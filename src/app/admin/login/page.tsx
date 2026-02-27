"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FadeIn } from "@/components/ui/fade-in";

export default function AdminLoginPage() {
	const [key, setKey] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const router = useRouter();

	const submit = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await fetch("/api/admin/session", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ key }),
			});
			if (!res.ok) {
				const j = await res.json().catch(() => ({}));
				throw new Error(j.error || "Unauthorized");
			}
			// store also in localStorage for clients that pass header key
			try { localStorage.setItem("adminKey", key); } catch {}
			router.replace("/admin");
		} catch (e: any) {
			setError(e.message || "Login failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
			<FadeIn delay={0.1} direction="up">
			<div style={{ width: 360, border: "1px solid var(--border)", borderRadius: 8, padding: 16 }}>
				<h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Admin Login</h1>
				<p style={{ color: "var(--muted-foreground)", marginBottom: 16 }}>Enter the admin key to continue.</p>
				<input
					type="password"
					placeholder="Admin key"
					value={key}
					onChange={(e) => setKey(e.target.value)}
					style={{ width: "100%", padding: 8, border: "1px solid var(--border)", borderRadius: 6, marginBottom: 8 }}
				/>
				{error ? <div style={{ color: "#b00020", fontSize: 12, marginBottom: 8 }}>{error}</div> : null}
				<button onClick={submit} disabled={loading || !key} style={{ width: "100%", padding: 10 }}>
					{loading ? "Signing in…" : "Sign in"}
				</button>
			</div>
			</FadeIn>
		</div>
	);
}

