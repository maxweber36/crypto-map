import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InfoItem {
  label: string;
  value: string;
  valueColor?: string;
}

interface InfoCardProps {
  title: string;
  icon: LucideIcon;
  iconColor?: string;
  items: InfoItem[];
  className?: string;
}

/**
 * 信息展示卡片组件
 * 用于显示标题、图标和键值对信息
 */
export default function InfoCard({
  title,
  icon: Icon,
  iconColor = 'text-blue-500',
  items,
  className = ''
}: InfoCardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`h-6 w-6 ${iconColor}`} />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {item.label}
            </span>
            <span className={`font-medium ${
              item.valueColor || 'text-gray-900 dark:text-white'
            }`}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}