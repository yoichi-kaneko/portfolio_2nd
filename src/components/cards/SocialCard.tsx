import social from "../../../data/social.json";

export function SocialCard() {
  return (
    <>
      <h3 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-widest">
        Social
      </h3>
      <div className="flex gap-4 text-sm">
        {social.links.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            className="hover:text-blue-400 transition-colors"
          >
            {link.label}
          </a>
        ))}
      </div>
    </>
  );
}
