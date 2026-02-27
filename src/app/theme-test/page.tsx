import { FadeIn } from "@/components/ui/fade-in";

export default function ThemeTestPage() {
  return (
    <div className="container mx-auto py-10">
      <FadeIn delay={0.1} direction="up">
      <h1 className="text-2xl font-bold">Theme Test</h1>
      <p>Theme testing page.</p>
      </FadeIn>
    </div>
  );
}
