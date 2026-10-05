import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Lock } from './Icons';

export function FilterDropdown({
  label,
  value,
  options = [],
  onSelect,
  disabled = false,
  disabledLabel,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selectedOption = options.find((o) => String(o.value) === String(value));
  const selectedLabel = disabled && disabledLabel
    ? disabledLabel
    : selectedOption?.label ?? '전체';

  const isSelected = !disabled && value && value !== 'all';

  if (disabled) {
    return (
      <div className="relative inline-block">
        <div className="bg-zinc-50 border border-zinc-200 rounded-full px-4 py-2 text-xs flex items-center gap-2 text-zinc-500 cursor-not-allowed select-none opacity-80 pointer-events-none whitespace-nowrap">
          <span className="flex items-center">
            <span className="text-zinc-400 font-normal mr-1.5">{label}</span>
            <span className="font-bold text-zinc-700">{selectedLabel}</span>
          </span>
          <Lock className="w-3.5 h-3.5 text-zinc-400" />
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`bg-white/90 border rounded-full px-4 py-2 text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
          open
            ? 'border-violet-600 ring-2 ring-violet-100'
            : 'border-violet-100 hover:border-violet-300'
        }`}
      >
        <span className="flex items-center">
          <span className="text-violet-400 font-normal mr-1.5">{label}</span>
          <span className={isSelected ? 'font-bold text-zinc-900' : 'font-semibold text-zinc-600'}>
            {selectedLabel}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-violet-500 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 min-w-[140px] bg-white/95 backdrop-blur-md border border-violet-100 rounded-2xl p-1.5 shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((opt) => {
            const optSelected = String(opt.value) === String(value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelect?.(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-xs rounded-xl transition-colors cursor-pointer border-0 whitespace-nowrap ${
                  optSelected
                    ? 'bg-violet-100 text-violet-700 font-bold'
                    : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-700 bg-transparent'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default FilterDropdown;
