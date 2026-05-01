interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-surface-800 bg-surface-900 p-6 ${className}`}
    >
      {children}
    </div>
  );
}
