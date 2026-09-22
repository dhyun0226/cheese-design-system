import { defineComponent, h } from "vue";
import * as P from "reka-ui";
import { ChevronDown } from "@lucide/vue";
import { styled } from "./styled";
export const NavigationMenuRoot: typeof P.NavigationMenuRoot = defineComponent({
  inheritAttrs: false,
  // CHEESE opens on hover immediately. Custom delays use primitive behavior.
  props: { delayDuration: { type: Number, default: 0 } },
  setup(props, { attrs, slots }) {
    const { forwardRef } = P.useForwardExpose();
    return () =>
      h(
        P.NavigationMenuRoot,
        {
          ...attrs,
          delayDuration: props.delayDuration,
          ref: forwardRef,
          class: ["cheese-navigation", attrs.class],
        },
        slots,
      );
  },
}) as unknown as typeof P.NavigationMenuRoot;
export const NavigationMenuList: typeof P.NavigationMenuList = styled(
  P.NavigationMenuList,
  "cheese-navigation-list",
);
export const NavigationMenuItem: typeof P.NavigationMenuItem =
  P.NavigationMenuItem;
export const NavigationMenuTrigger: typeof P.NavigationMenuTrigger =
  defineComponent({
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const { forwardRef } = P.useForwardExpose();
      return () =>
        h(
          P.NavigationMenuTrigger,
          {
            ...attrs,
            ref: forwardRef,
            class: ["cheese-navigation-trigger", attrs.class],
          },
          {
            default: () => [
              slots.default?.(),
              h(ChevronDown, { size: 15, "aria-hidden": true }),
            ],
          },
        );
    },
  }) as unknown as typeof P.NavigationMenuTrigger;
export const NavigationMenuContent: typeof P.NavigationMenuContent = styled(
  P.NavigationMenuContent,
  "cheese-navigation-content",
);
export const NavigationMenuLink: typeof P.NavigationMenuLink = styled(
  P.NavigationMenuLink,
  "cheese-navigation-link",
);
export const MenubarRoot: typeof P.MenubarRoot = styled(
  P.MenubarRoot,
  "cheese-menubar",
);
export const MenubarMenu: typeof P.MenubarMenu = P.MenubarMenu;
export const MenubarTrigger: typeof P.MenubarTrigger = styled(
  P.MenubarTrigger,
  "cheese-navigation-trigger",
);
export const MenubarContent: typeof P.MenubarContent = defineComponent({
  inheritAttrs: false,
  setup(_, { attrs, slots }) {
    const { forwardRef } = P.useForwardExpose();
    return () =>
      h(P.MenubarPortal, null, {
        default: () =>
          h(
            P.MenubarContent,
            {
              sideOffset: 6,
              align: "start",
              ...attrs,
              ref: forwardRef,
              class: ["cheese-menu cheese-root", attrs.class],
            },
            slots,
          ),
      });
  },
}) as unknown as typeof P.MenubarContent;
export const MenubarItem: typeof P.MenubarItem = styled(
  P.MenubarItem,
  "cheese-menu-item",
);
export const MenubarSeparator: typeof P.MenubarSeparator = styled(
  P.MenubarSeparator,
  "cheese-menu-separator",
);
export const ToolbarRoot: typeof P.ToolbarRoot = styled(
  P.ToolbarRoot,
  "cheese-toolbar",
);
export const ToolbarButton: typeof P.ToolbarButton = styled(
  P.ToolbarButton,
  "cheese-icon-button",
);
export const ToolbarToggleGroup: typeof P.ToolbarToggleGroup = styled(
  P.ToolbarToggleGroup,
  "cheese-inline",
);
export const ToolbarToggleItem: typeof P.ToolbarToggleItem = styled(
  P.ToolbarToggleItem,
  "cheese-toggle",
);
export const ToolbarSeparator: typeof P.ToolbarSeparator = styled(
  P.ToolbarSeparator,
  "cheese-toolbar-separator",
);
