import React, { useState, useRef, useEffect, useMemo } from 'react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import AttendanceStatsCard from './AttendanceStatsCard';
import FilterDropdown from './FilterDropdown';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  List,
  LayoutGrid,
  X,
} from './Icons';

dayjs.locale('ko');

export const AttendanceFilterBar = ({
  selectedDate,
  onDateChange,
  viewMode,
  onViewModeChange,
  stats,
  centers = [],
  selectedCenterId,
  onCenterChange,
  instructors = [],
  selectedInstructorId,
  onInstructorChange,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  isInstructor = false,
  loggedInInstructorName,
}) => {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef(null);
  const todayStr = dayjs().format('YYYY-MM-DD');

  const centerOptions = useMemo(() => {
    const list = centers && centers.length > 0
      ? centers.map((c) => ({ value: String(c.id), label: c.name }))
      : [
          { value: '1', label: '강남점' },
          { value: '2', label: '역삼점' },
        ];
    return [{ value: 'all', label: '전체' }, ...list];
  }, [centers]);

  const instructorOptions = useMemo(() => {
    const list = instructors && instructors.length > 0
      ? instructors.map((ins) => ({
          value: String(ins.id),
          label: ins.name || ins.instructorName,
        }))
      : [
          { value: '1', label: '김유라' },
          { value: '2', label: '박민준' },
          { value: '3', label: '이서연' },
          { value: '4', label: '정태호' },
        ];
    return [{ value: 'all', label: '전체' }, ...list];
  }, [instructors]);

  const statusOptions = useMemo(
    () => [
      { value: 'all', label: '전체' },
      { value: 'pending', label: '대기' },
      { value: 'completed', label: '완료' },
    ],
    []
  );

  // 외부 클릭 시 날짜 피커 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target)) {
        setDatePickerOpen(false);
      }
    };
    if (datePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [datePickerOpen]);

  // 날짜 이동
  const handleDeltaDate = (delta) => {
    const next = dayjs(selectedDate).add(delta, 'day').format('YYYY-MM-DD');
    onDateChange?.(next);
  };

  // 날짜 피커 달력 데이터 계산
  const currentDayjs = dayjs(selectedDate);
  const year = currentDayjs.year();
  const month = currentDayjs.month(); // 0-indexed
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="space-y-3">
      {/* ── [1열] 네비게이션 & 액션 (스케줄 페이지 1열 규격 일치화) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* 좌측: 날짜 피커 및 당일 이동 버튼 (스케줄 페이지와 동일한 박스형 디자인) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/80 border border-zinc-200/80 rounded-2xl p-1 px-3 shadow-xs">
            <button
              type="button"
              onClick={() => handleDeltaDate(-1)}
              aria-label="이전 날짜"
              className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-zinc-500" />
            </button>

            {/* 달력 날짜 팝오버 컨테이너 (z-[100] 부여) */}
            <div className="relative z-[100]" ref={datePickerRef}>
              <button
                type="button"
                onClick={() => setDatePickerOpen((v) => !v)}
                className="flex items-center gap-2 px-3 text-sm font-bold text-zinc-800 hover:text-violet-700 transition-colors cursor-pointer select-none"
              >
                <Calendar className="w-4 h-4 text-violet-600" />
                <span>{dayjs(selectedDate).format('YYYY년 M월 D일 (ddd)')}</span>
              </button>

              {datePickerOpen && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-violet-100 rounded-2xl shadow-2xl p-4 z-[110] w-72 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-violet-50">
                    <span className="text-xs font-bold text-zinc-800">
                      {year}년 {month + 1}월
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onDateChange?.(currentDayjs.subtract(1, 'month').format('YYYY-MM-DD'))}
                        className="p-1 rounded-lg hover:bg-violet-50 text-zinc-500 cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDateChange?.(currentDayjs.add(1, 'month').format('YYYY-MM-DD'))}
                        className="p-1 rounded-lg hover:bg-violet-50 text-zinc-500 cursor-pointer"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {['일', '월', '화', '수', '목', '금', '토'].map((d, idx) => (
                      <div
                        key={d}
                        className={`text-[11px] font-bold py-1 ${
                          idx === 0 ? 'text-red-400' : idx === 6 ? 'text-blue-400' : 'text-zinc-400'
                        }`}
                      >
                        {d}
                      </div>
                    ))}

                    {calendarCells.map((day, i) => {
                      if (!day) return <div key={`empty-${i}`} />;
                      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = dateKey === selectedDate;
                      const isToday = dateKey === todayStr;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => {
                            onDateChange?.(dateKey);
                            setDatePickerOpen(false);
                          }}
                          className={`aspect-square rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#7C3AED] text-white font-bold shadow-xs'
                              : isToday
                              ? 'bg-violet-100 text-violet-700 font-bold'
                              : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-700'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => handleDeltaDate(1)}
              aria-label="다음 날짜"
              className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>
          </div>

          {/* 오늘 버튼을 날짜 바로 옆에 배치 */}
          <button
            type="button"
            onClick={() => onDateChange?.(todayStr)}
            className="px-3.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-100 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
          >
            오늘
          </button>
        </div>

        {/* 우측: 뷰 모드 전환 토글 (스케줄 페이지와 동일한 알약 바 규격) */}
        <div className="h-10 flex items-center gap-1 p-1 rounded-full bg-violet-50/70 backdrop-blur-xl border border-violet-200/60 shadow-inner flex-shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange?.('list')}
            className={`h-8 flex items-center gap-1.5 px-3.5 sm:px-4 rounded-full text-xs transition-all border cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-violet-700 shadow-sm font-bold border-violet-200/80'
                : 'border-transparent text-zinc-500 font-medium bg-transparent hover:text-zinc-800'
            }`}
          >
            <List className="w-3.5 h-3.5 text-violet-600" />
            <span>통합 리스트</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange?.('detail')}
            className={`h-8 flex items-center gap-1.5 px-3.5 sm:px-4 rounded-full text-xs transition-all border cursor-pointer ${
              viewMode === 'detail'
                ? 'bg-white text-violet-700 shadow-sm font-bold border-violet-200/80'
                : 'border-transparent text-zinc-500 font-medium bg-transparent hover:text-zinc-800'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-violet-600" />
            <span>수업별 상세</span>
          </button>
        </div>
      </div>

      {/* ── [2열] 글래스모피즘 필터 바 (단일 화이트 컨테이너) ── */}
      <div className="relative z-30 bg-white/80 backdrop-blur-2xl rounded-2xl p-2.5 px-4 shadow-xs border border-violet-200/60 flex flex-wrap items-center justify-between gap-3">
        {/* 필터 셀렉트 그룹 (역할 전환은 상단 헤더로 이동 완료) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 지점 필터 */}
          <FilterDropdown
            label="지점"
            value={selectedCenterId || 'all'}
            options={centerOptions}
            onSelect={(val) => onCenterChange?.(val)}
          />

          {/* 강사 필터 */}
          <FilterDropdown
            label="강사"
            value={
              isInstructor
                ? instructors[0]?.id
                  ? String(instructors[0].id)
                  : '1'
                : selectedInstructorId || 'all'
            }
            options={instructorOptions}
            onSelect={(val) => onInstructorChange?.(val)}
            disabled={isInstructor}
            disabledLabel={loggedInInstructorName || instructors[0]?.name || '이강사'}
          />

          {/* 출결 상태 필터 */}
          <FilterDropdown
            label="상태"
            value={statusFilter || 'all'}
            options={statusOptions}
            onSelect={(val) => onStatusFilterChange?.(val)}
          />
        </div>

        {/* 검색바 (w-48 sm:w-60 알약형 인풋 규격 일치화) */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="회원명, 수업, 강사 검색..."
            className="w-48 sm:w-60 text-xs bg-violet-50/50 border border-violet-200/70 rounded-full px-3.5 py-1.5 pl-9 outline-none focus:border-violet-500 focus:bg-white placeholder:text-zinc-400 text-zinc-700 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* ── [3열] KPI 요약 지표 (필터 바 바로 아래 가로 정렬 알약 바) ── */}
      {stats && (
        <div className="pt-0.5">
          <AttendanceStatsCard stats={stats} isInstructor={isInstructor} />
        </div>
      )}
    </div>
  );
};

export default AttendanceFilterBar;

