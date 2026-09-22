"use client";
import * as React from "react";

export interface ErrorSummaryItem {
  /** A stable, unique key for this error; it is not used as a DOM id. */
  id: string;
  message: string;
  /** The id of a visible input, trigger, or container that contains one. */
  targetId?: string;
}

export interface ErrorSummaryProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title" | "children"
> {
  errors: readonly ErrorSummaryItem[];
  title?: string;
  /** Cancel the navigation event before focusing a custom composite control. */
  onNavigate?: (item: ErrorSummaryItem, event: Event) => void;
}

function focusTarget(root: HTMLElement, targetId: string) {
  const target = root.ownerDocument.getElementById(targetId);
  if (!target) return;
  const selector =
    'input:not([type="hidden"]), select, textarea, button, a[href], [tabindex], [contenteditable="true"]';
  const candidates = [
    target,
    ...target.querySelectorAll<HTMLElement>(selector),
  ];
  for (const candidate of candidates) {
    if (
      !candidate.matches(selector) ||
      candidate.matches(":disabled") ||
      candidate.closest(
        '[hidden], [inert], [aria-hidden="true"], [aria-disabled="true"]',
      )
    )
      continue;
    const rect = candidate.getBoundingClientRect();
    const style = root.ownerDocument.defaultView?.getComputedStyle(candidate);
    // Native form proxies can have a layout box despite being clipped from view.
    if (
      rect.width <= 1 ||
      rect.height <= 1 ||
      style?.visibility === "hidden" ||
      style?.visibility === "collapse" ||
      style?.clip === "rect(0px, 0px, 0px, 0px)" ||
      style?.clipPath === "inset(50%)"
    )
      continue;
    candidate.focus({ preventScroll: true });
    if (root.ownerDocument.activeElement === candidate) {
      candidate.scrollIntoView({ block: "nearest", inline: "nearest" });
      return;
    }
  }
}

/** Focus the summary explicitly after a failed submission; updates never steal focus. */
export const ErrorSummary = React.forwardRef<HTMLDivElement, ErrorSummaryProps>(
  function ErrorSummary(
    {
      errors,
      title = "입력 내용을 확인해 주세요.",
      onNavigate,
      className,
      ...props
    },
    forwardedRef,
  ) {
    const headingId = React.useId();
    if (!errors.length) return null;
    return (
      <div
        {...props}
        ref={forwardedRef}
        className={["cheese-error-summary", className]
          .filter(Boolean)
          .join(" ")}
        role="region"
        aria-labelledby={headingId}
        tabIndex={-1}
      >
        <h2 id={headingId} className="cheese-error-summary-title">
          {title}
        </h2>
        <ul className="cheese-error-summary-list">
          {errors.map((item) => (
            <li key={item.id}>
              {item.targetId ? (
                <a
                  className="cheese-error-summary-link"
                  href={`#${encodeURIComponent(item.targetId)}`}
                  onClick={(event) => {
                    event.preventDefault();
                    const navigation = new Event("navigate", {
                      cancelable: true,
                    });
                    onNavigate?.(item, navigation);
                    if (!navigation.defaultPrevented)
                      focusTarget(event.currentTarget, item.targetId!);
                  }}
                >
                  {item.message}
                </a>
              ) : (
                item.message
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  },
);
