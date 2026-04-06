import { skillCategories } from "@/data/modules/skills";
import { faCode } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const levelColorMap: Record<string, string> = {
  Expert: "text-blue-400",
  Pro: "text-blue-400",
  Intermediate: "text-gray-400",
  Learning: "text-gray-400",
};

export function TechStackCard() {
  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
        <FontAwesomeIcon icon={faCode} className="w-4 h-4 mr-1" />
        Tech Stack
      </h3>
      <div className="space-y-5 text-sm">
        {skillCategories.map((category) => (
          <div key={category.name}>
            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">
              {category.name}
            </p>
            <div className="space-y-1.5">
              {category.skills.map((skill) => (
                <div key={skill.name} className="flex justify-between">
                  <span>{skill.name}</span>
                  <span
                    className={levelColorMap[skill.level] ?? "text-gray-400"}
                  >
                    {skill.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
