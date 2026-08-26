/** 应用开发中占位（步骤完成前临时显示） */
import React from 'react';

export const PlaceholderApp: React.FC<{ name: string }> = ({ name }) => (
  <div className="flex h-full w-full items-center justify-center">
    <div className="text-center">
      <div className="mb-2 text-[15px] font-medium" style={{ color: 'var(--text-primary)' }}>
        {name}
      </div>
      <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
        正在装配中…
      </div>
    </div>
  </div>
);
