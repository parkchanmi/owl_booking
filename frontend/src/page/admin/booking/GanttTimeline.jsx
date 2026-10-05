import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Clock,
  Users,
} from './Icons';

const TIMELINE_START_HOUR = 7;
const TIMELINE_END_HOUR = 22;
const TIMELINE_HOURS = TIMELINE_END_HOUR - TIMELINE_START_HOUR; // 15 hours (07:00 ~ 22:00)
const HOUR_CELL_WIDTH = 120; // 120px per hour cell

function timeToPercent(time) {
  if (!time) return 0;
  const [h, m] = time.split(':').map(Number);
  const minutes = (h || 0) * 60 + (m || 0) - TIMELINE_START_HOUR * 60;
  return Math.max(0, Math.min(100, (minutes / (TIMELINE_HOURS * 60)) * 100));
}

function durationPercent(start, end) {
  if (!start || !end) return 6;
  return Math.max(5, timeToPercent(end) - timeToPercent(start));
}

export function GanttTimeline({
  schedules = [],
  instructors = [],
  studios = [
    { id: 'A', name: '스튜디오 A룸', capacity: 10 },
    { id: 'B', name: '스튜디오 B룸', capacity: 8 },
  ],
  timelineDate,
  onTimelineDateChange,
  todayKey,
  openDrawer,
  isInstructor = false,
  currentInstructorId,
}) {
  const [groupById, setGroupById] = useState('instructor'); // 'instructor' | 'studio'
  const [hoveredPlacement, setHoveredPlacement] = useState(null); // { id, isLeft }

  const daySchedules = useMemo(
    () => schedules.filter((s) => s.date === timelineDate),
    [schedules, timelineDate]
  );

  const availableDates = useMemo(() => {
    const dates = [...new Set(schedules.map((s) => s.date))].filter(Boolean).sort();
    if (dates.length === 0) return [timelineDate];
    return dates;
  }, [schedules, timelineDate]);

  const resources = useMemo(() => {
    if (groupById === 'instructor') {
      const list = isInstructor && currentInstructorId
        ? instructors.filter((i) => String(i.id) === String(currentInstructorId))
        : instructors;
      return list.map((ins) => ({
        id: String(ins.id),
        label: ins.name,
        sublabel: '강사',
        schedules: daySchedules.filter((s) => String(s.instructorId) === String(ins.id)),
      }));
    }
    return studios.map((std) => ({
      id: std.id,
      label: std.name,
      sublabel: `정원 ${std.capacity}명`,
      schedules: daySchedules.filter((s) => s.studioId === std.id),
    }));
  }, [groupById, instructors, studios, daySchedules, isInstructor, currentInstructorId]);

  const hours = useMemo(() => {
    const arr = [];
    for (let h = TIMELINE_START_HOUR; h <= TIMELINE_END_HOUR; h++) {
      arr.push(h);
    }
    return arr;
  }, []);

  const shiftDate = (days) => {
    const d = new Date(timelineDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onTimelineDateChange(`${y}-${m}-${day}`);
  };

  const totalTimelineWidth = TIMELINE_HOURS * HOUR_CELL_WIDTH;

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-5 shadow-xs border border-violet-100/80 space-y-4">
      {/* ── 1. 서브 컨트롤 바 (강사/스튜디오 토글 & 날짜 알약 버튼) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 관점 전환 (강사별 / 스튜디오별) */}
        {!isInstructor ? (
          <div className="flex items-center gap-1 p-1 rounded-full bg-violet-50/70 border border-violet-200/50 text-xs">
            <button
              type="button"
              onClick={() => setGroupById('instructor')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer border-0 ${
                groupById === 'instructor'
                  ? 'bg-white text-violet-700 shadow-xs font-bold border border-violet-100'
                  : 'text-zinc-500 bg-transparent hover:text-zinc-800'
              }`}
            >
              <User className="w-3.5 h-3.5 text-violet-600" />
              강사별 보기
            </button>
            <button
              type="button"
              onClick={() => setGroupById('studio')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer border-0 ${
                groupById === 'studio'
                  ? 'bg-white text-violet-700 shadow-xs font-bold border border-violet-100'
                  : 'text-zinc-500 bg-transparent hover:text-zinc-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-violet-600" />
              스튜디오 룸별 보기
            </button>
          </div>
        ) : (
          <div className="text-xs font-bold text-violet-700 bg-violet-50 px-3.5 py-1.5 rounded-full border border-violet-100">
            담당 수업 타임라인
          </div>
        )}

        {/* 날짜 네비게이션 알약 버튼 */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => shiftDate(-1)}
            className="w-7 h-7 rounded-full hover:bg-violet-100 flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent text-zinc-600"
            title="이전 날짜"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableDates.map((d) => {
              const isSelected = d === timelineDate;
              const isToday = d === todayKey;
              const dayNum = d.split('-')[2];
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onTimelineDateChange(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer border-0 ${
                    isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-xs'
                      : isToday
                      ? 'bg-violet-100 text-violet-700 font-bold border border-violet-200/60'
                      : 'text-zinc-500 bg-transparent hover:bg-violet-50'
                  }`}
                >
                  {dayNum}일{isToday ? ' (오늘)' : ''}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => shiftDate(1)}
            className="w-7 h-7 rounded-full hover:bg-violet-100 flex items-center justify-center transition-colors cursor-pointer border-0 bg-transparent text-zinc-600"
            title="다음 날짜"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. 간트 그리드 본체 ── */}
      <div className="flex rounded-2xl border border-violet-100/80 bg-white overflow-hidden shadow-xs relative">
        {/* 좌측 고정 리소스 열 */}
        <div className="w-44 border-r border-violet-100/80 bg-white/70 backdrop-blur-sm flex-shrink-0 z-10">
          <div className="h-10 flex items-center px-4 text-xs font-bold text-violet-500 border-b border-violet-100/80 bg-violet-50/30">
            {groupById === 'instructor' ? '강사' : '스튜디오 룸'}
          </div>
          {resources.map((res) => (
            <div key={res.id} className="h-20 flex items-center gap-2.5 px-3 border-b border-violet-50/60 last:border-b-0">
              {groupById === 'instructor' ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 text-violet-700 shadow-2xs font-bold text-xs">
                    {res.label.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{res.label}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{res.schedules.length}개 수업</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0 text-violet-700 shadow-2xs">
                    <MapPin className="w-4 h-4 text-violet-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{res.label}</p>
                    <p className="text-[10px] text-zinc-400 font-medium">{res.sublabel}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* 우측 수평 시간축 스크롤 컨테이너 */}
        <div className="flex-1 overflow-x-auto relative pb-6 custom-scrollbar">
          {/* 시간대 헤더 행 */}
          <div
            className="h-10 flex border-b border-violet-100/80 relative bg-violet-50/20"
            style={{ width: `${totalTimelineWidth}px`, minWidth: `${totalTimelineWidth}px` }}
          >
            {hours.slice(0, -1).map((h) => (
              <div
                key={h}
                className="flex items-center justify-start pl-2 text-[11px] font-semibold text-zinc-400 border-r border-violet-100/40"
                style={{ width: `${HOUR_CELL_WIDTH}px`, flexShrink: 0 }}
              >
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* 리소스별 행 */}
          {resources.map((res, rowIdx) => (
            <div
              key={res.id}
              className="h-20 relative border-b border-violet-50/60 last:border-b-0 hover:z-30 transition-colors"
              style={{ width: `${totalTimelineWidth}px`, minWidth: `${totalTimelineWidth}px` }}
            >
              {/* 세로 시간 눈금선 (배경 격자) */}
              {hours.slice(0, -1).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-r border-violet-100/40 pointer-events-none"
                  style={{ left: `${i * HOUR_CELL_WIDTH}px`, width: `${HOUR_CELL_WIDTH}px` }}
                />
              ))}

              {/* 배치된 수업 블록들 */}
              {res.schedules.map((cls) => {
                const leftPct = timeToPercent(cls.startTime);
                const widthPct = Math.max(durationPercent(cls.startTime, cls.endTime), 5);
                const bookedCount = Array.isArray(cls.booked) ? cls.booked.length : (cls.bookingCount || 0);
                const capacity = cls.capacity || 10;
                const isFull = bookedCount >= capacity;

                const compactLabel =
                  groupById === 'instructor'
                    ? `${cls.title} · ${cls.studioId === 'B' ? 'Studio B' : 'Studio A'}`
                    : `${cls.title} · ${cls.instructorName || '강사'}`;

                const isTooltipLeft = hoveredPlacement?.id === cls.id && hoveredPlacement.isLeft;
                const isFirstRow = rowIdx === 0;
                const isLastRow = rowIdx === resources.length - 1;
                const verticalPositionClass = isLastRow
                  ? 'bottom-0'
                  : isFirstRow
                  ? 'top-0'
                  : 'top-1/2 -translate-y-1/2';

                return (
                  <div
                    key={cls.id}
                    className="group absolute h-11 top-1/2 -translate-y-1/2"
                    style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                  >
                    <button
                      type="button"
                      onClick={() => openDrawer && openDrawer(cls)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const isCloseToRightEdge = window.innerWidth - rect.right < 230;
                        setHoveredPlacement({ id: cls.id, isLeft: isCloseToRightEdge });
                      }}
                      onMouseLeave={() => setHoveredPlacement(null)}
                      className={`w-full h-full rounded-2xl px-3 flex items-center justify-between text-[11px] font-medium transition-all shadow-xs cursor-pointer border ${
                        isFull
                          ? 'bg-violet-100 border-violet-300 text-violet-900 font-bold hover:bg-violet-200/90'
                          : 'bg-violet-50/95 border-violet-200/90 text-zinc-800 hover:border-violet-400 hover:bg-violet-100/70 hover:shadow-md'
                      }`}
                    >
                      <span className="truncate mr-1 font-semibold">{compactLabel}</span>
                      <span
                        className={`flex-shrink-0 text-[10px] ${
                          isFull
                            ? 'text-violet-700 font-bold bg-violet-200/90 px-1.5 py-0.5 rounded-full'
                            : 'text-zinc-500 font-medium'
                        }`}
                      >
                        {isFull ? '마감' : `${bookedCount}/${capacity}`}
                      </span>
                    </button>

                    {/* ── 화이트 글래스모피즘 호버 카드 툴팁 (레퍼런스 디자인 일치) ── */}
                    <div
                      className={`hidden group-hover:flex flex-col gap-1 absolute ${verticalPositionClass} ${
                        isTooltipLeft ? 'right-full mr-3' : 'left-full ml-3'
                      } p-3.5 bg-white/90 backdrop-blur-md border border-violet-100 rounded-2xl shadow-xl text-zinc-800 text-xs z-[100] whitespace-nowrap pointer-events-none min-w-[190px] animate-in fade-in duration-150`}
                    >
                      <div className="flex items-center justify-between gap-2 border-b border-violet-100/70 pb-1.5 mb-0.5">
                        <span className="font-bold text-zinc-900 text-xs">{cls.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-bold">
                          {cls.type || '수업'}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span>{cls.startTime} - {cls.endTime}</span>
                      </div>
                      <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span>{cls.studioId === 'B' ? 'Studio B' : 'Studio A'}</span>
                      </div>
                      <div className="text-[11px] text-zinc-600 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                        <span>강사: {cls.instructorName || '미지정'}</span>
                      </div>
                      <div className="text-[11px] font-bold text-violet-700 flex items-center gap-1.5 pt-1.5 mt-0.5 border-t border-violet-100/70">
                        <Users className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                        <span>예약 {bookedCount}/{capacity}명 {isFull && '(정원 마감)'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GanttTimeline;
