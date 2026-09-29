import type { NavigationItem } from "../workspace/types";

export interface AppShellItem extends NavigationItem {}

export interface FilterBarFilter {
  id: string;
  label: string;
  value: string;
  /** The first option is the filter's reset value. */
  options: { value: string; label: string }[];
}

export interface BulkAction {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface BulkActionResult {
  succeeded: number;
  failed: number;
}

export interface PickerPerson {
  id: string;
  name: string;
  organizationId: string;
  description?: string;
  disabled?: boolean;
}

export interface PickerOrganization {
  id: string;
  label: string;
  children?: PickerOrganization[];
}
