import {
  defineComponent,
  h,
  type Component,
  type PropType,
  useId,
  cloneVNode,
  isVNode,
} from "vue";
import * as P from "reka-ui";
export function styled<T extends Component>(
  component: T,
  className: string,
): T {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const { forwardRef } = P.useForwardExpose();
      return () =>
        h(
          component,
          { ...attrs, ref: forwardRef, class: [className, attrs.class] },
          slots,
        );
    },
  }) as unknown as T;
}
export const CheckboxRoot: typeof P.CheckboxRoot = styled(
  P.CheckboxRoot,
  "cheese-checkbox",
);
export const CheckboxIndicator: typeof P.CheckboxIndicator = styled(
  P.CheckboxIndicator,
  "",
);
export const SwitchRoot: typeof P.SwitchRoot = styled(
  P.SwitchRoot,
  "cheese-switch",
);
export const SwitchThumb: typeof P.SwitchThumb = styled(
  P.SwitchThumb,
  "cheese-switch-thumb",
);
export const RadioGroupRoot: typeof P.RadioGroupRoot = styled(
  P.RadioGroupRoot,
  "cheese-radio-group",
);
export const RadioGroupItem: typeof P.RadioGroupItem = styled(
  P.RadioGroupItem,
  "cheese-radio",
);
export const RadioGroupIndicator: typeof P.RadioGroupIndicator = styled(
  P.RadioGroupIndicator,
  "cheese-radio-indicator",
);
export const TabsRoot: typeof P.TabsRoot = styled(P.TabsRoot, "");
export const TabsList: typeof P.TabsList = styled(
  P.TabsList,
  "cheese-tabs-list",
);
export const TabsTrigger: typeof P.TabsTrigger = styled(
  P.TabsTrigger,
  "cheese-tabs-trigger",
);
export const TabsContent: typeof P.TabsContent = styled(
  P.TabsContent,
  "cheese-tabs-content",
);
export const DialogTitle: typeof P.DialogTitle = styled(
  P.DialogTitle,
  "cheese-dialog-title",
);
export const DialogDescription: typeof P.DialogDescription = styled(
  P.DialogDescription,
  "cheese-dialog-description",
);
export const AlertDialogTitle: typeof P.AlertDialogTitle = styled(
  P.AlertDialogTitle,
  "cheese-dialog-title",
);
export const AlertDialogDescription: typeof P.AlertDialogDescription = styled(
  P.AlertDialogDescription,
  "cheese-dialog-description",
);
export const AccordionItem: typeof P.AccordionItem = styled(
  P.AccordionItem,
  "cheese-accordion-item",
);
export const AccordionHeader: typeof P.AccordionHeader = styled(
  P.AccordionHeader,
  "cheese-accordion-header",
);
export const AccordionTrigger: typeof P.AccordionTrigger = styled(
  P.AccordionTrigger,
  "cheese-accordion-trigger",
);
export const AccordionContent: typeof P.AccordionContent = styled(
  P.AccordionContent,
  "cheese-accordion-content",
);
export const DropdownMenuItem: typeof P.DropdownMenuItem = styled(
  P.DropdownMenuItem,
  "cheese-menu-item",
);
export const ContextMenuItem: typeof P.ContextMenuItem = styled(
  P.ContextMenuItem,
  "cheese-menu-item",
);
export const SliderRoot: typeof P.SliderRoot = styled(
  P.SliderRoot,
  "cheese-slider",
);
export const SliderTrack: typeof P.SliderTrack = styled(
  P.SliderTrack,
  "cheese-slider-track",
);
export const SliderRange: typeof P.SliderRange = styled(
  P.SliderRange,
  "cheese-slider-range",
);
export const SliderThumb: typeof P.SliderThumb = styled(
  P.SliderThumb,
  "cheese-slider-thumb",
);
export const ProgressRoot: typeof P.ProgressRoot = styled(
  P.ProgressRoot,
  "cheese-progress",
);
export const ProgressIndicator: typeof P.ProgressIndicator = styled(
  P.ProgressIndicator,
  "cheese-progress-indicator",
);
export const AvatarRoot: typeof P.AvatarRoot = styled(
  P.AvatarRoot,
  "cheese-avatar",
);
export const Separator: typeof P.Separator = styled(
  P.Separator,
  "cheese-separator",
);
export const Toggle: typeof P.Toggle = styled(P.Toggle, "cheese-toggle");
export const ToggleGroupRoot: typeof P.ToggleGroupRoot = styled(
  P.ToggleGroupRoot,
  "cheese-toggle-group",
);
export const ToggleGroupItem: typeof P.ToggleGroupItem = styled(
  P.ToggleGroupItem,
  "cheese-toggle",
);
export const ToastRoot: typeof P.ToastRoot = styled(
  P.ToastRoot,
  "cheese-toast",
);
export const ToastTitle: typeof P.ToastTitle = styled(
  P.ToastTitle,
  "cheese-toast-title",
);
export const ToastDescription: typeof P.ToastDescription = styled(
  P.ToastDescription,
  "cheese-toast-description",
);
export const ToastViewport: typeof P.ToastViewport = styled(
  P.ToastViewport,
  "cheese-toast-viewport",
);
export const ScrollAreaRoot: typeof P.ScrollAreaRoot = styled(
  P.ScrollAreaRoot,
  "cheese-scroll-area",
);
export const ScrollAreaViewport: typeof P.ScrollAreaViewport = styled(
  P.ScrollAreaViewport,
  "cheese-scroll-viewport",
);
export const ScrollAreaScrollbar: typeof P.ScrollAreaScrollbar = styled(
  P.ScrollAreaScrollbar,
  "cheese-scrollbar",
);
export const ScrollAreaThumb: typeof P.ScrollAreaThumb = styled(
  P.ScrollAreaThumb,
  "cheese-scroll-thumb",
);

export const Card = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(
        "article",
        { ...attrs, class: ["cheese-card", attrs.class] },
        slots.default?.(),
      );
  },
});
export const Badge = defineComponent({
  inheritAttrs: false,
  props: {
    tone: {
      type: String as PropType<"neutral" | "brand" | "positive" | "critical">,
      default: "neutral",
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(
        "span",
        {
          ...attrs,
          class: ["cheese-badge", attrs.class],
          "data-tone": props.tone,
        },
        slots.default?.(),
      );
  },
});
export const Field = defineComponent({
  props: {
    label: { type: String, required: true },
    description: String,
    error: String,
    required: Boolean,
    id: String,
  },
  setup(props, { slots }) {
    const auto = useId();
    return () => {
      const child = slots.default?.().find(isVNode),
        id = props.id || child?.props?.id || auto,
        hint = props.error || props.description;
      return h("div", { class: "cheese-field" }, [
        h("label", { class: "cheese-label", for: id }, [
          props.label,
          props.required ? h("span", { "aria-hidden": "true" }, " *") : null,
        ]),
        child
          ? cloneVNode(child, {
              id,
              required: props.required || child.props?.required,
              "aria-invalid": props.error
                ? true
                : child.props?.["aria-invalid"],
              "aria-describedby":
                [
                  child.props?.["aria-describedby"],
                  hint ? id + "-hint" : undefined,
                ]
                  .filter(Boolean)
                  .join(" ") || undefined,
            })
          : null,
        hint
          ? h(
              "p",
              {
                id: id + "-hint",
                class: "cheese-help",
                "data-error": !!props.error,
                role: props.error ? "alert" : undefined,
              },
              hint,
            )
          : null,
      ]);
    };
  },
});
export const DialogContent = defineComponent({
  inheritAttrs: false,
  props: {
    placement: {
      type: String as PropType<"center" | "right" | "bottom">,
      default: "center",
    },
  },
  setup(props, { attrs, slots }) {
    return () =>
      h(P.DialogPortal, null, {
        default: () => [
          h(P.DialogOverlay, { class: "cheese-overlay" }),
          h(
            P.DialogContent,
            {
              ...attrs,
              class: ["cheese-dialog cheese-root", attrs.class],
              "data-placement": props.placement,
            },
            slots,
          ),
        ],
      });
  },
});
export const AlertDialogContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(P.AlertDialogPortal, null, {
        default: () => [
          h(P.AlertDialogOverlay, { class: "cheese-overlay" }),
          h(
            P.AlertDialogContent,
            { ...attrs, class: ["cheese-dialog cheese-root", attrs.class] },
            slots,
          ),
        ],
      });
  },
});
export const PopoverContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(P.PopoverPortal, null, {
        default: () =>
          h(
            P.PopoverContent,
            {
              sideOffset: 8,
              ...attrs,
              class: ["cheese-popover cheese-root", attrs.class],
            },
            slots,
          ),
      });
  },
});
export const DropdownMenuContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(P.DropdownMenuPortal, null, {
        default: () =>
          h(
            P.DropdownMenuContent,
            {
              sideOffset: 8,
              ...attrs,
              class: ["cheese-menu cheese-root", attrs.class],
            },
            slots,
          ),
      });
  },
});
export const ContextMenuContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(P.ContextMenuPortal, null, {
        default: () =>
          h(
            P.ContextMenuContent,
            {
              sideOffset: 8,
              ...attrs,
              class: ["cheese-menu cheese-root", attrs.class],
            },
            slots,
          ),
      });
  },
});
export const TooltipContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(P.TooltipPortal, null, {
        default: () =>
          h(
            P.TooltipContent,
            {
              sideOffset: 8,
              ...attrs,
              class: ["cheese-tooltip cheese-root", attrs.class],
            },
            slots,
          ),
      });
  },
});
export const HoverCardContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    return () =>
      h(P.HoverCardPortal, null, {
        default: () =>
          h(
            P.HoverCardContent,
            {
              role: "region",
              "aria-label": "추가 정보",
              sideOffset: 8,
              ...attrs,
              class: ["cheese-popover cheese-root", attrs.class],
            },
            slots,
          ),
      });
  },
});
