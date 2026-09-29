import type { Component } from "vue";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: Component;
  href?: string;
  disabled?: boolean;
  group?: string;
}
