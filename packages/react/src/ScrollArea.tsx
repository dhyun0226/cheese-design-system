"use client";
import * as React from "react";
import { ScrollArea as Primitive } from "radix-ui";

export interface ScrollAreaProps extends Omit<
  React.ComponentPropsWithoutRef<typeof Primitive.Root>,
  "type" | "asChild"
> {
  /** Accessible name of the keyboard-scrollable content region. */
  label?: string;
  orientation?: "vertical" | "horizontal" | "both";
  height?: React.CSSProperties["height"];
  viewportRef?: React.Ref<HTMLDivElement>;
  viewportProps?: Omit<
    React.ComponentPropsWithoutRef<typeof Primitive.Viewport>,
    "asChild" | "children"
  >;
}

/** Native scrolling with visible overflow indicators; no wheel/key interception. */
export const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  function ScrollArea(
    {
      children,
      label = "스크롤 영역",
      orientation = "vertical",
      height = 180,
      className,
      style,
      viewportRef,
      viewportProps,
      ...rootProps
    },
    ref,
  ) {
    const { className: viewportClass, ...viewportAttributes } =
      viewportProps ?? {};
    return (
      <Primitive.Root
        {...rootProps}
        ref={ref}
        type="auto"
        data-scroll-orientation={orientation}
        className={["cheese-scroll-area", className].filter(Boolean).join(" ")}
        style={{ height, ...style }}
      >
        <Primitive.Viewport
          role="region"
          aria-label={label}
          tabIndex={0}
          {...viewportAttributes}
          ref={viewportRef}
          className={["cheese-scroll-viewport", viewportClass]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </Primitive.Viewport>
        {orientation !== "horizontal" && (
          <Primitive.Scrollbar
            orientation="vertical"
            className="cheese-scrollbar"
          >
            <Primitive.Thumb className="cheese-scroll-thumb" />
          </Primitive.Scrollbar>
        )}
        {orientation !== "vertical" && (
          <Primitive.Scrollbar
            orientation="horizontal"
            className="cheese-scrollbar"
          >
            <Primitive.Thumb className="cheese-scroll-thumb" />
          </Primitive.Scrollbar>
        )}
        <Primitive.Corner className="cheese-scroll-corner" />
      </Primitive.Root>
    );
  },
);
