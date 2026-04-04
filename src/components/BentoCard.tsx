interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function BentoCard({ children, className = "", style }: BentoCardProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[#161616] border border-[#262626] rounded-2xl p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
