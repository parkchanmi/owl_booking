import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  CalendarRange,
  List,
  Clock,
  User,
  MapPin,
  Users,
  Search,
  Settings,
  ChevronDown,
  Lock,
} from './Icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenters } from '../../../api/centerApi';
import { fetchPrograms } from '../../../api/programApi';
import { fetchInstructors } from '../../../api/instructorApi';
import { fetchRealPrograms } from '../../../api/realProgramApi';
import ClassCreateModal from './ClassCreateModal';
import ClassTemplateManageModal from './ClassTemplateManageModal';
import ScheduleDetailDrawer from './ScheduleDetailDrawer';
import GanttTimeline from './GanttTimeline';
import FilterDropdown from './FilterDropdown';

dayjs.locale('ko');

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const STUDIOS = [
  { id: 'all', name: '전체' },
  { id: 'A', name: 'Studio A' },
  { id: 'B', name: 'Studio B' },
];

const CLASS_TYPES = ['all', '요가', '필라테스', '스피닝', 'PT', '크로스핏'];

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export const BookingSchedule = () => {
  const navigate = useNavigate();
  // 현재 날짜 및 뷰 상태
  const [viewDate, setViewDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'timeline' | 'list'
  const [timelineDate, setTimelineDate] = useState(dayjs().format('YYYY-MM-DD'));

  // 필터 상태
  const [selectedCenterId, setSelectedCenterId] = useState(null);
  const [studioFilter, setStudioFilter] = useState('all');
  const [instructorFilter, setInstructorFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 권한 상태 (RBAC: 'OWNER' | 'MANAGER' | 'INSTRUCTOR')
  const [userRole, setUserRole] = useState('OWNER');
  const [currentInstructorId, setCurrentInstructorId] = useState(null);

  // 백엔드 데이터 상태
  const [centers, setCenters] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // 모달 및 드로어 상태
  const [selectedClass, setSelectedClass] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const isAdmin = userRole === 'OWNER' || userRole === 'MANAGER';
  const isInstructor = userRole === 'INSTRUCTOR';

  // 백엔드 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [centerData, instructorData, programData, scheduleData, memberInfoRes] = await Promise.all([
        fetchCenters().catch(() => []),
        fetchInstructors().catch(() => []),
        fetchPrograms().catch(() => []),
        fetchRealPrograms().catch(() => []),
        axios.get('/api/member/info').catch(() => ({ data: null })),
      ]);

      const centerList = Array.isArray(centerData) ? centerData : [];
      const instructorList = Array.isArray(instructorData) ? instructorData : [];
      const programList = Array.isArray(programData) ? programData : [];
      const scheduleList = Array.isArray(scheduleData) ? scheduleData : [];

      setCenters(centerList);
      if (centerList.length > 0 && !selectedCenterId) {
        setSelectedCenterId(centerList[0].id);
      }
      setInstructors(instructorList);
      setPrograms(programList);

      // 스케줄 데이터 파싱
      const mappedSchedules = scheduleList.map((s) => {
        const prog = s.program || {};
        let cat = '요가';
        if (prog.name?.includes('필라테스')) cat = '필라테스';
        else if (prog.name?.includes('스피닝')) cat = '스피닝';
        else if (prog.name?.includes('PT') || prog.maxCapacity === 1) cat = 'PT';
        else if (prog.name?.includes('크로스핏')) cat = '크로스핏';

        return {
          id: String(s.id),
          rawId: s.id,
          title: prog.name || '수업',
          type: cat,
          studioId: s.studioId || 'A',
          instructorId: String(s.instructor?.id || prog.instructor?.id || ''),
          instructorName: s.instructor?.name || prog.instructor?.name || '-',
          date: dayjs(s.programDat).format('YYYY-MM-DD'),
          startTime: prog.startTime || '09:00',
          endTime: prog.endTime || '10:00',
          capacity: prog.maxCapacity || 10,
          bookingCount: s.bookingCount || 0,
          waitlistCount: s.waitlistCount || 0,
          waitlistCapacity: s.waitlistCapacity,
          booked: Array.from({ length: s.bookingCount || 0 }, (_, i) => ({ id: `booking-count-${s.id}-${i}` })),
          waitlist: Array.from({ length: s.waitlistCount || 0 }, (_, i) => ({ id: `wait-count-${s.id}-${i}` })),
        };
      });

      // 만약 백엔드 스케줄이 비어있다면 가이드용 기본 데이터 세팅
      if (mappedSchedules.length === 0) {
        const todayStr = dayjs().format('YYYY-MM-DD');
        mappedSchedules.push(
          {
            id: 'mock-1',
            title: '오전 비까 요가',
            type: '요가',
            studioId: 'A',
            instructorId: instructorList[0]?.id ? String(instructorList[0].id) : '1',
            instructorName: instructorList[0]?.name || '김유라',
            date: todayStr,
            startTime: '07:00',
            endTime: '08:00',
            capacity: 10,
            bookingCount: 8,
            waitlistCount: 2,
            booked: Array.from({ length: 8 }, (_, i) => ({
              id: `mb-1-${i}`,
              name: `회원 ${i + 1}`,
              phone: `010-1234-${1000 + i}`,
              ticketStatus: '요가 10회권',
              ticketRemaining: 8,
              ticketTotal: 10,
              bookedAt: '10.02 09:30',
            })),
            waitlist: [
              {
                id: 'mw-1-1',
                name: '이수민',
                phone: '010-8888-1111',
                ticketStatus: '요가 10회권',
                ticketRemaining: 10,
                ticketTotal: 10,
                bookedAt: '10.03 14:20',
              },
            ],
          },
          {
            id: 'mock-2',
            title: '리포머 필라테스',
            type: '필라테스',
            studioId: 'B',
            instructorId: instructorList[1]?.id ? String(instructorList[1].id) : '2',
            instructorName: instructorList[1]?.name || '박민준',
            date: todayStr,
            startTime: '09:00',
            endTime: '10:00',
            capacity: 8,
            bookingCount: 8,
            waitlistCount: 1,
            booked: Array.from({ length: 8 }, (_, i) => ({
              id: `mb-2-${i}`,
              name: `회원 ${i + 1}`,
              phone: `010-5555-${1000 + i}`,
              ticketStatus: '필라테스 20회권',
              ticketRemaining: 15,
              ticketTotal: 20,
              bookedAt: '10.01 11:00',
            })),
            waitlist: [],
          },
          {
            id: 'mock-3',
            title: '스피닝 인터벌',
            type: '스피닝',
            studioId: 'A',
            instructorId: instructorList[2]?.id ? String(instructorList[2].id) : '3',
            instructorName: instructorList[2]?.name || '이서연',
            date: todayStr,
            startTime: '10:30',
            endTime: '11:20',
            capacity: 12,
            bookingCount: 7,
            waitlistCount: 0,
            booked: Array.from({ length: 7 }, (_, i) => ({
              id: `mb-3-${i}`,
              name: `회원 ${i + 1}`,
              phone: `010-7777-${1000 + i}`,
              ticketStatus: '스피닝 자유이용권',
              ticketRemaining: 25,
              ticketTotal: 30,
              bookedAt: '10.03 18:00',
            })),
            waitlist: [],
          }
        );
      }

      setSchedules(mappedSchedules);

      // 강사 사용자 감지
      if (memberInfoRes.data) {
        const foundIns = instructorList.find((i) => i.name === memberInfoRes.data.name);
        if (foundIns) {
          setCurrentInstructorId(String(foundIns.id));
        }
      }
    } catch (err) {
      console.error(err);
      message.error('스케줄 데이터를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCenterId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 강사 역할일 때 강사 필터를 본인으로 잠금
  useEffect(() => {
    if (isInstructor) {
      if (!currentInstructorId) {
        const found = instructors.find((i) => i.name === '김유라') || instructors[0];
        const defaultId = found ? String(found.id) : '1';
        setCurrentInstructorId(defaultId);
        setInstructorFilter(defaultId);
      } else {
        setInstructorFilter(currentInstructorId);
      }
    } else {
      setInstructorFilter('all');
    }
  }, [isInstructor, currentInstructorId, instructors]);

  const year = viewDate.year();
  const month = viewDate.month();

  // 필터링된 스케줄
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (isInstructor && currentInstructorId && String(s.instructorId) !== String(currentInstructorId)) return false;
      if (instructorFilter !== 'all' && String(s.instructorId) !== String(instructorFilter)) return false;
      if (studioFilter !== 'all' && s.studioId !== studioFilter) return false;
      if (typeFilter !== 'all' && s.type !== typeFilter) return false;
      if (searchQuery && !(s.title || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [schedules, isInstructor, currentInstructorId, instructorFilter, studioFilter, typeFilter, searchQuery]);

  const calendarCells = useMemo(() => getCalendarDays(year, month), [year, month]);

  const schedulesByDate = useMemo(() => {
    const map = new Map();
    filteredSchedules.forEach((s) => {
      const existing = map.get(s.date) || [];
      existing.push(s);
      map.set(s.date, existing);
    });
    return map;
  }, [filteredSchedules]);

  const todayKey = dayjs().format('YYYY-MM-DD');

  const goToPrevMonth = () => setViewDate(viewDate.subtract(1, 'month'));
  const goToNextMonth = () => setViewDate(viewDate.add(1, 'month'));
  const goToToday = () => {
    setViewDate(dayjs());
    setTimelineDate(todayKey);
  };

  const openDrawer = (cls) => {
    setSelectedClass(cls);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setSelectedClass(null);
  };

  const instructorName = (id) => instructors.find((i) => String(i.id) === String(id))?.name || '-';
  const studioName = (id) => (id === 'B' ? '스튜디오 B룸' : '스튜디오 A룸');

  const listSchedules = useMemo(() => {
    return [...filteredSchedules].sort((a, b) => {
      if (a.date !== b.date) return (a.date || '').localeCompare(b.date || '');
      return (a.startTime || '').localeCompare(b.startTime || '');
    });
  }, [filteredSchedules]);

  const studioOptions = useMemo(
    () => STUDIOS.map((s) => ({ value: s.id, label: s.name })),
    []
  );

  const typeOptions = useMemo(
    () => CLASS_TYPES.map((t) => ({ value: t, label: t === 'all' ? '전체' : t })),
    []
  );

  const instructorOptions = useMemo(
    () => [
      { value: 'all', label: '전체' },
      ...instructors.map((ins) => ({ value: String(ins.id), label: ins.name })),
    ],
    [instructors]
  );

  return (
    <DashboardLayout title="수업 스케줄 관리">
      <div className="space-y-4 p-1 min-h-screen">
        {/* ==================================================== */}
        {/* 1. 상단 타이틀 & 관리 액션 (버튼 크기 & 높이 일치) */}
        {/* ==================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">수업 스케줄</h1>
              {/* 역할 스위처 (개발 및 RBAC 데모용) */}
              <div className="relative inline-flex items-center">
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  style={{ backgroundImage: 'none' }}
                  className="appearance-none bg-none [background-image:none] text-xs font-semibold pl-3 pr-7 py-1 rounded-xl bg-violet-100/70 hover:bg-violet-100 text-violet-700 border border-violet-200/60 outline-none cursor-pointer transition-colors shadow-2xs"
                  title="역할 전환"
                >
                  <option value="OWNER">관리자 (Owner)</option>
                  <option value="MANAGER">매니저 (Manager)</option>
                  <option value="INSTRUCTOR">강사 (Instructor)</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-violet-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-1">주간·월간 일정과 전체 수업을 한 화면에서 관리합니다.</p>
          </div>

          <div className="flex items-center gap-2">
            {/* 1. 메인 액션: 수업 추가 / 개인 레슨 추가 */}
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="h-9 px-4 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm shadow-violet-500/20 transition-all whitespace-nowrap cursor-pointer border-0"
            >
              <Plus className="w-3.5 h-3.5" />
              {isInstructor ? '개인 레슨 추가' : '수업 추가'}
            </button>

            {/* 2. 관리자/매니저만 보이는 수업 관리 (ClassTemplateManageModal) */}
            {isAdmin && (
              <button
                type="button"
                onClick={() => setTemplateModalOpen(true)}
                className="h-9 px-4 rounded-full border border-violet-200/90 bg-white/90 hover:bg-violet-50 text-zinc-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-violet-600" />
                수업 관리
              </button>
            )}
          </div>
        </div>

        {/* ==================================================== */}
        {/* 2. 1단: 날짜 탐색 & 오늘 버튼 + 시원하게 조절된 뷰 토글 바 */}
        {/* ==================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 날짜 탐색 & 오늘 버튼 (바로 우측 옆 배치) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/80 border border-zinc-200/80 rounded-2xl p-1 px-3 shadow-xs">
              <button
                type="button"
                onClick={goToPrevMonth}
                aria-label="이전 월"
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-zinc-500" />
              </button>
              <div className="flex items-center gap-2 px-3 text-sm font-bold text-zinc-800 select-none">
                <Calendar className="w-4 h-4 text-violet-600" />
                <span>{viewDate.format('YYYY년 M월')}</span>
              </div>
              <button
                type="button"
                onClick={goToNextMonth}
                aria-label="다음 월"
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-500 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </div>
            {/* 오늘 버튼을 날짜 바로 옆에 배치 */}
            <button
              type="button"
              onClick={goToToday}
              className="px-3.5 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold border border-violet-100 transition-all cursor-pointer whitespace-nowrap shadow-2xs"
            >
              오늘
            </button>
          </div>

          {/* 우측: 뷰 토글 바 */}
          <div className="h-10 flex items-center gap-1 p-1 rounded-full bg-violet-50/70 backdrop-blur-xl border border-violet-200/60 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`h-8 flex items-center gap-1.5 px-4 rounded-full text-xs transition-all border cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white text-violet-700 shadow-sm font-bold border-violet-200/80'
                    : 'border-transparent text-zinc-500 font-medium bg-transparent hover:text-zinc-800'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5 text-violet-600" />
                월간 캘린더
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`h-8 flex items-center gap-1.5 px-4 rounded-full text-xs transition-all border cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white text-violet-700 shadow-sm font-bold border-violet-200/80'
                    : 'border-transparent text-zinc-500 font-medium bg-transparent hover:text-zinc-800'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5 text-violet-600" />
                타임라인
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`h-8 flex items-center gap-1.5 px-4 rounded-full text-xs transition-all border cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-violet-700 shadow-sm font-bold border-violet-200/80'
                    : 'border-transparent text-zinc-500 font-medium bg-transparent hover:text-zinc-800'
                }`}
              >
                <List className="w-3.5 h-3.5 text-violet-600" />
                리스트
              </button>
            </div>
          </div>

        {/* ==================================================== */}
        {/* 3. 2단: 필터 & 검색 바 */}
        {/* ==================================================== */}
        <div className="relative z-30 bg-white/70 backdrop-blur-2xl rounded-2xl p-3 shadow-xs border border-violet-200/60">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* 스튜디오 필터 */}
              <FilterDropdown
                label="스튜디오"
                value={studioFilter}
                options={studioOptions}
                onSelect={(val) => setStudioFilter(val)}
              />

              {/* 강사 필터 */}
              <FilterDropdown
                label="강사"
                value={instructorFilter}
                options={instructorOptions}
                onSelect={(val) => setInstructorFilter(val)}
                disabled={isInstructor}
                disabledLabel={
                  instructors.find((i) => String(i.id) === String(currentInstructorId))?.name || '본인 (강사)'
                }
              />

              {/* 유형 필터 */}
              <FilterDropdown
                label="유형"
                value={typeFilter}
                options={typeOptions}
                onSelect={(val) => setTypeFilter(val)}
              />
            </div>

            {/* 검색 인풋 */}
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="수업명 검색..."
                className="w-48 sm:w-60 text-xs bg-violet-50/50 border border-violet-200/70 rounded-full px-3.5 py-2 pl-9 outline-none focus:border-violet-500 focus:bg-white placeholder:text-zinc-400 text-zinc-700"
              />
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* 4. 월간 캘린더 뷰 */}
        {/* ==================================================== */}
        {viewMode === 'calendar' && (
          <div className="relative z-10 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xs border border-violet-100/80">
            <div className="grid grid-cols-7 gap-2 mb-2">
              {WEEKDAYS.map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-xs font-bold py-2 ${
                    i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-zinc-400'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {calendarCells.map((day, idx) => {
                if (day === null) return <div key={idx} className="min-h-[110px] rounded-2xl bg-violet-50/20" />;
                const dateKey = formatDateKey(year, month, day);
                const daySchedules = schedulesByDate.get(dateKey) || [];
                const isToday = dateKey === todayKey;
                const isWeekend = idx % 7 === 0 || idx % 7 === 6;

                return (
                  <div
                    key={idx}
                    className={`min-h-[110px] rounded-2xl p-2 border transition-all ${
                      isToday
                        ? 'bg-violet-50/80 border-violet-300 shadow-xs ring-1 ring-violet-300'
                        : 'bg-white/70 border-violet-100/50 hover:bg-violet-50/30'
                    }`}
                  >
                    <div className={`text-xs font-bold mb-1.5 ${isToday ? 'text-violet-700' : isWeekend ? 'text-zinc-400' : 'text-zinc-700'}`}>
                      {day}
                    </div>
                    <div className="space-y-1.5">
                      {daySchedules.slice(0, 3).map((cls) => {
                        const full = (cls.booked?.length || 0) >= cls.capacity;

                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => openDrawer(cls)}
                            className={`w-full text-left p-1.5 rounded-xl transition-all text-[10px] cursor-pointer ${
                              full
                                ? 'bg-violet-100 border border-violet-200 text-violet-800 hover:bg-violet-200/70'
                                : 'bg-violet-50/90 border border-violet-100 text-zinc-800 hover:bg-violet-100/80'
                            }`}
                          >
                            <div className="font-bold truncate">{cls.title}</div>
                            <div className="flex items-center gap-1 mt-0.5 opacity-80 text-[9px]">
                              <Clock className="w-2.5 h-2.5" />
                              {cls.startTime}
                            </div>
                            <div className="flex items-center justify-between mt-0.5">
                              <span className="opacity-60">{cls.instructorName}</span>
                              <span className={full ? 'text-violet-700 font-bold bg-violet-200/80 px-1 rounded-full' : 'text-zinc-500 font-medium'}>
                                {full ? '마감' : `${cls.booked?.length || 0}/${cls.capacity}`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                      {daySchedules.length > 3 && (
                        <div className="text-[10px] text-zinc-400 px-1.5 font-medium">
                          +{daySchedules.length - 3}개 더
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. 타임라인 (간트) 뷰 */}
        {/* ==================================================== */}
        {viewMode === 'timeline' && (
          <div className="relative z-10">
            <GanttTimeline
              schedules={filteredSchedules}
              instructors={instructors}
              timelineDate={timelineDate}
              onTimelineDateChange={setTimelineDate}
              todayKey={todayKey}
              openDrawer={openDrawer}
              isInstructor={isInstructor}
              currentInstructorId={currentInstructorId}
            />
          </div>
        )}

        {/* ==================================================== */}
        {/* 6. 리스트 뷰 */}
        {/* ==================================================== */}
        {viewMode === 'list' && (
          <div className="relative z-10 bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xs border border-violet-100/80">
            <div className="space-y-3">
              {listSchedules.map((cls) => {
                const full = (cls.booked?.length || 0) >= cls.capacity;

                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => openDrawer(cls)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left border bg-white/90 border-violet-100/70 hover:border-violet-300 shadow-xs cursor-pointer"
                  >
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl flex-shrink-0 bg-violet-100/80 text-violet-700">
                      <span className="text-xs font-semibold">{cls.date.split('-')[1]}.{cls.date.split('-')[2]}</span>
                      <span className="text-lg font-bold leading-none mt-0.5">{cls.startTime}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-zinc-900 truncate text-sm">{cls.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-violet-100/70 text-violet-700 border border-violet-200/60 text-[10px] font-semibold flex-shrink-0">
                          {cls.type}
                        </span>
                        {full && (
                          <span className="px-2 py-0.5 rounded-full bg-violet-200/70 text-violet-800 text-[10px] font-bold flex-shrink-0">
                            정원 마감
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-violet-500" />
                          {studioName(cls.studioId)}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-violet-500" />
                          {cls.instructorName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-violet-500" />
                          <span className={full ? 'text-violet-700 font-bold' : ''}>
                            {cls.booked?.length || 0}/{cls.capacity}명
                          </span>
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-300 flex-shrink-0" />
                  </button>
                );
              })}
              {listSchedules.length === 0 && (
                <div className="text-center py-12 text-zinc-400 text-xs">해당 조건의 수업 스케줄이 없습니다.</div>
              )}
            </div>
          </div>
        )}

        {/* 상세 드로어 */}
        <ScheduleDetailDrawer
          open={drawerOpen}
          onClose={closeDrawer}
          cls={selectedClass}
          isAdmin={isAdmin}
          isInstructor={isInstructor}
          instructors={instructors}
          onInstructorChange={(newInstructorId) => {
            loadData();
          }}
          onScheduleChanged={loadData}
          onCancelBooking={loadData}
          onPromoteWaitlist={() => {
            loadData();
          }}
          onNavigateToAttendance={(classId) => {
            closeDrawer();
            navigate(`/admin/attendance?classId=${classId}`);
          }}
        />

        {/* 수업 추가 모달 */}
        <ClassCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onOpenTemplateManage={() => {
            setCreateModalOpen(false);
            setTemplateModalOpen(true);
          }}
          onSubmit={() => {
            loadData();
          }}
          centers={centers}
          instructors={instructors}
          programs={programs}
          selectedCenterId={selectedCenterId}
          userRole={userRole}
          currentInstructorId={currentInstructorId}
        />

        {/* 수업 템플릿 마스터 관리 모달 */}
        <ClassTemplateManageModal
          open={templateModalOpen}
          onClose={() => setTemplateModalOpen(false)}
          instructors={instructors}
          onTemplatesChanged={() => {
            loadData();
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default BookingSchedule;
