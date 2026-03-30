export function TechStackCard() {
  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
        Tech Stack
      </h3>
      <div className="space-y-5 text-sm">
        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Backend</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>PHP / Laravel</span>
              <span className="text-blue-400">Expert</span>
            </div>
            <div className="flex justify-between">
              <span>Ruby / Rails</span>
              <span className="text-gray-400">Intermediate</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Frontend</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>TypeScript / Next.js</span>
              <span className="text-gray-400">Intermediate</span>
            </div>
            <div className="flex justify-between">
              <span>React</span>
              <span className="text-gray-400">Learning</span>
            </div>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Infra & Tools</p>
          <div className="space-y-1.5">
            <div className="flex justify-between">
              <span>AWS</span>
              <span className="text-gray-400">Intermediate</span>
            </div>
            <div className="flex justify-between">
              <span>Docker</span>
              <span className="text-gray-400">Pro</span>
            </div>
            <div className="flex justify-between">
              <span>GCP / Firebase</span>
              <span className="text-gray-400">Learning</span>
            </div>
            <div className="flex justify-between">
              <span>LINE / Gemini API</span>
              <span className="text-gray-400">Intermediate</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
