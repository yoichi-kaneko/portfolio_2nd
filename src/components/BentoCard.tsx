interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  clipOverflow?: boolean;
}

export function BentoCard({
  children,
  className = "",
  style,
  clipOverflow = false,
}: BentoCardProps) {
  return (
    <div
      className={`relative ${clipOverflow ? "overflow-hidden" : ""} bg-[#161616] border border-[#262626] rounded-2xl p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
