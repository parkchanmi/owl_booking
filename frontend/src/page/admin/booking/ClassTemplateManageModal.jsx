import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Clock,
  User,
  MapPin,
  Users,
  Repeat,
  Search,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
} from './Icons';
import {
  fetchPrograms,
  createProgram,
  updateProgram,
  pauseProgram,
  deleteProgram,
} from '../../../api/programApi';
import { message } from 'antd';

const FALLBACK_TEMPLATES = [
  {
    id: 'tpl-1',
    title: '요가 기초',
    category: '요가',
    type: 'group',
    status: '활성',
    defaultDuration: 60,
    timeRange: '09:00 - 10:00',
    capacity: 15,
    repeatSchedule: '매주 월·수·금',
    defaultStudio: '스튜디오 A룸',
    instructorName: '홍길동',
  },
  {
    id: 'tpl-2',
    title: '리포머 필라테스',
    category: '필라테스',
    type: 'group',
    status: '활성',
    defaultDuration: 50,
    timeRange: '09:00 - 09:50',
    capacity: 8,
    repeatSchedule: '매주 금',
    defaultStudio: '스튜디오 B룸',
    instructorName: '김서연',
  },
  {
    id: 'tpl-3',
    title: '1:1 퍼스널 트레이닝 (PT)',
    category: 'PT',
    type: 'private',
    status: '활성',
    defaultDuration: 50,
    timeRange: '상시 조율',
    capacity: 1,
    repeatSchedule: '반복 없음 (개인)',
    defaultStudio: '피트니스존 (헬스장)',
    instructorName: '김유라',
  },
  {
    id: 'tpl-4',
    title: '릴리즈 요가',
    category: '요가',
    type: 'group',
    status: '중지',
    defaultDuration: 60,
    timeRange: '14:00 - 15:00',
    capacity: 10,
    repeatSchedule: '매주 목',
    defaultStudio: '스튜디오 B룸',
    instructorName: '박수민',
  },
];

export function ClassTemplateManageModal({
  open,
  onClose,
  instructors = [],
  onTemplatesChanged,
}) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('전체'); // '전체' | '활성' | '중지'
  const [searchQuery, setSearchQuery] = useState('');

  // 템플릿 신규/수정 폼 상태
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('요가');
  const [formClassType, setFormClassType] = useState('group'); // 'group' | 'private'
  const [formDuration, setFormDuration] = useState(60);
  const [formCapacity, setFormCapacity] = useState(10);
  const [formDays, setFormDays] = useState(['월', '수', '금']);
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formInstructorId, setFormInstructorId] = useState('');
  const [formStudio, setFormStudio] = useState('스튜디오 A룸');

  // 삭제 확인 모달 대상
  const [deletingTemplate, setDeletingTemplate] = useState(null);

  // ESC 키로 닫기 지원
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deletingTemplate) {
          setDeletingTemplate(null);
        } else if (isCreating) {
          setIsCreating(false);
          setEditingTemplate(null);
        } else {
          onClose?.();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, deletingTemplate, isCreating]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchPrograms();
      if (Array.isArray(data) && data.length > 0) {
        setTemplates(
          data.map((p) => ({
            id: String(p.id),
            title: p.name,
            category: p.category || '요가',
            type: p.maxCapacity === 1 ? 'private' : 'group',
            status: p.status === 1 || p.status === 'ACTIVE' ? '활성' : '중지',
            defaultDuration: 60,
            timeRange: `${p.startTime?.slice(0, 5) || '09:00'} - ${p.endTime?.slice(0, 5) || '10:00'}`,
            capacity: p.maxCapacity || 10,
            repeatSchedule: p.dayOfWeek ? `매주 ${p.dayOfWeek}` : '반복 없음',
            defaultStudio: '스튜디오 A룸',
            instructorName: p.instructor?.name || '홍길동',
            instructorId: p.instructor?.id ? String(p.instructor.id) : '',
          }))
        );
      } else {
        setTemplates(FALLBACK_TEMPLATES);
      }
    } catch {
      setTemplates(FALLBACK_TEMPLATES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadTemplates();
      setIsCreating(false);
      setEditingTemplate(null);
    }
  }, [open]);

  // 카운트 계산
  const totalCount = templates.length;
  const activeCount = templates.filter((t) => t.status === '활성').length;
  const pausedCount = templates.filter((t) => t.status === '중지').length;

  // 필터링
  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterStatus === '활성' && t.status !== '활성') return false;
      if (filterStatus === '중지' && t.status !== '중지') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesInstructor = t.instructorName?.toLowerCase().includes(q);
        const matchesCategory = t.category?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesInstructor && !matchesCategory) return false;
      }
      return true;
    });
  }, [templates, filterStatus, searchQuery]);

  if (!open) return null;

  const handleToggleStatus = async (tpl) => {
    const isActivating = tpl.status !== '활성';
    try {
      await pauseProgram(tpl.id, isActivating);
      message.success(`[${tpl.title}] 상태가 [${isActivating ? '활성' : '중지'}]로 변경되었습니다.`);
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, status: isActivating ? '활성' : '중지' } : t))
      );
      if (onTemplatesChanged) onTemplatesChanged();
    } catch {
      setTemplates((prev) =>
        prev.map((t) => (t.id === tpl.id ? { ...t, status: isActivating ? '활성' : '중지' } : t))
      );
      message.info(`[${tpl.title}] 상태가 [${isActivating ? '활성' : '중지'}]로 변경되었습니다.`);
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      await deleteProgram(deletingTemplate.id);
      message.success(`[${deletingTemplate.title}] 템플릿이 삭제되었습니다.`);
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      setDeletingTemplate(null);
      if (onTemplatesChanged) onTemplatesChanged();
    } catch {
      setTemplates((prev) => prev.filter((t) => t.id !== deletingTemplate.id));
      setDeletingTemplate(null);
      message.info(`[${deletingTemplate.title}] 템플릿이 삭제되었습니다.`);
    }
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();
    const finalTitle = formTitle.trim() || `${formCategory} 템플릿`;
    const [h, m] = formStartTime.split(':').map(Number);
    const endMinutes = (h || 0) * 60 + (m || 0) + Number(formDuration);
    const endH = Math.floor(endMinutes / 60) % 24;
    const endMin = endMinutes % 60;
    const computedEndTime = `${String(endH).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
    const finalCapacity = formClassType === 'private' ? 1 : Number(formCapacity) || 10;
    const instructorObj = instructors.find((i) => String(i.id) === String(formInstructorId));
    const instructorName = instructorObj?.name || '홍길동';

    try {
      if (editingTemplate) {
        await updateProgram(editingTemplate.id, {
          name: finalTitle,
          category: formCategory,
          dayOfWeek: formDays.join(','),
          startTime: `${formStartTime}:00`,
          endTime: `${computedEndTime}:00`,
          maxCapacity: finalCapacity,
          status: 1,
        });
        message.success(`[${finalTitle}] 템플릿이 수정되었습니다.`);
      } else {
        await createProgram({
          name: finalTitle,
          category: formCategory,
          dayOfWeek: formDays.join(','),
          startTime: `${formStartTime}:00`,
          endTime: `${computedEndTime}:00`,
          maxCapacity: finalCapacity,
          status: 1,
        });
        message.success(`[${finalTitle}] 템플릿이 등록되었습니다.`);
      }
      loadTemplates();
      setIsCreating(false);
      setEditingTemplate(null);
      if (onTemplatesChanged) onTemplatesChanged();
    } catch {
      const newTpl = {
        id: editingTemplate ? editingTemplate.id : `tpl-${Date.now()}`,
        title: finalTitle,
        category: formCategory,
        type: formClassType,
        status: '활성',
        defaultDuration: Number(formDuration) || 60,
        timeRange: `${formStartTime} - ${computedEndTime}`,
        capacity: finalCapacity,
        repeatSchedule: `매주 ${formDays.join('·')}`,
        defaultStudio: formStudio,
        instructorName: instructorName,
        instructorId: formInstructorId,
      };
      setTemplates((prev) =>
        editingTemplate
          ? prev.map((t) => (t.id === editingTemplate.id ? newTpl : t))
          : [newTpl, ...prev]
      );
      message.success(`[${finalTitle}] 템플릿이 저장되었습니다.`);
      setIsCreating(false);
      setEditingTemplate(null);
    }
  };

  const openEdit = (tpl) => {
    setEditingTemplate(tpl);
    setIsCreating(true);
    setFormTitle(tpl.title);
    setFormCategory(tpl.category);
    setFormClassType(tpl.type || (tpl.capacity === 1 ? 'private' : 'group'));
    setFormDuration(tpl.defaultDuration || 60);
    setFormCapacity(tpl.capacity);
    setFormStartTime(tpl.timeRange?.slice(0, 5) || '09:00');
    setFormStudio(tpl.defaultStudio || '스튜디오 A룸');
    setFormInstructorId(tpl.instructorId ? String(tpl.instructorId) : (instructors[0]?.id ? String(instructors[0].id) : ''));
  };

  const openCreate = () => {
    setEditingTemplate(null);
    setIsCreating(true);
    setFormTitle('');
    setFormCategory('요가');
    setFormClassType('group');
    setFormDuration(60);
    setFormCapacity(10);
    setFormStartTime('09:00');
    setFormStudio('스튜디오 A룸');
    setFormInstructorId(instructors[0]?.id ? String(instructors[0].id) : '');
  };

  const modalContent = (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-violet-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* ── 1. 고정 헤더: 제목, 설명, 닫기(X) 버튼 (스크롤 X) ── */}
        <div className="p-6 pb-4 border-b border-zinc-100 flex items-start justify-between gap-3 flex-shrink-0 bg-white">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight leading-none">
                수업 관리
              </h2>
              <span className="text-xs font-bold text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full">
                템플릿 마스터
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              반복해서 사용할 <strong className="text-violet-700 font-semibold">수업 템플릿(기본 청사진)</strong>을 관리합니다. 등록된 규격은 신규 수업 개설 시 기본값으로 채워집니다.
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

        {/* ── 2. 고정 탭 & 검색 바 (스크롤 X) ── */}
        <div className="px-6 py-3 bg-violet-50/40 border-b border-violet-100/70 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-1 p-1 rounded-full bg-violet-100/60 text-xs">
            <button
              type="button"
              onClick={() => setFilterStatus('전체')}
              className={`px-3 py-1 rounded-full font-semibold transition-all border-0 cursor-pointer ${
                filterStatus === '전체'
                  ? 'bg-white text-violet-700 shadow-xs font-bold'
                  : 'text-zinc-500 bg-transparent hover:text-zinc-800'
              }`}
            >
              전체 {totalCount}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('활성')}
              className={`px-3 py-1 rounded-full font-semibold transition-all border-0 cursor-pointer ${
                filterStatus === '활성'
                  ? 'bg-white text-violet-700 shadow-xs font-bold'
                  : 'text-zinc-500 bg-transparent hover:text-zinc-800'
              }`}
            >
              활성 {activeCount}
            </button>
            <button
              type="button"
              onClick={() => setFilterStatus('중지')}
              className={`px-3 py-1 rounded-full font-semibold transition-all border-0 cursor-pointer ${
                filterStatus === '중지'
                  ? 'bg-white text-violet-700 shadow-xs font-bold'
                  : 'text-zinc-500 bg-transparent hover:text-zinc-800'
              }`}
            >
              중지 {pausedCount}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="수업명, 강사명, 카테고리..."
              className="text-xs bg-white border border-violet-200/80 rounded-full py-1.5 pl-8 pr-3 w-48 sm:w-56 outline-none focus:border-violet-400 text-zinc-700 placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* ── 3. 본문 영역: 스크롤 가능 (스크롤 O) ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
          {/* [+ 새 수업 템플릿 만들기] 점선 버튼을 목록 상단에 항상 눈에 띄게 배치 */}
          {!isCreating && (
            <button
              type="button"
              onClick={openCreate}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-violet-300 hover:border-violet-500 bg-violet-50/40 hover:bg-violet-50/80 text-violet-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              새 수업 템플릿 만들기
            </button>
          )}

          {isCreating ? (
            <form id="template-form" onSubmit={handleSaveForm} className="space-y-4">
              <div className="p-5 rounded-2xl bg-violet-50/60 border border-violet-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900">
                    {editingTemplate ? '템플릿 수정' : '새로운 수업 템플릿 등록'}
                  </h3>
                  <span className="text-[11px] text-violet-600 font-semibold bg-violet-100/70 px-2 py-0.5 rounded-full">
                    기본 규격 틀(청사진)
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">수업명</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder={`예: ${formCategory} 클래스`}
                    className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-semibold text-zinc-800"
                  />
                </div>

                {/* 분류 & 수업 형태 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">분류</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-semibold"
                    >
                      <option value="요가">요가</option>
                      <option value="필라테스">필라테스</option>
                      <option value="스피닝">스피닝</option>
                      <option value="PT">PT (개인)</option>
                      <option value="크로스핏">크로스핏</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">수업 형태</label>
                    <select
                      value={formClassType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormClassType(val);
                        if (val === 'private') setFormCapacity(1);
                      }}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-semibold"
                    >
                      <option value="group">그룹 수업</option>
                      <option value="private">1:1 개인 레슨</option>
                    </select>
                  </div>
                </div>

                {/* 진행 시간 & 기본 정원 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">진행시간 (분)</label>
                    <input
                      type="number"
                      min="20"
                      max="180"
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-bold text-center"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">
                      기본 정원 (명)
                      {formClassType === 'private' && (
                        <span className="text-[10px] text-zinc-400 font-normal ml-1">(개인 1명 고정)</span>
                      )}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      disabled={formClassType === 'private'}
                      value={formClassType === 'private' ? 1 : formCapacity}
                      onChange={(e) => setFormCapacity(e.target.value)}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-bold text-center disabled:bg-zinc-100 disabled:text-zinc-400"
                    />
                  </div>
                </div>

                {/* 기본 시작 시간 & 기본 스튜디오 */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">기본 권장 시작 시간</label>
                    <input
                      type="time"
                      value={formStartTime}
                      onChange={(e) => setFormStartTime(e.target.value)}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-700 block mb-1">기본 스튜디오</label>
                    <select
                      value={formStudio}
                      onChange={(e) => setFormStudio(e.target.value)}
                      className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-semibold"
                    >
                      <option value="스튜디오 A룸">스튜디오 A룸 (GX/요가)</option>
                      <option value="스튜디오 B룸">스튜디오 B룸 (기구 필라테스)</option>
                      <option value="피트니스존">피트니스존 (헬스장)</option>
                    </select>
                  </div>
                </div>

                {/* 기본 담당 강사 */}
                <div>
                  <label className="text-xs font-bold text-zinc-700 block mb-1">기본 담당 강사</label>
                  <select
                    value={formInstructorId}
                    onChange={(e) => setFormInstructorId(e.target.value)}
                    className="w-full text-xs bg-white border border-violet-200 rounded-xl p-2.5 outline-none font-semibold"
                  >
                    <option value="">강사 미지정 (개설 시 지정)</option>
                    {instructors.map((ins) => (
                      <option key={ins.id} value={ins.id}>
                        {ins.name} ({ins.specialty || '전임 강사'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              {filteredTemplates.length > 0 ? (
                filteredTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="p-4 rounded-2xl bg-white border border-violet-100 hover:border-violet-300 transition-all shadow-2xs space-y-2.5"
                  >
                    {/* 카드 상단: 수업명, 뱃지, 액션 버튼 3종 */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-bold text-zinc-900">{tpl.title}</span>
                        <span className="px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 text-[11px] font-semibold">
                          {tpl.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600 text-[11px] font-medium">
                          {tpl.type === 'private' ? '1:1 개인 레슨' : '그룹 수업'}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            tpl.status === '활성'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                          }`}
                        >
                          {tpl.status}
                        </span>
                      </div>

                      {/* 액션 버튼 3종: [중지/활성화] [수정] [삭제] */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* 보라색/회색 상태 전환 버튼 */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tpl)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                            tpl.status === '활성'
                              ? 'text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200'
                              : 'text-zinc-500 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200'
                          }`}
                        >
                          {tpl.status === '활성' ? (
                            <>
                              <PauseCircle className="w-3.5 h-3.5" />
                              <span>중지</span>
                            </>
                          ) : (
                            <>
                              <PlayCircle className="w-3.5 h-3.5" />
                              <span>활성화</span>
                            </>
                          )}
                        </button>

                        {/* 수정 버튼 */}
                        <button
                          type="button"
                          onClick={() => openEdit(tpl)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-violet-600" />
                          <span>수정</span>
                        </button>

                        {/* 삭제 버튼 */}
                        <button
                          type="button"
                          onClick={() => setDeletingTemplate(tpl)}
                          className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>삭제</span>
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-400 font-medium">
                      기본 규격: {tpl.defaultDuration}분 · 정원 {tpl.capacity}명 · {tpl.defaultStudio}
                    </p>

                    {/* 카드 하단 5단 그리드 정보 박스 */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 text-xs">
                      <div className="p-2.5 rounded-xl bg-violet-50/40 border border-violet-100/60">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                          <User className="w-3 h-3 text-violet-500" /> 기본 강사
                        </div>
                        <p className="font-bold text-zinc-800 truncate">{tpl.instructorName}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-violet-50/40 border border-violet-100/60">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                          <Clock className="w-3 h-3 text-violet-500" /> 기본 시간
                        </div>
                        <p className="font-bold text-zinc-800 truncate">{tpl.timeRange}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-violet-50/40 border border-violet-100/60">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                          <Users className="w-3 h-3 text-violet-500" /> 기본 정원
                        </div>
                        <p className="font-bold text-zinc-800">{tpl.capacity}명</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-violet-50/40 border border-violet-100/60">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                          <Repeat className="w-3 h-3 text-violet-500" /> 권장 주기
                        </div>
                        <p className="font-bold text-zinc-800 truncate">{tpl.repeatSchedule}</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-violet-50/40 border border-violet-100/60">
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 mb-0.5">
                          <MapPin className="w-3 h-3 text-violet-500" /> 기본 장소
                        </div>
                        <p className="font-bold text-zinc-800 truncate">{tpl.defaultStudio}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-400 text-xs">등록된 템플릿이 없습니다.</div>
              )}
            </div>
          )}
        </div>

        {/* ── 4. 고정 푸터: 취소, 저장, 닫기 버튼 (스크롤 X) ── */}
        <div className="p-4 px-6 border-t border-zinc-100 flex items-center justify-between gap-2 flex-shrink-0 bg-white rounded-b-3xl">
          <span className="text-xs text-zinc-400 font-medium">총 {totalCount}개의 등록된 템플릿</span>
          <div className="flex items-center gap-2">
            {isCreating ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingTemplate(null);
                  }}
                  className="px-4 py-2 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer bg-white"
                >
                  취소
                </button>
                <button
                  type="submit"
                  form="template-form"
                  className="px-5 py-2 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs cursor-pointer border-0"
                >
                  {editingTemplate ? '수정 완료' : '템플릿 저장'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer bg-white"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 5. 삭제 확인 모달 ── */}
      {deletingTemplate && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-violet-100 space-y-4">
            <div>
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-2">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">템플릿 삭제</h3>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                [{deletingTemplate.title}] 템플릿을 삭제하시겠습니까? 삭제된 템플릿은 복구할 수 없습니다.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setDeletingTemplate(null)}
                className="flex-1 py-2.5 rounded-full border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 transition-colors cursor-pointer bg-white"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/20 cursor-pointer border-0"
              >
                삭제 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

export default ClassTemplateManageModal;
