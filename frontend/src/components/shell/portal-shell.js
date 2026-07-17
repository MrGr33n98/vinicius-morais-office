"use client";

import { useState } from "react";
import { BottomSheet, Button, IconButton } from "../ui/primitives";

const mainItems = [
  { key: "inicio", label: "Início", icon: "⌂", href: "/portal" },
  { key: "processos", label: "Processos", icon: "▣", href: "/portal/processos" },
  { key: "prazos", label: "Prazos", icon: "◷", href: "/portal/prazos", badge: 1 },
  { key: "mensagens", label: "Mensagens", icon: "✉", href: "/portal/mensagens", badge: 3 },
  { key: "mais", label: "Mais", icon: "☰" },
];

const moreItems = [
  { key: "documentos", label: "Documentos", href: "/portal/documentos" },
  { key: "audiencias", label: "Audiências", href: "/portal/audiencias" },
  { key: "financeiro", label: "Financeiro", href: "/portal/financeiro" },
  { key: "perfil", label: "Meu Perfil", href: "/portal/perfil" },
  { key: "ajuda", label: "Ajuda", href: "/portal/ajuda" },
];

function PortalAvatar({ initials = "VM" }) {
  return <span className="vm-portal-avatar" aria-hidden="true">{initials}</span>;
}

export function PortalMobileHeader({
  title = "Área do Cliente",
  eyebrow = "Portal VM",
  notifications = 0,
  onMore,
}) {
  return (
    <header className="vm-portal-mobile-header">
      <div>
        <span className="vm-portal-mobile-eyebrow">{eyebrow}</span>
        <h1 className="vm-portal-mobile-title">{title}</h1>
      </div>
      <div className="vm-portal-mobile-actions">
        <IconButton label={`Notificações${notifications ? `: ${notifications}` : ""}`}>
          <span aria-hidden="true">⌁</span>
          {notifications ? <span className="vm-portal-nav-badge">{notifications > 9 ? "9+" : notifications}</span> : null}
        </IconButton>
        <IconButton label="Abrir menu do portal" onClick={onMore}>
          <PortalAvatar />
        </IconButton>
      </div>
    </header>
  );
}

export function PortalBottomNavigation({ active = "inicio", onNavigate, onMore }) {
  return (
    <nav className="vm-portal-bottom-nav" aria-label="Navegação do portal">
      {mainItems.map((item) => (
        <button
          className="vm-portal-nav-item"
          data-active={active === item.key || undefined}
          key={item.key}
          type="button"
          onClick={() => (item.key === "mais" ? onMore?.() : onNavigate?.(item.href, item.key))}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
          {item.badge ? (
            <span className="vm-portal-nav-badge">{item.badge > 9 ? "9+" : item.badge}</span>
          ) : null}
        </button>
      ))}
    </nav>
  );
}

export function PortalMoreSheet({ open, onOpenChange, onNavigate }) {
  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Mais opções"
      description="Acesse documentos, financeiro, perfil e suporte"
    >
      <div className="vm-portal-more-list">
        {moreItems.map((item) => (
          <button
            className="vm-portal-more-item"
            key={item.key}
            type="button"
            onClick={() => {
              onNavigate?.(item.href, item.key);
              onOpenChange?.(false);
            }}
          >
            <span>{item.label}</span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
      <Button variant="secondary" full>
        Falar com suporte
      </Button>
    </BottomSheet>
  );
}

export function PortalDesktopSidebar({ active = "inicio", onNavigate }) {
  const sidebarItems = [...mainItems.filter((item) => item.key !== "mais"), ...moreItems];

  return (
    <aside className="vm-portal-desktop-sidebar" aria-label="Menu do portal">
      <div className="vm-portal-sidebar-brand">
        <span className="vm-public-logo-mark">VM</span>
        <span>
          <strong>Cliente Portal VM</strong>
          <small>Área do Cliente</small>
        </span>
      </div>
      <nav className="vm-portal-sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            className="vm-portal-sidebar-link"
            data-active={active === item.key || undefined}
            key={item.key}
            type="button"
            onClick={() => onNavigate?.(item.href, item.key)}
          >
            <span>{item.label}</span>
            {item.badge ? <span className="vm-portal-nav-badge">{item.badge}</span> : null}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export function PortalShell({ active = "inicio", children, onNavigate }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="vm-portal-shell">
      <PortalDesktopSidebar active={active} onNavigate={onNavigate} />
      <div className="vm-portal-main">
        <PortalMobileHeader title="Dashboard" notifications={3} onMore={() => setMoreOpen(true)} />
        <main className="vm-portal-content" id="conteudo-principal">
          {children}
        </main>
        <PortalBottomNavigation
          active={active}
          onNavigate={onNavigate}
          onMore={() => setMoreOpen(true)}
        />
        <PortalMoreSheet open={moreOpen} onOpenChange={setMoreOpen} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
