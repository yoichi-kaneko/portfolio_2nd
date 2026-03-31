import { socialLinks } from "@/data/modules/social";

export function SocialCard() {
  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
        Social
      </h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
