/**
 * CalendarPopover — 本月日历 + 今天高亮 + 三个城市时间（mock）
 */
import React, { useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { useClock } from '../../hooks/useClock';
import { useThemeStore } from '../../store/themeStore';

const CITIES = [
  { city: '北京', tz: 'Asia/Shanghai' },
  { city: '东京', tz: 'Asia/Tokyo' },
  { city: '纽约', tz: 'America/New_York' },
];

export const CalendarPopover: React.FC = () => {
  const now = useClock(1000);
  const locale = useThemeStore((s) => s.locale);
  const [month, setMonth] = useState(() => startOfMonth(now));

  const cells = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const isZh = locale === 'zh';
  const weekdayLabel = isZh ? ['一', '二', '三', '四', '五', '六', '日'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="w-full" style={{ color: 'var(--text-primary)' }}>
      {/* 月份导航 */}
      <div className="mb-3 flex items-center justify-between">
        <button
          className="pressable rounded-md px-2 py-0.5 text-sm"
          onClick={() => setMonth((m) => addMonths(m, -1))}
          aria-label="上个月"
        >
          ‹
        </button>
        <div className="text-[13px] font-semibold">
          {isZh ? format(month, 'yyyy年 M月', { locale: zhCN }) : format(month, 'MMMM yyyy', { locale: enUS })}
        </div>
        <button
          className="pressable rounded-md px-2 py-0.5 text-sm"
          onClick={() => setMonth((m) => addMonths(m, 1))}
          aria-label="下个月"
        >
          ›
        </button>
      </div>

      {/* 星期表头 */}
      <div className="mb-1 grid grid-cols-7 text-center text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
        {weekdayLabel.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {/* 日期格 */}
      <div className="grid grid-cols-7 gap-y-0.5 text-center text-[12px]">
        {cells.map((d) => {
          const today = isToday(d);
          const selected = isSameDay(d, now);
          const inMonth = isSameMonth(d, month);
          return (
            <div
              key={d.toISOString()}
              className="flex h-7 items-center justify-center rounded-full text-[12px]"
              style={{
                color: today ? 'var(--accent-contrast)' : inMonth ? 'var(--text-primary)' : 'var(--text-tertiary)',
                background: today ? 'var(--accent)' : 'transparent',
                fontWeight: today ? 600 : 400,
                boxShadow: selected && !today ? 'inset 0 0 0 1px var(--accent)' : undefined,
              }}
            >
              {d.getDate()}
            </div>
          );
        })}
      </div>

      {/* 世界时钟 */}
      <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--glass-border)' }}>
        <div className="mb-1.5 text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
          {isZh ? '世界时钟' : 'World Clock'}
        </div>
        <div className="flex flex-col gap-1">
          {CITIES.map((c) => {
            const time = new Intl.DateTimeFormat(isZh ? 'zh-CN' : 'en-US', {
              timeZone: c.tz,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }).format(now);
            return (
              <div key={c.tz} className="flex items-center justify-between text-[12px]">
                <span className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                  {c.city}
                </span>
                <span className="tnum font-medium">{time}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
