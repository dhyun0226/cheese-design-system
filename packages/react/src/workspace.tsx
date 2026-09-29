"use client";

import * as React from "react";
import { Avatar, Card } from "./index.js";

export interface NavigationItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string;
  disabled?: boolean;
  /** Items with the same label form a group, ordered by first appearance. */
  group?: string;
}

export interface NavigationListProps extends React.HTMLAttributes<HTMLElement> {
  items: NavigationItem[];
  activeId?: string;
  label?: string;
  /** Native navigation can be cancelled by calling event.preventDefault(). */
  onNavigate?: (
    id: string,
    event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
  ) => void;
}

function navigationHref(value?: string) {
  if (!value) return undefined;
  const href = value.trim();
  const normalized = href.replace(/[\u0000-\u0020\u007f]/g, "");
  if (!normalized) return undefined;
  if (
    /^[a-z][a-z\d+.-]*:/i.test(normalized) &&
    !/^(https?|mailto|tel):/i.test(normalized)
  )
    return undefined;
  return href;
}

/** A vertical navigation list. The caller owns route state and destination data. */
export function NavigationList({
  items,
  activeId,
  label = "주 메뉴",
  onNavigate,
  className,
  ...props
}: NavigationListProps) {
  const id = React.useId();
  const groups = new Map<string, NavigationItem[]>();
  items.forEach((item) => {
    const group = item.group ?? "";
    const members = groups.get(group);
    if (members) members.push(item);
    else groups.set(group, [item]);
  });

  return (
    <nav
      {...props}
      className={["cheese-workspace-navigation", className]
        .filter(Boolean)
        .join(" ")}
      aria-label={props["aria-label"] ?? label}
    >
      {Array.from(groups, ([group, members], groupIndex) => (
        <div className="cheese-navigation-group" key={group}>
          {group && (
            <p
              className="cheese-navigation-group-label"
              id={`${id}-${groupIndex}`}
            >
              {group}
            </p>
          )}
          <ul aria-labelledby={group ? `${id}-${groupIndex}` : undefined}>
            {members.map((item) => {
              const href = navigationHref(item.href);
              const disabled = item.disabled || (!!item.href && !href);
              const content = (
                <>
                  {item.icon && (
                    <span className="cheese-navigation-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="cheese-navigation-label">{item.label}</span>
                </>
              );
              return (
                <li key={item.id}>
                  {href && !disabled ? (
                    <a
                      className="cheese-workspace-navigation-link"
                      href={href}
                      aria-current={activeId === item.id ? "page" : undefined}
                      onClick={(event) => onNavigate?.(item.id, event)}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      type="button"
                      className="cheese-workspace-navigation-link"
                      disabled={disabled}
                      aria-current={activeId === item.id ? "page" : undefined}
                      onClick={(event) => onNavigate?.(item.id, event)}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export interface UserIdentityProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  description?: string;
  src?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg";
}

export function UserIdentity({
  name,
  description,
  src,
  fallback,
  size = "md",
  className,
  ...props
}: UserIdentityProps) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("");
  return (
    <div
      {...props}
      className={["cheese-user-identity", className].filter(Boolean).join(" ")}
      data-size={size}
    >
      <span className="cheese-user-identity-avatar" aria-hidden="true">
        <Avatar src={src} alt="" fallback={fallback ?? initials} />
      </span>
      <span className="cheese-user-identity-copy">
        <strong className="cheese-user-identity-name">{name}</strong>
        {description && (
          <span className="cheese-user-identity-description">
            {description}
          </span>
        )}
      </span>
    </div>
  );
}

export interface SectionHeaderProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "title"
> {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
}

export function SectionHeader({
  title,
  description,
  actions,
  headingLevel = 2,
  className,
  ...props
}: SectionHeaderProps) {
  const Heading = `h${headingLevel}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  return (
    <header
      {...props}
      className={["cheese-section-header", className].filter(Boolean).join(" ")}
    >
      <div className="cheese-section-header-copy">
        <Heading className="cheese-section-header-title">{title}</Heading>
        {description != null && (
          <p className="cheese-section-header-description">{description}</p>
        )}
      </div>
      {actions != null && (
        <div className="cheese-section-header-actions">{actions}</div>
      )}
    </header>
  );
}

export interface StatCardProps extends React.HTMLAttributes<HTMLElement> {
  label: string;
  value: React.ReactNode;
  description?: React.ReactNode;
}

/** A display-only metric. Formatting, calculations and data freshness belong to the caller. */
export function StatCard({
  label,
  value,
  description,
  className,
  ...props
}: StatCardProps) {
  return (
    <Card
      {...props}
      className={["cheese-stat-card", className].filter(Boolean).join(" ")}
    >
      <p className="cheese-stat-label">{label}</p>
      <p className="cheese-stat-value">{value}</p>
      {description != null && (
        <p className="cheese-stat-description">{description}</p>
      )}
    </Card>
  );
}

export interface StatGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: 2 | 3 | 4;
}

export function StatGroup({
  columns = 3,
  className,
  ...props
}: StatGroupProps) {
  return (
    <div
      {...props}
      className={["cheese-stat-group", className].filter(Boolean).join(" ")}
      data-columns={columns}
    />
  );
}
