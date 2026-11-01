import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import axios from 'axios';
import { message } from 'antd';
import DashboardLayout from '../../../components/DashboardLayout';
import { fetchCenters } from '../../../api/centerApi';
import { fetchInstructors } from '../../../api/instructorApi';
import { fetchRealPrograms } from '../../../api/realProgramApi';
import { fetchAttendance } from '../../../api/attendanceApi';

import AttendanceFilterBar from './AttendanceFilterBar';
import AttendanceStatusModal from './AttendanceStatusModal';
import {
  Calendar,
  Clock,
  Users,
  StickyNote,
  FileText,
  ArrowRight,
  X,
  Zap,
  ChevronDown,
} from './Icons';

dayjs.locale('ko');

const TODAY = dayjs().format('YYYY-MM-DD');

export const AttendancePage = () => {
  const [searchParams] = useSearchParams();

  // ── 1. 기본 필터 상태 ──
  const initialClassId = searchParams.get('classId') || '';
  const initialDate = searchParams.get('date') || TODAY;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
  const [selectedCenterId, setSelectedCenterId] = useState('all');
  const [selectedInstructorId, setSelectedInstructorId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'completed' | 'pending'
  const [searchQuery, setSearchQuery] = useState('');
  const [userRole, setUserRole] = useState('OWNER'); // 'OWNER' | 'MANAGER' | 'INSTRUCTOR'

  // ── 2. 선택된 수업 및 모달/서랍 상태 ──
  const [selectedClassId, setSelectedClassId] = useState(initialClassId);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeModalMember, setActiveModalMember] = useState(null);

  // ── 3. 백엔드 데이터 상태 ──
  const [centers, setCenters] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [classAttendanceMap, setClassAttendanceMap] = useState({}); // { [scheduleId]: AttendanceRow[] }
  const [loading, setLoading] = useState(true);
  const [savingClassId, setSavingClassId] = useState(null);

  const isInstructor = userRole === 'INSTRUCTOR';

  // ── 4. 백엔드 기본 데이터 로드 ──
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const [centerRes, instructorRes, scheduleRes] = await Promise.all([
        fetchCenters().catch(() => []),
        fetchInstructors().catch(() => []),
        fetchRealPrograms().catch(() => []),
      ]);

      const centerList = Array.isArray(centerRes) ? centerRes : [];
      const instructorList = Array.isArray(instructorRes) ? instructorRes : [];
      const scheduleList = Array.isArray(scheduleRes) ? scheduleRes : [];

      setCenters(centerList);
      setInstructors(instructorList);

      if (scheduleList.length > 0) {
        const mapped = scheduleList.map((s) => {
          const prog = s.program || {};
          let cat = '요가';
          if (prog.name?.includes('필라테스')) cat = '필라테스';
          else if (prog.name?.includes('스피닝')) cat = '스피닝';
          else if (prog.name?.includes('PT') || prog.maxCapacity === 1) cat = 'PT';
          else if (prog.name?.includes('크로스핏')) cat = '크로스핏';

          let studioId = 'A';
          let studioName = 'Studio A (요가/GX)';
          if (prog.name?.includes('필라테스')) {
            studioId = 'B';
            studioName = 'Studio B (필라테스)';
          } else if (prog.name?.includes('스피닝')) {
            studioId = 'C';
            studioName = 'Studio C (스피닝)';
          } else if (prog.name?.includes('PT') || prog.name?.includes('피트니스') || prog.name?.includes('헬스') || prog.maxCapacity === 1) {
            studioId = 'D';
            studioName = '피트니스존 (PT/자유운동)';
          }

          return {
            id: String(s.id),
            rawId: s.id,
            title: prog.name || s.programName || '수업',
            type: cat,
            studioId,
            studioName,
            instructorId: String(s.instructor?.id || prog.instructor?.id || ''),
            instructorName: s.instructor?.name || prog.instructor?.name || '-',
            date: dayjs(s.programDat).format('YYYY-MM-DD'),
            startTime: prog.startTime || s.startTime || '09:00',
            endTime: prog.endTime || s.endTime || '10:00',
            capacity: prog.maxCapacity || 10,
            booked: [],
          };
        });
        setAllSchedules(mapped);
      } else {
        setAllSchedules([]);
      }
    } catch {
      setAllSchedules([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ── 5. 날짜별 수업 필터링 ──
  const daySchedules = useMemo(() => {
    let list = allSchedules.filter((s) => s.date === selectedDate);

    if (selectedCenterId && selectedCenterId !== 'all') {
      list = list.filter((s) => String(s.centerId) === String(selectedCenterId));
    }

    if (isInstructor) {
      const insId = instructors[0]?.id ? String(instructors[0].id) : '1';
      list = list.filter((s) => s.instructorId === insId);
    } else if (selectedInstructorId && selectedInstructorId !== 'all') {
      list = list.filter((s) => s.instructorId === selectedInstructorId);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (s) =>
          s.title?.toLowerCase().includes(q) ||
          s.instructorName?.toLowerCase().includes(q) ||
          s.studioName?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  }, [allSchedules, selectedDate, selectedCenterId, isInstructor, instructors, selectedInstructorId, searchQuery]);

  // ── 6. 각 수업의 출결 상세 데이터 로드 / 동기화 ──
  const ensureClassAttendance = useCallback(
    async (cls) => {
      if (!cls || classAttendanceMap[cls.id]) return;

      if (cls.rawId && !String(cls.rawId).startsWith('mock-')) {
        try {
          const attData = await fetchAttendance(cls.rawId).catch(() => null);
          if (Array.isArray(attData)) {
            const mappedRows = attData.map((a, idx) => ({
              memberId: a.memberId || `m-${idx}`,
              memberName: a.memberName || `회원 ${idx + 1}`,
              memberPhone: a.memberHp || '010-0000-0000',
              ticketStatus: '이용권 예약',
              ticketRemaining: 8,
              ticketTotal: 10,
              status: a.attendanceStatus?.toLowerCase() === 'present' ? 'present' : a.attendanceStatus?.toLowerCase() === 'absent' ? 'absent' : 'hold',
              checkInTime: a.attendanceStatus?.toLowerCase() === 'present' ? '09:00:00' : null,
              memo: '',
            }));
            setClassAttendanceMap((prev) => ({ ...prev, [cls.id]: mappedRows }));
            return;
          }
        } catch {}
      }

      if (cls.booked && cls.booked.length > 0) {
        setClassAttendanceMap((prev) => ({ ...prev, [cls.id]: cls.booked }));
      } else {
        setClassAttendanceMap((prev) => ({ ...prev, [cls.id]: [] }));
      }
    },
    [classAttendanceMap]
  );

  useEffect(() => {
    daySchedules.forEach((cls) => {
      ensureClassAttendance(cls);
    });
  }, [daySchedules, ensureClassAttendance]);

  // 개별 수업의 출결 통계
  const getClassStats = useCallback(
    (cls) => {
      if (!cls) return { total: 0, present: 0, absent: 0, hold: 0 };
      const rows = classAttendanceMap[cls.id] || cls.booked || [];
      const total = rows.length;
      let present = 0;
      let absent = 0;
      let hold = 0;
      rows.forEach((r) => {
        if (r.status === 'present') present++;
        else if (r.status === 'absent') absent++;
        else hold++;
      });
      return { total, present, absent, hold };
    },
    [classAttendanceMap]
  );

  // ── 필터링된 당일 수업 목록 (출결 완료 여부: 'all' | 'pending' | 'completed') ──
  const filteredDaySchedules = useMemo(() => {
    return daySchedules.filter((cls) => {
      const st = getClassStats(cls);
      const isCompleted = st.total > 0 && st.hold === 0;
      if (statusFilter === 'completed') return isCompleted;
      if (statusFilter === 'pending') return !isCompleted;
      return true;
    });
  }, [daySchedules, getClassStats, statusFilter]);

  // 첫 번째 수업 자동 선택
  useEffect(() => {
    if (filteredDaySchedules.length > 0) {
      if (initialClassId && filteredDaySchedules.some((s) => s.id === initialClassId)) {
        setSelectedClassId(initialClassId);
      } else if (!filteredDaySchedules.some((s) => s.id === selectedClassId)) {
        setSelectedClassId(filteredDaySchedules[0].id);
      }
    } else {
      setSelectedClassId('');
    }
  }, [filteredDaySchedules, initialClassId, selectedClassId]);

  // 현재 선택된 수업
  const selectedClass = useMemo(() => {
    return filteredDaySchedules.find((s) => s.id === selectedClassId) || filteredDaySchedules[0] || null;
  }, [filteredDaySchedules, selectedClassId]);

  const currentRows = useMemo(() => {
    if (!selectedClass) return [];
    return classAttendanceMap[selectedClass.id] || selectedClass.booked || [];
  }, [classAttendanceMap, selectedClass]);


  // ── 7. 당일 전체 통계 (콤팩트 알약 바용) ──
  const dayKpiStats = useMemo(() => {
    let total = 0;
    let present = 0;
    let absent = 0;
    let hold = 0;

    daySchedules.forEach((cls) => {
      const st = getClassStats(cls);
      total += st.total;
      present += st.present;
      absent += st.absent;
      hold += st.hold;
    });

    return { total, present, absent, hold };
  }, [daySchedules, classAttendanceMap]);

  // ── 8. 출결 상태 단일 변경 (1클릭 토글) ──
  const handleUpdateStatus = (classId, memberId, newStatus) => {
    setClassAttendanceMap((prev) => {
      const rows = prev[classId] || [];
      const updated = rows.map((r) => {
        if (r.memberId !== memberId) return r;
        const now = dayjs().format('HH:mm:ss');
        return {
          ...r,
          status: newStatus,
          checkInTime: newStatus === 'present' ? r.checkInTime || now : null,
        };
      });
      return { ...prev, [classId]: updated };
    });
  };

  // ── 9. 인라인 메모 변경 ──
  const handleUpdateMemo = (classId, memberId, memo) => {
    setClassAttendanceMap((prev) => {
      const rows = prev[classId] || [];
      const updated = rows.map((r) => (r.memberId === memberId ? { ...r, memo } : r));
      return { ...prev, [classId]: updated };
    });
  };

  // ── 10. 전체 출석 처리 (Mark All Present) ──
  const handleMarkAllPresent = (classId) => {
    const now = dayjs().format('HH:mm:ss');
    setClassAttendanceMap((prev) => {
      const rows = prev[classId] || [];
      const updated = rows.map((r) => ({
        ...r,
        status: 'present',
        checkInTime: r.checkInTime || now,
      }));
      return { ...prev, [classId]: updated };
    });
    message.success('해당 수업의 모든 회원이 출석 처리되었습니다.');
  };

  // ── 11. 백엔드 출결 저장 ──
  const handleSaveAttendance = async (classId) => {
    const cls = daySchedules.find((s) => s.id === classId);
    if (!cls) return;

    const rows = classAttendanceMap[classId] || [];
    setSavingClassId(classId);
    try {
      if (cls.rawId && !String(cls.rawId).startsWith('mock-')) {
        const records = rows
          .filter((r) => r.status === 'present' || r.status === 'absent')
          .map((r) => ({
            memberId: r.memberId,
            status: r.status === 'present' ? 'PRESENT' : 'ABSENT',
          }));
        await axios.post(`/api/attendance/${cls.rawId}`, records);
      }
      message.success('출결 저장이 성공적으로 완료되었습니다.');
    } catch {
      message.error('출결 저장 중 오류가 발생했습니다.');
    } finally {
      setSavingClassId(null);
    }
  };

  // ── 12. 모달에서 상세 저장 (사유/시간 포함) ──
  const handleModalSave = ({ memberId, status, checkInTime, memo }) => {
    if (!selectedClass) return;
    setClassAttendanceMap((prev) => {
      const rows = prev[selectedClass.id] || [];
      const updated = rows.map((r) => {
        if (r.memberId !== memberId) return r;
        return { ...r, status, checkInTime, memo };
      });
      return { ...prev, [selectedClass.id]: updated };
    });
    message.success('회원 출결 상세 내역이 반영되었습니다.');
  };

  // 우측 서랍 열기
  const openClassDrawer = (classId) => {
    setSelectedClassId(classId);
    setDrawerOpen(true);
  };

  return (
    <DashboardLayout title="출결 관리">
      <div className="space-y-4 p-1 min-h-screen">
        {/* ── 1. 최상단 타이틀 ── */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">출결 관리</h1>
              {/* 역할 선택 드롭다운 뱃지 (수업 스케줄과 위치 및 규격 통일) */}
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
            <p className="text-xs text-zinc-400 mt-1">
              당일 수업 출결 체크와 회원별 출석 현황을 모니터링합니다.
            </p>
          </div>
          {isInstructor && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-[#7C3AED] text-xs font-bold shadow-2xs">
              <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>강사 출결 체크 모드</span>
            </div>
          )}
        </div>

        {/* ── 2. 컨트롤 바 (1단: 날짜 & 뷰 토글 / 2단: 필터 & 검색 / 3단: 콤팩트 알약 바) ── */}
        <AttendanceFilterBar
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          stats={dayKpiStats}
          centers={centers}
          selectedCenterId={selectedCenterId}
          onCenterChange={setSelectedCenterId}
          instructors={instructors}
          selectedInstructorId={selectedInstructorId}
          onInstructorChange={setSelectedInstructorId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          isInstructor={isInstructor}
          loggedInInstructorName={
            instructors.find((i) => i.name === '김유라')?.name ||
            instructors[0]?.name ||
            '이강사'
          }
        />

        {/* ── 3. 메인 콘텐츠 분기 ── */}

        {/* ─────────────────────────────────────────────────────────────
            MODE A: 통합 리스트 뷰 (관리자 기본 / 원본 시안 기준)
            ───────────────────────────────────────────────────────────── */}
        {viewMode === 'list' && (
          <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-6 shadow-xs border border-violet-100/80">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">당일 전체 수업 일정 및 출결 현황</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  수업을 클릭하면 서랍(Drawer)에서 출석부를 바로 열고 관리할 수 있습니다.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#7C3AED] bg-violet-50 px-3 py-1 rounded-full border border-violet-200/50">
                총 {filteredDaySchedules.length}개 수업
              </span>
            </div>

            {filteredDaySchedules.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-violet-100/80 text-xs font-bold text-zinc-400">
                      <th className="py-3 px-4">시간</th>
                      <th className="py-3 px-4">수업 정보</th>
                      <th className="py-3 px-4">강사 / 룸</th>
                      <th className="py-3 px-4 text-center">예약 현황</th>
                      <th className="py-3 px-4 text-center">출결 상세 현황</th>
                      <th className="py-3 px-4 text-center">출결 상태</th>
                      <th className="py-3 px-4 text-right">출석부</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-violet-50/60 text-sm">
                    {filteredDaySchedules.map((cls) => {
                      const st = getClassStats(cls);
                      const isCompleted = st.total > 0 && st.hold === 0;
                      const isSelected = cls.id === selectedClassId;

                      return (
                        <tr
                          key={cls.id}
                          onClick={() => openClassDrawer(cls.id)}
                          className={`hover:bg-violet-50/40 transition-colors cursor-pointer ${
                            isSelected ? 'bg-violet-50/20' : ''
                          }`}
                        >
                          {/* 시간 */}
                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-extrabold text-zinc-900 text-base">{cls.startTime}</span>
                            <span className="text-xs text-zinc-400 block mt-0.5">{cls.endTime}</span>
                          </td>

                          {/* 수업명 & 카테고리 */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-800 text-sm">{cls.title}</span>
                              <span className="px-2 py-0.5 rounded-full bg-violet-100 text-[#7C3AED] text-[10px] font-bold">
                                {cls.type}
                              </span>
                            </div>
                          </td>

                          {/* 강사 / 스튜디오 */}
                          <td className="py-4 px-4 whitespace-nowrap text-xs">
                            <div className="font-medium text-zinc-800">{cls.instructorName}</div>
                            <div className="text-zinc-400 mt-0.5">{cls.studioName}</div>
                          </td>

                          {/* 예약 인원 */}
                          <td className="py-4 px-4 text-center whitespace-nowrap text-xs">
                            <span className="font-extrabold text-zinc-900 text-sm">{st.total}</span>
                            <span className="text-zinc-400">/{cls.capacity}명</span>
                          </td>

                          {/* 출결 상세 현황 */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#7C3AED] font-bold text-[11px]">
                                출석 {st.present}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-bold text-[11px]">
                                결석 {st.absent}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-bold text-[11px]">
                                미체크 {st.hold}
                              </span>
                            </div>
                          </td>

                          {/* 출결 상태 */}
                          <td className="py-4 px-4 text-center whitespace-nowrap">
                            {isCompleted ? (
                              <span className="px-2.5 py-1 rounded-full bg-[#7C3AED] text-white text-xs font-bold shadow-xs">
                                완료
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-zinc-100 text-zinc-500 text-xs font-semibold">
                                대기
                              </span>
                            )}
                          </td>

                          {/* 출석부 액션 */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openClassDrawer(cls.id);
                              }}
                              className="h-8 px-3.5 rounded-full bg-white hover:bg-violet-50 text-[#7C3AED] border border-violet-200/80 text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1 cursor-pointer"
                            >
                              출석부
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-zinc-400">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">
                  {statusFilter === 'completed'
                    ? '출결 완료된 수업이 없습니다.'
                    : statusFilter === 'pending'
                    ? '출결 대기 중인 수업이 없습니다.'
                    : '선택한 날짜에 등록된 수업 일정이 없습니다.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            MODE B: 수업별 상세 뷰 (강사 기본 / 상단 카드 + 하단 출석부)
            ───────────────────────────────────────────────────────────── */}
        {viewMode === 'detail' && (
          <div className="space-y-5">
            {/* 상단 수업 카드 캐러셀 */}
            <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-5 shadow-xs border border-violet-100/80">
              <h3 className="text-sm font-bold text-zinc-700 mb-3">
                {dayjs(selectedDate).format('YYYY.MM.DD')} 수업
                <span className="ml-2 text-zinc-400 font-normal">({filteredDaySchedules.length}개)</span>
              </h3>

              {filteredDaySchedules.length > 0 ? (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {filteredDaySchedules.map((cls) => {
                    const isSelected = cls.id === selectedClass?.id;
                    const st = getClassStats(cls);
                    const isFull = st.total >= cls.capacity;

                    return (
                      <button
                        key={cls.id}
                        type="button"
                        onClick={() => setSelectedClassId(cls.id)}
                        className={`flex-shrink-0 w-60 p-4 rounded-2xl text-left transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#7C3AED] text-white border-violet-600 shadow-md ring-2 ring-violet-300'
                            : 'bg-white/90 border-violet-100 hover:border-violet-300 shadow-xs'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-bold ${isSelected ? 'text-white/80' : 'text-zinc-400'}`}>
                            {cls.startTime} - {cls.endTime}
                          </span>
                          {isFull && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-violet-100 text-violet-700'
                              }`}
                            >
                              마감
                            </span>
                          )}
                        </div>
                        <p className={`font-bold text-sm mb-1 truncate ${isSelected ? 'text-white' : 'text-zinc-800'}`}>
                          {cls.title}
                        </p>
                        <div className={`flex items-center gap-2 text-xs ${isSelected ? 'text-white/70' : 'text-zinc-500'}`}>
                          <span>{cls.studioName}</span>
                          <span>·</span>
                          <span>{cls.instructorName}</span>
                        </div>
                        <div className={`flex items-center gap-1 mt-2 text-xs ${isSelected ? 'text-white/70' : 'text-zinc-400'}`}>
                          <Users className="w-3 h-3" />
                          <span>{st.total}/{cls.capacity}명 예약</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-zinc-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">
                    {statusFilter === 'completed'
                      ? '출결 완료된 수업이 없습니다.'
                      : statusFilter === 'pending'
                      ? '출결 대기 중인 수업이 없습니다.'
                      : '이 날짜에 등록된 수업이 없습니다.'}
                  </p>
                </div>
              )}
            </div>

            {/* 하단 선택된 수업 출석부 테이블 */}
            {selectedClass && currentRows.length > 0 ? (
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xs border border-violet-100/80 overflow-hidden">
                <div className="px-6 py-4 border-b border-violet-100/80 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">{selectedClass.title} - 출석부</h2>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {selectedClass.startTime} - {selectedClass.endTime} · {selectedClass.studioName} · {selectedClass.instructorName}
                    </p>
                  </div>
                  {isInstructor && (
                    <span className="px-3 py-1 rounded-full bg-violet-100 text-[#7C3AED] text-xs font-bold">
                      강사 출결 체크 모드
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-violet-100/80 text-xs font-bold text-zinc-400">
                        <th className="text-left px-6 py-3.5">회원 정보</th>
                        <th className="text-left px-4 py-3.5">체크인 시간</th>
                        <th className="text-center px-4 py-3.5">출결 상태</th>
                        <th className="text-left px-4 py-3.5">메모 / 특이사항</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-violet-50/50 text-sm">
                      {currentRows.map((row) => (
                        <tr key={row.memberId} className="hover:bg-violet-50/30 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-[#7C3AED] text-sm font-bold flex-shrink-0">
                                {row.memberName?.charAt(0) || '회'}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-zinc-800">{row.memberName}</p>
                                <p className="text-xs text-zinc-500">{row.memberPhone}</p>
                                <p className="text-[10px] text-zinc-400 mt-0.5">
                                  {row.ticketStatus}
                                  {row.ticketTotal > 0 ? ` · 잔여 ${row.ticketRemaining}/${row.ticketTotal}` : ` · 잔여 ${row.ticketRemaining}회`}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5 text-sm text-zinc-600 font-mono">
                              <Clock className="w-3.5 h-3.5 text-violet-400" />
                              <span>{row.checkInTime || <span className="text-zinc-300">--:--:--</span>}</span>
                            </div>
                          </td>

                          <td className="px-4 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center gap-1.5 justify-center">
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(selectedClass.id, row.memberId, 'present')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  row.status === 'present'
                                    ? 'bg-[#7C3AED] text-white shadow-xs'
                                    : 'bg-zinc-100 text-zinc-500 hover:bg-violet-100 hover:text-violet-700'
                                }`}
                              >
                                출석
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(selectedClass.id, row.memberId, 'absent')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  row.status === 'absent'
                                    ? 'bg-rose-50 text-rose-600 shadow-xs ring-1 ring-rose-200'
                                    : 'bg-zinc-100 text-zinc-500 hover:bg-rose-50 hover:text-rose-600'
                                }`}
                              >
                                결석
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(selectedClass.id, row.memberId, 'hold')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                  row.status === 'hold'
                                    ? 'bg-zinc-200 text-zinc-700 shadow-xs'
                                    : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                                }`}
                              >
                                미체크
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-2 flex-1 px-1 py-1 border-b border-zinc-200/80 focus-within:border-violet-400 transition-colors">
                                <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                                <input
                                  type="text"
                                  value={row.memo || ''}
                                  onChange={(e) => handleUpdateMemo(selectedClass.id, row.memberId, e.target.value)}
                                  placeholder="특이사항 메모 (부상, 지각 등)..."
                                  className="w-full bg-transparent border-0 border-none p-0 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveModalMember(row);
                                  setStatusModalOpen(true);
                                }}
                                className="px-2 py-1 rounded-lg text-[11px] font-semibold text-violet-600 hover:text-violet-800 hover:bg-violet-50 transition-colors shrink-0 cursor-pointer"
                              >
                                상세
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* 하단 액션 바 */}
                <div className="px-6 py-4 border-t border-violet-100/80 flex items-center justify-between bg-violet-50/30">
                  {(() => {
                    const st = getClassStats(selectedClass);
                    return (
                      <div className="text-xs text-zinc-500 font-medium">
                        출석 {st.present} · 결석 {st.absent} · 미체크 {st.hold} / 총 {st.total}명
                      </div>
                    );
                  })()}
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleMarkAllPresent(selectedClass.id)}
                      className="h-9 px-4 rounded-full bg-white border border-violet-200/80 text-zinc-700 text-xs font-bold hover:bg-violet-50 transition-colors shadow-xs cursor-pointer"
                    >
                      전체 출석 처리
                    </button>
                    <button
                      type="button"
                      disabled={savingClassId === selectedClass.id}
                      onClick={() => handleSaveAttendance(selectedClass.id)}
                      className="h-9 px-5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20 cursor-pointer disabled:opacity-50"
                    >
                      {savingClassId === selectedClass.id ? '저장 중...' : '출결 저장 완료'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/70 backdrop-blur-2xl rounded-3xl p-12 shadow-xs border border-violet-100/80 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
                <p className="text-zinc-400 text-sm">예약된 회원이 없습니다.</p>
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            4. 우측 슬라이드 서랍 (Right Drawer) - 원본 시안 기준 우측 고정
            ───────────────────────────────────────────────────────────── */}
        {drawerOpen && selectedClass && typeof document !== 'undefined' && createPortal(
          <>
            {/* 백드롭 오버레이 (z-[140]) */}
            <div
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-xs z-[140] transition-opacity duration-200"
            />
            {/* 우측 슬라이드 서랍 (z-[150], fixed top-0 right-0 h-screen full-height 밀착) */}
            <div
              className="fixed top-0 right-0 h-screen z-[150] w-full max-w-md sm:max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
              style={{ top: 0, right: 0, height: '100vh' }}
            >
              <div className="p-6 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
                {/* 상단 타이틀 & 닫기 */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-zinc-900">{selectedClass.title}</h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-[#7C3AED] text-xs font-bold">
                        {selectedClass.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {selectedClass.date.replace(/-/g, '.')} · {selectedClass.startTime} - {selectedClass.endTime} · {selectedClass.instructorName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(false)}
                    className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 통계 요약 2카드 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-violet-50/40 border border-violet-100/60">
                    <p className="text-xs text-violet-400 font-medium">스튜디오</p>
                    <p className="text-sm font-bold text-zinc-800 mt-0.5">{selectedClass.studioName}</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-violet-50/40 border border-violet-100/60">
                    <p className="text-xs text-violet-400 font-medium">예약 현황</p>
                    <p className="text-sm font-bold text-zinc-800 mt-0.5">{currentRows.length}/{selectedClass.capacity}명</p>
                  </div>
                </div>

                {/* 출결 상태 요약 바 */}
                {(() => {
                  const st = getClassStats(selectedClass);
                  return (
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-violet-50/60 border border-violet-100">
                      <span className="text-xs font-bold text-violet-800">출결 상태 요약</span>
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-[#7C3AED] text-white font-bold">
                          출석 {st.present}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
                          결석 {st.absent}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-zinc-200 text-zinc-700 font-bold">
                          미체크 {st.hold}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* 회원 출석 체크 리스트 */}
                <div className="space-y-2.5">
                  {currentRows.map((row) => (
                    <div
                      key={row.memberId}
                      className="p-3.5 rounded-2xl bg-white border border-violet-100/70 hover:border-violet-300 transition-all shadow-xs space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        {/* 좌측: 회원 프로필 */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-[#7C3AED] text-xs font-bold flex-shrink-0">
                            {row.memberName?.charAt(0) || '회'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-zinc-800 truncate">{row.memberName}</p>
                            <p className="text-[10px] text-zinc-400 truncate">
                              {row.memberPhone}
                              {row.ticketTotal > 0 ? ` · 잔여 ${row.ticketRemaining}/${row.ticketTotal}` : ` · 잔여 ${row.ticketRemaining}회`}
                            </p>
                          </div>
                        </div>

                        {/* 우측: 체크인 시간 + 출결 토글 버튼 */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="flex items-center gap-1 text-[11px] font-medium text-zinc-500 bg-zinc-50 border border-zinc-100 px-2 py-1 rounded-lg">
                            <Clock className="w-3 h-3 text-[#7C3AED]" />
                            <span>{row.checkInTime || <span className="text-zinc-300">--:--:--</span>}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(selectedClass.id, row.memberId, 'present')}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                row.status === 'present'
                                  ? 'bg-[#7C3AED] text-white shadow-xs'
                                  : 'bg-zinc-100 text-zinc-500 hover:bg-violet-50'
                              }`}
                            >
                              출석
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(selectedClass.id, row.memberId, 'absent')}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                row.status === 'absent'
                                  ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                                  : 'bg-zinc-100 text-zinc-500 hover:bg-rose-50'
                              }`}
                            >
                              결석
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(selectedClass.id, row.memberId, 'hold')}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                                row.status === 'hold'
                                  ? 'bg-zinc-200 text-zinc-700'
                                  : 'bg-zinc-100 text-zinc-400'
                              }`}
                            >
                              미체크
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 메모 인라인 입력 (외곽선 박스 보더 제거 및 언더바 스타일) */}
                      <div className="flex items-center gap-2 mt-2 px-1 py-1 border-b border-zinc-200/80 focus-within:border-violet-400 transition-colors">
                        <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <input
                          type="text"
                          value={row.memo || ''}
                          onChange={(e) => handleUpdateMemo(selectedClass.id, row.memberId, e.target.value)}
                          placeholder="특이사항 메모 (부상, 지각 등)..."
                          className="w-full bg-transparent border-0 border-none p-0 text-xs text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-0"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 하단 고정 액션 버튼 */}
              <div className="p-4 px-6 border-t border-violet-100 flex items-center gap-2 bg-white shrink-0">
                <button
                  type="button"
                  onClick={() => handleMarkAllPresent(selectedClass.id)}
                  className="flex-1 py-3 rounded-full bg-violet-100 text-[#7C3AED] font-bold text-xs hover:bg-violet-200 transition-colors cursor-pointer"
                >
                  전체 출석
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await handleSaveAttendance(selectedClass.id);
                    setDrawerOpen(false);
                  }}
                  className="flex-1 py-3 rounded-full bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] transition-colors shadow-md shadow-violet-500/20 cursor-pointer"
                >
                  저장 후 닫기
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

        {/* ── 5. 회원 출석 상태 변경 / 사유 입력 모달 ── */}
        <AttendanceStatusModal
          open={statusModalOpen}
          onClose={() => setStatusModalOpen(false)}
          member={activeModalMember}
          classInfo={selectedClass}
          onSave={handleModalSave}
        />
      </div>
    </DashboardLayout>
  );
};

export default AttendancePage;

