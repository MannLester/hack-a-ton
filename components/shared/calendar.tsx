"use client";

import { useRef, useState, useEffect, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isBefore,
} from "date-fns";

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function usePopupPosition(triggerRef: RefObject<HTMLElement | null>) {
  const [pos, setPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });

  useEffect(() => {
    const update = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    };
    update();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [triggerRef]);

  return pos;
}

function CalendarPopup({
  selected,
  onSelect,
  onClose,
  triggerRef,
}: {
  selected: Date | null;
  onSelect: (date: Date) => void;
  onClose: () => void;
  triggerRef: RefObject<HTMLElement | null>;
}) {
  const [viewDate, setViewDate] = useState(selected ?? new Date());
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePopupPosition(triggerRef);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, triggerRef]);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const content = (
    <div
      ref={popupRef}
      className="fixed z-[100] rounded-lg border-2 border-zinc-950 bg-white p-3 shadow-[4px_4px_0_#111]"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate((d) => subMonths(d, 1))}
          className="inline-flex size-7 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          <ChevronLeft className="size-3" />
        </button>
        <p className="text-sm font-black text-zinc-950">
          {format(viewDate, "MMMM yyyy")}
        </p>
        <button
          type="button"
          onClick={() => setViewDate((d) => addMonths(d, 1))}
          className="inline-flex size-7 items-center justify-center rounded-md border-2 border-zinc-950 bg-white text-zinc-800 hover:translate-x-[1px] hover:translate-y-[1px]"
        >
          <ChevronRight className="size-3" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            className="py-1 text-center text-[10px] font-black text-zinc-400"
          >
            {day}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, viewDate);
          const isSelected = selected ? isSameDay(day, selected) : false;
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => {
                onSelect(day);
                onClose();
              }}
              className={`size-8 rounded-md text-xs font-bold transition-colors ${
                isSelected
                  ? "bg-zinc-950 text-white"
                  : isToday
                    ? "border-2 border-[#00a7e8] text-[#00a7e8]"
                    : inMonth
                      ? "text-zinc-950 hover:bg-zinc-100"
                      : "text-zinc-300"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

export function CalendarPicker({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [parsedDate, setParsedDate] = useState<Date | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const handleSelect = (date: Date) => {
    setParsedDate(date);
    onChange(format(date, "MMM d, yyyy"));
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-zinc-700">
        {label}
      </label>
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen(!open)}
          className={`flex h-11 w-full items-center gap-2 rounded-md border-2 px-3 text-left text-sm font-bold ${
            open ? "border-[#00a7e8]" : "border-zinc-200"
          } ${value ? "text-zinc-950" : "text-zinc-400"} hover:border-zinc-300`}
        >
          <CalendarDays className="size-4 shrink-0 text-zinc-400" />
          {value || placeholder || "Pick a date"}
        </button>
        {open && (
          <CalendarPopup
            selected={parsedDate}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
            triggerRef={triggerRef}
          />
        )}
      </div>
    </div>
  );
}

export function DateRangePicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [startParsed, setStartParsed] = useState<Date | null>(null);
  const [endParsed, setEndParsed] = useState<Date | null>(null);
  const startTriggerRef = useRef<HTMLButtonElement>(null);
  const endTriggerRef = useRef<HTMLButtonElement>(null);

  const formatRange = (a: Date, b: Date): string => {
    const [earlier, later] = isBefore(a, b) ? [a, b] : [b, a];
    if (isSameDay(earlier, later)) return format(earlier, "MMM d, yyyy");
    if (isSameMonth(earlier, later)) {
      return `${format(earlier, "MMM d")}-${format(later, "d, yyyy")}`;
    }
    return `${format(earlier, "MMM d")} - ${format(later, "MMM d, yyyy")}`;
  };

  const handleStartSelect = (date: Date) => {
    setStartParsed(date);
    onChange(
      endParsed ? formatRange(date, endParsed) : format(date, "MMM d, yyyy"),
    );
  };

  const handleEndSelect = (date: Date) => {
    setEndParsed(date);
    onChange(
      startParsed
        ? formatRange(startParsed, date)
        : format(date, "MMM d, yyyy"),
    );
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-black text-zinc-700">
        {label}
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="relative">
          <button
            ref={startTriggerRef}
            type="button"
            onClick={() => {
              setStartOpen(!startOpen);
              setEndOpen(false);
            }}
            className={`flex h-11 w-full items-center gap-2 rounded-md border-2 px-3 text-left text-sm font-bold ${
              startOpen ? "border-[#00a7e8]" : "border-zinc-200"
            } ${startParsed ? "text-zinc-950" : "text-zinc-400"} hover:border-zinc-300`}
          >
            <CalendarDays className="size-4 shrink-0 text-zinc-400" />
            {startParsed
              ? format(startParsed, "MMM d, yyyy")
              : "Start date"}
          </button>
          {startOpen && (
            <CalendarPopup
              selected={startParsed}
              onSelect={handleStartSelect}
              onClose={() => setStartOpen(false)}
              triggerRef={startTriggerRef}
            />
          )}
        </div>
        <div className="relative">
          <button
            ref={endTriggerRef}
            type="button"
            onClick={() => {
              setEndOpen(!endOpen);
              setStartOpen(false);
            }}
            className={`flex h-11 w-full items-center gap-2 rounded-md border-2 px-3 text-left text-sm font-bold ${
              endOpen ? "border-[#00a7e8]" : "border-zinc-200"
            } ${endParsed ? "text-zinc-950" : "text-zinc-400"} hover:border-zinc-300`}
          >
            <CalendarDays className="size-4 shrink-0 text-zinc-400" />
            {endParsed ? format(endParsed, "MMM d, yyyy") : "End date"}
          </button>
          {endOpen && (
            <CalendarPopup
              selected={endParsed}
              onSelect={handleEndSelect}
              onClose={() => setEndOpen(false)}
              triggerRef={endTriggerRef}
            />
          )}
        </div>
      </div>
    </div>
  );
}
