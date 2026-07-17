"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Drawer, IconButton } from "../components/ui/primitives";

/* ─────────────────────────────────────────────────────────────────
   DESIGN SYSTEM TOKENS
────────────────────────────────────────────────────────────────── */
const T = {
  navy:       "#010F1C",
  navyMid:    "#0D1B2A",
  navyLight:  "#0F2236",
  navySubtle: "#EBF0F5",        // azul muito suave para seções
  gold:       "#C9A227",
  goldLight:  "#E5B831",
  goldBg:     "rgba(201,162,39,0.08)",
  white:      "#FFFFFF",
  gray50:     "#F9FAFB",
  gray100:    "#F3F4F6",
  gray200:    "#E5E7EB",
  gray400:    "#9CA3AF",
  gray500:    "#6B7280",
  gray700:    "#374151",
  gray900:    "#111827",
  shadow:     "0 8px 30px rgba(15,23,42,0.06)",
  shadowMd:   "0 12px 40px rgba(15,23,42,0.10)",
  shadowLg:   "0 20px 60px rgba(15,23,42,0.14)",
  // radii
  r6:  "8px",
  r8:  "12px",
  r12: "16px",
};

const fonts = {
  display: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  body:    "'Inter', system-ui, sans-serif",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const MAX_W = "1280px";
const SECTION_PY = "96px";
const DEFAULT_TOPBAR_BANNERS = [
  {
    id: "default-topbar",
    title: "Plantão jurídico",
    message: "Agenda aberta para análise inicial com acompanhamento digital do seu caso.",
    cta_label: "Solicitar análise",
    cta_url: "#form",
  },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────────── */
function Container({ children, style = {}, className = "" }) {
  return (
    <div className={`landing-container ${className}`.trim()} style={{ maxWidth: MAX_W, margin: "0 auto", padding: "0 24px", ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
      <div style={{ height: "1px", width: "32px", background: T.gold }} />
      <span style={{ fontSize: "12px", fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "2px", fontFamily: fonts.body }}>{text}</span>
      <div style={{ height: "1px", width: "32px", background: T.gold }} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   1 · TOP BAR
────────────────────────────────────────────────────────────────── */
function TopBar() {
  const [banners, setBanners] = useState(DEFAULT_TOPBAR_BANNERS);

  useEffect(() => {
    let ignore = false;

    async function loadBanners() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/banners?placement=topbar`, {
          cache: "no-store",
        });
        if (!res.ok) return;

        const data = await res.json();
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setBanners(data);
        }
      } catch {
        // Mantem o banner padrao quando o CMS estiver indisponivel.
      }
    }

    loadBanners();
    return () => { ignore = true; };
  }, []);

  const tickerBase = Array.from(
    { length: Math.max(2, Math.ceil(6 / banners.length)) },
    () => banners
  ).flat();
  const tickerItems = [...tickerBase, ...tickerBase];

  return (
    <div style={{ background: T.navyMid, borderBottom: `1px solid rgba(201,162,39,0.18)`, fontFamily: fonts.body, overflow: "hidden" }}>
      <Container className="landing-topbar-inner" style={{ display: "grid", gridTemplateColumns: "auto minmax(0, 1fr) auto", alignItems: "center", gap: "18px", minHeight: "42px" }}>
        <div className="landing-topbar-label" style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          color: T.gold, fontSize: "11px", fontWeight: 800,
          textTransform: "uppercase", letterSpacing: "1.2px", whiteSpace: "nowrap"
        }}>
          <span style={{ width: "8px", height: "8px", background: T.gold, borderRadius: "50%", boxShadow: "0 0 14px rgba(201,162,39,0.8)" }} />
          Plantão jurídico
        </div>

        <div className="landing-news-ticker" aria-live="polite">
          <div className="landing-news-track is-animated">
            {tickerItems.map((banner, index) => (
              <div key={`${banner.id}-${index}`} className="landing-news-item">
                <span style={{ color: T.white, fontWeight: 700 }}>{banner.title}</span>
                <span style={{ color: "#94a3b8" }}>{banner.message}</span>
                {banner.cta_label && banner.cta_url && (
                  <BannerCta href={banner.cta_url}>
                    {banner.cta_label} →
                  </BannerCta>
                )}
              </div>
            ))}
          </div>
        </div>

        <a className="landing-topbar-phone" href="tel:+556592918889" style={{
          fontSize: "13px", fontWeight: 700, color: "#cbd5e1", textDecoration: "none",
          display: "flex", alignItems: "center", gap: "6px", whiteSpace: "nowrap"
        }}>
          <span style={{ color: T.gold }}>☎</span>(65) 9291-8889
        </a>
      </Container>
    </div>
  );
}

function BannerCta({ href, children }) {
  const style = {
    color: T.navy,
    background: T.gold,
    borderRadius: T.r6,
    padding: "5px 12px",
    fontSize: "11px",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    textDecoration: "none",
    whiteSpace: "nowrap",
  };

  if (href.startsWith("/")) {
    return <Link href={href} style={style}>{children}</Link>;
  }

  return <a href={href} style={style}>{children}</a>;
}

/* ─────────────────────────────────────────────────────────────────
   2 · NAVBAR
────────────────────────────────────────────────────────────────── */
function Navbar({ scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { label: "Áreas de Atuação", href: "#areas" },
    { label: "Como Funciona", href: "#dashboard" },
    { label: "Área do Cliente", href: "/portal/login" },
    { label: "Conteúdos", href: "/blog" },
    { label: "Sobre", href: "#sobre" },
    { label: "Contato", href: "#contato" },
  ];
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 200,
      background: scrolled ? "rgba(1,15,28,0.97)" : T.navy,
      backdropFilter: "blur(16px)",
      borderBottom: `1px solid rgba(201,162,39,0.12)`,
      fontFamily: fonts.body,
      transition: "all 0.3s",
    }}>
      <Container className="landing-nav-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? "60px" : "68px", transition: "height 0.3s" }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "40px", height: "40px", background: T.gold, borderRadius: T.r6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 800, fontSize: "13px", color: T.navy, letterSpacing: "-0.5px" }}>V|M</div>
          <div>
            <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: "16px", color: T.white, lineHeight: 1.1 }}>ADVOCACIA</div>
            <div style={{ fontSize: "9px", color: T.gold, fontWeight: 600, letterSpacing: "1.5px" }}>CUIABÁ · MATO GROSSO</div>
          </div>
        </Link>

        {/* Links */}
        <div className="landing-nav-links" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {links.map(l => (
            <Link key={l.label} href={l.href} style={{
              fontSize: "13.5px", fontWeight: 500, color: "#cbd5e1", padding: "8px 13px",
              textDecoration: "none", borderRadius: T.r6, transition: "all 0.18s"
            }}
              onMouseEnter={e => { e.currentTarget.style.color = T.gold; e.currentTarget.style.background = "rgba(201,162,39,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#cbd5e1"; e.currentTarget.style.background = "transparent"; }}
            >{l.label}</Link>
          ))}
        </div>

        {/* CTAs */}
        <div className="landing-nav-actions" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <a href="https://wa.me/556592918889" target="_blank" rel="noreferrer" style={{
            border: `1.5px solid rgba(201,162,39,0.5)`, color: T.gold, padding: "8px 16px",
            borderRadius: T.r6, fontSize: "13px", fontWeight: 600, textDecoration: "none", transition: "all 0.18s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.goldBg; e.currentTarget.style.borderColor = T.gold; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(201,162,39,0.5)"; }}
          >WhatsApp</a>
          <a href="#form" style={{
            background: T.gold, color: T.navy, padding: "8px 20px", borderRadius: T.r6,
            fontSize: "13px", fontWeight: 700, textDecoration: "none", transition: "background 0.18s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.goldLight}
            onMouseLeave={e => e.currentTarget.style.background = T.gold}
          >Solicitar análise</a>
          <IconButton
            className="landing-mobile-menu-button"
            label="Abrir menu"
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            onClick={() => setMenuOpen(true)}
          >
            ☰
          </IconButton>
        </div>
      </Container>
      <Drawer
        open={menuOpen}
        onOpenChange={setMenuOpen}
        title="Menu"
        description="Navegue pelo site ou acesse sua área do cliente"
      >
        <nav className="landing-mobile-drawer-nav" id="landing-mobile-menu" aria-label="Menu mobile">
          {links.map((link) => (
            <Link href={link.href} key={link.href} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          <a href="https://wa.me/556592918889" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          <a className="is-primary" href="#form" onClick={() => setMenuOpen(false)}>
            Solicitar análise
          </a>
        </nav>
      </Drawer>
    </nav>
  );
}

/* ─────────────────────────────────────────────────────────────────
   3 · HERO
────────────────────────────────────────────────────────────────── */
function Hero() {
  return (
    <section className="landing-hero" style={{
      background: `linear-gradient(120deg, ${T.navy} 0%, ${T.navyLight} 60%, #0A1E2F 100%)`,
      position: "relative", overflow: "hidden", minHeight: "580px",
      display: "flex", alignItems: "center",
    }}>
      {/* Gold glow */}
      <div style={{ position: "absolute", top: 0, right: "30%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(201,162,39,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent 0%, ${T.gold} 50%, transparent 100%)`, opacity: 0.4 }} />

      <Container className="landing-hero-grid" style={{ display: "grid", gridTemplateColumns: "52% 48%", gap: "0", alignItems: "stretch", padding: "64px 24px 0", width: "100%" }}>
        {/* LEFT */}
        <div className="landing-hero-copy" style={{ paddingRight: "48px", paddingBottom: "64px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", border: `1px solid rgba(201,162,39,0.35)`, padding: "5px 14px", borderRadius: T.r6, marginBottom: "24px", width: "fit-content" }}>
            <span style={{ width: "6px", height: "6px", background: T.gold, borderRadius: "50%", display: "inline-block" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", fontFamily: fonts.body }}>Advocacia Estratégica com Tecnologia</span>
          </div>

          <h1 style={{ fontFamily: fonts.display, fontSize: "clamp(34px, 4vw, 52px)", fontWeight: 700, color: T.white, lineHeight: 1.08, marginBottom: "20px", letterSpacing: "-1.5px" }}>
            Advocacia estratégica<br />com acompanhamento<br />
            <span style={{ color: T.gold }}>digital do seu processo.</span>
          </h1>

          <p style={{ fontSize: "17px", color: "#94a3b8", lineHeight: 1.65, marginBottom: "32px", maxWidth: "480px", fontFamily: fonts.body }}>
            Atendimento jurídico em Cuiabá e Mato Grosso, com acesso seguro a prazos, documentos, audiências e atualizações em tempo real.
          </p>

          {/* Feature pills */}
          <div className="landing-hero-features" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 20px", marginBottom: "36px" }}>
            {[
              "Atendimento 100% Online ou Presencial",
              "Acompanhamento digital em cada etapa",
              "Resposta Rápida e acompanhamento",
              "Sigilo & Ética Garantidos",
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: T.gold, fontWeight: 700, fontSize: "14px", marginTop: "1px" }}>✓</span>
                <span style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.4, fontFamily: fonts.body }}>{f}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="landing-hero-actions" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <a href="#form" style={{
              background: T.gold, color: T.navy, padding: "14px 28px", borderRadius: T.r8,
              fontWeight: 700, fontSize: "15px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "8px",
              boxShadow: `0 4px 20px rgba(201,162,39,0.35)`, transition: "all 0.2s", fontFamily: fonts.body
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Solicitar análise jurídica
            </a>
            <Link href="/portal/login" style={{
              border: `1.5px solid rgba(201,162,39,0.4)`, color: "#cbd5e1", padding: "13px 24px", borderRadius: T.r8,
              fontWeight: 600, fontSize: "15px", textDecoration: "none",
              display: "inline-flex", alignItems: "center", gap: "8px",
              transition: "all 0.2s", fontFamily: fonts.body
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(201,162,39,0.4)"; e.currentTarget.style.color = "#cbd5e1"; }}
            >
              Conhecer a Área do Cliente →
            </Link>
          </div>

          <p style={{ fontSize: "12px", color: "#475569", marginTop: "20px", display: "flex", alignItems: "center", gap: "5px", fontFamily: fonts.body }}>
            <span style={{ color: T.gold }}>📍</span>
            Atendimento em Cuiabá e em todo o estado de Mato Grosso
          </p>
        </div>

        {/* RIGHT: Hero image + floating form card */}
        <div className="landing-hero-visual" style={{ position: "relative", display: "flex", alignItems: "flex-end" }}>
          {/* Hero image */}
          <div className="landing-hero-image" style={{ position: "relative", width: "100%", height: "500px", borderRadius: "12px 12px 0 0", overflow: "hidden" }}>
            <Image
              src="/01-hero-cliente-area-do-cliente.webp"
              alt="Cliente acessando a Área do Cliente no notebook"
              fill
              sizes="(max-width: 900px) 100vw, 48vw"
              style={{ objectFit: "cover", objectPosition: "center top" }}
              priority
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(1,15,28,0.5) 0%, transparent 40%)" }} />
          </div>
          {/* Floating form */}
          <div id="form" className="landing-hero-form" style={{
            position: "absolute", top: "24px", right: "-24px",
            width: "310px", background: T.white, borderRadius: T.r12,
            boxShadow: T.shadowLg, padding: "28px", border: `1px solid ${T.gray200}`
          }}>
            <LeadForm />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   4 · LEAD FORM (conversion component)
────────────────────────────────────────────────────────────────── */
function LeadForm({ dark = false }) {
  const [form, setForm] = useState({ name: "", phone: "", area: "", description: "", lgpd: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const areas = ["Direito Empresarial","Direito de Família","Direito Imobiliário","Direito Civil","Direito Tributário","Direito Trabalhista","Outro"];

  const formatPhone = (v) => {
    const d = v.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d;
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`;
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
  };

  const bg = dark ? "rgba(255,255,255,0.06)" : T.gray50;
  const border = dark ? "rgba(255,255,255,0.12)" : T.gray200;
  const color = dark ? T.white : T.gray900;
  const labelColor = dark ? "#94a3b8" : T.gray500;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.lgpd) { setError("Você precisa aceitar a Política de Privacidade."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/opportunities`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ opportunity: { name: form.name, phone: form.phone, email: `${form.phone.replace(/\D/g,"")}@lead.vm`, area_interest: form.area, description: form.description, source: "ads", stage: "lead" } })
      });
      if (res.ok) { setSuccess(true); setForm({ name:"", phone:"", area:"", description:"", lgpd: false }); }
      else { const d = await res.json(); setError(d.errors?.join(", ") || "Erro ao enviar."); }
    } catch { setSuccess(true); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ textAlign: "center", padding: "8px 0" }}>
      <div style={{ fontSize: "36px", marginBottom: "12px" }}>✅</div>
      <p style={{ fontWeight: 700, color: T.gold, fontSize: "15px", fontFamily: fonts.display }}>Solicitação recebida!</p>
      <p style={{ color: labelColor, fontSize: "13px", marginTop: "6px", lineHeight: 1.5, fontFamily: fonts.body }}>Nossa equipe entrará em contato em horário comercial.</p>
      <button onClick={() => setSuccess(false)} style={{ marginTop: "16px", background: T.gold, color: T.navy, border: "none", padding: "8px 20px", borderRadius: T.r6, fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>Nova consulta</button>
    </div>
  );

  return (
    <div style={{ fontFamily: fonts.body }}>
      <div style={{ marginBottom: "18px" }}>
        <p style={{ fontSize: "11px", fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "4px" }}>Solicite uma análise inicial</p>
        <h3 style={{ fontFamily: fonts.display, fontSize: "18px", fontWeight: 700, color: color, lineHeight: 1.2, margin: 0 }}>Retorno em horário comercial</h3>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
          <span style={{ fontSize: "10px", color: "#22c55e" }}>🔒</span>
          <span style={{ fontSize: "11px", color: labelColor }}>Seus dados estão protegidos (LGPD)</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        {[
          { key: "name", placeholder: "Nome completo", type: "text", label: "Nome completo", required: true },
          { key: "phone", placeholder: "(65) 99999-9999", type: "tel", label: "WhatsApp", required: true },
        ].map(f => (
          <div key={f.key}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: labelColor, marginBottom: "4px" }}>{f.label}</label>
            <input
              type={f.type} required={f.required} placeholder={f.placeholder}
              value={form[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: f.key === "phone" ? formatPhone(e.target.value) : e.target.value }))}
              style={{
                width: "100%", padding: "10px 12px", background: bg, border: `1px solid ${border}`,
                borderRadius: T.r6, color: color, fontSize: "13px", fontFamily: fonts.body,
                outline: "none", boxSizing: "border-box", transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = T.gold}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>
        ))}

        {/* Area dropdown */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: labelColor, marginBottom: "4px" }}>Área jurídica</label>
          <select
            required value={form.area}
            onChange={e => setForm(p => ({ ...p, area: e.target.value }))}
            style={{ width: "100%", padding: "10px 12px", background: bg, border: `1px solid ${border}`, borderRadius: T.r6, color: form.area ? color : labelColor, fontSize: "13px", fontFamily: fonts.body, outline: "none", boxSizing: "border-box", cursor: "pointer" }}
            onFocus={e => e.target.style.borderColor = T.gold}
            onBlur={e => e.target.style.borderColor = border}
          >
            <option value="" disabled>Selecione a área</option>
            {areas.map(a => <option key={a} value={a} style={{ color: T.gray900, background: T.white }}>{a}</option>)}
          </select>
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: labelColor, marginBottom: "4px" }}>Conte brevemente o que aconteceu</label>
          <textarea
            value={form.description}
            onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            placeholder="Descreva brevemente sua situação..."
            rows={3}
            style={{ width: "100%", padding: "10px 12px", background: bg, border: `1px solid ${border}`, borderRadius: T.r6, color: color, fontSize: "13px", fontFamily: fonts.body, outline: "none", resize: "none", boxSizing: "border-box" }}
            onFocus={e => e.target.style.borderColor = T.gold}
            onBlur={e => e.target.style.borderColor = border}
          />
        </div>

        {/* LGPD */}
        <label style={{ display: "flex", gap: "8px", alignItems: "flex-start", cursor: "pointer" }}>
          <input type="checkbox" checked={form.lgpd} onChange={e => setForm(p => ({ ...p, lgpd: e.target.checked }))} style={{ marginTop: "2px", accentColor: T.gold, flexShrink: 0 }} />
          <span style={{ fontSize: "11px", color: labelColor, lineHeight: 1.5 }}>
            Autorizo o contato conforme a <Link href="/privacidade" style={{ color: T.gold }}>Política de Privacidade</Link>.
          </span>
        </label>

        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "10px 12px", borderRadius: T.r6, color: "#dc2626", fontSize: "12px" }}>{error}</div>}

        <button type="submit" disabled={loading} style={{
          background: T.gold, color: T.navy, border: "none", padding: "13px", borderRadius: T.r8,
          fontFamily: fonts.display, fontWeight: 700, fontSize: "14px", cursor: loading ? "wait" : "pointer",
          transition: "all 0.2s", boxShadow: `0 4px 16px rgba(201,162,39,0.3)`
        }}
          onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = T.goldLight; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseLeave={e => { e.currentTarget.style.background = T.gold; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {loading ? "Enviando..." : "Receber avaliação inicial →"}
        </button>

        <p style={{ textAlign: "center", fontSize: "11px", color: labelColor, margin: 0 }}>
          🔒 Seus dados são protegidos e não serão compartilhados.
        </p>
      </form>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   5 · AREAS DE ATUAÇÃO  (branco)
────────────────────────────────────────────────────────────────── */
const AREAS_DATA = [
  {
    icon: "🏢", title: "Direito Empresarial", desc: "Contratos, cobrança, responsabilidade societária e prevenção de riscos.",
    services: ["Consultoria empresarial","Revisão de contratos","Recuperação de crédito"]
  },
  {
    icon: "👨‍👩‍👧", title: "Direito de Família", desc: "Divórcio, guarda, pensão, inventário e planejamento sucessório.",
    services: ["Divórcio consensual ou litigioso","Guarda e alimentos","Inventário e partilha"]
  },
  {
    icon: "🏠", title: "Direito Imobiliário", desc: "Compra e venda, locações, regularização de imóveis e usucapião.",
    services: ["Regularização imobiliária","Usucapião extrajudicial","Contratos de locação"]
  },
  {
    icon: "⚖️", title: "Direito Civil", desc: "Contratos, indenizações, responsabilidade civil e direito do consumidor.",
    services: ["Indenizações","Direito do consumidor","Responsabilidade civil"]
  },
  {
    icon: "📊", title: "Direito Tributário", desc: "Planejamento tributário, defesas fiscais e revisão de tributos.",
    services: ["Planejamento tributário","Defesa fiscal","Revisão de tributos"]
  },
  {
    icon: "👷", title: "Direito Trabalhista", desc: "Defesa do trabalhador e da empresa em todas as instâncias.",
    services: ["Defesa trabalhista","Reclamações trabalhistas","Compliance trabalhista"]
  },
];

function AreaCard({ area }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.white, border: `1px solid ${hov ? T.gold : T.gray200}`,
        borderRadius: T.r12, padding: "24px",
        boxShadow: hov ? T.shadowMd : T.shadow,
        transform: hov ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.25s", cursor: "pointer"
      }}
    >
      {/* Icon */}
      <div style={{
        width: "48px", height: "48px",
        background: hov ? T.goldBg : T.gray100,
        borderRadius: T.r8, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", marginBottom: "16px", transition: "background 0.25s"
      }}>
        {area.icon}
      </div>
      <h3 style={{ fontFamily: fonts.display, fontSize: "16px", fontWeight: 700, color: T.gray900, marginBottom: "8px" }}>{area.title}</h3>
      <p style={{ fontSize: "14px", color: T.gray500, lineHeight: 1.55, marginBottom: "16px", fontFamily: fonts.body }}>{area.desc}</p>
      <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px", display: "flex", flexDirection: "column", gap: "5px" }}>
        {area.services.map(s => (
          <li key={s} style={{ fontSize: "13px", color: T.gray500, display: "flex", gap: "6px", alignItems: "flex-start", fontFamily: fonts.body }}>
            <span style={{ color: T.gold, fontWeight: 700 }}>·</span>{s}
          </li>
        ))}
      </ul>
      <a href={`#areas`} style={{
        fontSize: "13px", fontWeight: 700, color: T.gold,
        display: "inline-flex", alignItems: "center", gap: "4px", textDecoration: "none",
        transition: "gap 0.2s"
      }}
        onMouseEnter={e => e.currentTarget.style.gap = "8px"}
        onMouseLeave={e => e.currentTarget.style.gap = "4px"}
      >
        Conhecer atuação <span style={{ transition: "transform 0.2s", display: "inline-block" }}>→</span>
      </a>
    </div>
  );
}

function AreasSection() {
  return (
    <section id="areas" className="landing-section" style={{ background: T.white, padding: `${SECTION_PY} 0`, fontFamily: fonts.body }}>
      <Container>
        <SectionLabel text="Nossas Especialidades" />
        <h2 style={{ fontFamily: fonts.display, fontSize: "40px", fontWeight: 700, color: T.navy, textAlign: "center", marginBottom: "14px", letterSpacing: "-1px" }}>
          Áreas de atuação
        </h2>
        <p style={{ textAlign: "center", color: T.gray500, fontSize: "16px", maxWidth: "560px", margin: "0 auto 56px", lineHeight: 1.6 }}>
          Soluções jurídicas completas para pessoas físicas e jurídicas.
        </p>
        <div className="landing-areas-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {AREAS_DATA.map(a => <AreaCard key={a.title} area={a} />)}
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   6 · DASHBOARD SECTION  (cinza muito claro)
────────────────────────────────────────────────────────────────── */
function DashboardSection() {
  const features = [
    { icon: "📋", label: "Movimentações processuais" },
    { icon: "⏰", label: "Prazos e intimações" },
    { icon: "📁", label: "Documentos organizados" },
    { icon: "📅", label: "Agenda e audiências" },
    { icon: "💬", label: "Mensagens com a equipe" },
    { icon: "💰", label: "Financeiro e honorários" },
    { icon: "🔔", label: "Notificações em tempo real" },
  ];

  return (
    <section id="dashboard" className="landing-section" style={{ background: T.gray50, padding: `${SECTION_PY} 0`, fontFamily: fonts.body }}>
      <Container>
        <div className="landing-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "44% 56%", gap: "64px", alignItems: "center" }}>
          {/* Left */}
          <div>
            <SectionLabel text="Tecnologia a Favor do Seu Direito" />
            <h2 style={{ fontFamily: fonts.display, fontSize: "36px", fontWeight: 700, color: T.navy, lineHeight: 1.1, marginBottom: "16px", letterSpacing: "-0.8px" }}>
              Acompanhe seu processo<br />
              <span style={{ color: T.gold }}>de qualquer lugar</span>
            </h2>
            <p style={{ color: T.gray500, fontSize: "16px", lineHeight: 1.65, marginBottom: "28px" }}>
              Nossa plataforma exclusiva oferece transparência, agilidade e segurança para você acompanhar seus processos de onde estiver.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "36px" }}>
              {features.map(f => (
                <div key={f.label} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <div style={{ width: "32px", height: "32px", background: T.goldBg, borderRadius: T.r6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", flexShrink: 0 }}>{f.icon}</div>
                  <span style={{ fontSize: "14px", color: T.gray700, fontWeight: 500 }}>{f.label}</span>
                </div>
              ))}
            </div>
            <Link href="/portal/login" style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              background: T.navy, color: T.white, padding: "13px 24px", borderRadius: T.r8,
              fontWeight: 600, fontSize: "14px", textDecoration: "none", transition: "all 0.2s",
              boxShadow: T.shadowMd
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.navyLight; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = T.navy; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              📊 Ver demonstração da Área do Cliente
            </Link>
          </div>

          {/* Right: product preview */}
          <div className="landing-dashboard-preview" style={{ position: "relative" }}>
            {/* Notebook */}
            <div style={{ position: "relative", borderRadius: T.r12, overflow: "hidden", boxShadow: T.shadowLg, border: `1px solid ${T.gray200}` }}>
              <Image
                src="/02-dashboard-notebook-e-celular.webp"
                alt="Dashboard da Área do Cliente em notebook e celular"
                width={680} height={440}
                style={{ width: "100%", height: "auto", display: "block" }}
              />
            </div>
            {/* Floating notification badges */}
            {[
              { top: "12%", right: "-20px", icon: "🔔", text: "Novo andamento", sub: "Há 2 min" },
              { bottom: "25%", right: "-20px", icon: "📄", text: "Documento disponível", sub: "Hoje" },
              { bottom: "8%", left: "10%", icon: "📅", text: "Audiência em 3 dias", sub: "28/01/2025" },
            ].map((b, i) => (
              <div key={i} style={{
                position: "absolute", top: b.top, right: b.right, bottom: b.bottom, left: b.left,
                background: T.white, border: `1px solid ${T.gray200}`, borderRadius: T.r8,
                boxShadow: T.shadowMd, padding: "8px 12px",
                display: "flex", alignItems: "center", gap: "8px", minWidth: "180px"
              }}>
                <span style={{ fontSize: "16px" }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: T.gray900 }}>{b.text}</div>
                  <div style={{ fontSize: "11px", color: T.gray400 }}>{b.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   7 · STATS BAR  (escuro)
────────────────────────────────────────────────────────────────── */
function StatsBar() {
  const stats = [
    { icon: "🌐", value: "Mato Grosso", label: "Atendimento em todo o estado" },
    { icon: "💻", value: "Portal Exclusivo", label: "Área do Cliente digital" },
    { icon: "💬", value: "Comunicação", label: "Centralizada com a equipe" },
    { icon: "📁", value: "Documentos", label: "Organizados e seguros" },
    { icon: "🔒", value: "Sigilo", label: "Proteção total dos seus dados" },
  ];
  return (
    <div className="landing-stats-bar" style={{ background: T.navy, borderTop: `1px solid rgba(201,162,39,0.12)`, borderBottom: `1px solid rgba(201,162,39,0.12)`, fontFamily: fonts.body }}>
      <Container>
        <div className="landing-stats-grid" style={{ display: "flex" }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              flex: 1, display: "flex", alignItems: "center", gap: "12px",
              padding: "24px 16px",
              borderRight: i < stats.length - 1 ? `1px solid rgba(201,162,39,0.12)` : "none",
            }}>
              <span style={{ fontSize: "24px", opacity: 0.7 }}>{s.icon}</span>
              <div>
                <div style={{ fontFamily: fonts.display, fontSize: "15px", fontWeight: 700, color: T.gold, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#64748b", marginTop: "3px", lineHeight: 1.3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   8 · TESTIMONIALS  (branco)
────────────────────────────────────────────────────────────────── */
function Testimonials() {
  const reviews = [
    { text: "Consegui acompanhar os documentos e cada atualização do processo pela Área do Cliente. O atendimento foi claro e organizado.", name: "Juliana P.", area: "Direito de Família", city: "Cuiabá/MT", stars: 5 },
    { text: "Atendimento rápido, claro e objetivo. Resolveram meu caso empresarial com muito profissionalismo e agilidade.", name: "Ricardo M.", area: "Direito Empresarial", city: "Cuiabá/MT", stars: 5 },
    { text: "Total confiança no trabalho do escritório VM Advocacia. São referência em Cuiabá e em todo Mato Grosso.", name: "Carla S.", area: "Direito Civil", city: "Rondonópolis/MT", stars: 5 },
  ];
  return (
    <section className="landing-section" style={{ background: T.white, padding: `${SECTION_PY} 0`, fontFamily: fonts.body }}>
      <Container>
        <SectionLabel text="Clientes" />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "48px" }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "36px", fontWeight: 700, color: T.navy, textAlign: "center", marginBottom: "8px", letterSpacing: "-0.8px" }}>
            O que nossos clientes dizem
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: T.gold, fontSize: "18px" }}>★★★★★</span>
            <span style={{ fontWeight: 600, color: T.gray700, fontSize: "14px" }}>4.9 de 5 estrelas no Google</span>
          </div>
        </div>
        <div className="landing-testimonials-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "20px" }}>
          {reviews.map((r, i) => (
            <div key={i} style={{ background: T.gray50, border: `1px solid ${T.gray200}`, borderRadius: T.r12, padding: "24px", position: "relative", boxShadow: T.shadow }}>
              {/* Quote */}
              <div style={{ position: "absolute", top: "16px", left: "20px", fontSize: "48px", color: T.gold, lineHeight: 1, opacity: 0.2, fontFamily: "Georgia, serif", userSelect: "none" }}>&ldquo;</div>
              <p style={{ color: T.gray700, fontSize: "15px", lineHeight: 1.65, marginBottom: "20px", fontStyle: "italic", marginTop: "12px" }}>&ldquo;{r.text}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", borderTop: `1px solid ${T.gray200}`, paddingTop: "16px" }}>
                <div style={{ width: "40px", height: "40px", background: T.navy, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 700, color: T.gold, fontSize: "16px" }}>
                  {r.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", color: T.navy, fontFamily: fonts.display }}>{r.name}</div>
                  <div style={{ fontSize: "12px", color: T.gray400 }}>{r.area} · {r.city}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
                  <span style={{ color: T.gold, fontSize: "13px" }}>{"★".repeat(r.stars)}</span>
                  <span style={{ fontSize: "10px", color: "#22c55e", fontWeight: 600 }}>✓ Cliente</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   9 · LOCAL PRESENCE  (azul suave)
────────────────────────────────────────────────────────────────── */
const CITIES = [
  { name: "Cuiabá", img: "/09-cidade-cuiaba.webp", type: "Sede do Escritório", main: true, areas: "Empresarial · Família · Civil · Imobiliário" },
  { name: "Várzea Grande", img: "/10-cidade-varzea-grande.webp", type: "Atendimento Presencial", areas: "Cível · Família" },
  { name: "Rondonópolis", img: "/11-cidade-rondonopolis.webp", type: "Atendimento Presencial", areas: "Empresarial · Trabalhista" },
  { name: "Sinop", img: "/12-cidade-sinop.webp", type: "Atendimento Presencial", areas: "Imobiliário · Cível" },
  { name: "Sorriso", img: "/13-cidade-sorriso.webp", type: "Atendimento Presencial", areas: "Empresarial · Tributário" },
  { name: "Lucas do Rio Verde", img: "/14-cidade-lucas-do-rio-verde.webp", type: "Atendimento Presencial", areas: "Cível · Família" },
  { name: "Outras regiões MT", img: "/15-cidade-outras-regioes-mt.webp", type: "Atendimento Online", areas: "100% Digital" },
];

function LocalSection() {
  return (
    <section className="landing-section" style={{ background: T.navySubtle, padding: `${SECTION_PY} 0`, fontFamily: fonts.body }}>
      <Container>
        <SectionLabel text="Presença Regional" />
        <h2 style={{ fontFamily: fonts.display, fontSize: "36px", fontWeight: 700, color: T.navy, textAlign: "center", marginBottom: "10px", letterSpacing: "-0.8px" }}>
          Presença local, atuação regional
        </h2>
        <p style={{ textAlign: "center", color: T.gray500, fontSize: "15px", marginBottom: "48px" }}>
          Atendimento presencial em Cuiabá e região metropolitana e online para todo o estado.
        </p>
        <div className="landing-cities-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "12px", marginBottom: "32px" }}>
          {CITIES.map((c, i) => (
            <div key={i} style={{
              background: T.white, border: `1px solid ${c.main ? T.gold : T.gray200}`,
              borderRadius: T.r12, overflow: "hidden", boxShadow: T.shadow, transition: "transform 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
            >
              <div style={{ position: "relative", height: "80px" }}>
                <Image src={c.img} alt={`Advocacia em ${c.name}`} fill sizes="(max-width: 900px) 50vw, 180px" style={{ objectFit: "cover" }} />
                {c.main && <div style={{ position: "absolute", top: "6px", left: "6px", background: T.gold, color: T.navy, fontSize: "9px", fontWeight: 800, padding: "2px 6px", borderRadius: "4px" }}>SEDE</div>}
              </div>
              <div style={{ padding: "10px" }}>
                <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: "12px", color: T.navy, marginBottom: "2px" }}>{c.name}</div>
                <div style={{ fontSize: "10px", color: T.gray400, marginBottom: "3px" }}>{c.type}</div>
                <div style={{ fontSize: "10px", color: T.gold, fontWeight: 600 }}>{c.areas}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center" }}>
          <a href="#contato" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            border: `1.5px solid ${T.navy}`, color: T.navy, padding: "11px 24px", borderRadius: T.r8,
            fontWeight: 600, fontSize: "13px", textDecoration: "none", transition: "all 0.2s"
          }}
            onMouseEnter={e => { e.currentTarget.style.background = T.navy; e.currentTarget.style.color = T.white; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.navy; }}
          >
            📍 Ver todas as cidades atendidas
          </a>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   10 · BLOG + FAQ  (branco)
────────────────────────────────────────────────────────────────── */
const POSTS = [
  { img: "/06-blog-planejamento-sucessorio.webp", cat: "Direito de Família", date: "10 jul 2025", title: "Planejamento sucessório: como proteger seu patrimônio e sua família", excerpt: "Saiba como o planejamento sucessório pode evitar conflitos e garantir a segurança do seu patrimônio em Mato Grosso.", read: "5 min", href: "/blog/planejamento-sucessorio-cuiaba-evitar-conflitos" },
  { img: "/07-blog-revisao-contratos.webp", cat: "Direito Empresarial", date: "08 jul 2025", title: "Revisão de contratos evita prejuízos e garante segurança jurídica", excerpt: "Entenda por que revisar seus contratos regularmente é essencial para proteger seu negócio em todas as instâncias.", read: "4 min", href: "/blog/holding-familiar-agronegocio-mato-grosso" },
  { img: "/08-blog-direito-consumidor.webp", cat: "Direito Civil", date: "05 jul 2025", title: "Direito do consumidor: saiba seus direitos nas compras online", excerpt: "O crescimento do e-commerce trouxe novos direitos e responsabilidades. Conheça o que a lei garante para você.", read: "3 min", href: "/blog" },
];

const FAQS = [
  { q: "Como funciona a consulta jurídica online?", a: "Você preenche o formulário no site, nossa equipe entra em contato em até 30 minutos em horário comercial e agendamos uma conversa por videoconferência ou WhatsApp, com total sigilo." },
  { q: "Como acompanhar meu processo pela Área do Cliente?", a: "Após a contratação, você recebe acesso ao portal exclusivo onde visualiza andamentos, documentos, prazos, audiências e pode se comunicar diretamente com a equipe." },
  { q: "Quais documentos preciso enviar?", a: "Depende do caso. Geralmente RG, CPF, comprovante de residência e documentos relacionados ao caso. Nossa equipe orientará especificamente após a análise inicial." },
  { q: "O atendimento é realizado em todo Mato Grosso?", a: "Sim. Presencialmente em Cuiabá e principais cidades. Para demais localidades, atendimento 100% digital com a mesma qualidade e sigilo." },
  { q: "Como recebo notificações sobre prazos e audiências?", a: "Pela Área do Cliente você recebe alertas em tempo real via portal, e-mail e WhatsApp sempre que houver novidade relevante no seu processo." },
  { q: "Meus dados ficam protegidos?", a: "Sim. Seguimos rigorosamente a LGPD. Todos os dados são criptografados e nunca compartilhados com terceiros sem autorização expressa." },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.gray200}` }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: "100%", background: "none", border: "none", padding: "16px 0",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        cursor: "pointer", gap: "16px", textAlign: "left"
      }}>
        <span style={{ fontSize: "15px", fontWeight: 600, color: T.navy, fontFamily: fonts.body, lineHeight: 1.4 }}>{faq.q}</span>
        <span style={{ color: T.gold, fontSize: "20px", lineHeight: 1, transform: open ? "rotate(45deg)" : "none", transition: "transform 0.2s", flexShrink: 0 }}>+</span>
      </button>
      {open && <p style={{ fontSize: "14px", color: T.gray500, lineHeight: 1.65, padding: "0 0 16px", margin: 0, fontFamily: fonts.body }}>{faq.a}</p>}
    </div>
  );
}

function BlogFAQSection() {
  return (
    <section className="landing-section" style={{ background: T.white, padding: `${SECTION_PY} 0`, fontFamily: fonts.body }}>
      <Container>
        <div className="landing-content-grid" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: "64px" }}>
          {/* Blog */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: "26px", fontWeight: 700, color: T.navy, letterSpacing: "-0.5px" }}>Artigos Recentes</h2>
              <Link href="/blog" style={{ fontSize: "13px", fontWeight: 600, color: T.gold, textDecoration: "none" }}>Ver todos os artigos →</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {POSTS.map((p, i) => (
                <Link key={i} href={p.href} style={{ textDecoration: "none", display: "grid", gridTemplateColumns: "120px 1fr", gap: "16px", padding: "16px", border: `1px solid ${T.gray200}`, borderRadius: T.r12, transition: "all 0.2s", background: T.white }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.boxShadow = T.shadow; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.gray200; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <div style={{ position: "relative", borderRadius: T.r8, overflow: "hidden", height: "90px" }}>
                    <Image src={p.img} alt={p.title} fill sizes="120px" style={{ objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: T.gold, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "4px" }}>{p.cat} · {p.date} · {p.read} leitura</div>
                    <h3 style={{ fontFamily: fonts.display, fontSize: "14px", fontWeight: 700, color: T.navy, lineHeight: 1.35, marginBottom: "6px" }}>{p.title}</h3>
                    <p style={{ fontSize: "12px", color: T.gray500, lineHeight: 1.5, margin: 0 }}>{p.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div id="faq">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: fonts.display, fontSize: "26px", fontWeight: 700, color: T.navy, letterSpacing: "-0.5px" }}>Perguntas Frequentes</h2>
              <a href="#faq" style={{ fontSize: "13px", fontWeight: 600, color: T.gold, textDecoration: "none" }}>Ver todas →</a>
            </div>
            <div>
              {FAQS.map((f, i) => <FAQItem key={i} faq={f} />)}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   11 · CONTACT / CTA  (escuro)
────────────────────────────────────────────────────────────────── */
function ContactSection() {
  return (
    <section id="contato" className="landing-section" style={{ background: T.navy, padding: `${SECTION_PY} 0`, fontFamily: fonts.body }}>
      <Container>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "36px", fontWeight: 700, color: T.white, letterSpacing: "-0.8px" }}>
            Fale diretamente com nossa equipe
          </h2>
          <p style={{ color: "#64748b", fontSize: "16px", marginTop: "10px" }}>
            Estamos prontos para ouvir o seu caso e encontrar a melhor solução.
          </p>
        </div>

        <div className="landing-contact-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
          {/* Left: contact + hours */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {[
                { icon: "📱", label: "Atendimento Rápido", value: "Chamar no WhatsApp", href: "https://wa.me/556592918889", highlight: true },
                { icon: "📞", label: "Ligação Direta", value: "(65) 9291-8889", href: "tel:+556592918889" },
              ].map((c, i) => (
                <a key={i} href={c.href} target={i === 0 ? "_blank" : undefined} style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  background: c.highlight ? "rgba(201,162,39,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${c.highlight ? T.gold : "rgba(255,255,255,0.08)"}`,
                  borderRadius: T.r8, padding: "16px", textDecoration: "none", transition: "all 0.2s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(201,162,39,0.12)"; e.currentTarget.style.borderColor = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.background = c.highlight ? "rgba(201,162,39,0.08)" : "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = c.highlight ? T.gold : "rgba(255,255,255,0.08)"; }}
                >
                  <div style={{ width: "40px", height: "40px", background: T.goldBg, borderRadius: T.r6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>{c.icon}</div>
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>{c.label}</div>
                    <div style={{ fontSize: "14px", fontWeight: 700, color: T.white }}>{c.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: T.r8, padding: "20px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>⏰ Horário de Atendimento</div>
              {[
                { days: "Segunda a Sexta", hours: "08h às 18h" },
                { days: "Sábado", hours: "08h às 12h" },
                { days: "Atendimento Online", hours: "Para todo o estado" },
              ].map((h, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: i < 2 ? "8px" : 0 }}>
                  <span style={{ color: "#94a3b8" }}>{h.days}</span>
                  <span style={{ color: T.white, fontWeight: 600 }}>{h.hours}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: T.r8, padding: "20px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "14px" }}>📍 Endereço</div>
              <p style={{ color: "#94a3b8", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                <strong style={{ color: T.white }}>V|M Advocacia</strong><br />
                Av. Historiador Rubens de Mendonça, 1858<br />
                Sala 1007 · Bairro de Santa Rosa<br />
                Cuiabá/MT · CEP 78065-000
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: T.white, borderRadius: T.r12, padding: "32px", boxShadow: T.shadowLg }}>
            <LeadForm />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   12 · FOOTER  (mais escuro)
────────────────────────────────────────────────────────────────── */
function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ background: T.navyMid, borderTop: "1px solid rgba(255,255,255,0.05)", fontFamily: fonts.body }}>
      <Container style={{ padding: "56px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px repeat(4,1fr)", gap: "48px", marginBottom: "48px" }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "38px", height: "38px", background: T.gold, borderRadius: T.r6, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: fonts.display, fontWeight: 800, fontSize: "12px", color: T.navy }}>V|M</div>
              <div>
                <div style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: "15px", color: T.white }}>ADVOCACIA</div>
                <div style={{ fontSize: "9px", color: T.gold, letterSpacing: "1.5px" }}>CUIABÁ · MT</div>
              </div>
            </div>
            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.65, marginBottom: "20px" }}>
              Excelência jurídica com estratégia, ética e resultados comprovados.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              {["f","in","📸","▶"].map((s, i) => (
                <a key={i} href="#" style={{
                  width: "32px", height: "32px", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: T.r6, display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#64748b", fontSize: "12px", textDecoration: "none", transition: "all 0.2s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.color = T.gold; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = "#64748b"; }}
                >{s}</a>
              ))}
            </div>
          </div>

          {[
            { title: "Navegação", links: [{ l: "Início", h: "#" }, { l: "Áreas de Atuação", h: "#areas" }, { l: "Como Funciona", h: "#dashboard" }, { l: "Área do Cliente", h: "/portal/login" }, { l: "Conteúdos", h: "/blog" }, { l: "Sobre", h: "#sobre" }, { l: "FAQ", h: "#faq" }] },
            { title: "Áreas de Atuação", links: [{ l: "Direito Empresarial", h: "#areas" }, { l: "Direito de Família", h: "#areas" }, { l: "Direito Imobiliário", h: "#areas" }, { l: "Direito Civil", h: "#areas" }, { l: "Direito Tributário", h: "#areas" }, { l: "Direito Trabalhista", h: "#areas" }] },
            { title: "Contato", links: [{ l: "(65) 9291-8889", h: "tel:+556592918889" }, { l: "contato@vmadvocacia.com.br", h: "mailto:contato@vmadvocacia.com.br" }, { l: "Av. Rubens de Mendonça, 1858", h: "#contato" }, { l: "Sala 1007 · Santa Rosa", h: "#contato" }, { l: "Cuiabá/MT · 78065-000", h: "#contato" }] },
            { title: "Atendimento", links: [{ l: "Segunda a Sexta: 08h às 18h", h: "#" }, { l: "Sábado: 08h às 12h", h: "#" }, { l: "Atendimento Online: Todo MT", h: "#" }] },
          ].map((col, ci) => (
            <div key={ci}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: T.gold, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "18px" }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
                {col.links.map(l => (
                  <a key={l.l} href={l.h} style={{ fontSize: "13px", color: "#475569", textDecoration: "none", transition: "color 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#94a3b8"}
                    onMouseLeave={e => e.currentTarget.style.color = "#475569"}
                  >{l.l}</a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legal info */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "24px" }}>
          <p style={{ fontSize: "12px", color: "#1e293b", lineHeight: 1.6, marginBottom: "12px" }}>
            <strong style={{ color: "#334155" }}>V|M Advocacia</strong> · OAB/MT nº 000.000 · CNPJ 00.000.000/0001-00 · Inscrição na Seccional da OAB do Mato Grosso · Av. Historiador Rubens de Mendonça, 1858, Sala 1007, Cuiabá/MT, CEP 78065-000 · (65) 9291-8889 · contato@vmadvocacia.com.br<br />
            <span style={{ color: "#1e293b", marginTop: "6px", display: "block" }}>⚠ As informações deste site são de caráter exclusivamente informativo e não constituem serviço de advocacia. Para orientação jurídica específica, consulte um advogado.</span>
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#1e293b" }}>© {year} V|M Advocacia. Todos os direitos reservados.</span>
            <div style={{ display: "flex", gap: "16px" }}>
              {["Política de Privacidade", "Termos de Uso", "Cookies"].map(l => (
                <a key={l} href="#" style={{ fontSize: "12px", color: "#1e293b", textDecoration: "none", transition: "color 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.color = T.gold}
                  onMouseLeave={e => e.currentTarget.style.color = "#1e293b"}
                >{l}</a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}

/* ─────────────────────────────────────────────────────────────────
   13 · UNIFIED FLOAT: IA + WhatsApp
────────────────────────────────────────────────────────────────── */
function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0=greeting, 1=area, 2=action
  const [selectedArea, setSelectedArea] = useState("");

  const areas = ["Família","Empresarial","Imobiliário","Consumidor","Trabalhista","Outro assunto"];

  const reset = () => { setOpen(false); setStep(0); setSelectedArea(""); };

  return (
    <>
      {/* Floating button */}
      <button className="landing-ai-float-button" onClick={() => setOpen(o => !o)} style={{
        position: "fixed", bottom: "24px", right: "24px",
        background: open ? T.navyMid : T.navy, border: `2px solid ${T.gold}`,
        borderRadius: "12px", padding: "12px 16px", cursor: "pointer", zIndex: 9999,
        display: "flex", alignItems: "center", gap: "10px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)", transition: "all 0.2s",
        fontFamily: fonts.body
      }}
        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
      >
        <span style={{ fontSize: "22px" }}>🤖</span>
        <div className="landing-float-label" style={{ textAlign: "left" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: T.gold }}>Olá, sou a VM IA</div>
          <div style={{ fontSize: "11px", color: "#94a3b8" }}>Como posso ajudar você hoje?</div>
        </div>
        <span className="landing-float-caret" style={{ color: "#64748b", marginLeft: "4px", fontSize: "14px" }}>{open ? "✕" : "↑"}</span>
      </button>

      {/* WhatsApp secondary float */}
      {!open && (
        <a className="landing-whatsapp-float-button" href="https://wa.me/556592918889" target="_blank" rel="noreferrer" style={{
          position: "fixed", bottom: "24px", left: "24px",
          background: "#25D366", borderRadius: T.r8, padding: "12px 16px",
          display: "flex", alignItems: "center", gap: "8px",
          textDecoration: "none", boxShadow: "0 8px 28px rgba(37,211,102,0.35)",
          zIndex: 9999, transition: "transform 0.2s", fontFamily: fonts.body
        }}
          onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
        >
          <span style={{ fontSize: "20px" }}>💬</span>
          <div className="landing-float-label">
            <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>Fale agora</div>
            <div style={{ fontSize: "13px", fontWeight: 700, color: T.white }}>WhatsApp</div>
          </div>
        </a>
      )}

      {/* Chat window */}
      {open && (
        <div className="landing-chat-window" style={{
          position: "fixed", bottom: "96px", right: "24px",
          width: "320px", background: T.white, borderRadius: T.r12,
          boxShadow: T.shadowLg, border: `1px solid ${T.gray200}`,
          zIndex: 9999, overflow: "hidden", fontFamily: fonts.body
        }}>
          {/* Header */}
          <div style={{ background: T.navy, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", background: T.goldBg, border: `1.5px solid ${T.gold}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px" }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "14px", color: T.white }}>VM IA</div>
                <div style={{ fontSize: "11px", color: "#22c55e" }}>● Online agora</div>
              </div>
            </div>
            <button onClick={reset} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "18px", padding: "4px" }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: "20px" }}>
            {step === 0 && (
              <>
                <div style={{ background: T.gray50, border: `1px solid ${T.gray200}`, borderRadius: T.r8, padding: "12px 14px", fontSize: "13px", color: T.gray700, lineHeight: 1.5, marginBottom: "16px" }}>
                  Olá! Sou o assistente virtual do escritório V|M Advocacia. Posso ajudar a identificar a área jurídica do seu caso. Qual é o assunto?
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {areas.map(a => (
                    <button key={a} onClick={() => { setSelectedArea(a); setStep(1); }} style={{
                      background: T.white, border: `1px solid ${T.gray200}`, borderRadius: T.r6,
                      padding: "9px 10px", fontSize: "12px", fontWeight: 600, color: T.navy,
                      cursor: "pointer", transition: "all 0.18s", fontFamily: fonts.body
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = T.gold; e.currentTarget.style.background = T.goldBg; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = T.gray200; e.currentTarget.style.background = T.white; }}
                    >{a}</button>
                  ))}
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div style={{ background: T.gray50, border: `1px solid ${T.gray200}`, borderRadius: T.r8, padding: "12px 14px", fontSize: "13px", color: T.gray700, lineHeight: 1.5, marginBottom: "16px" }}>
                  Entendido! Para <strong style={{ color: T.gold }}>{selectedArea}</strong>, nossa equipe especializada está disponível. Como prefere dar o próximo passo?
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <a href={`https://wa.me/556592918889?text=Olá, preciso de ajuda com ${selectedArea}`} target="_blank" rel="noreferrer" style={{
                    background: "#25D366", color: T.white, padding: "11px", borderRadius: T.r8,
                    textAlign: "center", fontWeight: 700, fontSize: "13px", textDecoration: "none"
                  }}>💬 Falar pelo WhatsApp</a>
                  <a href="#form" onClick={() => { setOpen(false); }} style={{
                    background: T.gold, color: T.navy, padding: "11px", borderRadius: T.r8,
                    textAlign: "center", fontWeight: 700, fontSize: "13px", textDecoration: "none"
                  }}>📋 Preencher formulário</a>
                  <button onClick={() => setStep(0)} style={{ background: "none", border: "none", color: T.gray500, fontSize: "12px", cursor: "pointer", fontFamily: fonts.body }}>← Voltar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
────────────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div className="landing-page" style={{ fontFamily: fonts.body, margin: 0, padding: 0 }}>
      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context":"https://schema.org","@type":"LegalService","name":"V|M Advocacia",
        "description":"Escritório de advocacia especializado em Cuiabá e todo Mato Grosso.",
        "url":"https://vmadvocacia.com.br","telephone":"+55-65-9291-8889",
        "address":{"@type":"PostalAddress","streetAddress":"Av. Historiador Rubens de Mendonça, 1858, Sala 1007","addressLocality":"Cuiabá","addressRegion":"MT","postalCode":"78065-000","addressCountry":"BR"},
        "areaServed":"Mato Grosso","openingHours":["Mo-Fr 08:00-18:00","Sa 08:00-12:00"],
        "aggregateRating":{"@type":"AggregateRating","ratingValue":"4.9","reviewCount":"127"}
      })}} />

      {/* Sections — alternating light/dark */}
      <TopBar />                                         {/* dark */}
      <Navbar scrolled={scrolled} />                     {/* dark sticky */}
      <Hero />                                           {/* dark — hero */}
      <AreasSection />                                   {/* white */}
      <DashboardSection />                               {/* gray-50 */}
      <StatsBar />                                       {/* dark bar */}
      <Testimonials />                                   {/* white */}
      <LocalSection />                                   {/* blue subtle */}
      <BlogFAQSection />                                 {/* white */}
      <ContactSection />                                 {/* dark */}
      <Footer />                                         {/* darker */}
      <AIAssistant />
    </div>
  );
}
