import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Sparkles,
  Layers,
  Clock,
  User,
  Users,
  MapPin,
  Lock,
  ArrowRight,
  Repeat,
  AlertTriangle,
} from './Icons';
import dayjs from 'dayjs';
import { message } from 'antd';
import { createProgram } from '../../../api/programApi';

const STUDIO_OPTIONS = [
  { id: 'A', name: '스튜디오 A룸 (요가/GX)' },
  { id: 'B', name: '스튜디오 B룸 (기구 필라테스)' },
  { id: 'C', name: '피트니스존 (헬스장)' },
];

const DOW_OPTIONS = ['월', '화', '수', '목', '금', '토', '일'];

const FALLBACK_TEMPLATES = [
  {
    id: 'tpl-1',
    name: '요가 기초',
    category: '요가',
    type: 'group',
    capacity: 15,
    startTime: '09:00',
    endTime: '10:00',
    studioId: 'A',
    instructorName: '홍길동',
    instructorId: '1',
    dayOfWeek: '월, 수, 금',
  },
  {
    id: 'tpl-2',
    name: '리포머 필라테스',
    category: '필라테스',
    type: 'group',
    capacity: 8,
    startTime: '09:00',
    endTime: '09:50',
    studioId: 'B',
    instructorName: '김서연',
    instructorId: '2',
    dayOfWeek: '금',
  },
  {
    id: 'tpl-3',
    name: '1:1 퍼스널 트레이닝 (PT)',
    category: 'PT',
    type: 'private',
    capacity: 1,
    startTime: '10:00',
    endTime: '10:50',
    studioId: 'C',
    instructorName: '김유라',
    instructorId: '3',
    dayOfWeek: '',
  },
  {
    id: 'tpl-4',
    name: '릴리즈 요가',
    category: '요가',
    type: 'group',
    capacity: 10,
    startTime: '14:00',
    endTime: '15:00',
    studioId: 'B',
    instructorName: '박수민',
    instructorId: '4',
    dayOfWeek: '목',
  },
];

export function ClassCreateModal({
  open,
  onClose,
  onOpenTemplateManage,
  onSubmit,
  centers = [],
  instructors = [],
  programs = [],
  selectedCenterId,
  userRole = 'OWNER',
  currentInstructorId,
}) {
  const isInstructor = userRole === 'INSTRUCTOR';

  // 강사는 템플릿 사용 모드로 고정, 관리자는 기본 템플릿 사용
  const [activeTab, setActiveTab] = useState('template'); // 'template' | 'new'

  // 템플릿 선택 모드
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  // 폼 필드
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('요가');
  const [classType, setClassType] = useState('group'); // 'group' | 'private'
  const [centerId, setCenterId] = useState(selectedCenterId || centers[0]?.id || '');
  const [status, setStatus] = useState('운영');
  const [startDate, setStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));

  // 진행 시간 (50, 60, custom)
  const [durationMode, setDurationMode] = useState(60);
  const [customDuration, setCustomDuration] = useState(45);
  const [startTime, setStartTime] = useState('09:00');

  // 강사 및 장소, 정원
  const [instructorId, setInstructorId] = useState('');
  const [studioName, setStudioName] = useState('A');
  const [capacity, setCapacity] = useState(10);

  // 반복 요일 및 템플릿 저장 옵션
  const [selectedDays, setSelectedDays] = useState(['월', '수', '금']);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 현재 접속/선택 강사 정보 판별
  const currentInstructor = useMemo(() => {
    if (currentInstructorId) {
      const found = instructors.find((i) => String(i.id) === String(currentInstructorId));
      if (found) return found;
    }
    const yura = instructors.find((i) => i.name === '김유라');
    if (yura) return yura;
    if (instructors.length > 0) return instructors[0];
    return { id: currentInstructorId || '1', name: '김유라' };
  }, [instructors, currentInstructorId]);

  // 전체 템플릿 정규화
  const allTemplates = useMemo(() => {
    let list = [];
    if (Array.isArray(programs) && programs.length > 0) {
      list = programs.map((p) => {
        const isPriv = p.type === 'private' || p.maxCapacity === 1 || p.capacity === 1;
        return {
          id: String(p.id),
          name: p.name || p.title || '',
          category: p.category || (isPriv ? 'PT' : '요가'),
          type: isPriv ? 'private' : 'group',
          capacity: isPriv ? 1 : Number(p.maxCapacity || p.capacity || 10),
          startTime: p.startTime ? p.startTime.slice(0, 5) : '09:00',
          endTime: p.endTime ? p.endTime.slice(0, 5) : '10:00',
          studioId: p.studioId || 'A',
          instructorId: p.instructorId ? String(p.instructorId) : p.instructor?.id ? String(p.instructor.id) : '',
          instructorName: p.instructorName || p.instructor?.name || '',
          dayOfWeek: p.dayOfWeek || '',
        };
      });
    } else {
      list = FALLBACK_TEMPLATES;
    }
    return list;
  }, [programs]);

  // 권한별 노출 가능한 템플릿 목록
  // - 강사: 본인에게 배정된 1:1 레슨 템플릿만 노출 (t.type === 'private' && (t.instructorName === 본인 || t.instructorId === 본인))
  // - 관리자/매니저: 전체 템플릿 노출
  const availableTemplates = useMemo(() => {
    if (!isInstructor) {
      return allTemplates;
    }
    const currentName = currentInstructor?.name?.trim();
    const currentId = currentInstructor?.id ? String(currentInstructor.id) : null;

    return allTemplates.filter((t) => {
      // 1. 수업 형태가 1:1 개인 레슨
      const isPrivate = t.type === 'private' || t.capacity === 1;
      if (!isPrivate) return false;

      // 2. 템플릿의 기본 강사가 본인
      const matchesName = Boolean(currentName && t.instructorName && t.instructorName.trim() === currentName);
      const matchesId = Boolean(currentId && t.instructorId && String(t.instructorId) === currentId);

      return matchesName || matchesId;
    });
  }, [allTemplates, isInstructor, currentInstructor]);

  // 역할에 따른 초기화
  useEffect(() => {
    if (isInstructor) {
      setActiveTab('template');
      setClassType('private');
      setCapacity(1);
      if (currentInstructor?.id) {
        setInstructorId(String(currentInstructor.id));
      } else if (currentInstructorId) {
        setInstructorId(String(currentInstructorId));
      }
    } else {
      if (instructors.length > 0 && !instructorId) {
        setInstructorId(String(instructors[0].id));
      }
    }
  }, [isInstructor, currentInstructor, currentInstructorId, instructors, instructorId]);

  useEffect(() => {
    if (selectedCenterId) setCenterId(selectedCenterId);
    else if (centers.length > 0 && !centerId) setCenterId(centers[0].id);
  }, [selectedCenterId, centers]);

  // 모달 오픈 시 단일 템플릿 자동 선택 처리
  useEffect(() => {
    if (!open) {
      setSelectedTemplateId('');
      return;
    }
    if (isInstructor && availableTemplates.length === 1 && !selectedTemplateId) {
      handleSelectTemplate(availableTemplates[0].id);
    }
  }, [open, isInstructor, availableTemplates, selectedTemplateId]);

  // 종료 시간 자동 계산
  const effectiveDuration = durationMode === 'custom' ? Number(customDuration) || 45 : Number(durationMode);
  const endTime = useMemo(() => {
    if (!startTime) return '10:00';
    const [h, m] = startTime.split(':').map(Number);
    const startM = (h || 0) * 60 + (m || 0);
    const endM = startM + effectiveDuration;
    const endH = Math.floor(endM / 60) % 24;
    const endMin = endM % 60;
    return `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  }, [startTime, effectiveDuration]);

  // 선택된 템플릿 데이터
  const selectedTemplate = useMemo(() => {
    return availableTemplates.find((p) => String(p.id) === String(selectedTemplateId));
  }, [availableTemplates, selectedTemplateId]);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // 템플릿 선택 시 기본 정보 자동 채우기 (Prefill)
  const handleSelectTemplate = (tplId) => {
    setSelectedTemplateId(tplId);
    if (!tplId) return;
    const tpl = availableTemplates.find((p) => String(p.id) === String(tplId));
    if (tpl) {
      setTitle(tpl.name || '');
      setCategory(tpl.category || '요가');
      const isPriv = tpl.type === 'private' || tpl.capacity === 1;
      setClassType(isPriv ? 'private' : 'group');
      setCapacity(isPriv ? 1 : Number(tpl.capacity || 10));
      if (tpl.startTime) setStartTime(tpl.startTime.slice(0, 5));
      if (tpl.startTime && tpl.endTime) {
        const [sh, sm] = tpl.startTime.slice(0, 5).split(':').map(Number);
        const [eh, em] = tpl.endTime.slice(0, 5).split(':').map(Number);
        const dur = (eh * 60 + em) - (sh * 60 + sm);
        if (dur > 0) {
          if (dur === 50 || dur === 60) {
            setDurationMode(dur);
          } else {
            setDurationMode('custom');
            setCustomDuration(dur);
          }
        }
      }
      if (tpl.instructorId) setInstructorId(String(tpl.instructorId));
      else if (tpl.instructor?.id) setInstructorId(String(tpl.instructor.id));
      else if (currentInstructor?.id) setInstructorId(String(currentInstructor.id));
      if (tpl.studioId) setStudioName(tpl.studioId);
      if (tpl.dayOfWeek) {
        const days = tpl.dayOfWeek.split(',').map((d) => d.trim()).filter(Boolean);
        if (days.length > 0) setSelectedDays(days);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isInstructor && (availableTemplates.length === 0 || !selectedTemplateId)) {
      message.warning('개설할 1:1 레슨 템플릿을 선택해 주세요.');
      return;
    }
    if (activeTab === 'template' && !isInstructor && !selectedTemplateId) {
      message.warning('불러올 수업 템플릿을 선택해 주세요.');
      return;
    }

    setSubmitting(true);

    try {
      const finalTitle = title.trim() || `${category} 수업`;
      const targetInstructorId = isInstructor
        ? Number(currentInstructor?.id || currentInstructorId || instructorId) || 1
        : Number(instructorId) || (instructors[0]?.id ? Number(instructors[0].id) : null);

      await createProgram({
        centerId: Number(centerId) || 1,
        instructorId: targetInstructorId,
        name: finalTitle,
        category: category,
        dayOfWeek: classType === 'private' ? '' : selectedDays.join(','),
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
        maxCapacity: classType === 'private' ? 1 : Number(capacity) || 10,
        status: status === '운영' ? 1 : 0,
      });

      message.success(
        isInstructor
          ? `[${finalTitle}] 1:1 개인 레슨이 개설되었습니다.`
          : activeTab === 'template'
          ? `템플릿 기반으로 [${finalTitle}] 수업이 등록되었습니다.`
          : `[${finalTitle}] 수업이 등록되었습니다.`
      );

      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      console.error(err);
      message.error('수업 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* ── 1. 고정 헤더: 제목, 설명, 닫기(X) 버튼 (스크롤 X) ── */}
        <div className="p-6 pb-4 border-b border-zinc-100 flex-shrink-0 bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                {isInstructor ? '1:1 개인 레슨 개설' : '수업 추가'}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {isInstructor
                  ? '배정된 1:1 개인 레슨 템플릿을 선택하여 일정을 등록합니다.'
                  : '새로운 수업 일정을 개설하거나 등록된 템플릿을 불러옵니다.'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer border-0 shrink-0"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 탭 전환 (강사 권한은 단일 템플릿 모드로 강제 고정) */}
          {!isInstructor && (
            <div className="pt-3">
              <div className="flex items-center gap-1 p-1 rounded-full bg-violet-100/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('template')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 ${
                    activeTab === 'template'
                      ? 'bg-white text-violet-700 shadow-xs font-bold'
                      : 'text-zinc-500 bg-transparent hover:text-zinc-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  기존 수업 템플릿 사용
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new')}
                  className={`flex-1 py-1.5 rounded-full text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border-0 ${
                    activeTab === 'new'
                      ? 'bg-white text-violet-700 shadow-xs font-bold'
                      : 'text-zinc-500 bg-transparent hover:text-zinc-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  새로운 수업 직접 만들기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 2. 본문 영역: 스크롤 가능 (스크롤 O) ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {/* 템플릿 선택 헤더 & 드롭다운 (템플릿 모드이거나 강사일 때) */}
          {(activeTab === 'template' || isInstructor) && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-violet-600" />
                  {isInstructor ? '배정된 1:1 레슨 템플릿 선택' : '템플릿 선택'}
                </label>
                {isInstructor ? (
                  <span className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-2.5 py-0.5 rounded-full border border-violet-100">
                    담당: {currentInstructor?.name || '본인'} 강사
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenTemplateManage}
                    className="text-xs font-bold text-violet-600 hover:text-violet-800 flex items-center gap-1 cursor-pointer bg-transparent border-0"
                  >
                    템플릿 설정/관리
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* 강사인데 배정된 템플릿이 없을 때 경고 카드 */}
              {isInstructor && availableTemplates.length === 0 ? (
                <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-900 flex items-start gap-3 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-amber-900">
                      관리자가 배정한 1:1 레슨 템플릿이 없습니다.
                    </p>
                    <p className="text-amber-700 leading-relaxed">
                      개인 레슨을 개설하려면 관리자에게 본인 배정 1:1 레슨 템플릿 등록을 요청해 주세요.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => handleSelectTemplate(e.target.value)}
                    className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-2xl p-3 outline-none focus:bg-white focus:border-violet-400 font-semibold text-zinc-800 cursor-pointer"
                  >
                    <option value="">불러올 템플릿을 선택하세요</option>
                    {availableTemplates.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.category || '수업'}] {p.name} ({p.startTime} - {p.endTime})
                        {!isInstructor && p.instructorName ? ` - ${p.instructorName} 강사` : ''}
                      </option>
                    ))}
                  </select>

                  {selectedTemplate ? (
                    <div className="p-3.5 rounded-2xl bg-violet-50/70 border border-violet-200/80 flex items-center justify-between text-xs text-violet-800">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                        [{selectedTemplate?.name}] 기본 정보가 채워졌습니다. 이번 일정을 확인·수정해 주세요.
                      </span>
                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-2xl bg-violet-50/30 border border-dashed border-violet-200 space-y-1 text-xs text-zinc-500">
                      <Layers className="w-5 h-5 text-violet-400 mx-auto mb-1" />
                      <p className="font-bold text-zinc-700">
                        {isInstructor ? '개설할 1:1 레슨 템플릿을 선택해 주세요' : '등록된 수업 템플릿을 선택해 주세요'}
                      </p>
                      <p className="text-zinc-400">
                        선택 즉시 기본 규격(수업명, 정원, 시간, 강사)이 폼에 자동으로 채워집니다.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* 폼 입력 필드 (템플릿이 선택되었거나, 신규 모드일 때 노출) */}
          {((activeTab === 'new' && !isInstructor) || selectedTemplateId) && (
            <div className="space-y-4 pt-1">
              {/* 수업명 */}
              <div>
                <label className="text-xs font-bold text-zinc-700 block mb-1">
                  수업명 <span className="text-zinc-400 font-normal">(미입력 시 분류명 자동 적용)</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`예: ${category} 기초 클래스`}
                  className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-3 outline-none focus:bg-white focus:border-violet-400 font-semibold text-zinc-800"
                />
              </div>

              {/* 분류 & 유형 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">수업 분류</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={isInstructor}
                    className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-violet-400 font-semibold text-zinc-800 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                  >
                    <option value="PT">PT (개인)</option>
                    <option value="요가">요가</option>
                    <option value="필라테스">필라테스</option>
                    <option value="스피닝">스피닝</option>
                    <option value="크로스핏">크로스핏</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">수업 유형</label>
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-violet-50/60 border border-violet-200/60">
                    <button
                      type="button"
                      disabled={isInstructor}
                      onClick={() => {
                        setClassType('group');
                        setCapacity(10);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 ${
                        classType === 'group'
                          ? 'bg-white text-violet-700 shadow-xs font-bold'
                          : isInstructor
                          ? 'text-zinc-300 bg-transparent cursor-not-allowed'
                          : 'text-zinc-400 bg-transparent'
                      }`}
                    >
                      그룹 수업
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setClassType('private');
                        setCapacity(1);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border-0 ${
                        classType === 'private'
                          ? 'bg-white text-violet-700 shadow-xs font-bold'
                          : 'text-zinc-400 bg-transparent'
                      }`}
                    >
                      1:1 개인
                    </button>
                  </div>
                </div>
              </div>

              {/* 개설 기간 (시작일 / 종료일) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">개설 시작일</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">개설 종료일</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-2.5 outline-none focus:bg-white focus:border-violet-400"
                  />
                </div>
              </div>

              {/* 진행 시간 & 시작/종료 시간 */}
              <div className="p-3.5 rounded-2xl bg-violet-50/50 border border-violet-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-violet-600" />
                    진행 시간 및 일정
                  </span>
                  <div className="flex items-center gap-1">
                    {[50, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMode(m)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                          durationMode === m
                            ? 'bg-violet-600 text-white border-violet-600'
                            : 'bg-white text-zinc-600 border-violet-200 hover:bg-violet-50'
                        }`}
                      >
                        {m}분
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setDurationMode('custom')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                        durationMode === 'custom'
                          ? 'bg-violet-600 text-white border-violet-600'
                          : 'bg-white text-zinc-600 border-violet-200 hover:bg-violet-50'
                      }`}
                    >
                      직접 입력
                    </button>
                  </div>
                </div>

                {durationMode === 'custom' && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">직접 지정:</span>
                    <input
                      type="number"
                      min="10"
                      max="240"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      className="w-20 text-xs bg-white border border-violet-200 rounded-lg p-1.5 text-center font-bold outline-none"
                    />
                    <span className="text-xs text-zinc-500">분</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 block mb-1">시작 시간</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2 outline-none font-bold text-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-zinc-500 block mb-1">종료 시간 (자동 계산)</label>
                    <input
                      type="text"
                      readOnly
                      value={endTime}
                      className="w-full text-xs bg-violet-100/50 border border-violet-200 rounded-xl p-2 font-bold text-violet-800 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* 강사 및 스튜디오, 정원 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">담당 강사</label>
                  {isInstructor ? (
                    <div className="flex items-center gap-1.5 p-2 bg-violet-50 border border-violet-200 rounded-xl text-xs font-bold text-violet-800">
                      <Lock className="w-3 h-3 text-violet-500" />
                      {currentInstructor?.name || '본인'} (강사)
                    </div>
                  ) : (
                    <select
                      value={instructorId}
                      onChange={(e) => setInstructorId(e.target.value)}
                      className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-2.5 outline-none font-semibold text-zinc-800"
                    >
                      {instructors.map((ins) => (
                        <option key={ins.id} value={ins.id}>{ins.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">스튜디오</label>
                  <select
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-2.5 outline-none font-semibold text-zinc-800"
                  >
                    {STUDIO_OPTIONS.map((st) => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">정원 (명)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    disabled={classType === 'private'}
                    value={classType === 'private' ? 1 : capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="w-full text-xs bg-violet-50/40 border border-violet-200 rounded-xl p-2.5 outline-none font-bold text-zinc-800 disabled:bg-zinc-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* 반복 요일 */}
              {!isInstructor && classType === 'group' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700 block">반복 요일</label>
                  <div className="flex items-center gap-1.5">
                    {DOW_OPTIONS.map((d) => {
                      const isSel = selectedDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleDay(d)}
                          className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            isSel
                              ? 'bg-violet-600 text-white border-violet-600 shadow-xs'
                              : 'bg-white text-zinc-600 border-violet-200 hover:bg-violet-50'
                          }`}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 템플릿 목록에도 추가 체크박스 (신규 모드일 때만) */}
              {!isInstructor && activeTab === 'new' && (
                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={saveAsTemplate}
                    onChange={(e) => setSaveAsTemplate(e.target.checked)}
                    className="w-4 h-4 rounded text-violet-600 accent-violet-600 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-zinc-700">이 설정을 템플릿 목록에도 추가</span>
                </label>
              )}
            </div>
          )}
        </div>

        {/* ── 3. 고정 푸터: 취소, 저장/개설 완료 버튼 (스크롤 X) ── */}
        <div className="p-4 px-6 border-t border-zinc-100 flex items-center justify-end gap-2 flex-shrink-0 bg-white rounded-b-3xl">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer bg-white"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={
              submitting ||
              (isInstructor && (availableTemplates.length === 0 || !selectedTemplateId)) ||
              (activeTab === 'template' && !isInstructor && !selectedTemplateId)
            }
            className="px-6 py-2.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold transition-all shadow-md shadow-violet-500/20 cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? '등록 중...'
              : isInstructor
              ? '1:1 레슨 개설하기'
              : activeTab === 'template'
              ? '템플릿 기반 수업 개설'
              : '수업 개설 완료'}
          </button>
        </div>
      </form>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

export default ClassCreateModal;
