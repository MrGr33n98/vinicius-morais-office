"use client";

import { useEffect, useId, useRef, useState } from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function getFocusable(container) {
  if (!container) return [];
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);
}

function useLayer(open, onOpenChange, panelRef) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = "hidden";

    requestAnimationFrame(() => {
      const focusable = getFocusable(panelRef.current);
      (focusable[0] || panelRef.current)?.focus?.();
    });

    function onKeyDown(event) {
      if (event.key === "Escape") {
        onOpenChange?.(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open, onOpenChange, panelRef]);
}

function trapTab(event, panelRef) {
  if (event.key !== "Tab") return;

  const focusable = getFocusable(panelRef.current);
  if (focusable.length === 0) {
    event.preventDefault();
    panelRef.current?.focus?.();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function Button({ variant = "primary", full = false, className = "", type = "button", ...props }) {
  const variantClass = {
    primary: "vm-button-primary",
    secondary: "vm-button-secondary",
    ghost: "vm-button-ghost",
    portal: "vm-button-portal",
    danger: "vm-button-danger",
  }[variant];

  return (
    <button
      className={cx("vm-button", variantClass, full && "vm-button-full", className)}
      type={type}
      {...props}
    />
  );
}

export function IconButton({ label, className = "", type = "button", ...props }) {
  return (
    <button className={cx("vm-icon-button", className)} type={type} aria-label={label} {...props} />
  );
}

export function Field({ label, htmlFor, help, error, children }) {
  return (
    <div className="vm-field">
      {label ? (
        <label className="vm-label" htmlFor={htmlFor}>
          {label}
        </label>
      ) : null}
      {children}
      {help && !error ? <p className="vm-help-text">{help}</p> : null}
      {error ? (
        <p className="vm-error-text" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className = "", error, ...props }) {
  return (
    <input
      className={cx("vm-input", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      {...props}
    />
  );
}

export function Select({ className = "", error, children, ...props }) {
  return (
    <select
      className={cx("vm-select", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className = "", error, ...props }) {
  return (
    <textarea
      className={cx("vm-textarea", className)}
      aria-invalid={Boolean(error)}
      aria-describedby={error && props.id ? `${props.id}-error` : undefined}
      {...props}
    />
  );
}

export function Checkbox({ label, description, className = "", ...props }) {
  const generatedId = useId();
  const id = props.id || generatedId;

  return (
    <label className={cx("vm-check-row", className)} htmlFor={id}>
      <input className="vm-checkbox" id={id} type="checkbox" {...props} />
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </label>
  );
}

export function Switch({ checked, onCheckedChange, label, description, className = "" }) {
  return (
    <button
      className={cx("vm-switch-row", className)}
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
    >
      <span className={cx("vm-switch", checked && "vm-switch-on")} aria-hidden="true">
        <span className="vm-switch-thumb" />
      </span>
      <span>
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
    </button>
  );
}

export function Badge({ tone = "neutral", className = "", children }) {
  return <span className={cx("vm-badge", `vm-badge-${tone}`, className)}>{children}</span>;
}

export function Card({ title, description, footer, className = "", children }) {
  return (
    <section className={cx("vm-card", className)}>
      {(title || description) && (
        <header className="vm-card-header">
          {title ? <h3 className="vm-card-title">{title}</h3> : null}
          {description ? <p className="vm-card-description">{description}</p> : null}
        </header>
      )}
      <div className="vm-card-body">{children}</div>
      {footer ? <footer className="vm-card-footer">{footer}</footer> : null}
    </section>
  );
}

export function Skeleton({ className = "", style, ...props }) {
  return <div className={cx("vm-skeleton", className)} style={style} aria-hidden="true" {...props} />;
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="vm-state" role="status">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

export function ErrorState({ title = "Não foi possível carregar", description, action }) {
  return (
    <div className="vm-state vm-state-error" role="alert">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  );
}

function SheetFrame({
  open,
  onOpenChange,
  title,
  description,
  children,
  panelClassName,
  role = "dialog",
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);
  useLayer(open, onOpenChange, panelRef);

  if (!open) return null;

  return (
    <>
      <button
        className="vm-overlay"
        type="button"
        aria-label="Fechar"
        onClick={() => onOpenChange?.(false)}
      />
      <section
        ref={panelRef}
        className={panelClassName}
        role={role}
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        onKeyDown={(event) => trapTab(event, panelRef)}
      >
        <header className="vm-sheet-header">
          <div>
            {title ? (
              <h2 className="vm-sheet-title" id={titleId}>
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="vm-sheet-description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <IconButton label="Fechar" onClick={() => onOpenChange?.(false)}>
            ×
          </IconButton>
        </header>
        <div className="vm-sheet-body">{children}</div>
      </section>
    </>
  );
}

export function Dialog(props) {
  return <SheetFrame panelClassName="vm-dialog" {...props} />;
}

export function Drawer(props) {
  return <SheetFrame panelClassName="vm-drawer" {...props} />;
}

export function BottomSheet(props) {
  return <SheetFrame panelClassName="vm-bottom-sheet" {...props} />;
}

export function Tabs({ items, defaultValue, ariaLabel = "Seções" }) {
  const [selected, setSelected] = useState(defaultValue || items?.[0]?.value);
  const selectedItem = items?.find((item) => item.value === selected) || items?.[0];

  return (
    <div className="vm-tabs">
      <div className="vm-tab-list" role="tablist" aria-label={ariaLabel}>
        {items.map((item) => (
          <button
            key={item.value}
            className="vm-tab"
            type="button"
            role="tab"
            aria-selected={selected === item.value}
            onClick={() => setSelected(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="vm-tab-panel" role="tabpanel">
        {selectedItem?.content}
      </div>
    </div>
  );
}

export function Accordion({ items, multiple = false }) {
  const [openItems, setOpenItems] = useState(() => new Set());

  function toggle(value) {
    setOpenItems((current) => {
      const next = new Set(multiple ? current : []);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  return (
    <div className="vm-accordion">
      {items.map((item) => {
        const contentId = `${item.value}-content`;
        const isOpen = openItems.has(item.value);

        return (
          <section className="vm-accordion-item" key={item.value}>
            <button
              className="vm-accordion-trigger"
              type="button"
              aria-expanded={isOpen}
              aria-controls={contentId}
              onClick={() => toggle(item.value)}
            >
              <span>{item.label}</span>
              <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>
            <div className="vm-accordion-content" id={contentId} hidden={!isOpen}>
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export function Toast({ title, description, tone = "default", action }) {
  return (
    <aside className={cx("vm-toast", tone === "error" && "vm-toast-error")} role="status">
      <strong>{title}</strong>
      {description ? <p>{description}</p> : null}
      {action}
    </aside>
  );
}
