/**
 * MenuClock — 菜单栏时钟
 * 只显示 星期 + 日期 + 时分（秒不显示，避免跳动干扰）。
 * 格式跟随设置：12/24 小时、中/英。
 */
import React from 'react';
import { format } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useClock } from '../../hooks/useClock';
import { useThemeStore } from '../../store/themeStore';

const ZH_WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const MenuClock: React.FC = () => {
  const now = useClock(1000);
  const clockFormat = useThemeStore((s) => s.clockFormat);
  const locale = useThemeStore((s) => s.locale);

  const text = React.useMemo(() => {
    const h24 = clockFormat === '24h';
    if (locale === 'zh') {
      const weekday = ZH_WEEK[now.getDay()];
      const md = `${now.getMonth() + 1}月${now.getDate()}日`;
      const time = h24
        ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
        : format(now, 'h:mm a');
      return `${weekday} ${md} ${time}`;
    }
    return format(now, h24 ? 'EEE MMM d HH:mm' : 'EEE MMM d h:mm a', { locale: enUS });
  }, [now, clockFormat, locale]);

  return (
    <span className="tnum whitespace-nowrap text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
      {text}
    </span>
  );
};
