import { ReactNode } from 'react';
export default function Card({ children, className = '', onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={`card ${className}`}>{children}</div>;
}
