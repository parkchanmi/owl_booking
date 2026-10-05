import React from 'react';
import { Users, CheckCircle2, XCircle, HelpCircle } from './Icons';

export const AttendanceStatsCard = ({ stats, isInstructor = false }) => {
  const {
    total = 0,
    present = 0,
    absent = 0,
    hold = 0,
  } = stats || {};

  const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="flex items-center gap-2 py-0.5 flex-wrap">
      {/* 1. 총 예약 / 예약 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-zinc-200/80 text-zinc-700 text-xs font-semibold shadow-2xs">
        <Users className="w-3.5 h-3.5 text-zinc-500" />
        <span>
          {isInstructor ? '내 수업 예약' : '총 예약'} <b className="font-extrabold text-zinc-900 ml-0.5">{total}명</b>
        </span>
      </div>

      {/* 2. 출석 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 text-violet-800 border border-violet-200/80 text-xs font-semibold shadow-2xs">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#7C3AED]" />
        <span>
          출석 <b className="font-extrabold text-[#7C3AED] ml-0.5">{present}명</b>
        </span>
        <span className="text-[10px] font-bold text-violet-600 bg-violet-100/80 px-1.5 py-0.5 rounded-md ml-0.5">
          {attendanceRate}%
        </span>
      </div>

      {/* 3. 결석 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200/80 text-xs font-semibold shadow-2xs">
        <XCircle className="w-3.5 h-3.5 text-rose-500" />
        <span>
          결석 <b className="font-extrabold text-rose-700 ml-0.5">{absent}명</b>
        </span>
      </div>

      {/* 4. 미체크: 깔끔한 회색 톤 */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-600 border border-zinc-200/60 text-xs font-medium shadow-2xs">
        <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
        <span>
          미체크 <b className="font-bold text-zinc-800 ml-0.5">{hold}명</b>
        </span>
      </div>
    </div>
  );
};

export default AttendanceStatsCard;

