import AnimatedCard from "@/components/AnimatedCard";
import RightBlueGradient from "@/components/RightBlueGradient";

export default function Page() {
  return (
    <main className="relative min-h-screen bg-white flex items-center justify-start p-4 overflow-hidden">
      {/* Right-side background gradient */}
      <RightBlueGradient />

      {/* Your content */}
      <AnimatedCard />
    </main>
  );
}
