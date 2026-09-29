"use client";

import * as React from "react";
import { Button } from "./index.js";
import { PageHeader } from "./patterns.js";
import { internalFormLockContext, useFormLock } from "./form-state.js";

export interface PageTemplateProps {
  title: string;
  eyebrow?: string;
  description?: string;
  /** Match the host page's document outline when rendering inside a drawer or demo. */
  headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export interface ListPageProps extends PageTemplateProps {
  summary?: React.ReactNode;
  filters?: React.ReactNode;
  toolbar?: React.ReactNode;
  pagination?: React.ReactNode;
}

/** Composes a list screen; querying, table state, and pagination stay with the app. */
export function ListPage({
  title,
  eyebrow,
  description,
  headingLevel = 1,
  actions,
  summary,
  filters,
  toolbar,
  pagination,
  children,
  className = "",
}: ListPageProps) {
  return (
    <div className={`cheese-page-template cheese-list-page ${className}`}>
      <PageHeader {...{ title, eyebrow, description, headingLevel, actions }} />
      {summary != null && <div className="cheese-page-summary">{summary}</div>}
      {filters != null && <div className="cheese-page-filters">{filters}</div>}
      {toolbar != null && <div className="cheese-page-toolbar">{toolbar}</div>}
      <div className="cheese-page-content">{children}</div>
      {pagination != null && (
        <div className="cheese-page-pagination">{pagination}</div>
      )}
    </div>
  );
}

export interface DetailPageProps extends PageTemplateProps {
  summary?: React.ReactNode;
  tabs?: React.ReactNode;
  aside?: React.ReactNode;
  footer?: React.ReactNode;
}

/** A reusable detail screen, with an optional complementary panel. */
export function DetailPage({
  title,
  eyebrow,
  description,
  headingLevel = 1,
  actions,
  summary,
  tabs,
  aside,
  footer,
  children,
  className = "",
}: DetailPageProps) {
  return (
    <div className={`cheese-page-template cheese-detail-page ${className}`}>
      <PageHeader {...{ title, eyebrow, description, headingLevel, actions }} />
      {summary != null && <div className="cheese-page-summary">{summary}</div>}
      {tabs != null && <div className="cheese-page-tabs">{tabs}</div>}
      <div
        className="cheese-detail-page-body"
        data-has-aside={aside != null || undefined}
      >
        <div className="cheese-page-content">{children}</div>
        {aside != null && (
          <div className="cheese-detail-page-aside">{aside}</div>
        )}
      </div>
      {footer != null && <div className="cheese-page-footer">{footer}</div>}
    </div>
  );
}

export interface FormPageProps extends PageTemplateProps {
  id?: string;
  noValidate?: boolean;
  /** Locks native fields and CHEESE controls connected to form state, including portals. */
  pending?: boolean;
  /** Arbitrary consumer widgets must implement their own disabled contract. */
  disabled?: boolean;
  footer?: React.ReactNode;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

/** Native form semantics without submitting data or pretending to save it. */
export function FormPage({
  title,
  eyebrow,
  description,
  headingLevel = 1,
  actions,
  id,
  noValidate,
  pending = false,
  disabled = false,
  footer,
  onSubmit,
  children,
  className = "",
}: FormPageProps) {
  const inheritedLock = useFormLock();
  const blocked = inheritedLock || disabled || pending;
  return (
    <internalFormLockContext.Provider value={blocked}>
      <form
        id={id}
        className={`cheese-page-template cheese-form-page ${className}`}
        noValidate={noValidate}
        aria-busy={pending || undefined}
        onSubmit={(event) => {
          event.preventDefault();
          if (!blocked) onSubmit?.(event);
        }}
      >
        <PageHeader
          {...{ title, eyebrow, description, headingLevel, actions }}
        />
        <fieldset className="cheese-form-page-fields" disabled={blocked}>
          <div className="cheese-page-content">{children}</div>
          {footer != null && <div className="cheese-page-footer">{footer}</div>}
        </fieldset>
      </form>
    </internalFormLockContext.Provider>
  );
}

export interface MasterDetailLayoutProps {
  list: React.ReactNode;
  detail: React.ReactNode;
  listLabel?: string;
  detailLabel?: string;
  className?: string;
}

/** Responsive layout only: selection and routing remain controlled by the app. */
export function MasterDetailLayout({
  list,
  detail,
  listLabel = "목록",
  detailLabel = "상세",
  className = "",
}: MasterDetailLayoutProps) {
  return (
    <div className={`cheese-master-detail ${className}`}>
      <div
        className="cheese-master-detail-list"
        role="region"
        aria-label={listLabel}
      >
        {list}
      </div>
      <div
        className="cheese-master-detail-detail"
        role="region"
        aria-label={detailLabel}
      >
        {detail}
      </div>
    </div>
  );
}

export interface FormSectionProps {
  title: string;
  description?: string;
  /** Locks native fields and connected CHEESE controls; ancestor locks remain effective. */
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  disabled,
  children,
  className = "",
}: FormSectionProps) {
  const descriptionId = React.useId();
  const inheritedLock = useFormLock();
  const blocked = inheritedLock || !!disabled;
  return (
    <internalFormLockContext.Provider value={blocked}>
      <fieldset
        className={`cheese-form-section ${className}`}
        disabled={blocked}
        aria-describedby={description ? descriptionId : undefined}
      >
        <legend className="cheese-form-section-legend">{title}</legend>
        {description && (
          <p id={descriptionId} className="cheese-form-section-description">
            {description}
          </p>
        )}
        <div className="cheese-form-section-content">{children}</div>
      </fieldset>
    </internalFormLockContext.Provider>
  );
}

export interface FormGridProps {
  columns?: 1 | 2 | 3;
  children: React.ReactNode;
  className?: string;
}

export function FormGrid({
  columns = 2,
  children,
  className = "",
}: FormGridProps) {
  return (
    <div className={`cheese-form-grid ${className}`} data-columns={columns}>
      {children}
    </div>
  );
}

export interface FormActionsProps {
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  pending?: boolean;
  disabled?: boolean;
  submitDisabled?: boolean;
  /** Associates the submit button with a FormPage or any native form by id. */
  form?: string;
  onCancel?: () => void;
  status?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function FormActions({
  submitLabel = "저장",
  cancelLabel = "취소",
  showCancel = true,
  pending = false,
  disabled = false,
  submitDisabled = false,
  form,
  onCancel,
  status,
  children,
  className = "",
}: FormActionsProps) {
  const inheritedLock = useFormLock();
  const blocked = inheritedLock || disabled || pending;
  return (
    <fieldset
      className={`cheese-form-actions ${className}`}
      disabled={blocked}
      aria-busy={pending || undefined}
    >
      {status != null && (
        <div className="cheese-form-actions-status">{status}</div>
      )}
      <div className="cheese-form-actions-buttons">
        {children}
        {showCancel && (
          <Button
            type="button"
            variant="weak"
            disabled={blocked}
            onClick={() => {
              if (!blocked) onCancel?.();
            }}
          >
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          form={form}
          loading={pending}
          disabled={blocked || submitDisabled}
        >
          {submitLabel}
        </Button>
      </div>
    </fieldset>
  );
}

export interface ReadOnlyFieldProps {
  label: string;
  value?: React.ReactNode;
  emptyText?: string;
  className?: string;
}

export function ReadOnlyField({
  label,
  value,
  emptyText = "—",
  className = "",
}: ReadOnlyFieldProps) {
  const display =
    value == null || value === ""
      ? emptyText
      : typeof value === "boolean"
        ? String(value)
        : value;
  return (
    <dl className={`cheese-read-only-field ${className}`}>
      <dt className="cheese-read-only-field-label">{label}</dt>
      <dd className="cheese-read-only-field-value">{display}</dd>
    </dl>
  );
}
