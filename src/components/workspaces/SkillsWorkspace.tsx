export default function SkillsWorkspace() {
  const buckets = [
    { title: "Languages", items: ["TypeScript", "Java", "Python", "SQL"] },
    { title: "Frameworks", items: ["Next.js", "Spring Boot", "React", "Tailwind"] },
    { title: "Infra", items: ["Postgres", "Docker", "Vercel", "AWS"] },
    { title: "ML/AI", items: ["PyTorch", "LangGraph", "RAG", "OpenAI"] },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {buckets.map((b) => (
        <div key={b.title} className="rounded-2xl border border-gray-700 p-4 bg-gray-900/50">
          <h3 className="font-semibold mb-2 text-white">{b.title}</h3>
          <div className="flex flex-wrap gap-2">
            {b.items.map((s) => (
              <span key={s} className="text-xs rounded-full bg-gray-800 px-2 py-1 text-gray-300">
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

