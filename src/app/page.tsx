import AnimatedCard from "@/components/AnimatedCard";
import RightSlopeField from "@/components/RightSlopeField";

export default function Page() {
  return (
    <main className="relative min-h-screen bg-black flex items-center justify-start p-4 overflow-hidden">
      {/* Right-side 3D slope field */}
      <RightSlopeField />
      {/* Your content */}
      <AnimatedCard />
    </main>
  );
}
