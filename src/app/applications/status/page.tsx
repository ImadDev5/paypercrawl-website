import { FadeIn } from "@/components/ui/fade-in";

export default function ApplicationStatusPage() {
  return (
    <div className="container mx-auto py-10">
      <FadeIn delay={0.1} direction="up">
      <h1 className="text-2xl font-bold">Application Status</h1>
      <p>Check back later for updates.</p>
      </FadeIn>
    </div>
  );
}
