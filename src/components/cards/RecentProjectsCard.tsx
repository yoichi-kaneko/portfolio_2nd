import projects from "../../../data/projects.json";

export function RecentProjectsCard() {
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">Recent Projects</h3>
        <a href="#" className="text-sm text-blue-400 hover:underline">
          View All
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.projects.map((project) => (
          <div
            key={project.name}
            className="p-3 bg-white/5 rounded-lg border border-white/5"
          >
            <p className="font-bold text-sm">{project.name}</p>
            <p className="text-xs text-gray-400 mt-1">{project.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
