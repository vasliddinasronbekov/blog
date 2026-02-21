export default function Card({ 
  children, 
  className = '',
  layer = 2,
  hover = true
}: { 
  children: React.ReactNode; 
  className?: string;
  layer?: 1 | 2 | 3 | 4 | 5;
  hover?: boolean;
}) {
  return (
    <div className={`glass-card p-6 layer-${layer} ${hover ? 'group' : ''} ${className}`}>
      {children}
    </div>
  );
}
