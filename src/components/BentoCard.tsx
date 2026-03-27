interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BentoCard({ children, className = "" }: BentoCardProps) {
  return (
    <div
      className={`bg-[#161616] border border-[#262626] rounded-2xl p-6 transition-all duration-300 hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] ${className}`}
    >
      {children}
    </div>
  );
}
