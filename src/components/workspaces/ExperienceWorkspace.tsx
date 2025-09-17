export default function ExperienceWorkspace() {
  return (
    <ol className="relative border-s border-gray-700 pl-6 space-y-6">
      {[...Array(4)].map((_, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full bg-blue-500" />
          <h3 className="font-semibold text-white">Company {i + 1} · Role</h3>
          <div className="text-xs text-gray-400 mb-1">Jan 2024 – Present · City, ST</div>
          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
            <li>Impact-oriented bullet showing outcome and metrics.</li>
            <li>Tech used and interesting system details.</li>
          </ul>
        </li>
      ))}
    </ol>
  );
}

