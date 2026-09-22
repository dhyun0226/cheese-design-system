"use client";
import * as React from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { useFieldValue } from "./Collections.js";

export interface SplitterProps {
  label: string;
  first: React.ReactNode;
  second: React.ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}
export function Splitter({
  label,
  first,
  second,
  value,
  defaultValue = 40,
  onValueChange,
  min = 20,
  max = 80,
  disabled,
}: SplitterProps) {
  const [ratio, setRatio, root] = useFieldValue(
      value,
      defaultValue,
      onValueChange,
    ),
    firstId = React.useId();
  const low = Math.max(0, Math.min(min, 100)),
    high = Math.max(low, Math.min(max, 100));
  const clamp = (n: number) => Math.min(high, Math.max(low, n)),
    current = clamp(ratio);
  const update = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = root.current?.getBoundingClientRect();
    if (box?.width)
      setRatio(
        clamp(Math.round(((event.clientX - box.left) / box.width) * 100)),
      );
  };
  return (
    <div
      ref={root}
      className="cheese-splitter"
      style={{ "--split": current + "%" } as React.CSSProperties}
    >
      <div id={firstId} className="cheese-splitter-panel">
        {first}
      </div>
      <div
        role="separator"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-orientation="vertical"
        aria-controls={firstId}
        aria-valuemin={low}
        aria-valuemax={high}
        aria-valuenow={current}
        aria-valuetext={`첫 패널 ${current}%`}
        aria-disabled={disabled || undefined}
        className="cheese-splitter-handle"
        onPointerDown={(e) => {
          if (disabled || e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.focus();
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!disabled && e.currentTarget.hasPointerCapture(e.pointerId))
            update(e);
        }}
        onPointerUp={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId))
            e.currentTarget.releasePointerCapture(e.pointerId);
        }}
        onKeyDown={(e) => {
          if (disabled) return;
          if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
            e.preventDefault();
            setRatio(
              e.key === "Home"
                ? low
                : e.key === "End"
                  ? high
                  : clamp(
                      current +
                        (e.key === "ArrowLeft" ? -1 : 1) *
                          (e.shiftKey ? 10 : 2),
                    ),
            );
          }
        }}
      >
        <GripVertical size={16} aria-hidden="true" />
      </div>
      <div className="cheese-splitter-panel">{second}</div>
    </div>
  );
}
export interface CarouselProps {
  label: string;
  items: React.ReactNode[];
  value?: number;
  defaultValue?: number;
  onValueChange?: (index: number) => void;
}
export function Carousel({
  label,
  items,
  value,
  defaultValue = 0,
  onValueChange,
}: CarouselProps) {
  const [selected, setSelected, root] = useFieldValue(
    value,
    defaultValue,
    onValueChange,
  );
  const index = Math.max(0, Math.min(selected, items.length - 1)),
    id = React.useId();
  return (
    <div
      ref={root}
      className="cheese-carousel"
      role="region"
      aria-roledescription="캐러셀"
      aria-label={label}
    >
      <div className="cheese-carousel-controls">
        <button
          type="button"
          className="cheese-icon-button"
          aria-label="이전 슬라이드"
          aria-controls={id}
          disabled={index === 0 || !items.length}
          onClick={() => setSelected(index - 1)}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="cheese-help" aria-live="polite">
          {items.length ? index + 1 : 0} / {items.length}
        </span>
        <button
          type="button"
          className="cheese-icon-button"
          aria-label="다음 슬라이드"
          aria-controls={id}
          disabled={index >= items.length - 1}
          onClick={() => setSelected(index + 1)}
        >
          <ChevronRight size={18} />
        </button>
      </div>
      <div id={id} className="cheese-carousel-viewport">
        {items.length ? (
          <div
            role="group"
            aria-roledescription="슬라이드"
            aria-label={`${items.length}개 중 ${index + 1}`}
          >
            {items[index]}
          </div>
        ) : (
          <p className="cheese-help">표시할 콘텐츠가 없습니다.</p>
        )}
      </div>
      <div className="cheese-carousel-dots">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i + 1}번 슬라이드로 이동`}
            aria-current={i === index ? "true" : undefined}
            className="cheese-carousel-dot"
            onClick={() => setSelected(i)}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
}
