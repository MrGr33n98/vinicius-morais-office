"use client";

import Link from "next/link";
import { useState } from "react";
import { Accordion, Drawer, IconButton } from "../ui/primitives";

const defaultLinks = [
  { href: "/", label: "Início" },
  { href: "/areas-de-atuacao", label: "Áreas" },
  { href: "/como-funciona", label: "Como funciona" },
  { href: "/blog", label: "Conteúdos" },
  { href: "/contato", label: "Contato" },
];

const defaultFooterGroups = [
  {
    value: "institucional",
    label: "Institucional",
    links: [
      { href: "/sobre", label: "Sobre" },
      { href: "/como-funciona", label: "Como funciona" },
      { href: "/depoimentos", label: "Depoimentos" },
    ],
  },
  {
    value: "areas",
    label: "Áreas de atuação",
    links: [
      { href: "/areas-de-atuacao/direito-civil", label: "Direito Civil" },
      { href: "/areas-de-atuacao/direito-empresarial", label: "Direito Empresarial" },
      { href: "/areas-de-atuacao/direito-familia", label: "Direito de Família" },
    ],
  },
  {
    value: "suporte",
    label: "Suporte",
    links: [
      { href: "/portal/login", label: "Portal do Cliente" },
      { href: "/politica-de-privacidade", label: "Privacidade" },
      { href: "/termos-de-uso", label: "Termos de uso" },
    ],
  },
];

function LogoMark() {
  return (
    <Link className="vm-public-logo" href="/" aria-label="Vinicius Morais Advocacia">
      <span className="vm-public-logo-mark">VM</span>
      <span>
        <strong>Advocacia</strong>
        <small>Cuiabá · Mato Grosso</small>
      </span>
    </Link>
  );
}

export function PublicHeader({ links = defaultLinks, activePath = "/" }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="vm-public-header">
      <a className="vm-skip-link" href="#conteudo-principal">
        Pular para o conteúdo
      </a>
      <div className="vm-public-header-inner">
        <LogoMark />
        <nav className="vm-public-nav" aria-label="Navegação principal">
          {links.map((link) => (
            <Link
              className="vm-public-nav-link"
              data-active={activePath === link.href || undefined}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="vm-public-actions">
          <a className="vm-button vm-button-secondary vm-public-desktop-action" href="https://wa.me/5565999098888">
            WhatsApp
          </a>
          <Link className="vm-button vm-button-primary" href="/portal/login">
            Portal do Cliente
          </Link>
          <IconButton
            className="vm-public-menu-button"
            label="Abrir menu"
            aria-expanded={open}
            aria-controls="public-mobile-drawer"
            onClick={() => setOpen(true)}
          >
            ☰
          </IconButton>
        </div>
      </div>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        title="Menu"
        description="Acesse as principais áreas do site"
      >
        <nav className="vm-public-drawer-nav" id="public-mobile-drawer" aria-label="Menu mobile">
          {links.map((link) => (
            <Link
              className="vm-public-nav-link"
              href={link.href}
              key={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link className="vm-button vm-button-primary vm-button-full" href="/portal/login">
            Portal do Cliente
          </Link>
          <a className="vm-button vm-button-secondary vm-button-full" href="tel:+5565999098888">
            Ligar agora
          </a>
        </nav>
      </Drawer>
    </header>
  );
}

export function PublicFooter({ groups = defaultFooterGroups }) {
  const accordionItems = groups.map((group) => ({
    value: group.value,
    label: group.label,
    content: (
      <div className="vm-public-footer-links">
        {group.links.map((link) => (
          <Link href={link.href} key={link.href}>
            {link.label}
          </Link>
        ))}
      </div>
    ),
  }));

  return (
    <footer className="vm-public-footer">
      <div className="vm-public-footer-inner">
        <div className="vm-public-footer-brand">
          <LogoMark />
          <p>Atuação jurídica estratégica com acompanhamento digital e comunicação clara.</p>
          <a href="tel:+5565999098888">(65) 99909-8888</a>
        </div>
        <div className="vm-public-footer-grid" aria-label="Links do rodapé">
          {groups.map((group) => (
            <section className="vm-public-footer-column" key={group.value}>
              <h2>{group.label}</h2>
              <div className="vm-public-footer-links">
                {group.links.map((link) => (
                  <Link href={link.href} key={link.href}>
                    {link.label}
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="vm-public-footer-mobile">
          <Accordion items={accordionItems} />
        </div>
        <div className="vm-public-footer-legal">
          <span>© 2026 VM Advocacia</span>
          <span>OAB/MT 00000</span>
        </div>
      </div>
    </footer>
  );
}
