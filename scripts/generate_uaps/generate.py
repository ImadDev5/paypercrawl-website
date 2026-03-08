#!/usr/bin/env python3
"""
Generate gradient-optimised Universal Adversarial Perturbations (UAPs)
that disrupt VLM encoders (CLIP, SigLIP, DINOv2).

This script implements MI-DI-TI-FGSM optimisation against an ensemble
of vision encoders.  The resulting UAPs are tiled across any input image
at runtime (simple pixel addition), providing model-transferable
adversarial protection WITHOUT needing model inference at embed-time.

Usage:
    pip install -r requirements.txt
    python generate.py --out-dir ../../public/uaps --epochs 150

Hardware: Best on a CUDA GPU (RTX 3060 or better recommended).
          CPU fallback is supported for smaller or smoke-test runs.

Output: 8 binary files (224×224×3, int8, ~150 KB each) + manifest.json.
"""

import argparse
import hashlib
import json
import os
import random
import sys
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torchvision import transforms
from tqdm import tqdm, trange

# ─── Lazy imports for optional models ────────────────────────
_clip_model = None
_clip_preprocess = None
_siglip_model = None
_dino_model = None

DEFAULT_BLEND_PROFILES = {
    "robust": [{"id": "general", "weight": 1.0}],
    "balanced": [
        {"id": "general", "weight": 0.7},
        {"id": "urban", "weight": 0.18},
        {"id": "product", "weight": 0.12},
    ],
    "forensic": [
        {"id": "general", "weight": 0.45},
        {"id": "text", "weight": 0.25},
        {"id": "abstract", "weight": 0.3},
    ],
    "textHeavy": [
        {"id": "general", "weight": 0.45},
        {"id": "text", "weight": 0.4},
        {"id": "product", "weight": 0.15},
    ],
    "vivid": [
        {"id": "general", "weight": 0.4},
        {"id": "art", "weight": 0.35},
        {"id": "abstract", "weight": 0.25},
    ],
    "structured": [
        {"id": "general", "weight": 0.5},
        {"id": "urban", "weight": 0.3},
        {"id": "product", "weight": 0.2},
    ],
    "soft": [
        {"id": "general", "weight": 0.55},
        {"id": "landscape", "weight": 0.3},
        {"id": "face", "weight": 0.15},
    ],
}

DEFAULT_LABELS = {
    "general": "General purpose",
    "landscape": "Landscapes & nature",
    "face": "Portraits & faces",
    "text": "Documents & text",
    "product": "Products & objects",
    "art": "Art & illustrations",
    "urban": "Urban & architecture",
    "abstract": "Abstract & patterns",
}


def seed_everything(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def get_device():
    if torch.cuda.is_available():
        return torch.device("cuda")
    if hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        return torch.device("mps")
    print("WARNING: No GPU detected. This will be VERY slow (~24h).", file=sys.stderr)
    return torch.device("cpu")


def configure_runtime(device, cpu_threads: int | None):
    if device.type != "cpu":
        return
    threads = max(1, cpu_threads or 1)
    torch.set_num_threads(threads)
    if hasattr(torch, "set_num_interop_threads"):
        torch.set_num_interop_threads(1)


# ─── Model loaders (lazy) ───────────────────────────────────

CLIP_MODEL_SPECS = {
    "clip_vit_b16": ("ViT-B-16", "openai"),
    "clip_vit_b32": ("ViT-B-32", "laion2b_s34b_b79k"),
    "clip_vit_l14": ("ViT-L-14", "laion2b_s32b_b82k"),
}

def load_clip(device, requested_ids: list[str]):
    """Load only the requested CLIP visual encoders via open_clip."""
    global _clip_model
    requested = tuple(sorted({model_id for model_id in requested_ids if model_id.startswith("clip_")}))
    if not requested:
        return []
    if _clip_model is not None and _clip_model.get("ids") == requested:
        return _clip_model["models"]

    import open_clip

    models = []

    for model_id in requested:
        if model_id not in CLIP_MODEL_SPECS:
            raise ValueError(f"Unsupported CLIP model id: {model_id}")
        arch, pretrained = CLIP_MODEL_SPECS[model_id]
        model, _, preprocess = open_clip.create_model_and_transforms(arch, pretrained=pretrained)
        models.append((model_id, model.visual.to(device).eval(), preprocess))

    _clip_model = {"ids": requested, "models": models}
    return models


def load_dino(device):
    """Load DINOv2 ViT-B/14."""
    global _dino_model
    if _dino_model is not None:
        return _dino_model

    model = torch.hub.load("facebookresearch/dinov2", "dinov2_vitb14", pretrained=True)
    model = model.to(device).eval()
    _dino_model = model
    return model


def resolve_models(device, model_ids: list[str]):
    """Load the requested model ensemble lazily."""
    resolved = []
    clip_models = None

    if any(model_id.startswith("clip_") for model_id in model_ids):
        clip_models = {name: model for name, model, _ in load_clip(device, model_ids)}

    for model_id in model_ids:
        if model_id.startswith("clip_"):
            if clip_models is None or model_id not in clip_models:
                raise ValueError(f"Unsupported model id: {model_id}")
            resolved.append((model_id, clip_models[model_id]))
            continue
        if model_id == "dino":
            resolved.append(("dino", load_dino(device)))
            continue
        raise ValueError(f"Unsupported model id: {model_id}")

    return resolved


# ─── Data augmentation transforms (for MI-DI-TI-FGSM) ─────

def input_diversity(x, prob=0.7, low=0.85, high=1.15):
    """Random resizing + padding (DI-FGSM)."""
    if np.random.rand() > prob:
        return x
    _, _, h, w = x.shape
    rnd = int(np.random.uniform(low, high) * h)
    rnd = max(h, rnd)  # at least original size
    rescaled = F.interpolate(x, size=(rnd, rnd), mode="bilinear", align_corners=False)
    h_rem = rnd - h
    w_rem = rnd - w
    pad_top = np.random.randint(0, max(1, h_rem + 1))
    pad_left = np.random.randint(0, max(1, w_rem + 1))
    padded = F.pad(rescaled, (pad_left, w_rem - pad_left, pad_top, h_rem - pad_top))
    return F.interpolate(padded, size=(h, w), mode="bilinear", align_corners=False)


def translation_invariant_kernel(kernel_size=5):
    """Gaussian kernel for TI-FGSM (translation invariance)."""
    kern = torch.ones(1, 1, kernel_size, kernel_size) / (kernel_size * kernel_size)
    return kern


# ─── UAP generation ─────────────────────────────────────────

def generate_uap(
    device,
    category_id: str,
    image_paths: list[str],
    model_ids: list[str],
    epochs: int = 150,
    epsilon: float = 16 / 255,
    step_size: float = 1 / 255,
    momentum_decay: float = 0.9,
    batch_size: int = 8,
):
    """
    Generate one UAP via MI-DI-TI-FGSM against an ensemble of ViTs.

    The UAP maximises embedding displacement:
        max_δ  E_x[ Σ_model || f(x+δ) - f(x) ||² ]
    subject to ||δ||∞ ≤ ε.
    """

    models = resolve_models(device, model_ids)

    # Standard CLIP preprocessing (normalise only — we handle resize ourselves)
    normalize = transforms.Normalize(
        mean=[0.48145466, 0.4578275, 0.40821073],
        std=[0.26862954, 0.26130258, 0.27577711],
    )

    resize_224 = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
    ])

    ti_kernel = translation_invariant_kernel(5).to(device)

    # Initialise UAP as small random noise
    uap = torch.empty(1, 3, 224, 224, device=device).uniform_(-epsilon * 0.1, epsilon * 0.1)
    uap.requires_grad_(True)

    momentum = torch.zeros_like(uap)

    # Pre-load and cache images
    print(f"  Loading {len(image_paths)} images...")
    all_images = []
    for p in image_paths:
        try:
            img = Image.open(p).convert("RGB")
            tensor = resize_224(img)
            all_images.append(tensor)
        except Exception:
            continue

    if not all_images:
        raise ValueError(f"No valid images found for category '{category_id}'")

    print(f"  Loaded {len(all_images)} images. Starting optimisation...")

    for epoch in trange(epochs, desc=f"  {category_id}", leave=False):
        # Shuffle and batch
        indices = np.random.permutation(len(all_images))

        for batch_start in range(0, len(indices), batch_size):
            batch_idx = indices[batch_start : batch_start + batch_size]
            batch = torch.stack([all_images[i] for i in batch_idx]).to(device)  # (B,3,224,224)

            if uap.grad is not None:
                uap.grad.zero_()

            # Add UAP
            perturbed = batch + uap
            perturbed = torch.clamp(perturbed, 0, 1)

            total_loss = torch.tensor(0.0, device=device)

            # ── Ensemble loss ──
            clean_in = normalize(batch)
            adv_in = normalize(input_diversity(perturbed))
            for name, model in models:
                with torch.no_grad():
                    clean_emb = model(clean_in)

                adv_emb = model(adv_in)
                total_loss = total_loss + F.mse_loss(adv_emb, clean_emb, reduction="mean")

            # Backward
            (-total_loss).backward()  # negative because we maximise displacement

            # MI-FGSM: momentum accumulation
            grad = uap.grad.data
            grad = grad / (grad.abs().mean() + 1e-12)

            # TI-FGSM: convolve gradient with Gaussian kernel
            grad = F.conv2d(
                grad, ti_kernel.expand(3, -1, -1, -1),
                padding=ti_kernel.shape[-1] // 2,
                groups=3,
            )

            momentum = momentum_decay * momentum + grad

            # Sign update (FGSM step)
            with torch.no_grad():
                uap.data = uap.data - step_size * momentum.sign()
                uap.data = torch.clamp(uap.data, -epsilon, epsilon)

    # Convert to int8 for storage
    uap_np = (uap.squeeze(0).permute(1, 2, 0).detach().cpu().numpy() * 255).astype(np.float32)
    uap_int8 = np.clip(uap_np, -128, 127).astype(np.int8)

    return uap_int8


# ─── Main ────────────────────────────────────────────────────

def find_images(directory: str, max_per_category: int = 1000) -> list[str]:
    """Recursively find image files in a directory."""
    exts = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
    images = []
    for root, dirs, files in os.walk(directory):
        dirs.sort()
        for f in sorted(files):
            if Path(f).suffix.lower() in exts:
                images.append(os.path.join(root, f))
                if len(images) >= max_per_category:
                    return images
    return images


def choose_images_for_category(
    image_dir: Path,
    category_id: str,
    max_per_category: int,
    seed: int,
) -> list[str]:
    """Choose a deterministic per-category slice from category-specific or shared images."""
    cat_dir = image_dir / category_id
    if cat_dir.is_dir():
        return find_images(str(cat_dir), max_per_category=max_per_category)

    all_images = find_images(str(image_dir), max_per_category=max_per_category * 32)
    if len(all_images) <= max_per_category:
        return all_images

    category_seed = int(hashlib.sha256(f"{category_id}:{seed}".encode("utf-8")).hexdigest()[:8], 16)
    shuffled = list(all_images)
    random.Random(category_seed).shuffle(shuffled)
    return shuffled[:max_per_category]


def default_model_ids_for_device(device) -> list[str]:
    if device.type == "cuda":
        return ["clip_vit_l14", "clip_vit_b32", "dino"]
    return ["clip_vit_b16"]


def read_existing_manifest(out_dir: Path):
    manifest_path = out_dir / "manifest.json"
    if not manifest_path.exists():
        return {}
    try:
        with open(manifest_path, "r") as f:
            return json.load(f)
    except Exception:
        return {}


def main():
    parser = argparse.ArgumentParser(description="Generate gradient-optimised UAPs")
    parser.add_argument(
        "--out-dir",
        type=str,
        default="../../public/uaps",
        help="Output directory for .bin files",
    )
    parser.add_argument(
        "--image-dir",
        type=str,
        default="./images",
        help="Directory containing training images (can have sub-dirs per category)",
    )
    parser.add_argument("--epochs", type=int, default=150, help="Training epochs per category")
    parser.add_argument("--epsilon", type=float, default=16 / 255, help="L∞ budget (normalised 0-1)")
    parser.add_argument("--batch-size", type=int, default=8, help="Batch size")
    parser.add_argument(
        "--max-images-per-category",
        type=int,
        default=64,
        help="Maximum training images to use per category",
    )
    parser.add_argument(
        "--models",
        type=str,
        nargs="*",
        default=None,
        help="Model ids to target: clip_vit_b16, clip_vit_b32, clip_vit_l14, dino. Defaults to auto per device.",
    )
    parser.add_argument("--seed", type=int, default=1337, help="Deterministic seed for image sampling")
    parser.add_argument(
        "--cpu-threads",
        type=int,
        default=1,
        help="Torch CPU threads to use when no GPU is available",
    )
    parser.add_argument(
        "--categories",
        type=str,
        nargs="*",
        default=["general", "landscape", "face", "text", "product", "art", "urban", "abstract"],
        help="Categories to generate",
    )
    args = parser.parse_args()

    seed_everything(args.seed)
    device = get_device()
    configure_runtime(device, args.cpu_threads)
    model_ids = args.models or default_model_ids_for_device(device)
    out_dir = Path(args.out_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    previous_manifest = read_existing_manifest(out_dir)

    image_dir = Path(args.image_dir).resolve()
    if not image_dir.exists():
        print(f"Image directory not found: {image_dir}")
        print("Create it and add training images (1000+ per category recommended).")
        print("Sub-directories per category are optional; if absent, all images are shared.")
        sys.exit(1)

    print(f"Device: {device}")
    if device.type == "cpu":
        print(f"CPU threads: {args.cpu_threads}")
    print(f"Output: {out_dir}")
    print(f"Epochs: {args.epochs}, ε: {args.epsilon:.4f} ({args.epsilon * 255:.1f}/255)")
    print(f"Models: {', '.join(model_ids)}")
    print(f"Max images/category: {args.max_images_per_category}")
    print()

    manifest = {
        "version": 2,
        "description": "Gradient-optimised UAPs (MI-DI-TI-FGSM ensemble)",
        "patchSize": 224,
        "channels": 3,
        "dtype": "int8",
        "bytesPerUAP": 224 * 224 * 3,
        "note": "Gradient-trained assets generated from repo-local imagery.",
        "placeholder": False,
        "models": model_ids,
        "blendProfiles": previous_manifest.get("blendProfiles", DEFAULT_BLEND_PROFILES),
        "training": {
            "device": str(device),
            "epochs": args.epochs,
            "epsilon": args.epsilon,
            "batchSize": args.batch_size,
            "maxImagesPerCategory": args.max_images_per_category,
            "seed": args.seed,
            "cpuThreads": args.cpu_threads,
            "imageDir": str(image_dir),
            "trainedAt": datetime.now(timezone.utc).isoformat(),
        },
        "categories": [],
    }
    previous_category_labels = {
        item.get("id"): item.get("label")
        for item in previous_manifest.get("categories", [])
        if isinstance(item, dict) and item.get("id")
    }
    previous_category_entries = {
        item.get("id"): item
        for item in previous_manifest.get("categories", [])
        if isinstance(item, dict) and item.get("id")
    }
    generated_category_ids = set()

    for cat in args.categories:
        print(f"═══ Category: {cat} ═══")

        images = choose_images_for_category(
            image_dir=image_dir,
            category_id=cat,
            max_per_category=args.max_images_per_category,
            seed=args.seed,
        )

        if not images:
            print(f"  ⚠ No images found for '{cat}', skipping.")
            continue

        uap = generate_uap(
            device,
            category_id=cat,
            image_paths=images,
            model_ids=model_ids,
            epochs=args.epochs,
            epsilon=args.epsilon,
            batch_size=args.batch_size,
        )

        # Save as raw int8 binary (H, W, C order — row-major RGB)
        out_path = out_dir / f"{cat}.bin"
        uap.tofile(str(out_path))

        print(f"  ✓ {cat}.bin ({os.path.getsize(out_path)} bytes)")
        print(f"    Range: [{uap.min()}, {uap.max()}], Mean |δ|: {np.abs(uap).mean():.2f}")

        manifest["categories"].append({
            "id": cat,
            "file": f"{cat}.bin",
            "label": previous_category_labels.get(cat, DEFAULT_LABELS.get(cat, cat.replace("_", " ").title())),
            "epsilon": float(args.epsilon),
            "epochs": args.epochs,
            "imageCount": len(images),
            "models": model_ids,
        })
        generated_category_ids.add(cat)
        print()

    for cat in args.categories:
        if cat not in generated_category_ids and cat in previous_category_entries:
            manifest["categories"].append(previous_category_entries[cat])

    for cat_id, item in previous_category_entries.items():
        if cat_id not in generated_category_ids and cat_id not in args.categories:
            manifest["categories"].append(item)

    # Write manifest
    manifest_path = out_dir / "manifest.json"
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"Manifest: {manifest_path}")
    print("Done!")


if __name__ == "__main__":
    main()
