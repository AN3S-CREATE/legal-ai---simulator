import React from 'react';

interface StatusBadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ label, color, size = 'md' }) => {
  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${px} font-medium`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
};

export default StatusBadge;
