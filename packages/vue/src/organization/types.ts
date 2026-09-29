export interface OrganizationNode {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  children?: OrganizationNode[];
}

export interface PermissionAction {
  id: string;
  label: string;
}

export interface PermissionResource {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
  unavailableActions?: string[];
}

export interface PermissionGrant {
  resourceId: string;
  actionId: string;
}

export interface SortableListItem {
  id: string;
  label: string;
  description?: string;
  disabled?: boolean;
}
