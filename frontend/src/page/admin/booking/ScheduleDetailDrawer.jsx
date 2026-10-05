import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Clock,
  User,
  Users,
  MapPin,
  ChevronDown,
  Crown,
  Search,
  Zap,
  ArrowRight,
} from './Icons';

export function ScheduleDetailDrawer({
  open,
  onClose,
  cls,
  isAdmin = true,
  isInstructor = false,
  instructors = [],
  onInstructorChange,
  onCancelBooking,
  onPromoteWaitlist,
  onNavigateToAttendance,
}) {
  const [activeTab, setActiveTab] = useState('booked'); // 'booked' | 'waitlist'
  const [instructorDropdownOpen, setInstructorDropdownOpen] = useState(false);
  const [pendingInstructorId, setPendingInstructorId] = useState(null);
  const [pendingCancelMember, setPendingCancelMember] = useState(null);
  const [searchMember, setSearchMember] = useState('');

  // 안전한 배열 및 속성 참조 (옵셔널 체이닝 및 기본값)
  const bookedList = useMemo(() => {
    return Array.isArray(cls?.booked) ? cls.booked : [];
  }, [cls?.booked]);

  const waitlistList = useMemo(() => {
    return Array.isArray(cls?.waitlist) ? cls.waitlist : [];
  }, [cls?.waitlist]);

  const capacity = Number(cls?.capacity) || 10;
  const isFull = bookedList.length >= capacity;

  const currentInstructor = useMemo(() => {
    if (!cls?.instructorId) return { name: cls?.instructorName || '강사 미지정' };
    const found = instructors.find((i) => String(i.id) === String(cls.instructorId));
    return found || { name: cls?.instructorName || '강사 미지정' };
  }, [cls?.instructorId, cls?.instructorName, instructors]);

  const studioDisplayName = useMemo(() => {
    if (!cls?.studioId) return '스튜디오 미지정';
    if (cls.studioId === 'A') return 'Studio A';
    if (cls.studioId === 'B') return 'Studio B';
    return cls.studioId;
  }, [cls?.studioId]);

  // 검색어 필터링
  const filteredBooked = useMemo(() => {
    if (!searchMember.trim()) return bookedList;
    const q = searchMember.toLowerCase();
    return bookedList.filter(
      (m) => (m?.name && m.name.toLowerCase().includes(q)) || (m?.phone && m.phone.includes(q))
    );
  }, [bookedList, searchMember]);

  const filteredWaitlist = useMemo(() => {
    if (!searchMember.trim()) return waitlistList;
    const q = searchMember.toLowerCase();
    return waitlistList.filter(
      (m) => (m?.name && m.name.toLowerCase().includes(q)) || (m?.phone && m.phone.includes(q))
    );
  }, [waitlistList, searchMember]);

  // ESC 키로 닫기 지원
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (pendingCancelMember) {
          setPendingCancelMember(null);
        } else if (pendingInstructorId) {
          setPendingInstructorId(null);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, pendingCancelMember, pendingInstructorId]);

  if (!open || !cls) return null;

  const handleConfirmInstructorChange = () => {
    if (pendingInstructorId && onInstructorChange) {
      onInstructorChange(pendingInstructorId);
      setPendingInstructorId(null);
    }
  };

  const handleConfirmCancelBooking = () => {
    if (pendingCancelMember && onCancelBooking) {
      onCancelBooking(pendingCancelMember);
      setPendingCancelMember(null);
    }
  };

  const formattedDate = cls.date ? String(cls.date).replace(/-/g, '.') : '';
  const formattedTime = cls.startTime && cls.endTime ? `${cls.startTime} - ${cls.endTime}` : (cls.time || '');

  const drawerContent = (
    <>
      {/* ── 백드롭 오버레이 (z-[110]) ── */}
      <div
        onClick={onClose}
        className="fixed inset-0 top-0 left-0 right-0 bottom-0 bg-black/40 backdrop-blur-xs z-[110] transition-opacity duration-200"
      />

      {/* ── 우측 슬라이드 서랍 (화면 상하단 맨 위부터 맨 아래까지 꽉 채움: fixed inset-y-0 top-0 bottom-0 right-0 z-[120] h-screen) ── */}
      <div
        className="fixed inset-y-0 top-0 bottom-0 right-0 z-[120] w-full max-w-md bg-white shadow-2xl flex flex-col h-screen overflow-hidden animate-in slide-in-from-right duration-200"
        style={{ top: 0, bottom: 0, height: '100vh' }}
      >
        {/* ── 1. 헤더 영역 (고정 헤더: shrink-0 p-6) ── */}
        <div className="p-6 border-b border-violet-100/80 flex items-start justify-between gap-3 shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 tracking-tight leading-none">
                {cls.title || '수업 상세'}
              </h2>
              {cls.type && (
                <span className="px-2.5 py-0.5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                  {cls.type}
                </span>
              )}
              {isFull && (
                <span className="px-2.5 py-0.5 rounded-full bg-violet-200 text-violet-900 text-xs font-bold">
                  정원 마감
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-1">
              {formattedDate} · {formattedTime}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border-0 shrink-0"
            title="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. 스크롤 가능한 본문 영역 (flex-1 overflow-y-auto) ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {/* 스튜디오 & 예약 현황 요약 카드 (2단) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-violet-50/50 border border-violet-100/70">
              <div className="flex items-center gap-1.5 text-xs text-violet-500 mb-1 font-medium">
                <MapPin className="w-3.5 h-3.5" /> 스튜디오
              </div>
              <p className="text-sm font-bold text-zinc-900">{studioDisplayName}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-violet-50/50 border border-violet-100/70">
              <div className="flex items-center gap-1.5 text-xs text-violet-500 mb-1 font-medium">
                <Users className="w-3.5 h-3.5" /> 예약 현황
              </div>
              <p className="text-sm font-bold text-zinc-900">
                <span className={isFull ? 'text-violet-700 font-extrabold' : ''}>
                  {bookedList.length}/{capacity}명
                </span>
                {waitlistList.length > 0 && (
                  <span className="text-zinc-400 font-normal text-xs ml-1.5">
                    · 대기 {waitlistList.length}명
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* 적용 정책 카드 */}
          <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100/80 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-violet-900">
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              수업 운영 정책
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/90 p-2.5 rounded-xl border border-violet-100/60 shadow-2xs">
                <span className="text-zinc-400 block text-[10px] mb-0.5">취소 가능 시간</span>
                <span className="font-bold text-zinc-800">수업 60분 전까지</span>
              </div>
              <div className="bg-white/90 p-2.5 rounded-xl border border-violet-100/60 shadow-2xs">
                <span className="text-zinc-400 block text-[10px] mb-0.5">대기 확정 방식</span>
                <span className="font-bold text-zinc-800">자동 확정</span>
              </div>
            </div>
          </div>

          {/* 담당 강사 지정 카드 */}
          <div className="relative">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-violet-50/80 border border-violet-100/80">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 text-violet-600 shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-violet-400 font-medium">담당 강사</p>
                <p className="text-sm font-bold text-zinc-900 truncate">{currentInstructor.name}</p>
              </div>
              {isAdmin && !isInstructor && (
                <button
                  type="button"
                  onClick={() => setInstructorDropdownOpen((v) => !v)}
                  className="px-3 py-1.5 rounded-full bg-white text-violet-700 text-xs font-bold hover:bg-violet-100/80 transition-colors flex items-center gap-1 shadow-xs border border-violet-200 cursor-pointer"
                >
                  변경
                  <ChevronDown className="w-3 h-3 text-violet-500" />
                </button>
              )}
            </div>

            {/* 강사 선택 팝오버 드롭다운 */}
            {instructorDropdownOpen && isAdmin && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-xl border border-violet-100 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150 max-h-56 overflow-y-auto custom-scrollbar">
                {instructors.map((ins) => {
                  const isSelected = String(ins.id) === String(cls.instructorId);
                  return (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => {
                        setInstructorDropdownOpen(false);
                        if (!isSelected) {
                          setPendingInstructorId(ins.id);
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer border-0 ${
                        isSelected
                          ? 'bg-violet-100 text-violet-800 font-bold'
                          : 'text-zinc-700 hover:bg-violet-50/80 bg-transparent'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-violet-200 text-violet-800' : 'bg-violet-50 text-violet-500'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold">{ins.name}</span>
                      {isSelected && <Crown className="w-3.5 h-3.5 text-violet-600 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 예약 회원 / 대기자 탭 & 검색 인풋 */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center gap-1 p-1 rounded-full bg-violet-50/70 border border-violet-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('booked')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                  activeTab === 'booked'
                    ? 'bg-white text-violet-700 shadow-xs font-bold'
                    : 'text-zinc-500 bg-transparent hover:text-zinc-800'
                }`}
              >
                예약 회원 ({bookedList.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('waitlist')}
                className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border-0 ${
                  activeTab === 'waitlist'
                    ? 'bg-white text-violet-700 shadow-xs font-bold'
                    : 'text-zinc-500 bg-transparent hover:text-zinc-800'
                }`}
              >
                대기자 ({waitlistList.length})
              </button>
            </div>

            {/* 회원 검색 인풋 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="회원명 또는 연락처 검색..."
                className="w-full text-xs bg-violet-50/40 border border-violet-200/60 rounded-xl py-2 pl-8 pr-3 outline-none focus:bg-white focus:border-violet-400 text-zinc-700 placeholder:text-zinc-400 transition-all"
              />
            </div>

            {/* 회원 카드 리스트 */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-0.5 custom-scrollbar">
              {activeTab === 'booked' && (
                filteredBooked.length > 0 ? (
                  filteredBooked.map((m, idx) => (
                    <div
                      key={m?.id || `booked-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-violet-100 hover:border-violet-300 transition-all shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                        {m?.name ? m.name.charAt(0) : '회'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{m?.name || '회원'}</p>
                        <p className="text-[11px] text-zinc-400">{m?.phone || '-'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-zinc-700">{m?.ticketStatus || '이용권'}</p>
                        {m?.ticketTotal > 0 && (
                          <p className="text-[10px] text-zinc-400">
                            잔여 {m?.ticketRemaining}/{m?.ticketTotal}
                          </p>
                        )}
                        <p className="text-[10px] text-zinc-400 mt-0.5">{m?.bookedAt || ''}</p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => setPendingCancelMember(m)}
                          className="p-1.5 rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0 cursor-pointer border-0 bg-transparent"
                          title="예약 취소"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-xs">일치하는 예약 회원이 없습니다.</div>
                )
              )}

              {activeTab === 'waitlist' && (
                filteredWaitlist.length > 0 ? (
                  filteredWaitlist.map((m, idx) => (
                    <div
                      key={m?.id || `wait-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-violet-100 hover:border-violet-300 transition-all shadow-2xs"
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-zinc-900 truncate">{m?.name || '대기자'}</p>
                        <p className="text-[11px] text-zinc-400">{m?.phone || '-'}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-zinc-700">{m?.ticketStatus || '대기 접수'}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{m?.bookedAt || ''}</p>
                      </div>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onPromoteWaitlist && onPromoteWaitlist(m)}
                          className="px-2.5 py-1 rounded-full bg-violet-600 text-white text-[11px] font-bold hover:bg-violet-700 transition-colors flex-shrink-0 flex items-center gap-1 shadow-xs border-0 cursor-pointer"
                        >
                          <Crown className="w-3 h-3" />
                          승격
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-zinc-400 text-xs">일치하는 대기자가 없습니다.</div>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── 3. 하단 고정 액션 영역 (shrink-0 mt-auto p-4 px-6) ── */}
        <div className="p-4 px-6 border-t border-violet-100/80 bg-white/95 backdrop-blur-md shrink-0 mt-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer bg-white"
          >
            닫기
          </button>
          <button
            type="button"
            onClick={() => onNavigateToAttendance && onNavigateToAttendance(cls?.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs sm:text-sm transition-all shadow-md shadow-violet-500/25 cursor-pointer border-0"
          >
            <Zap className="w-4 h-4" />
            출결 관리 바로가기
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 4. 담당 강사 변경 확인 모달 (z-[130]) ── */}
      {pendingInstructorId && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-violet-100 space-y-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900">담당 강사 변경</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                해당 수업의 담당 강사를 변경하시겠습니까? 수업 일정 및 출결 권한이 새로 지정된 강사에게 위임됩니다.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-center justify-between">
              <div className="text-center flex-1">
                <span className="text-[10px] text-zinc-400 block mb-0.5">현재 강사</span>
                <span className="text-xs font-bold text-zinc-700">{currentInstructor.name}</span>
              </div>
              <ArrowRight className="w-4 h-4 text-violet-400 flex-shrink-0" />
              <div className="text-center flex-1">
                <span className="text-[10px] text-violet-500 block mb-0.5">새 강사</span>
                <span className="text-xs font-bold text-violet-700">
                  {instructors.find((i) => String(i.id) === String(pendingInstructorId))?.name || '새 강사'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingInstructorId(null)}
                className="flex-1 py-2.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer bg-white"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmInstructorChange}
                className="flex-1 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20 cursor-pointer border-0"
              >
                변경 적용
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. 예약 취소 확인 모달 (z-[130]) ── */}
      {pendingCancelMember && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-violet-100 space-y-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                <X className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">수업 예약 취소</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                해당 회원의 예약을 강제로 취소하시겠습니까? 차감되었던 이용권 횟수가 자동으로 반환 처리됩니다.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">회원명</span>
                <span className="font-bold text-zinc-800">
                  {pendingCancelMember.name} ({pendingCancelMember.phone || '-'})
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">이용권</span>
                <span className="font-medium text-zinc-700">
                  {pendingCancelMember.ticketStatus || '이용권'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-200">
                <span className="text-zinc-400">대상 수업</span>
                <span className="font-medium text-violet-700">
                  {cls.title} ({formattedTime})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setPendingCancelMember(null)}
                className="flex-1 py-2.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer bg-white"
              >
                닫기
              </button>
              <button
                type="button"
                onClick={handleConfirmCancelBooking}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 cursor-pointer border-0"
              >
                예약 취소 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (typeof document !== 'undefined') {
    return createPortal(drawerContent, document.body);
  }

  return drawerContent;
}

export default ScheduleDetailDrawer;
