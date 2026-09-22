"use client";
import * as React from "react";
import * as P from "radix-ui";
import { ChevronDown } from "lucide-react";

export const NavigationMenuRoot = React.forwardRef<
  React.ComponentRef<typeof P.NavigationMenu.Root>,
  React.ComponentPropsWithoutRef<typeof P.NavigationMenu.Root>
>(function Root({ className = "", delayDuration = 0, ...props }, ref) {
  // CHEESE opens on hover immediately. Custom delays use primitive behavior.
  return (
    <P.NavigationMenu.Root
      {...props}
      delayDuration={delayDuration}
      ref={ref}
      className={"cheese-navigation " + className}
    />
  );
});
export const NavigationMenuList = React.forwardRef<
  React.ComponentRef<typeof P.NavigationMenu.List>,
  React.ComponentPropsWithoutRef<typeof P.NavigationMenu.List>
>(function List({ className = "", ...props }, ref) {
  return (
    <P.NavigationMenu.List
      {...props}
      ref={ref}
      className={"cheese-navigation-list " + className}
    />
  );
});
export const NavigationMenuItem = P.NavigationMenu.Item;
export const NavigationMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof P.NavigationMenu.Trigger>
>(function Trigger({ className = "", children, ...props }, ref) {
  return (
    <P.NavigationMenu.Trigger
      {...props}
      ref={ref}
      className={"cheese-navigation-trigger " + className}
    >
      {children}
      <ChevronDown size={15} aria-hidden="true" />
    </P.NavigationMenu.Trigger>
  );
});
export const NavigationMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.NavigationMenu.Content>
>(function Content({ className = "", ...props }, ref) {
  return (
    <P.NavigationMenu.Content
      {...props}
      ref={ref}
      className={"cheese-navigation-content " + className}
    />
  );
});
export const NavigationMenuLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<typeof P.NavigationMenu.Link>
>(function Link({ className = "", ...props }, ref) {
  return (
    <P.NavigationMenu.Link
      {...props}
      ref={ref}
      className={"cheese-navigation-link " + className}
    />
  );
});

export const MenubarRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.Menubar.Root>
>(function Root({ className = "", ...props }, ref) {
  return (
    <P.Menubar.Root
      {...props}
      ref={ref}
      className={"cheese-menubar " + className}
    />
  );
});
export const MenubarMenu = P.Menubar.Menu;
export const MenubarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof P.Menubar.Trigger>
>(function Trigger({ className = "", ...props }, ref) {
  return (
    <P.Menubar.Trigger
      {...props}
      ref={ref}
      className={"cheese-navigation-trigger " + className}
    />
  );
});
export const MenubarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.Menubar.Content>
>(function Content({ className = "", ...props }, ref) {
  return (
    <P.Menubar.Portal>
      <P.Menubar.Content
        sideOffset={6}
        align="start"
        {...props}
        ref={ref}
        className={"cheese-menu cheese-root " + className}
      />
    </P.Menubar.Portal>
  );
});
export const MenubarItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.Menubar.Item>
>(function Item({ className = "", ...props }, ref) {
  return (
    <P.Menubar.Item
      {...props}
      ref={ref}
      className={"cheese-menu-item " + className}
    />
  );
});
export const MenubarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.Menubar.Separator>
>(function Separator({ className = "", ...props }, ref) {
  return (
    <P.Menubar.Separator
      {...props}
      ref={ref}
      className={"cheese-menu-separator " + className}
    />
  );
});

export const ToolbarRoot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.Toolbar.Root>
>(function Root({ className = "", ...props }, ref) {
  return (
    <P.Toolbar.Root
      {...props}
      ref={ref}
      className={"cheese-toolbar " + className}
    />
  );
});
export const ToolbarButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof P.Toolbar.Button>
>(function Button({ className = "", ...props }, ref) {
  return (
    <P.Toolbar.Button
      {...props}
      ref={ref}
      className={"cheese-icon-button " + className}
    />
  );
});
export const ToolbarToggleGroup = React.forwardRef<
  React.ComponentRef<typeof P.Toolbar.ToggleGroup>,
  React.ComponentPropsWithoutRef<typeof P.Toolbar.ToggleGroup>
>(function Group({ className = "", ...props }, ref) {
  return (
    <P.Toolbar.ToggleGroup
      {...props}
      ref={ref}
      className={"cheese-inline " + className}
    />
  );
});
export const ToolbarToggleItem = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof P.Toolbar.ToggleItem>
>(function Item({ className = "", ...props }, ref) {
  return (
    <P.Toolbar.ToggleItem
      {...props}
      ref={ref}
      className={"cheese-toggle " + className}
    />
  );
});
export const ToolbarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.Toolbar.Separator>
>(function Separator({ className = "", ...props }, ref) {
  return (
    <P.Toolbar.Separator
      {...props}
      ref={ref}
      className={"cheese-toolbar-separator " + className}
    />
  );
});

export const HoverCardRoot = P.HoverCard.Root;
export const HoverCardTrigger = P.HoverCard.Trigger;
export const HoverCardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof P.HoverCard.Content>
>(function Content({ className = "", ...props }, ref) {
  return (
    <P.HoverCard.Portal>
      <P.HoverCard.Content
        role="region"
        aria-label="추가 정보"
        sideOffset={8}
        collisionPadding={12}
        {...props}
        ref={ref}
        className={"cheese-popover cheese-root " + className}
      />
    </P.HoverCard.Portal>
  );
});
