import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  X,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  StickyNote,
} from './Icons';

const REASON_PRESETS = [
  '사전 연락 결석',
  '당일 취소',
  '노쇼 (무단 결석)',
  '지각 입실',
  '컨디션 난조 / 부상',
  '회원 요청 변경',
  '기구 적응 및 안내',
];

export const AttendanceStatusModal = ({
  open,
  onClose,
  member,
  classInfo,
  onSave,
}) => {
  const [selectedStatus, setSelectedStatus] = useState('hold'); // 'present' | 'absent' | 'hold'
  const [checkInTime, setCheckInTime] = useState('');
  const [memo, setMemo] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (member) {
      setSelectedStatus(member.status || 'hold');
      setCheckInTime(member.checkInTime || '');
      setMemo(member.memo || '');
    }
  }, [member, open]);

  // ESC 키 닫기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open || !member) return null;

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    if (status === 'present') {
      if (!checkInTime) {
        setCheckInTime(dayjs().format('HH:mm:ss'));
      }
    } else {
      setCheckInTime('');
    }
  };

  const handleAddPreset = (preset) => {
    setMemo((prev) => (prev ? `${prev}, ${preset}` : preset));
  };

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      await onSave?.({
        memberId: member.memberId,
        status: selectedStatus,
        checkInTime: selectedStatus === 'present' ? checkInTime || dayjs().format('HH:mm:ss') : null,
        memo,
      });
      onClose?.();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-150">
        {/* ── 1. 헤더 ── */}
        <div className="p-6 pb-4 border-b border-violet-100/80 flex items-start justify-between gap-3 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-100 text-[#7C3AED] flex items-center justify-center font-black text-base shadow-2xs shrink-0">
              {member.memberName?.slice(0, 1) || '회'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-zinc-900">{member.memberName} 회원</h2>
                <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold">
                  {member.ticketStatus || '이용권 회원'}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {member.memberHp || member.memberPhone || '-'}
                {classInfo?.title && ` · ${classInfo.title}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── 2. 본문 ── */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* 수업 정보 요약 뱃지 */}
          {classInfo && (
            <div className="p-3.5 rounded-2xl bg-violet-50/50 border border-violet-100/70 flex items-center justify-between text-xs">
              <span className="font-semibold text-violet-900">
                {classInfo.date && `${classInfo.date} `}
                {classInfo.startTime} ~ {classInfo.endTime}
              </span>
              <span className="text-violet-600 font-medium">
                {classInfo.studioName && `${classInfo.studioName} · `}
                강사 {classInfo.instructorName || '-'}
              </span>
            </div>
          )}

          {/* 출결 상태 선택 버튼 (3버튼 그룹) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-700 block">
              출결 상태 선택 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {/* 출석 */}
              <button
                type="button"
                onClick={() => handleStatusSelect('present')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'present'
                    ? 'bg-[#7C3AED] text-white border-violet-600 shadow-md shadow-violet-500/20 ring-2 ring-violet-200'
                    : 'bg-white border-zinc-200 hover:border-violet-300 text-zinc-700 hover:bg-violet-50/40'
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${selectedStatus === 'present' ? 'text-white' : 'text-violet-600'}`} />
                <span className="text-xs font-bold">출석 (PRESENT)</span>
              </button>

              {/* 결석 */}
              <button
                type="button"
                onClick={() => handleStatusSelect('absent')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'absent'
                    ? 'bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/20 ring-2 ring-rose-200'
                    : 'bg-white border-zinc-200 hover:border-rose-300 text-zinc-700 hover:bg-rose-50/40'
                }`}
              >
                <XCircle className={`w-5 h-5 ${selectedStatus === 'absent' ? 'text-white' : 'text-rose-500'}`} />
                <span className="text-xs font-bold">결석 (ABSENT)</span>
              </button>

              {/* 미체크 */}
              <button
                type="button"
                onClick={() => handleStatusSelect('hold')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  selectedStatus === 'hold'
                    ? 'bg-zinc-700 text-white border-zinc-800 shadow-md ring-2 ring-zinc-300'
                    : 'bg-white border-zinc-200 hover:border-zinc-300 text-zinc-700 hover:bg-zinc-50'
                }`}
              >
                <HelpCircle className={`w-5 h-5 ${selectedStatus === 'hold' ? 'text-white' : 'text-zinc-500'}`} />
                <span className="text-xs font-bold">미체크 (대기)</span>
              </button>
            </div>
          </div>

          {/* 체크인 시간 입력 */}
          {selectedStatus === 'present' && (
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-violet-600" />
                  체크인 시간
                </label>
                <button
                  type="button"
                  onClick={() => setCheckInTime(dayjs().format('HH:mm:ss'))}
                  className="text-[11px] font-semibold text-violet-600 hover:underline cursor-pointer"
                >
                  현재 시간으로 설정
                </button>
              </div>
              <input
                type="text"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                placeholder="예: 09:05:00"
                className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono font-medium outline-none focus:border-violet-400"
              />
            </div>
          )}

          {/* 빠른 사유 프리셋 칩 */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-zinc-700 block">
              빠른 사유 선택 태그
            </span>
            <div className="flex flex-wrap gap-1.5">
              {REASON_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2.5 py-1 rounded-full bg-violet-50 hover:bg-violet-100 text-violet-700 text-[11px] font-semibold border border-violet-200/60 transition-all cursor-pointer shadow-2xs"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* 사유 및 특이사항 메모 입력창 */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-zinc-400" />
              출결 특이사항 / 사유 메모
            </label>
            <textarea
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="특이사항이나 사유를 입력하세요 (예: 사전 연락으로 결석 확인, 지각 입실 등)"
              className="w-full p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:bg-white focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all resize-none"
            />
          </div>
        </div>

        {/* ── 3. 고정 푸터 ── */}
        <div className="p-4 px-6 border-t border-violet-100/80 flex items-center justify-end gap-2.5 bg-zinc-50/70">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            취소
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md shadow-violet-500/25 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '출결 상태 저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceStatusModal;

