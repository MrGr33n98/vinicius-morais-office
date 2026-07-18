"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "../../components/ui/primitives";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const EMPTY_PROFILE = {
  user_name: "",
  user_email: "",
  client_name: "",
  client_document_number: "",
  phone: "",
  secondary_phone: "",
  document_number: "",
  profession: "",
  preferred_contact_method: "whatsapp",
  address_zip_code: "",
  address_street: "",
  address_number: "",
  address_complement: "",
  address_neighborhood: "",
  address_city: "",
  address_state: "",
  email_notifications: true,
  whatsapp_notifications: true,
  sms_notifications: false,
  marketing_consent: false,
};

function normalizeProfile(profile = {}) {
  return Object.fromEntries(
    Object.entries(EMPTY_PROFILE).map(([key, fallback]) => [key, profile[key] ?? fallback])
  );
}

function formatPortalDateLabel(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("pt-BR");
}

function formatPortalTimeLabel(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function mapTimelineMovementToPortal(movement, index) {
  const title = movement.simplified_text || movement.nome || "Movimentação processual";
  const content = movement.simplified_text && movement.nome && movement.simplified_text !== movement.nome
    ? movement.nome
    : "Atualização importada automaticamente do tribunal.";

  return {
    id: movement.id || movement.source_movement_id || `timeline-${index}`,
    date: formatPortalDateLabel(movement.data_hora),
    time: formatPortalTimeLabel(movement.data_hora),
    type: movement.translated ? "DataJud traduzido" : "DataJud",
    title,
    content,
    icon: "•",
    raw_title: movement.nome || title,
    translated: Boolean(movement.translated),
  };
}

function mapHealthStatusLabel(status) {
  return {
    green: "Atualizado",
    yellow: "Atenção",
    red: "Sem atualização recente",
  }[status] || "Sem dados";
}

function mergeMatterInsights(matter, insight) {
  if (!matter || !insight) return matter;

  const mappedMovements = Array.isArray(insight.movements)
    ? insight.movements.map(mapTimelineMovementToPortal)
    : [];

  const nextMatter = { ...matter };

  if (mappedMovements.length > 0) {
    nextMatter.andamentos = mappedMovements;
    nextMatter.last_update_text = mappedMovements[0].title;
  }

  if (insight.health) {
    nextMatter.health = insight.health;
    nextMatter.stagnant = typeof insight.health.days_since === "number" ? insight.health.days_since > 120 : matter.stagnant;
  }

  if (insight.sync) {
    nextMatter.sync = insight.sync;
  }

  return nextMatter;
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Icon = {
  Dashboard: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Processos: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 2 L2 7 L12 12 L22 7 Z"/><path d="M2 17 L12 22 L22 17"/><path d="M2 12 L12 17 L22 12"/>
    </svg>
  ),
  Andamentos: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  ),
  Prazos: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Recursos: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="2" y="3" width="20" height="14" rx="0"/><line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  ),
  Audiencias: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  ),
  Documentos: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  ),
  Cronograma: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18" rx="0"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Financeiro: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  ),
  Agenda: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Mensagens: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  ),
  Atendimentos: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.66A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z"/>
    </svg>
  ),
  Notificacoes: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Perfil: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Logout: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Search: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Bell: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Eye: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  MoreVertical: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
    </svg>
  ),
  Plus: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Send: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  ),
  Paperclip: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/>
    </svg>
  ),
  TrendUp: () => (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="18"/><line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Filter: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Info: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  Shield: () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Scale: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="12" y1="3" x2="12" y2="21"/><path d="M3 7h18"/><path d="M3 7l4 8c0 2-2 4-4 4"/>
      <path d="M21 7l-4 8c0 2 2 4 4 4"/>
    </svg>
  ),
  Folder: () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  Check: () => (
    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    "Em Andamento":    ["badge badge-info", "Em Andamento"],
    "Concluído":       ["badge badge-success", "Concluído"],
    "Aguardando":      ["badge badge-warning", "Aguardando"],
    "Em Análise":      ["badge badge-warning", "Em Análise"],
    "EM ANÁLISE":      ["badge badge-warning", "Em Análise"],
    "DEFERIDA":        ["badge badge-success", "Deferida"],
    "Deferida":        ["badge badge-success", "Deferida"],
    "INDEFERIDA":      ["badge badge-danger", "Indeferida"],
    "PENDENTE":        ["badge badge-warning", "Pendente"],
    "Pendente":        ["badge badge-warning", "Pendente"],
    "Aceita":          ["badge badge-success", "Aceita"],
    "ACEITA":          ["badge badge-success", "Aceita"],
    "AGUARDANDO":      ["badge badge-warning", "Aguardando"],
    "Realizada":       ["badge badge-success", "Realizada"],
    "Compareceu":      ["badge badge-success", "Compareceu"],
    "Não Compareceu":  ["badge badge-danger", "Não Compareceu"],
    "Infrutífera":     ["badge badge-danger", "Infrutífera"],
    "Acordo Parcial":  ["badge badge-gold", "Acordo Parcial"],
    "paid":            ["badge badge-success", "Pago"],
    "pending":         ["badge badge-warning", "Pendente"],
    "overdue":         ["badge badge-danger", "Vencido"],
    "signed":          ["badge badge-success", "Assinado"],
    "under_review":    ["badge badge-warning", "Em Revisão"],
    "Fnd. Contrarrazões": ["badge badge-purple", "Fnd. Contrarrazões"],
    "CONFIRMADO":      ["badge badge-success", "Confirmado"],
    "PENDENTE":        ["badge badge-warning", "Pendente"],
    "Concluído":       ["badge badge-success", "Concluído"],
    "Em Atraso":       ["badge badge-danger", "Em Atraso"],
  };
  const [cls, label] = map[status] || ["badge badge-neutral", status];
  return <span className={cls}>{label}</span>;
}

function ProcessStatusBadge({ status }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "3px 10px", fontSize: "11px", fontWeight: 700,
      backgroundColor: "hsl(217 91% 93%)", color: "hsl(217 91% 35%)",
      border: "1px solid hsl(217 91% 80%)", textTransform: "uppercase", letterSpacing: "0.5px"
    }}>
      <span style={{ width: "6px", height: "6px", background: "hsl(217 91% 50%)", display: "inline-block" }}></span>
      {status}
    </span>
  );
}

function ProcessHealthPill({ health, loading = false }) {
  if (loading) {
    return (
      <span className="badge badge-neutral" aria-live="polite">
        Atualizando saúde...
      </span>
    );
  }

  if (!health?.status) return null;

  const toneClass = {
    green: "badge badge-success",
    yellow: "badge badge-warning",
    red: "badge badge-danger",
  }[health.status] || "badge badge-neutral";

  return (
    <span className={toneClass} title={health.last_movement_date ? `Última movimentação em ${formatPortalDateLabel(health.last_movement_date)}` : "Sem movimentações sincronizadas"}>
      {mapHealthStatusLabel(health.status)}
      {typeof health.days_since === "number" ? ` · ${health.days_since}d` : ""}
    </span>
  );
}

function ProcessSyncBadge({ sync, loading = false }) {
  if (loading) {
    return <span className="badge badge-neutral">Sincronizando…</span>;
  }

  if (!sync?.status) {
    return <span className="badge badge-neutral">Sem sincronização</span>;
  }

  const toneClass = {
    synced: "badge badge-success",
    success: "badge badge-success",
    failed: "badge badge-danger",
    not_found: "badge badge-danger",
    missing_api_key: "badge badge-warning",
    pending: "badge badge-warning",
    running: "badge badge-info",
  }[sync.status] || "badge badge-neutral";

  const label = {
    synced: "Sincronizado",
    success: "Sincronizado",
    failed: "Falha no sync",
    not_found: "Não encontrado",
    missing_api_key: "Chave ausente",
    pending: "Pendente",
    running: "Sincronizando",
  }[sync.status] || "Sincronização";

  return <span className={toneClass}>{label}</span>;
}

// ─── DONUT SVG CHART ──────────────────────────────────────────────────────────
function DonutChart({ segments, size = 100, strokeWidth = 18, centerLabel }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  const total = segments.reduce((s, seg) => s + seg.value, 0);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      {segments.map((seg, i) => {
        const pct = total > 0 ? seg.value / total : 0;
        const offset = total > 0
          ? segments.slice(0, i).reduce((sum, item) => sum + item.value / total, 0)
          : 0;
        const dash = pct * circumference;
        const gap = circumference - dash;
        return (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset * circumference}
            strokeLinecap="butt"
          />
        );
      })}
      {centerLabel && (
        <text
          x={cx} y={cy}
          textAnchor="middle" dominantBaseline="middle"
          style={{ transform: "rotate(90deg)", transformOrigin: `${cx}px ${cy}px`, fontSize: "11px", fontWeight: "700", fill: "#1e293b", fontFamily: "Outfit, sans-serif" }}
        >
          {centerLabel}
        </text>
      )}
    </svg>
  );
}

// ─── MINI LINE CHART ──────────────────────────────────────────────────────────
function MiniLineChart({ data, color = "hsl(43 74% 49%)", width = 100, height = 36 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ClientDashboardPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMatter, setSelectedMatter] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("visao_geral");
  const [chatMessage, setChatMessage] = useState("");
  const [activeConv, setActiveConv] = useState(0);
  const [activeDocFolder, setActiveDocFolder] = useState("Todas as Pastas");
  const [docFilter, setDocFilter] = useState("Todos");
  const [processSearch, setProcessSearch] = useState("");
  const [processStatusFilter, setProcessStatusFilter] = useState("all");
  const [processPhaseFilter, setProcessPhaseFilter] = useState("all");
  const [deadlineFilter, setDeadlineFilter] = useState("all");
  const [documentSearch, setDocumentSearch] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [scheduleZoom, setScheduleZoom] = useState("quarter");
  const [activeKanbanColumn, setActiveKanbanColumn] = useState("all");
  const [workflowFilters, setWorkflowFilters] = useState({
    process: "all",
    responsible: "all",
    priority: "all",
    period: "all",
    status: "all",
  });
  const [selectedWorkflowItem, setSelectedWorkflowItem] = useState(null);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const chatEndRef = useRef(null);

  const [clientData, setClientData] = useState(null);
  const [portalLoading, setPortalLoading] = useState(true);
  const [portalError, setPortalError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [profileForm, setProfileForm] = useState(EMPTY_PROFILE);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSavedAt, setProfileSavedAt] = useState("");
  const [matterInsights, setMatterInsights] = useState({});
  const [matterInsightsLoading, setMatterInsightsLoading] = useState(false);
  const [matterInsightsError, setMatterInsightsError] = useState("");
  const activeMatterId = selectedMatter?.id || clientData?.matters?.[0]?.id || null;


  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token) {
      router.push("/portal/login");
      return;
    }

    const loadPortal = async () => {
      try {
        setPortalLoading(true);
        setPortalError("");

        const response = await fetch(`${API_BASE_URL}/api/v1/portal`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json().catch(() => ({}));

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("user_token");
          localStorage.removeItem("user_role");
          router.push(`/portal/login?expired=1&returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
          return;
        }

        if (!response.ok) {
          throw new Error(data.error || "Não foi possível carregar os dados do portal.");
        }

        setClientData(data);
        setProfileForm(normalizeProfile(data.profile));
        setSelectedMatter(data.matters?.[0] || null);
        setActiveConv(0);
        setAuthorized(true);
      } catch (loadError) {
        setPortalError(loadError.message);
        setAuthorized(true);
      } finally {
        setPortalLoading(false);
      }
    };

    loadPortal();
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem("user_token");
    if (!token || !activeMatterId || !clientData) return;

    let cancelled = false;

    const loadMatterInsights = async () => {
      try {
        setMatterInsightsLoading(true);
        setMatterInsightsError("");

        const [timelineResponse, healthResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/v1/portal/matters/${activeMatterId}/timeline`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_URL}/api/v1/portal/matters/${activeMatterId}/health`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (timelineResponse.status === 401 || timelineResponse.status === 403 || healthResponse.status === 401 || healthResponse.status === 403) {
          handleLogout();
          return;
        }

        const timelineData = await timelineResponse.json().catch(() => ({}));
        const healthData = await healthResponse.json().catch(() => ({}));

        if (!timelineResponse.ok) {
          throw new Error(timelineData.error || "Não foi possível carregar o histórico real do processo.");
        }

        if (!healthResponse.ok) {
          throw new Error(healthData.error || "Não foi possível calcular a saúde do processo.");
        }

        if (cancelled) return;

        const syncPayload = timelineData.sync || healthData.sync || null;

        setMatterInsights((previous) => ({
          ...previous,
          [activeMatterId]: {
            movements: timelineData.movements || [],
            health: timelineData.health || healthData,
            sync: syncPayload,
          },
        }));

        setClientData((previous) => {
          if (!previous) return previous;

          return {
            ...previous,
            matters: previous.matters.map((item) => (
              item.id === activeMatterId
                ? mergeMatterInsights(item, { movements: timelineData.movements || [], health: timelineData.health || healthData, sync: syncPayload })
                : item
            )),
          };
        });
      } catch (error) {
        if (!cancelled) {
          setMatterInsightsError(error.message);
        }
      } finally {
        if (!cancelled) {
          setMatterInsightsLoading(false);
        }
      }
    };

    loadMatterInsights();

    return () => {
      cancelled = true;
    };
  }, [activeMatterId, clientData?.matters?.length, router]);

  const handleLogout = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("user_name");
    router.push("/portal/login");
  };

  const navigate = (tab, matter = null, subTab = "visao_geral") => {
    setActiveTab(tab);
    setSelectedMatter(matter);
    setActiveSubTab(subTab);
  };

  if (!authorized || portalLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(210 20% 98%)" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          <div style={{ width: "40px", height: "40px", background: "hsl(43 74% 49%)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif", fontWeight: 900, fontSize: "16px" }}>V|M</div>
          <p style={{ fontSize: "13px", color: "#64748b" }}>Carregando dados do portal...</p>
        </div>
      </div>
    );
  }

  if (portalError || !clientData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "hsl(210 20% 98%)", padding: "24px" }}>
        <div className="card" style={{ maxWidth: "460px", padding: "24px", textAlign: "center" }}>
          <div style={{ width: "44px", height: "44px", background: "hsl(43 74% 49%)", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: "Outfit, sans-serif", fontWeight: 900, marginBottom: "16px" }}>V|M</div>
          <h1 style={{ fontSize: "20px", marginBottom: "8px" }}>Não foi possível carregar o portal</h1>
          <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "16px" }}>{portalError || "Tente novamente em alguns instantes."}</p>
          <button className="btn btn-primary btn-sm" onClick={handleLogout}>Voltar ao login</button>
        </div>
      </div>
    );
  }

  const currentConv = clientData.conversations[activeConv] || clientData.conversations[0];
  const baseMatter = selectedMatter || clientData.matters[0] || null;
  const matter = mergeMatterInsights(baseMatter, baseMatter ? matterInsights[baseMatter.id] : null);
  const documentSearchTerm = documentSearch.trim().toLowerCase();
  const filteredDocs = (matter?.documents || []).filter(d =>
    activeDocFolder === "Todas as Pastas" || d.folder === activeDocFolder
  ).filter(d =>
    docFilter === "Todos" || d.type_label === docFilter
  ).filter(d =>
    !documentSearchTerm || [d.name, d.type_label, d.format, d.date].filter(Boolean).join(" ").toLowerCase().includes(documentSearchTerm)
  );
  const filteredDeadlines = clientData.recent_prazos.filter((deadline) => (
    deadlineFilter === "all" || String(deadline.type || "").toLowerCase().includes(deadlineFilter)
  ));
  const selectedDocument = filteredDocs.find((doc) => doc.id === selectedDocumentId) || filteredDocs[0] || null;
  const unreadMessages = clientData.conversations.reduce((total, conv) => total + (conv.unread || 0), 0);
  const totalMessages = clientData.conversations.reduce((total, conv) => total + (conv.messages?.length || 0), 0);
  const processSearchTerm = processSearch.trim().toLowerCase();
  const processStatuses = Array.from(new Set(clientData.matters.map((item) => item.status).filter(Boolean)));
  const processPhases = Array.from(new Set(clientData.matters.map((item) => item.current_phase).filter(Boolean)));
  const filteredMatters = clientData.matters.filter((item) => {
    const searchable = [
      item.title,
      item.court_number,
      item.court_name,
      item.current_phase,
      item.status,
      item.last_update_text,
    ].filter(Boolean).join(" ").toLowerCase();
    const matchesSearch = !processSearchTerm || searchable.includes(processSearchTerm);
    const matchesStatus = processStatusFilter === "all" || item.status === processStatusFilter;
    const matchesPhase = processPhaseFilter === "all" || item.current_phase === processPhaseFilter;
    return matchesSearch && matchesStatus && matchesPhase;
  });
  const hasProcessFilters = Boolean(processSearchTerm) || processStatusFilter !== "all" || processPhaseFilter !== "all";
  const resetProcessFilters = () => {
    setProcessSearch("");
    setProcessStatusFilter("all");
    setProcessPhaseFilter("all");
  };

  const handleSendMessage = async () => {
    const content = chatMessage.trim();
    if (!content || sendingMessage || !currentConv) return;

    const token = localStorage.getItem("user_token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError("");

      const response = await fetch(`${API_BASE_URL}/api/v1/portal_messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: {
            content,
            chat_room_id: currentConv.id || clientData.default_chat_room_id,
          },
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.error || "Não foi possível enviar a mensagem.");
      }

      setClientData((previous) => {
        const conversations = [...previous.conversations];
        const conversation = { ...conversations[activeConv] };
        conversation.messages = [...(conversation.messages || []), data];
        conversation.preview = data.text;
        conversation.time = data.time;
        conversations[activeConv] = conversation;
        return { ...previous, conversations };
      });
      setChatMessage("");
      window.requestAnimationFrame(() => chatEndRef.current?.scrollIntoView({ block: "end" }));
    } catch (sendError) {
      setMessageError(sendError.message);
    } finally {
      setSendingMessage(false);
    }
  };

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({ ...current, [field]: value }));
    setProfileError("");
    setProfileSavedAt("");
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("user_token");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      setProfileSaving(true);
      setProfileError("");
      setProfileSavedAt("");

      const response = await fetch(`${API_BASE_URL}/api/v1/portal_profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profile: profileForm }),
      });
      const data = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        handleLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(data.errors?.join(", ") || data.error || "Não foi possível salvar o perfil.");
      }

      const normalizedProfile = normalizeProfile(data);
      setProfileForm(normalizedProfile);
      setClientData((previous) => ({
        ...previous,
        name: normalizedProfile.client_name,
        cnpj: normalizedProfile.client_document_number,
        profile: normalizedProfile,
      }));
      localStorage.setItem("user_name", normalizedProfile.user_name);
      setProfileSavedAt("Perfil salvo com sucesso.");
    } catch (saveError) {
      setProfileError(saveError.message);
    } finally {
      setProfileSaving(false);
    }
  };

  const toDate = (value) => {
    if (!value || value === "A definir" || value === "Atual") return null;
    const match = String(value).match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;
    return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
  };

  const formatDate = (date) => {
    if (!date) return "A definir";
    return date.toLocaleDateString("pt-BR");
  };

  const addDays = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + days);
    return nextDate;
  };

  const phaseLabel = (phase) => phase.name || phase;

  const buildGanttPhases = () => {
    const baseNames = ["Petição Inicial", "Citação", "Contestação", "Instrução", "Sentença", "Recurso", "Execução"];
    const sourcePhases = matter?.timeline_phases || [];
    const currentIndex = Math.max(
      baseNames.findIndex((name) => sourcePhases.some((phase) => phaseLabel(phase) === name && phase.status === "active")),
      0
    );
    const today = new Date();
    const firstStart = addDays(today, -28 - currentIndex * 12);

    return baseNames.map((name, index) => {
      const source = sourcePhases.find((phase) => phaseLabel(phase) === name);
      const sourceDate = toDate(source?.date);
      const start = sourceDate || addDays(firstStart, index * 18);
      const duration = index === currentIndex ? 24 : index > currentIndex ? 22 : 14;
      const end = addDays(start, duration);
      const isPastDue = end < today && index >= currentIndex;
      const status = source?.status === "completed"
        ? "completed"
        : source?.status === "active"
          ? "in_progress"
          : isPastDue
            ? "delayed"
            : matter?.status === "Suspenso"
              ? "suspended"
              : "planned";
      const progress = status === "completed" ? 100 : status === "in_progress" ? 58 : status === "delayed" ? 35 : 0;

      return {
        id: `phase-${index}`,
        title: name,
        type: "Fase processual",
        process: matter?.court_number,
        process_title: matter?.title,
        status,
        start,
        end,
        progress,
        responsible: index <= currentIndex ? "Advogado" : "Equipe jurídica",
        dependency: index === 0 ? "Distribuição" : baseNames[index - 1],
        description: source?.label ? `${name} é a fase atual do processo.` : `${name} vinculada ao cronograma do processo.`,
        documents: matter?.documents?.slice(0, 3) || [],
        updates: matter?.andamentos?.slice(0, 3) || [],
        deadlines: matter?.prazos_recursos?.slice(0, 2) || [],
        nextAction: index === currentIndex ? "Acompanhar próxima movimentação" : "Aguardar avanço da fase anterior",
        priority: index === currentIndex ? "alta" : "normal",
        ownerType: index === currentIndex ? "Advogado" : "Judiciário",
      };
    });
  };

  const ganttPhases = matter ? buildGanttPhases() : [];
  const currentGanttPhase = ganttPhases.find((item) => item.status === "in_progress") || ganttPhases[0];
  const pendingClientTasks = ganttPhases.filter((item) => item.ownerType === "Cliente" && item.status !== "completed").length;
  const nextDeadline = matter?.prazos_recursos?.[0] || clientData.recent_prazos?.[0] || null;
  const processProgress = ganttPhases.length
    ? Math.round(ganttPhases.reduce((sum, item) => sum + item.progress, 0) / ganttPhases.length)
    : 0;

  const buildKanbanCards = () => {
    const cards = [];

    (matter?.prazos_recursos || []).forEach((deadline, index) => {
      const status = deadline.color === "danger" ? "aguardando_cliente" : "em_analise";
      cards.push({
        id: `deadline-${index}`,
        column: status,
        title: deadline.title,
        type: "Prazo",
        process: matter.court_number,
        dueDate: deadline.deadline,
        priority: deadline.color === "danger" ? "alta" : "media",
        responsible: deadline.color === "danger" ? "Cliente" : "Advogado",
        documents: matter.documents.slice(0, 2),
        lastUpdate: deadline.days,
        badges: [deadline.color === "danger" ? "Atrasado" : "Prazo próximo", deadline.color === "danger" ? "Cliente" : "Advogado"],
        nextAction: deadline.color === "danger" ? "Enviar documento" : "Acompanhar análise",
        history: matter.andamentos.slice(0, 3),
      });
    });

    (matter?.andamentos || []).slice(0, 4).forEach((update, index) => {
      cards.push({
        id: `update-${update.id}`,
        column: index === 0 ? "protocolado" : "concluido",
        title: update.title,
        type: update.type,
        process: matter.court_number,
        dueDate: update.date,
        priority: "normal",
        responsible: "Advogado",
        documents: matter.documents.slice(0, 2),
        lastUpdate: `${update.date} às ${update.time}`,
        badges: [index === 0 ? "Advogado" : "Concluído"],
        nextAction: index === 0 ? "Aguardar judiciário" : "Consultar histórico",
        history: [update],
      });
    });

    (matter?.audiencias || []).slice(0, 2).forEach((hearing) => {
      cards.push({
        id: `hearing-${hearing.id}`,
        column: "aguardando_judiciario",
        title: hearing.type,
        type: "Audiência",
        process: matter.court_number,
        dueDate: `${hearing.date} ${hearing.time}`,
        priority: hearing.status_color === "danger" ? "alta" : "media",
        responsible: "Judiciário",
        documents: matter.documents.slice(0, 2),
        lastUpdate: hearing.status,
        badges: ["Judiciário", hearing.status_color === "danger" ? "Prazo próximo" : "Aguardando"],
        nextAction: "Comparecer ou confirmar presença",
        history: matter.andamentos.slice(0, 2),
      });
    });

    if (!cards.some((card) => card.column === "a_fazer")) {
      cards.unshift({
        id: "task-documentos",
        column: "a_fazer",
        title: "Conferir documentos compartilhados",
        type: "Documento",
        process: matter?.court_number,
        dueDate: matter?.documents?.[0]?.date || "A definir",
        priority: "normal",
        responsible: "Cliente",
        documents: matter?.documents?.slice(0, 3) || [],
        lastUpdate: matter?.documents?.[0]?.date || "Sem atualização",
        badges: ["Cliente"],
        nextAction: "Enviar documento",
        history: matter?.andamentos?.slice(0, 2) || [],
      });
    }

    return cards;
  };

  const kanbanCards = matter ? buildKanbanCards() : [];
  const filteredKanbanCards = kanbanCards.filter((card) => {
    const due = toDate(card.dueDate);
    const periodDays = workflowFilters.period === "all" ? null : Number(workflowFilters.period);
    const matchStatus = workflowFilters.status === "all" || card.column === workflowFilters.status;
    const matchProcess = workflowFilters.process === "all" || card.process === workflowFilters.process;
    const matchResponsible = workflowFilters.responsible === "all" || card.responsible === workflowFilters.responsible;
    const matchPriority = workflowFilters.priority === "all" || card.priority === workflowFilters.priority;
    const matchPeriod = !periodDays || !due || due <= addDays(new Date(), periodDays);
    return matchStatus && matchProcess && matchResponsible && matchPriority && matchPeriod;
  });

  const openWorkflowPanel = (item) => {
    setSelectedWorkflowItem(item);
  };

  // ─── SIDEBAR ──────────────────────────────────────────────────────────────
  const sidebarGroups = [
    {
      label: null,
      items: [
        { key: "dashboard", label: "Dashboard", Icon: Icon.Dashboard, badge: null },
      ]
    },
    {
      label: "Meus Processos",
      items: [
        { key: "processos", label: "Processos", Icon: Icon.Processos, badge: null },
        { key: "andamentos", label: "Andamentos", Icon: Icon.Andamentos, badge: null },
        { key: "prazos", label: "Prazos e Intimações", Icon: Icon.Prazos, badge: clientData.recent_prazos.length || null },
        { key: "recursos", label: "Recursos e Petições", Icon: Icon.Recursos, badge: null },
        { key: "audiencias", label: "Audiências", Icon: Icon.Audiencias, badge: null },
        { key: "documentos", label: "Documentos", Icon: Icon.Documentos, badge: null },
        { key: "cronograma", label: "Cronograma", Icon: Icon.Cronograma, badge: null },
        { key: "financeiro_processo", label: "Financeiro", Icon: Icon.Financeiro, badge: null },
      ]
    },
    {
      label: "Gestão e Organização",
      items: [
        { key: "agenda", label: "Agenda", Icon: Icon.Agenda, badge: null },
        { key: "compromissos", label: "Compromissos", Icon: Icon.Cronograma, badge: null },
        { key: "tarefas", label: "Tarefas", Icon: Icon.Andamentos, badge: null },
      ]
    },
    {
      label: "Comunicação",
      items: [
        { key: "mensagens", label: "Mensagens", Icon: Icon.Mensagens, badge: 3 },
        { key: "atendimentos", label: "Atendimentos", Icon: Icon.Atendimentos, badge: null },
        { key: "notificacoes", label: "Notificações", Icon: Icon.Notificacoes, badge: null },
      ]
    },
    {
      label: "Configurações",
      items: [
        { key: "perfil", label: "Meu Perfil", Icon: Icon.Perfil, badge: null },
      ]
    },
  ];

  const isActive = (key) => {
    if (key === "dashboard") return activeTab === "dashboard" && !selectedMatter;
    if (key === "processos") return (activeTab === "processos" || selectedMatter) && activeSubTab === "visao_geral";
    if (key === "andamentos") return selectedMatter && activeSubTab === "andamentos";
    if (key === "prazos") return selectedMatter && activeSubTab === "prazos";
    if (key === "recursos") return selectedMatter && activeSubTab === "recursos";
    if (key === "audiencias") return selectedMatter && activeSubTab === "audiencias";
    if (key === "documentos") return selectedMatter && activeSubTab === "documentos";
    if (key === "cronograma") return selectedMatter && activeSubTab === "cronograma";
    if (key === "financeiro_processo") return selectedMatter && activeSubTab === "financeiro_processo";
    return activeTab === key;
  };

  const handleSidebarClick = (key) => {
    const mattersNavMap = ["andamentos", "prazos", "recursos", "audiencias", "documentos", "cronograma", "financeiro_processo"];
    const firstMatter = clientData.matters[0] || null;

    if (mattersNavMap.includes(key)) {
      setMobileMoreOpen(false);
      setSelectedMatter(firstMatter);
      setActiveSubTab(key);
      setActiveTab(firstMatter ? "processos" : "dashboard");
    } else if (key === "processos") {
      setMobileMoreOpen(false);
      setSelectedMatter(firstMatter);
      setActiveSubTab("visao_geral");
      setActiveTab(firstMatter ? "processos" : "dashboard");
    } else if (key === "dashboard") {
      setMobileMoreOpen(false);
      setSelectedMatter(null);
      setActiveTab("dashboard");
    } else {
      setMobileMoreOpen(false);
      setSelectedMatter(null);
      setActiveTab(key);
    }
  };

  // ─── TOPBAR BREADCRUMB ───────────────────────────────────────────────────
  const getBreadcrumb = () => {
    if (activeTab === "mensagens") return ["Dashboard", "Comunicação", "Mensagens"];
    if (activeTab === "dashboard") return ["Dashboard"];
    if (selectedMatter) {
      const sub = {
        visao_geral: "Visão Geral", andamentos: "Andamentos", cronograma: "Cronograma",
        quadro_processual: "Quadro Processual",
        prazos: "Prazos e Intimações", documentos: "Documentos", recursos: "Recursos e Petições",
        audiencias: "Audiências", financeiro_processo: "Financeiro",
      };
      return ["Dashboard", "Processos", matter.title.substring(0, 30) + "...", sub[activeSubTab] || ""];
    }
    return ["Dashboard", activeTab];
  };

  const currentBc = getBreadcrumb();
  const mobilePrimaryKeys = new Set(["dashboard", "processos", "prazos", "mensagens"]);
  const mobileMoreItems = sidebarGroups
    .flatMap((group) => group.items)
    .filter((item) => !mobilePrimaryKeys.has(item.key));

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER SECTIONS
  // ──────────────────────────────────────────────────────────────────────────

  const renderDashboard = () => (
    <div className="animate-fade-in portal-dashboard-layout" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header */}
      <div className="page-header portal-dashboard-greeting">
        <span className="portal-dashboard-eyebrow">Área do Cliente</span>
        <h1>Olá, {clientData.name?.split(" ")[0] || "cliente"}.</h1>
        <p>Acompanhe processos, prazos, documentos e mensagens em um só lugar.</p>
      </div>

      {/* Stat Cards */}
      <div className="stat-cards-grid portal-dashboard-stat-strip">
        {[
          { label: "Processos Ativos", value: clientData.stats.active_matters, icon: "⚖️", meta: "Abrir processos", positive: null, onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0]) },
          { label: "Audiências", value: clientData.stats.hearings_count, icon: "🏛", meta: "Ver agenda", positive: null, onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0], "audiencias") },
          { label: "Intimações", value: clientData.stats.notifications_count, icon: "📬", meta: "Ver prazos", positive: false, onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0], "prazos") },
          { label: "Recursos", value: clientData.stats.resources_count, icon: "📑", meta: "Ver recursos", positive: null, onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0], "recursos") },
          { label: "Honorários em Aberto", value: clientData.stats.open_billing, icon: "💰", meta: "Ver financeiro", positive: false, isCurrency: true, onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0], "financeiro_processo") },
        ].map((s, i) => (
          <button key={i} type="button" className="stat-card portal-stat-action portal-dashboard-stat-card" onClick={s.onClick}>
            <div className="stat-card-header portal-dashboard-stat-header">
              <span className="stat-card-label">{s.label}</span>
              <span className="stat-card-icon portal-dashboard-stat-icon">{s.icon}</span>
            </div>
            <div className="stat-card-value portal-dashboard-stat-value" style={{ fontSize: s.isCurrency ? "20px" : "28px" }}>{s.value}</div>
            {s.meta && (
              <div className={`stat-card-meta ${s.positive === true ? "positive" : s.positive === false ? "" : ""}`}>
                {s.positive && <span className="text-success">↑ </span>}
                {s.meta}
              </div>
            )}
          </button>
        ))}
      </div>

      {clientData.recent_prazos[0] && (
        <section className="card portal-next-action-card">
          <div>
            <span className="portal-dashboard-eyebrow">Próximo prazo</span>
            <h2>{clientData.recent_prazos[0].title}</h2>
            <p>{clientData.recent_prazos[0].desc}</p>
          </div>
          <div className="portal-next-action-meta">
            <strong style={{ color: clientData.recent_prazos[0].color }}>
              {clientData.recent_prazos[0].time}
            </strong>
            <span>{clientData.recent_prazos[0].date}</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => clientData.matters[0] && navigate("processos", clientData.matters[0], "prazos")}
          >
            Ver prazo
          </button>
        </section>
      )}

      <div className="portal-dashboard-priority-grid">
        {[
          {
            label: "Documento recente",
            title: clientData.recent_documents[0]?.title || "Nenhum documento novo",
            meta: clientData.recent_documents[0] ? `${clientData.recent_documents[0].date} · ${clientData.recent_documents[0].size}` : "Os próximos arquivos aparecerão aqui.",
            icon: "📄",
            cta: "Abrir documentos",
            onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0], "documentos"),
          },
          {
            label: "Mensagem",
            title: clientData.conversations[0]?.preview || "Nenhuma conversa recente",
            meta: unreadMessages > 0 ? `${unreadMessages} não lida${unreadMessages > 1 ? "s" : ""}` : "Sem mensagens pendentes",
            icon: "💬",
            cta: "Abrir mensagens",
            onClick: () => navigate("mensagens"),
          },
          {
            label: "Financeiro",
            title: clientData.stats.open_billing ? `Em aberto: ${clientData.stats.open_billing}` : "Sem pendência aberta",
            meta: "Honorários, faturas e comprovantes",
            icon: "💰",
            cta: "Ver financeiro",
            onClick: () => clientData.matters[0] && navigate("processos", clientData.matters[0], "financeiro_processo"),
          },
        ].map((item) => (
          <button key={item.label} type="button" className="portal-priority-card" onClick={item.onClick}>
            <span className="portal-priority-icon">{item.icon}</span>
            <span className="portal-dashboard-eyebrow">{item.label}</span>
            <strong>{item.title}</strong>
            <small>{item.meta}</small>
            <em>{item.cta} →</em>
          </button>
        ))}
      </div>

      <div className="portal-dashboard-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "16px" }}>
        {/* Processos em Andamento */}
        <div className="card portal-process-list-card">
          <div className="card-header portal-process-list-header">
            <div>
              <span className="card-title">Processos em Andamento</span>
              <p>Busque por nome, CNJ, fase, vara ou última atualização.</p>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetProcessFilters}>Limpar filtros</button>
          </div>
          <div className="portal-process-filters" aria-label="Filtros dos processos">
            <label>
              <span>Buscar</span>
              <input
                className="input-field"
                type="search"
                value={processSearch}
                onChange={(event) => setProcessSearch(event.target.value)}
                placeholder="Ex.: cobrança, CNJ ou fase"
              />
            </label>
            <label>
              <span>Status</span>
              <select className="input-field" value={processStatusFilter} onChange={(event) => setProcessStatusFilter(event.target.value)}>
                <option value="all">Todos</option>
                {processStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
            <label>
              <span>Fase</span>
              <select className="input-field" value={processPhaseFilter} onChange={(event) => setProcessPhaseFilter(event.target.value)}>
                <option value="all">Todas</option>
                {processPhases.map((phase) => <option key={phase} value={phase}>{phase}</option>)}
              </select>
            </label>
          </div>
          {hasProcessFilters && (
            <div className="portal-filter-chips" aria-live="polite">
              {processSearchTerm && <span>Busca: {processSearch}</span>}
              {processStatusFilter !== "all" && <span>Status: {processStatusFilter}</span>}
              {processPhaseFilter !== "all" && <span>Fase: {processPhaseFilter}</span>}
              <span>{filteredMatters.length} resultado{filteredMatters.length === 1 ? "" : "s"}</span>
            </div>
          )}
          {clientData.matters.length > 0 && filteredMatters.length === 0 && (
            <div className="portal-process-empty portal-process-filter-empty">
              <strong>Nenhum processo encontrado</strong>
              <span>Ajuste a busca ou remova os filtros para ver todos os processos vinculados.</span>
            </div>
          )}
          <table className="data-table">
            <thead>
              <tr>
                <th>Processo</th>
                <th>Número CNJ</th>
                <th>Fase Atual</th>
                <th>Status</th>
                <th>Última Atualização</th>
              </tr>
            </thead>
            <tbody>
              {filteredMatters.map(m => (
                <tr key={m.id} style={{ cursor: "pointer" }} onClick={() => navigate("processos", m)}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: "13px", maxWidth: "240px" }}>{m.title}</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{m.court_name}</div>
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: "12px" }}>{m.court_number}</td>
                  <td>
                    <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>{m.current_phase}</span>
                  </td>
                  <td><ProcessStatusBadge status={m.status} /></td>
                  <td style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>{m.last_update_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="portal-process-card-list">
            {clientData.matters.length === 0 ? (
              <div className="portal-process-empty">
                <strong>Nenhum processo vinculado</strong>
                <span>Quando houver processos ativos, eles aparecerão aqui.</span>
              </div>
            ) : filteredMatters.length === 0 ? (
              <div className="portal-process-empty">
                <strong>Nenhum processo encontrado</strong>
                <span>Ajuste a busca ou remova os filtros para ver todos os processos vinculados.</span>
              </div>
            ) : (
              filteredMatters.map((m) => (
                <button
                  className="portal-process-card"
                  key={m.id}
                  type="button"
                  onClick={() => navigate("processos", m)}
                >
                  <span className="portal-process-card-title">{m.title}</span>
                  <span className="portal-process-card-cnj">{m.court_number}</span>
                  <span className="portal-process-card-meta">{m.court_name}</span>
                  <span className="portal-process-card-row">
                    <span>{m.current_phase}</span>
                    <ProcessStatusBadge status={m.status} />
                  </span>
                  <span className="portal-process-card-update">{m.last_update_text}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Próximos Prazos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Próximos Prazos</span>
            <button className="btn btn-ghost btn-sm">Ver todos →</button>
          </div>
          <div style={{ padding: "16px" }}>
            <div className="timeline">
              {clientData.recent_prazos.map((p, i) => (
                <div key={p.id} className="timeline-item">
                  <div className="timeline-dot-wrapper">
                    <div className="timeline-dot" style={{ backgroundColor: p.color, borderColor: p.color, color: p.color }}></div>
                    {i < clientData.recent_prazos.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                    <div style={{ fontWeight: 700, fontSize: "13px" }}>{p.title}</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginTop: "2px" }}>{p.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 700, color: p.color }}>{p.time}</span>
                      <span style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{p.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="portal-dashboard-secondary-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Documentos Recentes */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Documentos Recentes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => clientData.matters[0] && navigate("processos", clientData.matters[0], "documentos")}>Ver todos →</button>
          </div>
          <div className="card-body" style={{ padding: "8px 16px" }}>
            {clientData.recent_documents.map(doc => (
              <div key={doc.id} className="file-item">
                <div className="file-icon file-icon-pdf">PDF</div>
                <div className="file-info">
                  <div className="file-name">{doc.title}</div>
                  <div className="file-meta">{doc.size} · {doc.date}</div>
                </div>
                <button className="btn btn-ghost btn-xs"><Icon.Download /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Mensagens Recentes */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Mensagens Recentes</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate("mensagens")}>Ver todas →</button>
          </div>
          <div style={{ padding: "0" }}>
            {clientData.conversations.slice(0, 4).map((c, i) => (
              <div key={c.id} className="chat-conv-item" onClick={() => { setActiveConv(i); navigate("mensagens"); }}>
                <div className="avatar" style={{ background: c.avatar_color, color: "#fff", fontSize: "12px", fontWeight: 700 }}>
                  {c.initials}
                  {c.status === "online" && <span style={{ position: "absolute", bottom: "1px", right: "1px", width: "8px", height: "8px", background: "#22c55e", border: "2px solid white" }}></span>}
                </div>
                <div className="chat-conv-info">
                  <div className="chat-conv-name">{c.name}</div>
                  <div className="chat-conv-preview">{c.preview}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                  <span className="chat-conv-time">{c.time}</span>
                  {c.unread > 0 && (
                    <span style={{ background: "hsl(var(--gold-primary))", color: "#0a0a0a", fontSize: "10px", fontWeight: 700, padding: "1px 6px", minWidth: "18px", textAlign: "center" }}>{c.unread}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPerfil = () => {
    const inputStyle = {
      width: "100%",
      border: "1px solid hsl(var(--border-color))",
      background: "#fff",
      padding: "11px 12px",
      fontSize: "13px",
      color: "hsl(var(--text-primary))",
      outline: "none",
    };
    const labelStyle = {
      display: "block",
      fontSize: "11px",
      fontWeight: 800,
      color: "hsl(var(--text-muted))",
      textTransform: "uppercase",
      letterSpacing: "0.6px",
      marginBottom: "6px",
    };
    const field = (name, label, props = {}) => (
      <label key={name}>
        <span style={labelStyle}>{label}</span>
        <input
          style={inputStyle}
          value={profileForm[name] || ""}
          onChange={(event) => updateProfileField(name, event.target.value)}
          {...props}
        />
      </label>
    );
    const checkbox = (name, label, description) => (
      <label key={name} style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        padding: "14px",
        border: "1px solid hsl(var(--border-color))",
        background: profileForm[name] ? "hsl(43 74% 97%)" : "#fff",
        cursor: "pointer",
      }}>
        <input
          type="checkbox"
          checked={Boolean(profileForm[name])}
          onChange={(event) => updateProfileField(name, event.target.checked)}
          style={{ marginTop: "3px" }}
        />
        <span>
          <strong style={{ display: "block", fontSize: "13px", color: "hsl(var(--text-primary))" }}>{label}</strong>
          <small style={{ display: "block", fontSize: "12px", color: "hsl(var(--text-muted))", marginTop: "3px", lineHeight: 1.5 }}>{description}</small>
        </span>
      </label>
    );

    return (
      <form onSubmit={handleProfileSubmit} className="animate-fade-in profile-form" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div className="page-header profile-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <h1>Meu Perfil</h1>
            <p>Gerencie seus dados cadastrais, contato e preferências do portal.</p>
          </div>
          <button className="btn btn-gold btn-sm" type="submit" disabled={profileSaving}>
            {profileSaving ? "Salvando..." : "Salvar perfil"}
          </button>
        </div>

        {(profileError || profileSavedAt) && (
          <div style={{
            border: `1px solid ${profileError ? "#fecaca" : "#bbf7d0"}`,
            background: profileError ? "#fef2f2" : "#f0fdf4",
            color: profileError ? "#991b1b" : "#166534",
            padding: "12px 14px",
            fontSize: "13px",
            fontWeight: 700,
          }}>
            {profileError || profileSavedAt}
          </div>
        )}

        <div className="profile-shell" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: "18px", alignItems: "start" }}>
          <aside className="card profile-summary-card" style={{ padding: "22px", position: "sticky", top: "96px" }}>
            <div style={{ width: "58px", height: "58px", background: "hsl(var(--gold-primary))", color: "#111827", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontFamily: "Outfit, sans-serif", marginBottom: "14px" }}>
              VM
            </div>
            <h2 style={{ fontSize: "18px", marginBottom: "4px" }}>{profileForm.user_name || clientData.name}</h2>
            <p style={{ fontSize: "12px", color: "hsl(var(--text-muted))", lineHeight: 1.5, marginBottom: "16px" }}>{profileForm.user_email}</p>
            <div style={{ borderTop: "1px solid hsl(var(--border-color))", paddingTop: "14px", display: "grid", gap: "10px" }}>
              {[
                ["Cliente", profileForm.client_name || "—"],
                ["Documento", profileForm.client_document_number || "—"],
                ["Contato preferencial", profileForm.preferred_contact_method],
              ].map(([label, value]) => (
                <div key={label}>
                  <div style={{ fontSize: "10px", color: "hsl(var(--text-muted))", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, marginTop: "2px" }}>{value}</div>
                </div>
              ))}
            </div>
            <div className="profile-security-list">
              {[
                ["Senha", "Protegida", "Alterações críticas exigem confirmação do usuário."],
                ["Sessão", "Ativa", "Use sair da conta em dispositivos compartilhados."],
                ["LGPD", "Preferências salvas", "Consentimentos podem ser revisados a qualquer momento."],
              ].map(([label, value, description]) => (
                <div className="profile-security-item" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                  <small>{description}</small>
                </div>
              ))}
            </div>
          </aside>

          <div className="profile-content" style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            <section className="card">
              <div className="card-header">
                <span className="card-title">Dados de Acesso</span>
                <span style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>Usados para login e identificação no portal</span>
              </div>
              <div className="card-body profile-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {field("user_name", "Nome do usuário", { required: true })}
                {field("user_email", "E-mail de acesso", { type: "email", required: true })}
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <span className="card-title">Dados Cadastrais</span>
              </div>
              <div className="card-body profile-card-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {field("client_name", "Nome / razão social", { required: true })}
                {field("client_document_number", "CPF / CNPJ do cliente", { required: true })}
                {field("document_number", "CPF do responsável")}
                {field("profession", "Profissão / cargo")}
                {field("phone", "WhatsApp principal", { type: "tel" })}
                {field("secondary_phone", "Telefone secundário", { type: "tel" })}
                <label>
                  <span style={labelStyle}>Contato preferencial</span>
                  <select
                    style={inputStyle}
                    value={profileForm.preferred_contact_method}
                    onChange={(event) => updateProfileField("preferred_contact_method", event.target.value)}
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">E-mail</option>
                    <option value="phone">Telefone</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <span className="card-title">Endereço</span>
              </div>
              <div className="card-body profile-address-grid" style={{ display: "grid", gridTemplateColumns: "1fr 2fr 120px", gap: "14px" }}>
                {field("address_zip_code", "CEP")}
                {field("address_street", "Logradouro")}
                {field("address_number", "Número")}
                {field("address_complement", "Complemento")}
                {field("address_neighborhood", "Bairro")}
                {field("address_city", "Cidade")}
                {field("address_state", "UF", { maxLength: 2 })}
              </div>
            </section>

            <section className="card">
              <div className="card-header">
                <span className="card-title">Preferências</span>
              </div>
              <div className="card-body profile-preference-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {checkbox("email_notifications", "Notificações por e-mail", "Receber publicações, documentos e avisos importantes.")}
                {checkbox("whatsapp_notifications", "Avisos por WhatsApp", "Permitir contato operacional pelo número principal.")}
                {checkbox("sms_notifications", "SMS de prazos críticos", "Receber alertas curtos sobre prazos e audiências.")}
                {checkbox("marketing_consent", "Conteúdos institucionais", "Receber artigos, novidades e comunicados do escritório.")}
              </div>
            </section>

            <section className="card profile-help-card">
              <div className="card-header">
                <span className="card-title">Segurança e Privacidade</span>
                <span style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>Ações sensíveis recebem validação adicional</span>
              </div>
              <div className="card-body profile-help-grid">
                {[
                  ["Alterar senha", "Solicite a atualização pelo atendimento para confirmar sua identidade com segurança."],
                  ["Canais de aviso", "Use as preferências acima para escolher onde deseja receber movimentações e prazos."],
                  ["Privacidade", "Dados cadastrais e documentos são tratados apenas para acompanhamento jurídico."],
                ].map(([title, description]) => (
                  <div className="profile-help-item" key={title}>
                    <strong>{title}</strong>
                    <span>{description}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </form>
    );
  };

  const renderPortalSupportState = () => {
    const labels = {
      compromissos: {
        title: "Compromissos",
        description: "Acompanhe compromissos operacionais ligados ao seu atendimento.",
        empty: "Nenhum compromisso pendente no momento.",
      },
      tarefas: {
        title: "Tarefas",
        description: "Veja pendências que precisam da sua ação ou ciência.",
        empty: "Você não possui tarefas abertas agora.",
      },
      atendimentos: {
        title: "Atendimentos",
        description: "Solicite suporte e acompanhe orientações do escritório.",
        empty: "Nenhum atendimento aberto.",
      },
      notificacoes: {
        title: "Notificações",
        description: "Centralize avisos de prazos, documentos e movimentações.",
        empty: "Sem notificações novas.",
      },
    };
    const current = labels[activeTab] || {
      title: activeTab.replace("_", " "),
      description: "Acompanhe informações importantes da sua área do cliente.",
      empty: "Nenhum registro encontrado.",
    };

    return (
      <div className="animate-fade-in portal-support-state">
        <div className="page-header">
          <h1>{current.title}</h1>
          <p>{current.description}</p>
        </div>

        <div className="portal-support-grid">
          <section className="card portal-support-card">
            <div className="card-header">
              <span className="card-title">Status atual</span>
            </div>
            <div className="card-body">
              <div className="empty-compact">
                <strong>{current.empty}</strong>
                <span>Quando houver atualização, ela aparecerá aqui e também nos atalhos do dashboard.</span>
              </div>
            </div>
          </section>

          <section className="card portal-support-card">
            <div className="card-header">
              <span className="card-title">Precisa de ajuda?</span>
            </div>
            <div className="card-body portal-support-actions">
              <button className="btn btn-gold btn-sm" type="button" onClick={() => navigate("mensagens")}>
                Falar com a equipe
              </button>
              <button className="btn btn-secondary btn-sm" type="button" onClick={() => navigate("perfil")}>
                Revisar preferências
              </button>
            </div>
          </section>
        </div>

        <section className="card portal-support-faq">
          <div className="card-header">
            <span className="card-title">Perguntas frequentes</span>
          </div>
          <div className="card-body">
            {[
              ["Como recebo avisos importantes?", "Você pode escolher e-mail, WhatsApp ou SMS crítico em Meu Perfil."],
              ["Como envio documentos?", "Acesse o processo, entre em Documentos e use o envio orientado quando houver pendência."],
              ["Quando devo mandar mensagem?", "Use Mensagens para dúvidas do processo, confirmação de documentos e orientações do atendimento."],
            ].map(([question, answer]) => (
              <details key={question}>
                <summary>{question}</summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    );
  };

  // ─── COMUNICAÇÃO ──────────────────────────────────────────────────────────
  const renderMensagens = () => {
    const conv = currentConv;
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Header */}
        <div className="communication-header" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: 900 }}>Central de Comunicação</h1>
            <p style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>Acompanhe todas as mensagens e interações com sua equipe jurídica.</p>
          </div>
          <div className="communication-stats" style={{ display: "flex", gap: "12px" }}>
            {[
              { label: "Não lidas", value: unreadMessages, color: "#6366f1", bg: "#eef2ff" },
              { label: "Conversas", value: clientData.conversations.length, color: "#f59e0b", bg: "#fffbeb" },
              { label: "Mensagens", value: totalMessages, color: "#10b981", bg: "#f0fdf4" },
            ].map((s, i) => (
              <div key={i} style={{ border: `1px solid ${s.color}30`, background: s.bg, padding: "10px 16px", minWidth: "90px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: s.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{s.label}</div>
                <div style={{ fontSize: "22px", fontWeight: 900, color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sub tabs */}
        <div className="sub-tabs">
          {["Mensagens", "Atendimentos", "Notificações", "Avisos da Equipe", "Envios Realizados"].map(t => (
            <div key={t} className={`sub-tab ${t === "Mensagens" ? "active" : ""}`}>{t}</div>
          ))}
        </div>

        <div className="communication-notice">
          <strong>Canal protegido por sigilo profissional</strong>
          <span>Use este espaço para dúvidas do processo, envio de documentos e acompanhamento. Em situações urgentes, fale também pelo atendimento do escritório.</span>
        </div>

        {/* Chat Layout */}
        <div className="chat-layout">
          {/* Sidebar Conversas */}
          <div className="chat-sidebar">
            <div className="chat-sidebar-header">
              <div className="chat-sidebar-title">
                <span>Caixa de Entrada</span>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button className="btn btn-ghost btn-xs" style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--gold-primary))" }}>Mais recentes</button>
                  <button className="btn btn-ghost btn-xs"><Icon.Filter /></button>
                </div>
              </div>
              <div className="topbar-search" style={{ width: "100%" }}>
                <Icon.Search />
                <input placeholder="Buscar mensagens..." />
              </div>
            </div>
            <div className="chat-conversations">
              {clientData.conversations.map((c, i) => (
                <div key={c.id} className={`chat-conv-item ${i === activeConv ? "active" : ""}`} onClick={() => setActiveConv(i)}>
                  <div className="avatar" style={{ background: c.avatar_color, color: "#fff", fontSize: "12px", fontWeight: 700, position: "relative" }}>
                    {c.initials}
                    {c.status === "online" && <span style={{ position: "absolute", bottom: "1px", right: "1px", width: "8px", height: "8px", background: "#22c55e", border: "2px solid white" }}></span>}
                  </div>
                  <div className="chat-conv-info">
                    <div className="chat-conv-name">{c.name}</div>
                    <div className="chat-conv-preview">{c.preview}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                    <span className="chat-conv-time">{c.time}</span>
                    {c.unread > 0 && (
                      <span style={{ background: "hsl(var(--gold-primary))", color: "#0a0a0a", fontSize: "10px", fontWeight: 700, padding: "1px 6px", minWidth: "18px", textAlign: "center" }}>{c.unread}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "12px 16px", borderTop: "1px solid hsl(var(--border-color))" }}>
              <button className="btn btn-secondary btn-sm w-full" style={{ width: "100%", justifyContent: "center", fontSize: "12px" }}>
                Ver todas as conversas <Icon.ChevronRight />
              </button>
            </div>
          </div>

          {/* Chat Principal */}
          <div className="chat-main">
            {/* Header */}
            <div className="chat-main-header">
              <div className="avatar" style={{ background: conv.avatar_color, color: "#fff", fontSize: "13px", fontWeight: 700 }}>{conv.initials}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: "14px" }}>{conv.name}</div>
                <div style={{ fontSize: "11px", color: conv.status === "online" ? "hsl(var(--color-success))" : "hsl(var(--text-muted))" }}>
                  {conv.status === "online" ? "● Online" : conv.oab || "Offline"}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button className="topbar-icon-btn" title="Ligar"><span>📞</span></button>
                <button className="topbar-icon-btn" title="Vídeo"><span>📹</span></button>
                <button className="topbar-icon-btn"><Icon.MoreVertical /></button>
              </div>
            </div>

            {/* Pinned Message */}
            {conv.pinned_message && (
              <div style={{ background: "hsl(43 74% 97%)", border: "1px solid hsl(var(--gold-primary))", borderLeft: "3px solid hsl(var(--gold-primary))", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "hsl(var(--gold-primary))", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mensagem fixada</div>
                  <div style={{ fontSize: "13px", color: "hsl(var(--text-primary))" }}>{conv.pinned_message}</div>
                </div>
                <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))", fontWeight: 700 }}>Ver detalhes</button>
              </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
              {/* Date separator */}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "8px 0" }}>
                <div style={{ flex: 1, height: "1px", background: "hsl(var(--border-color))" }}></div>
                <span style={{ fontSize: "11px", color: "hsl(var(--text-muted))", fontWeight: 600 }}>Hoje</span>
                <div style={{ flex: 1, height: "1px", background: "hsl(var(--border-color))" }}></div>
              </div>

              {conv.messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.mine ? "mine" : ""}`}>
                  {!msg.mine && (
                    <div className="avatar" style={{ background: conv.avatar_color, color: "#fff", fontSize: "11px", fontWeight: 700 }}>{conv.initials}</div>
                  )}
                  <div>
                    <div className={`chat-bubble ${msg.mine ? "mine" : ""}`}>
                      <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                      {msg.attachment && (
                        <div style={{ marginTop: "10px", background: msg.mine ? "rgba(255,255,255,0.1)" : "hsl(var(--bg-muted))", border: `1px solid ${msg.mine ? "rgba(255,255,255,0.2)" : "hsl(var(--border-color))"}`, padding: "8px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ color: "#ef4444", fontSize: "12px", fontWeight: 700 }}>PDF</span>
                          <div>
                            <div style={{ fontSize: "12px", fontWeight: 600 }}>{msg.attachment.name}</div>
                            <div style={{ fontSize: "10px", opacity: 0.7 }}>PDF · {msg.attachment.size}</div>
                          </div>
                          <div style={{ display: "flex", gap: "6px", marginLeft: "auto" }}>
                            <button style={{ opacity: 0.8, cursor: "pointer", background: "none", border: "none" }}><Icon.Download /></button>
                            <button style={{ opacity: 0.8, cursor: "pointer", background: "none", border: "none" }}><Icon.Eye /></button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="chat-msg-time" style={{ textAlign: msg.mine ? "left" : "right" }}>{msg.time} {msg.mine && "✓✓"}</span>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef}></div>
            </div>

            {/* Input Area */}
            <div className="chat-input-area">
              <div className="chat-input-tabs">
                <div className="chat-input-tab active">Mensagem</div>
                <div className="chat-input-tab">Anexar documento</div>
              </div>
              <div className="chat-input-row">
                <button className="btn btn-ghost btn-xs"><Icon.Paperclip /></button>
                <button className="btn btn-ghost btn-xs">😊</button>
                <textarea
                  rows={1}
                  placeholder="Digite sua mensagem..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <button
                  className="btn btn-gold btn-sm"
                  style={{ borderRadius: "0 !important" }}
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !chatMessage.trim()}
                >
                  <Icon.Send />
                </button>
              </div>
              {messageError && (
                <div style={{ color: "#b91c1c", fontSize: "12px", marginTop: "8px" }}>{messageError}</div>
              )}
              <div className="chat-input-helper">
                Não envie senhas, dados bancários completos ou informações sensíveis sem solicitação da equipe.
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="chat-detail-panel">
            {/* Detalhes da Conversa */}
            <div className="chat-detail-section">
              <div className="chat-detail-section-title">
                Detalhes da Conversa
                <button className="btn btn-ghost btn-xs"><Icon.Info /></button>
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
                <div className="avatar" style={{ background: conv.avatar_color, color: "#fff", fontSize: "13px", fontWeight: 700, width: "40px", height: "40px" }}>{conv.initials}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "13px" }}>{conv.name}</div>
                  <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{conv.oab}</div>
                </div>
              </div>
              {[
                { label: "Início da conversa", value: conv.conv_start, icon: "🕐" },
                { label: "Processo relacionado", value: conv.process, icon: "⚖️" },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "14px", marginTop: "1px" }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: "10px", color: "hsl(var(--text-muted))", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{f.label}</div>
                    <div style={{ fontSize: "12px", fontWeight: 600, fontFamily: f.label.includes("Processo") ? "monospace" : "inherit" }}>{f.value}</div>
                  </div>
                </div>
              ))}
              {conv.process && (
                <button className="btn btn-secondary btn-xs" style={{ marginTop: "8px", fontSize: "11px" }}>
                  Ver detalhes do processo →
                </button>
              )}
            </div>

            {/* Ações Rápidas */}
            <div className="chat-detail-section">
              <div className="chat-detail-section-title">Ações Rápidas</div>
              <div className="quick-actions">
                {["📤 Enviar Documento", "📅 Agendar Reunião", "🔄 Solicitar Atualização", "💬 Nova Mensagem"].map(a => (
                  <button key={a} className="quick-action-btn">{a}</button>
                ))}
              </div>
            </div>

            {/* Arquivos Compartilhados */}
            {conv.shared_files.length > 0 && (
              <div className="chat-detail-section">
                <div className="chat-detail-section-title">
                  Arquivos Compartilhados
                  <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))", fontWeight: 700, fontSize: "11px" }}>Ver todos</button>
                </div>
                {conv.shared_files.map((f, i) => (
                  <div key={i} className="file-item">
                    <div className="file-icon file-icon-pdf">PDF</div>
                    <div className="file-info">
                      <div className="file-name">{f.name}</div>
                      <div className="file-meta">{f.date} · PDF · {f.size}</div>
                    </div>
                    <button className="btn btn-ghost btn-xs"><Icon.Download /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Segurança */}
            <div className="chat-detail-section" style={{ background: "hsl(142 71% 97%)", border: "1px solid hsl(142 71% 85%)" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ color: "hsl(var(--color-success))", marginTop: "2px" }}><Icon.Shield /></span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "12px", color: "hsl(142 71% 30%)" }}>Privacidade e Segurança</div>
                  <div style={{ fontSize: "11px", color: "hsl(142 71% 35%)", marginTop: "3px" }}>Suas conversas são protegidas com criptografia de ponta a ponta e sigilo profissional.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── PROCESSO DETAIL ─────────────────────────────────────────────────────
  const renderProcessoDetail = () => {
    if (!matter) {
      return (
        <div className="animate-fade-in">
          <div className="page-header">
            <h1>Processos</h1>
            <p>Nenhum processo foi vinculado ao seu portal até o momento.</p>
          </div>
        </div>
      );
    }

    const subTabs = [
      { key: "visao_geral", label: "Visão Geral", icon: "📊" },
      { key: "andamentos", label: "Andamentos", icon: "📋" },
      { key: "cronograma", label: "Cronograma", icon: "📅" },
      { key: "quadro_processual", label: "Quadro Processual", icon: "▦" },
      { key: "prazos", label: "Prazos e Intimações", icon: "⏰", badge: matter.prazos_recursos.length || null },
      { key: "documentos", label: "Documentos", icon: "📁" },
      { key: "recursos", label: "Recursos e Petições", icon: "📑" },
      { key: "audiencias", label: "Audiências", icon: "🏛" },
      { key: "financeiro_processo", label: "Financeiro", icon: "💰" },
    ];

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {/* Process Header */}
        <div style={{ marginBottom: "16px" }}>
          <div className="process-header-grid">
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 900, marginBottom: "6px" }}>{matter.title}</h1>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "13px", color: "hsl(var(--text-muted))", fontFamily: "monospace" }}>Proc. {matter.court_number}</span>
                <span style={{ color: "hsl(var(--border-color))" }}>•</span>
                <span style={{ fontSize: "13px", color: "hsl(var(--text-muted))" }}>{matter.action_class} - {matter.main_subject}</span>
                <ProcessStatusBadge status={matter.status} />
                <ProcessHealthPill health={matter.health} loading={matterInsightsLoading} />
                <ProcessSyncBadge sync={matter.sync} loading={matterInsightsLoading} />
              </div>
            </div>
            <div className="workflow-view-switch" aria-label="Alterar visualização do processo">
              {[
                ["visao_geral", "Visão Geral"],
                ["cronograma", "Gantt"],
                ["quadro_processual", "Kanban"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={activeSubTab === key ? "active" : ""}
                  onClick={() => setActiveSubTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sub Tabs */}
        <div className="sub-tabs" style={{ marginBottom: "20px" }}>
          {subTabs.map(t => (
            <div key={t.key} className={`sub-tab ${activeSubTab === t.key ? "active" : ""}`} onClick={() => setActiveSubTab(t.key)}>
              <span>{t.icon}</span>
              {t.label}
              {t.badge && <span className="tab-badge">{t.badge}</span>}
            </div>
          ))}
        </div>

        {/* Sub Tab Content */}
        {activeSubTab === "visao_geral" && renderVisaoGeral()}
        {activeSubTab === "andamentos" && renderAndamentos()}
        {activeSubTab === "cronograma" && renderCronograma()}
        {activeSubTab === "quadro_processual" && renderQuadroProcessual()}
        {activeSubTab === "prazos" && renderPrazos()}
        {activeSubTab === "documentos" && renderDocumentos()}
        {activeSubTab === "recursos" && renderRecursos()}
        {activeSubTab === "audiencias" && renderAudiencias()}
        {activeSubTab === "financeiro_processo" && renderFinanceiro()}
      </div>
    );
  };

  const renderVisaoGeral = () => (
    <div className="portal-process-overview">
      <section className="portal-process-next-panel">
        <div>
          <span className="portal-dashboard-eyebrow">Próxima ação prioritária</span>
          <h2>{nextDeadline?.title || "Acompanhar próxima movimentação"}</h2>
          <p>{nextDeadline?.desc || "Nossa equipe acompanha o andamento do processo e avisará quando houver uma nova pendência."}</p>
          {matter.sync?.last_synced_at ? (
            <small style={{ display: "block", marginTop: "8px", color: "hsl(var(--text-muted))" }}>
              Dados do tribunal atualizados em {formatPortalDateLabel(matter.sync.last_synced_at)} às {formatPortalTimeLabel(matter.sync.last_synced_at)}.
            </small>
          ) : null}
          {matter.sync?.last_error_message ? (
            <small style={{ display: "block", marginTop: "8px", color: "#b91c1c" }}>
              Última falha de sincronização: {matter.sync.last_error_message}
            </small>
          ) : null}
        </div>
        <div className="portal-process-next-meta">
          <strong>{nextDeadline?.time || nextDeadline?.days || "Sem urgência"}</strong>
          <span>{nextDeadline?.deadline || nextDeadline?.date || "Data a definir"}</span>
        </div>
        <div className="portal-process-quick-actions" aria-label="Ações rápidas do processo">
          <button type="button" className="btn btn-gold btn-sm" onClick={() => setActiveSubTab("prazos")}>Ver prazo</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setActiveSubTab("documentos")}>Documentos</button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => navigate("mensagens")}>Falar com advogado</button>
        </div>
      </section>

      <section className="portal-process-summary-strip">
        {[
          { label: "Fase atual", value: currentGanttPhase?.title || matter.current_phase || "A definir", meta: `${processProgress}% de progresso estimado` },
          { label: "Último andamento", value: matter.andamentos[0]?.title || "Sem atualização", meta: matter.andamentos[0] ? `${matter.andamentos[0].date} às ${matter.andamentos[0].time}` : "Será exibido quando publicado" },
          { label: "Saúde", value: mapHealthStatusLabel(matter.health?.status), meta: typeof matter.health?.days_since === "number" ? `${matter.health.days_since} dias desde a última movimentação` : "Aguardando sincronização" },
          { label: "Origem", value: matter.sync?.source_label || "Equipe jurídica", meta: matter.sync?.process_data_id ? `ID tribunal ${matter.sync.process_data_id}` : "Sem vínculo público" },
          { label: "Documentos", value: matter.documents.length, meta: "Arquivos disponíveis" },
          { label: "Audiências", value: matter.audiencias.length, meta: "Agenda vinculada" },
        ].map((item) => (
          <button key={item.label} type="button" className="portal-process-summary-card" onClick={() => {
            if (item.label === "Documentos") setActiveSubTab("documentos");
            if (item.label === "Audiências") setActiveSubTab("audiencias");
            if (item.label === "Último andamento") setActiveSubTab("andamentos");
            if (item.label === "Fase atual") setActiveSubTab("cronograma");
          }}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.meta}</small>
          </button>
        ))}
      </section>

      <div className="portal-process-overview-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Dados do Processo */}
        <div className="card">
          <div className="card-header"><span className="card-title">Dados do Processo</span></div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {[
                { label: "Número CNJ", value: matter.court_number },
                { label: "Órgão Julgador", value: matter.court_name },
                { label: "Classe Processual", value: matter.action_class },
                { label: "Assunto Principal", value: matter.main_subject },
                { label: "Valor da Causa", value: `R$ ${matter.value_of_cause}` },
                { label: "Distribuição", value: matter.timeline_phases[0]?.date || "—" },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontSize: "10px", fontWeight: 700, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>{f.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{f.value}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid hsl(var(--border-color))", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>Parte Autora</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{clientData.name} <span className="badge badge-success" style={{ fontSize: "9px" }}>{matter.client_role}</span></div>
              </div>
              <div>
                <div style={{ fontSize: "10px", fontWeight: 700, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "3px" }}>Parte Ré</div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{matter.other_party_name} <span className="badge badge-danger" style={{ fontSize: "9px" }}>{matter.other_party_role}</span></div>
                <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{matter.other_party_cnpj}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Últimos Andamentos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Últimos Andamentos</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setActiveSubTab("andamentos")}>Ver todos →</button>
          </div>
          <div className="card-body" style={{ padding: "16px" }}>
            {matterInsightsError ? (
              <div className="portal-process-filter-empty" style={{ marginBottom: "12px" }}>{matterInsightsError}</div>
            ) : null}
            <div className="timeline">
              {matter.andamentos.slice(0, 3).map((a, i) => (
                <div key={a.id} className="timeline-item">
                  <div className="timeline-dot-wrapper">
                    <div className="timeline-dot completed"></div>
                    {i < 2 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content">
                <div style={{ display: "flex", gap: "8px", alignItems: "baseline" }}>
                  <span style={{ fontWeight: 700, fontSize: "13px" }}>{a.title}</span>
                  <span className="badge badge-neutral">{a.type}</span>
                  {a.translated ? <span className="badge badge-info">Linguagem simples</span> : null}
                </div>
                <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))", marginTop: "2px" }}>{a.content}</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginTop: "4px" }}>{a.date} às {a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Fase Atual */}
        <div className="card">
          <div className="card-header"><span className="card-title">Cronograma do Processo</span></div>
          <div className="card-body" style={{ padding: "16px" }}>
            <div className="timeline">
              {matter.timeline_phases.map((p, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot-wrapper">
                    <div className={`timeline-dot ${p.status}`}></div>
                    {i < matter.timeline_phases.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="timeline-content" style={{ paddingBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: p.status === "active" ? 700 : 600, fontSize: "13px" }}>{p.name}</span>
                      {p.label && <span className="badge badge-warning" style={{ fontSize: "9px" }}>{p.label}</span>}
                    </div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{p.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Próxima Ação */}
        <div className="card" style={{ border: "1px solid hsl(var(--gold-primary))", background: "hsl(43 74% 98%)" }}>
          <div className="card-header" style={{ borderBottom: "1px solid hsl(43 74% 90%)" }}>
            <span className="card-title">📌 Próxima Ação</span>
          </div>
          <div className="card-body">
            <div style={{ fontWeight: 700, fontSize: "14px" }}>{nextDeadline?.title || "Acompanhar próxima movimentação"}</div>
            <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))", marginTop: "4px" }}>{nextDeadline?.desc || "Sem pendência do cliente neste momento."}</div>
            <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
              <button className="btn btn-gold btn-sm" onClick={() => setActiveSubTab("prazos")}>Ver detalhes</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveSubTab("documentos")}>Documentos</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );

  const renderAndamentos = () => (
    <div className="process-module-shell">
      <div className="process-module-summary-grid">
        {[
          { label: "Movimentações", value: matter.andamentos.length, meta: "Publicadas no portal" },
          { label: "Última atualização", value: matter.andamentos[0]?.date || "A definir", meta: matter.andamentos[0]?.title || "Sem andamento recente" },
          { label: "Documentos vinculados", value: matter.documents.length, meta: "Arquivos do processo" },
        ].map((item) => (
          <div key={item.label} className="process-module-summary-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.meta}</small>
          </div>
        ))}
      </div>

        <div className="card">
          <div className="card-header process-module-header">
            <div>
              <span className="card-title">Histórico de Andamentos</span>
              <p>Movimentações publicadas pela equipe com explicação em linguagem simples.</p>
            </div>
            <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>{matter.andamentos.length} movimentações</div>
          </div>
        {matterInsightsError ? (
          <div className="portal-process-filter-empty" style={{ margin: "16px 20px 0" }}>
            {matterInsightsError}
          </div>
        ) : null}
        <div className="process-timeline-card-list">
          {matter.andamentos.length === 0 && (
            <div className="process-empty-state">
              <strong>Nenhum andamento publicado</strong>
              <span>Quando houver nova movimentação, ela aparecerá nesta linha do tempo.</span>
            </div>
          )}
          {matter.andamentos.map((a) => (
            <article key={a.id} className="process-event-card">
              <div className="process-event-icon">{a.icon || "📋"}</div>
              <div>
                <div className="process-event-title-row">
                  <strong>{a.title}</strong>
                  <span className="badge badge-neutral">{a.type}</span>
                  {a.translated ? <span className="badge badge-info">Linguagem simples</span> : null}
                </div>
                <p>{a.content}</p>
                <small>{a.date} às {a.time}</small>
                <button type="button" className="process-text-action">Explicar este andamento</button>
              </div>
            </article>
          ))}
        </div>
        <div className="process-desktop-timeline" style={{ padding: "20px" }}>
        <div className="timeline">
          {matter.andamentos.map((a, i) => (
            <div key={a.id} className="timeline-item">
              <div className="timeline-dot-wrapper">
                <div className="timeline-dot completed"></div>
                {i < matter.andamentos.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="timeline-content">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "16px" }}>{a.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>{a.title}</span>
                  <span className="badge badge-neutral">{a.type}</span>
                  {a.translated ? <span className="badge badge-info">Linguagem simples</span> : null}
                </div>
                <div style={{ fontSize: "13px", color: "hsl(var(--text-secondary))", marginTop: "6px", lineHeight: "1.6" }}>{a.content}</div>
                <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginTop: "6px", display: "flex", gap: "6px" }}>
                  <Icon.Calendar />
                  <span>{a.date} às {a.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );

  const renderWorkflowOverview = () => (
    <div className="workflow-kpi-grid">
      {[
        { label: "Progresso geral", value: `${processProgress}%`, meta: "Fases concluídas e em andamento" },
        { label: "Fase atual", value: currentGanttPhase?.title || "A definir", meta: currentGanttPhase ? `${currentGanttPhase.progress}% concluída` : "Sem fase ativa" },
        { label: "Próximo prazo", value: nextDeadline?.deadline || nextDeadline?.date || "A definir", meta: nextDeadline?.title || "Sem prazo cadastrado" },
        { label: "Pendências do cliente", value: pendingClientTasks, meta: "Atividades aguardando ação" },
      ].map((item) => (
        <div key={item.label} className="workflow-kpi-card">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.meta}</small>
        </div>
      ))}
    </div>
  );

  const renderWorkflowPanel = () => {
    if (!selectedWorkflowItem) return null;

    return (
      <aside className="workflow-detail-panel" aria-label="Detalhes da atividade selecionada">
        <div className="workflow-detail-header">
          <div>
            <span>{selectedWorkflowItem.type}</span>
            <h3>{selectedWorkflowItem.title}</h3>
          </div>
          <button type="button" onClick={() => setSelectedWorkflowItem(null)} aria-label="Fechar detalhes">×</button>
        </div>
        <div className="workflow-detail-body">
          {[
            ["Processo", selectedWorkflowItem.process],
            ["Responsável", selectedWorkflowItem.responsible],
            ["Prazo / previsão", selectedWorkflowItem.dueDate || formatDate(selectedWorkflowItem.end)],
            ["Prioridade", selectedWorkflowItem.priority],
            ["Próxima ação", selectedWorkflowItem.nextAction],
            ["Dependência", selectedWorkflowItem.dependency],
          ].filter(([, value]) => value).map(([label, value]) => (
            <div key={label} className="workflow-detail-row">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}

          <section>
            <h4>Documentos relacionados</h4>
            {(selectedWorkflowItem.documents || []).length === 0 ? (
              <p className="workflow-empty-text">Nenhum documento vinculado.</p>
            ) : selectedWorkflowItem.documents.map((document) => (
              <div key={document.id || document.name} className="workflow-mini-item">
                <strong>{document.name || document.title}</strong>
                <span>{document.date || document.size || "Disponível no portal"}</span>
              </div>
            ))}
          </section>

          <section>
            <h4>Histórico e movimentações</h4>
            {(selectedWorkflowItem.history || selectedWorkflowItem.updates || []).slice(0, 4).map((update) => (
              <div key={update.id || update.title} className="workflow-mini-item">
                <strong>{update.title}</strong>
                <span>{update.date} {update.time ? `às ${update.time}` : ""}</span>
              </div>
            ))}
          </section>

          <section>
            <h4>Mensagens</h4>
            <p className="workflow-empty-text">Use a Central de Comunicação para conversar sobre esta atividade.</p>
          </section>

          {selectedWorkflowItem.nextAction === "Enviar documento" && (
            <button type="button" className="btn btn-gold btn-sm" onClick={() => setActiveSubTab("documentos")}>
              Enviar documento
            </button>
          )}
        </div>
      </aside>
    );
  };

  const renderGanttLegend = () => (
    <div className="workflow-legend">
      {[
        ["completed", "Concluído"],
        ["in_progress", "Em andamento"],
        ["planned", "Previsto"],
        ["delayed", "Atrasado"],
        ["suspended", "Suspenso"],
      ].map(([key, label]) => (
        <span key={key}><i className={`workflow-dot ${key}`}></i>{label}</span>
      ))}
    </div>
  );

  const renderCronograma = () => {
    const today = new Date();
    const minDate = ganttPhases.reduce((min, item) => item.start < min ? item.start : min, ganttPhases[0]?.start || today);
    const maxDate = ganttPhases.reduce((max, item) => item.end > max ? item.end : max, ganttPhases[0]?.end || today);
    const rangeByZoom = {
      month: [addDays(today, -14), addDays(today, 45)],
      quarter: [addDays(today, -28), addDays(today, 92)],
      full: [addDays(minDate, -10), addDays(maxDate, 18)],
    };
    const [viewStart, viewEnd] = rangeByZoom[scheduleZoom] || rangeByZoom.quarter;
    const totalDays = Math.max(1, Math.ceil((viewEnd - viewStart) / 86400000));
    const weeks = Array.from({ length: Math.ceil(totalDays / 7) + 1 }, (_, index) => addDays(viewStart, index * 7));
    const months = weeks.filter((week, index) => index === 0 || week.getMonth() !== weeks[index - 1].getMonth());
    const todayLeft = Math.min(100, Math.max(0, ((today - viewStart) / (viewEnd - viewStart)) * 100));

    return (
      <div className="workflow-shell">
        {renderWorkflowOverview()}
        <div className="workflow-content-grid">
          <section className="card workflow-main-card">
            <div className="workflow-card-toolbar">
              <div>
                <span className="workflow-eyebrow">Cronograma do Processo</span>
                <h2>Gráfico Gantt</h2>
                <p>Fases processuais, dependências, progresso e previsões consolidadas.</p>
              </div>
              <div className="workflow-toolbar-actions">
                {renderGanttLegend()}
                <div className="workflow-zoom-control" aria-label="Zoom do cronograma">
                  {[
                    ["month", "Mês"],
                    ["quarter", "Trimestre"],
                    ["full", "Completo"],
                  ].map(([key, label]) => (
                    <button key={key} type="button" className={scheduleZoom === key ? "active" : ""} onClick={() => setScheduleZoom(key)}>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="workflow-secondary-actions">
                  <button type="button" onClick={() => setScheduleZoom("month")}>Ir para hoje</button>
                  <button type="button" onClick={() => window.print()}>Exportar</button>
                </div>
              </div>
            </div>

            <div className="gantt-mobile-timeline" aria-label="Linha do tempo resumida do cronograma">
              {ganttPhases.map((phase) => (
                <button
                  key={phase.id}
                  type="button"
                  className={`gantt-mobile-phase ${phase.status}`}
                  onClick={() => openWorkflowPanel({ ...phase, dueDate: formatDate(phase.end), history: phase.updates })}
                >
                  <span className={`workflow-dot ${phase.status}`} />
                  <strong>{phase.title}</strong>
                  <small>{phase.progress}% · {formatDate(phase.start)} até {formatDate(phase.end)}</small>
                  <em>{phase.responsible}</em>
                </button>
              ))}
            </div>

            <div className="gantt-scroll" tabIndex={0} aria-label="Cronograma Gantt com rolagem horizontal">
              <div className="gantt-board" style={{ minWidth: `${Math.max(920, weeks.length * 96 + 360)}px` }}>
                <div className="gantt-header">
                  <div className="gantt-fixed-head">Etapa</div>
                  <div className="gantt-time-head">
                    {months.map((month) => (
                      <span key={`${month.getFullYear()}-${month.getMonth()}`} style={{
                        left: `${((month - viewStart) / (viewEnd - viewStart)) * 100}%`,
                      }}>
                        {month.toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="gantt-body">
                  <div className="gantt-today-line" style={{ left: `calc(360px + (${todayLeft}% * (100% - 360px) / 100))` }}>
                    <span>Hoje</span>
                  </div>
                  {weeks.map((week) => (
                    <i key={week.toISOString()} className="gantt-week-line" style={{
                      left: `calc(360px + (${((week - viewStart) / (viewEnd - viewStart)) * 100}% * (100% - 360px) / 100))`,
                    }} />
                  ))}

                  {ganttPhases.map((phase) => {
                    const left = Math.max(0, ((phase.start - viewStart) / (viewEnd - viewStart)) * 100);
                    const width = Math.max(4, ((phase.end - phase.start) / (viewEnd - viewStart)) * 100);
                    return (
                      <button
                        key={phase.id}
                        type="button"
                        className={`gantt-row ${phase.status}`}
                        onClick={() => openWorkflowPanel({ ...phase, dueDate: formatDate(phase.end), history: phase.updates })}
                        title={`${phase.title}: ${phase.description} | Docs: ${phase.documents.length} | Prazos: ${phase.deadlines.length}`}
                      >
                        <div className="gantt-row-meta">
                          <strong>{phase.title}</strong>
                          <span>{phase.progress}% · {formatDate(phase.start)} → {formatDate(phase.end)}</span>
                        </div>
                        <div className="gantt-row-track">
                          <span className={`gantt-bar ${phase.status}`} style={{ left: `${left}%`, width: `${width}%` }}>
                            <i style={{ width: `${phase.progress}%` }} />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
          {renderWorkflowPanel()}
        </div>
      </div>
    );
  };

  const renderQuadroProcessual = () => {
    const columns = [
      ["a_fazer", "A Fazer"],
      ["em_analise", "Em Análise"],
      ["aguardando_cliente", "Aguardando Cliente"],
      ["protocolado", "Protocolado"],
      ["aguardando_judiciario", "Aguardando Judiciário"],
      ["concluido", "Concluído"],
    ];
    const selectStyle = {
      border: "1px solid hsl(var(--border-color))",
      background: "#fff",
      padding: "9px 10px",
      fontSize: "12px",
      color: "hsl(var(--text-secondary))",
      minWidth: "150px",
    };

    return (
      <div className="workflow-shell">
        {renderWorkflowOverview()}
        <div className="workflow-content-grid">
          <section className="card workflow-main-card">
            <div className="workflow-card-toolbar">
              <div>
                <span className="workflow-eyebrow">Quadro Processual</span>
                <h2>Kanban somente leitura</h2>
                <p>Atividades sincronizadas com prazos, andamentos, audiências e documentos.</p>
              </div>
            </div>

            <div className="kanban-filters" aria-label="Filtros do quadro processual">
              <select style={selectStyle} value={workflowFilters.process} onChange={(e) => setWorkflowFilters((current) => ({ ...current, process: e.target.value }))}>
                <option value="all">Todos os processos</option>
                <option value={matter.court_number}>{matter.court_number}</option>
              </select>
              <select style={selectStyle} value={workflowFilters.responsible} onChange={(e) => setWorkflowFilters((current) => ({ ...current, responsible: e.target.value }))}>
                <option value="all">Todos responsáveis</option>
                <option value="Cliente">Cliente</option>
                <option value="Advogado">Advogado</option>
                <option value="Judiciário">Judiciário</option>
              </select>
              <select style={selectStyle} value={workflowFilters.priority} onChange={(e) => setWorkflowFilters((current) => ({ ...current, priority: e.target.value }))}>
                <option value="all">Todas prioridades</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="normal">Normal</option>
              </select>
              <select style={selectStyle} value={workflowFilters.period} onChange={(e) => setWorkflowFilters((current) => ({ ...current, period: e.target.value }))}>
                <option value="all">Todo período</option>
                <option value="7">Próximos 7 dias</option>
                <option value="30">Próximos 30 dias</option>
              </select>
              <select style={selectStyle} value={workflowFilters.status} onChange={(e) => setWorkflowFilters((current) => ({ ...current, status: e.target.value }))}>
                <option value="all">Todos status</option>
                {columns.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </div>

            <div className="kanban-mobile-column-switch" aria-label="Selecionar coluna do quadro">
              <button type="button" className={activeKanbanColumn === "all" ? "active" : ""} onClick={() => setActiveKanbanColumn("all")}>
                Todas
              </button>
              {columns.map(([key, label]) => {
                const count = filteredKanbanCards.filter((card) => card.column === key).length;
                return (
                  <button key={key} type="button" className={activeKanbanColumn === key ? "active" : ""} onClick={() => setActiveKanbanColumn(key)}>
                    {label} <span>{count}</span>
                  </button>
                );
              })}
            </div>

            <div className="kanban-board" aria-label="Quadro processual somente leitura">
              {columns.map(([key, label]) => {
                const cards = filteredKanbanCards.filter((card) => card.column === key);
                return (
                  <section key={key} className={`kanban-column status-${key} ${activeKanbanColumn !== "all" && activeKanbanColumn !== key ? "is-mobile-hidden" : ""}`}>
                    <header>
                      <strong>{label}</strong>
                      <span>{cards.length}</span>
                    </header>
                    <div className="kanban-column-body">
                      {cards.length === 0 ? (
                        <p className="workflow-empty-text">Sem atividades.</p>
                      ) : cards.map((card) => (
                        <button key={card.id} type="button" className="kanban-card" onClick={() => openWorkflowPanel(card)}>
                          <div className="kanban-card-bar" />
                          <strong>{card.title}</strong>
                          <span>{card.type} · {card.process}</span>
                          <div className="kanban-card-meta">
                            <small>Prazo: {card.dueDate}</small>
                            <small>{card.responsible}</small>
                          </div>
                          <div className="kanban-badges">
                            {card.badges.map((badge) => <i key={badge}>{badge}</i>)}
                          </div>
                          <div className="kanban-card-footer">
                            <span>{card.documents.length} docs</span>
                            <span>{card.lastUpdate}</span>
                          </div>
                          {card.nextAction === "Enviar documento" && <em>Enviar documento</em>}
                        </button>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </section>
          {renderWorkflowPanel()}
        </div>
      </div>
    );
  };

  const renderPrazos = () => (
    <div className="process-module-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
      <div className="card">
        <div className="card-header process-module-header">
          <div>
            <span className="card-title">Prazos e Intimações</span>
            <p>Datas importantes com status textual, origem e ação relacionada.</p>
          </div>
          <span className="badge badge-danger">{clientData.stats.notifications_count} pendentes</span>
        </div>
        <div className="process-filter-tabs" role="tablist" aria-label="Filtrar prazos e intimações">
          {[
            ["all", "Todos"],
            ["prazo", "Prazos"],
            ["intima", "Intimações"],
          ].map(([key, label]) => (
            <button key={key} type="button" className={deadlineFilter === key ? "active" : ""} onClick={() => setDeadlineFilter(key)}>
              {label}
            </button>
          ))}
        </div>
        <div className="process-deadline-card-list">
          {filteredDeadlines.length === 0 ? (
            <div className="process-empty-state">
              <strong>Nenhum item encontrado</strong>
              <span>Altere o filtro para consultar outros prazos e intimações.</span>
            </div>
          ) : filteredDeadlines.map((p) => (
            <article key={p.id} className={`process-deadline-card status-${p.color}`}>
              <div>
                <span className="badge badge-neutral">{p.type}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
              <dl>
                <div>
                  <dt>Situação</dt>
                  <dd style={{ color: p.color }}>{p.time}</dd>
                </div>
                <div>
                  <dt>Data</dt>
                  <dd>{p.date}</dd>
                </div>
                <div>
                  <dt>Origem</dt>
                  <dd>Portal do processo</dd>
                </div>
              </dl>
              <div className="process-card-actions">
                <button type="button" className="btn btn-gold btn-sm">Abrir detalhe</button>
                <button type="button" className="btn btn-secondary btn-sm">Adicionar ao calendário</button>
              </div>
            </article>
          ))}
        </div>
        <div className="process-desktop-timeline">
          <div className="timeline" style={{ padding: "20px" }}>
          {filteredDeadlines.map((p, i) => (
            <div key={p.id} className="timeline-item">
              <div className="timeline-dot-wrapper">
                <div className="timeline-dot" style={{ backgroundColor: p.color, borderColor: p.color }}></div>
                {i < filteredDeadlines.length - 1 && <div className="timeline-line"></div>}
              </div>
              <div className="timeline-content">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 700, fontSize: "14px" }}>{p.title}</span>
                  <span className="badge badge-neutral" style={{ fontSize: "10px" }}>{p.type}</span>
                </div>
                <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))", marginTop: "2px" }}>{p.desc}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: p.color }}>{p.time}</span>
                  <span style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>{p.date}</span>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-header"><span className="card-title">Publicações do DJe</span></div>
        <div className="card-body">
          {matter.andamentos.slice(0, 2).map((a, i) => (
            <div key={i} style={{ marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid hsl(var(--border-color))" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-muted))", marginBottom: "4px" }}>{a.date}</div>
              <div style={{ fontSize: "12px", lineHeight: "1.6" }}>{a.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDocumentos = () => {
    const docFilters = ["Todos", ...new Set(matter.documents.map(d => d.type_label))];
    return (
      <div className="process-documents-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: "16px" }}>
        {/* Pastas */}
        <div className="card">
          <div className="card-header"><span className="card-title">Pastas do Processo</span></div>
          <div style={{ padding: "8px 0" }}>
            {matter.document_folders.map(folder => (
              <div key={folder.name}
                onClick={() => setActiveDocFolder(folder.name)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 16px", cursor: "pointer", fontSize: "13px",
                  background: activeDocFolder === folder.name ? "hsl(43 74% 93%)" : "transparent",
                  borderLeft: activeDocFolder === folder.name ? "3px solid hsl(var(--gold-primary))" : "3px solid transparent",
                  fontWeight: activeDocFolder === folder.name ? 700 : 500,
                  transition: "var(--transition)"
                }}
              >
                <span>{folder.icon ? `${folder.icon} ` : ""}{folder.name}</span>
                <span style={{ fontSize: "11px", color: "hsl(var(--text-muted))", fontWeight: 700 }}>{folder.count}</span>
              </div>
            ))}
          </div>
          {/* Storage */}
          <div style={{ padding: "12px 16px", borderTop: "1px solid hsl(var(--border-color))" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-muted))", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "6px" }}>Armazenamento</div>
            <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${matter.storage.percent}%` }}></div></div>
            <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginTop: "4px" }}>{matter.storage.used} de {matter.storage.total} utilizados</div>
          </div>
        </div>

        {/* Documentos Table */}
        <div className="card">
          <div className="card-header">
            <div>
              <span className="card-title">Todos os Documentos</span>
              <span style={{ fontSize: "12px", color: "hsl(var(--text-muted))", marginLeft: "8px" }}>{matter.documents.length} documentos</span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn btn-gold btn-sm"><Icon.Plus /> Novo Documento</button>
              <button className="btn btn-secondary btn-sm"><Icon.Download /> Baixar Selecionados</button>
            </div>
          </div>
          {/* Filter Pills */}
          <div className="process-document-toolbar">
            <label className="process-document-search">
              <span>Buscar documento</span>
              <input
                className="input-field"
                type="search"
                value={documentSearch}
                onChange={(event) => setDocumentSearch(event.target.value)}
                placeholder="Nome, tipo ou data"
              />
            </label>
            <div className="process-document-filter-pills">
            {docFilters.map(f => (
              <button key={f} onClick={() => setDocFilter(f)}
                className={f === docFilter ? "btn btn-primary btn-sm" : "btn btn-secondary btn-sm"}
              >{f}</button>
            ))}
            </div>
            <button className="btn btn-ghost btn-sm">Ordenar por: Mais recentes ▼</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: "32px" }}><input type="checkbox" /></th>
                <th>Documento</th>
                <th>Data/Hora</th>
                <th>Tamanho</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDocs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "hsl(var(--text-muted))" }}>Nenhum documento encontrado nesta pasta.</td></tr>
              ) : filteredDocs.map(doc => (
                <tr key={doc.id} onClick={() => setSelectedDocumentId(doc.id)} style={{ cursor: "pointer" }}>
                  <td><input type="checkbox" /></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "16px" }}>{doc.type_icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{doc.name}</div>
                        <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{doc.type_label} · {doc.format}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>{doc.date} {doc.time}</td>
                  <td style={{ fontSize: "12px" }}>{doc.size}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button className="btn btn-ghost btn-xs"><Icon.Download /></button>
                      <button className="btn btn-ghost btn-xs"><Icon.Eye /></button>
                      <button className="btn btn-ghost btn-xs"><Icon.MoreVertical /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="process-document-card-list">
            {filteredDocs.length === 0 ? (
              <div className="process-empty-state">
                <strong>Nenhum documento encontrado</strong>
                <span>Revise a busca, a pasta ou o tipo selecionado.</span>
              </div>
            ) : filteredDocs.map((doc) => (
              <article key={doc.id} className={`process-document-card ${selectedDocument?.id === doc.id ? "active" : ""}`}>
                <button type="button" onClick={() => setSelectedDocumentId(doc.id)}>
                  <span className="process-document-icon">{doc.type_icon}</span>
                  <span>
                    <strong>{doc.name}</strong>
                    <small>{doc.type_label} · {doc.format} · {doc.size}</small>
                    <small>{doc.date} {doc.time}</small>
                  </span>
                </button>
                <div className="process-card-actions">
                  <button type="button" className="btn btn-secondary btn-sm"><Icon.Eye /> Visualizar</button>
                  <button type="button" className="btn btn-gold btn-sm"><Icon.Download /> Baixar</button>
                </div>
              </article>
            ))}
          </div>
          {/* Pagination */}
          <div className="process-document-pagination" style={{ padding: "12px 16px", borderTop: "1px solid hsl(var(--border-color))", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} className={n === 1 ? "btn btn-primary btn-xs" : "btn btn-ghost btn-xs"}>{n}</button>
            ))}
            <button className="btn btn-ghost btn-xs">→</button>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card process-document-preview">
            <div className="card-header"><span className="card-title">Visualizador</span></div>
            <div className="card-body">
              {selectedDocument ? (
                <>
                  <div className="process-document-preview-box">
                    <span>{selectedDocument.type_icon}</span>
                    <strong>{selectedDocument.format}</strong>
                  </div>
                  <h3>{selectedDocument.name}</h3>
                  <p>{selectedDocument.type_label} · {selectedDocument.size} · {selectedDocument.date}</p>
                  <div className="process-card-actions">
                    <button type="button" className="btn btn-gold btn-sm">Baixar</button>
                    <button type="button" className="btn btn-secondary btn-sm">Abrir</button>
                  </div>
                </>
              ) : (
                <div className="process-empty-state">
                  <strong>Selecione um documento</strong>
                  <span>Os detalhes do arquivo aparecerão aqui.</span>
                </div>
              )}
            </div>
          </div>

          {/* Resumo */}
          <div className="card">
            <div className="card-header"><span className="card-title">Resumo de Documentos</span></div>
            <div className="card-body">
              <div className="donut-container" style={{ flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                    <DonutChart
                      segments={matter.doc_resumo.map(d => ({ value: d.count, color: d.color }))}
                      size={90}
                      strokeWidth={16}
                    />
                    <div style={{ position: "absolute", textAlign: "center" }}>
                      <div style={{ fontWeight: 900, fontSize: "16px", fontFamily: "Outfit, sans-serif" }}>{matter.documents.length + 35}</div>
                      <div style={{ fontSize: "9px", color: "hsl(var(--text-muted))", fontWeight: 600 }}>Total</div>
                    </div>
                  </div>
                </div>
                <div className="donut-legend">
                  {matter.doc_resumo.map((d, i) => (
                    <div key={i} className="donut-legend-item">
                      <div className="donut-legend-dot" style={{ backgroundColor: d.color }}></div>
                      <span className="donut-legend-label">{d.label}</span>
                      <span className="donut-legend-pct">{d.count} ({d.pct}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="card">
            <div className="card-header"><span className="card-title">Ações Rápidas</span></div>
            <div className="card-body">
              <div className="quick-actions">
                {["📤 Enviar Documento", "📁 Criar Pasta", "🔗 Compartilhar", "📄 Solicitar Documento", "🖨 Digitalizar", "👁 Ver Lixeira"].map(a => (
                  <button key={a} className="quick-action-btn">{a}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Docs Recentes */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Documentos Recentes</span>
              <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))", fontWeight: 700 }}>Ver todos</button>
            </div>
            <div style={{ padding: "8px 16px" }}>
              {matter.documents.slice(0, 3).map((doc, i) => (
                <div key={doc.id} className="file-item">
                  <div className="file-icon file-icon-pdf">{doc.format}</div>
                  <div className="file-info">
                    <div className="file-name">{doc.name}</div>
                    <div className="file-meta">{doc.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: "10px 16px", background: "hsl(142 71% 97%)", borderTop: "1px solid hsl(142 71% 85%)", display: "flex", gap: "8px", alignItems: "center" }}>
              <span style={{ color: "hsl(var(--color-success))" }}><Icon.Shield /></span>
              <div>
                <div style={{ fontWeight: 700, fontSize: "11px", color: "hsl(142 71% 30%)" }}>Seus documentos estão seguros</div>
                <div style={{ fontSize: "10px", color: "hsl(142 71% 40%)" }}>Ambiente 100% seguro com criptografia e backup automático.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecursos = () => (
    <div className="process-resources-grid" style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "16px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Stat Cards */}
        <div className="stat-cards-grid" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { label: "Total de Petições", value: matter.peticoes_stats.protocoladas, desc: "Protocoladas", icon: "📄" },
            { label: "Recursos Interpostos", value: matter.recursos_stats.interpostos, desc: "No processo", icon: "📑" },
            { label: "Pendentes de Análise", value: matter.peticoes_stats.analise, desc: "Pela parte contrária", icon: "⏳" },
            { label: "Já Julgados", value: matter.recursos_stats.julgados, desc: "Decididos", icon: "✅" },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">{s.label}</span>
                <span className="stat-card-icon">{s.icon}</span>
              </div>
              <div className="stat-card-value">{s.value}</div>
              <div className="stat-card-meta">{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="card">
          <div className="card-header process-module-header">
            <div>
              <span className="card-title">Petições e Recursos</span>
              <p>Consulta de peças protocoladas, status e prazos relacionados. Área somente leitura para o cliente.</p>
            </div>
            <div style={{ display: "flex", gap: "0" }}>
              {["Petições Protocoladas", "Recursos Interpostos", "Outros Requerimentos"].map((t, i) => (
                <button key={t} className={`btn btn-${i === 0 ? "primary" : "ghost"} btn-sm`} style={{ fontWeight: i === 0 ? 700 : 500, borderBottom: i === 0 ? "2px solid hsl(var(--gold-primary))" : "2px solid transparent" }}>{t}</button>
              ))}
            </div>
          </div>
          <div className="process-resource-card-list">
            {matter.peticoes.length === 0 ? (
              <div className="process-empty-state">
                <strong>Nenhuma peça disponível</strong>
                <span>Quando uma petição ou recurso for publicado, ele aparecerá aqui.</span>
              </div>
            ) : matter.peticoes.map((p) => (
              <article key={p.id} className="process-resource-card">
                <div>
                  <span className="portal-dashboard-eyebrow">Peça processual</span>
                  <h3>{p.title}</h3>
                  <p>{p.ultima_manifest}</p>
                </div>
                <dl>
                  <div>
                    <dt>Protocolo</dt>
                    <dd>{p.date}</dd>
                  </div>
                  <div>
                    <dt>Responsável</dt>
                    <dd>{p.by}</dd>
                  </div>
                  <div>
                    <dt>Situação</dt>
                    <dd><StatusBadge status={p.status} /></dd>
                  </div>
                </dl>
                <div className="process-card-actions">
                  <button type="button" className="btn btn-secondary btn-sm"><Icon.Eye /> Ver detalhes</button>
                  <button type="button" className="btn btn-gold btn-sm"><Icon.Download /> Baixar peça</button>
                </div>
              </article>
            ))}
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Tipo de Petição</th>
                <th>Data Protocolo</th>
                <th>Protocolado Por</th>
                <th>Situação</th>
                <th>Última Manifestação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {matter.peticoes.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td style={{ fontSize: "12px" }}>{p.date}</td>
                  <td style={{ fontSize: "12px", color: "hsl(var(--text-muted))" }}>{p.by}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ fontSize: "12px", color: "hsl(var(--text-muted))", maxWidth: "200px" }} className="truncate">{p.ultima_manifest}</td>
                  <td>
                    <div style={{ display: "flex", gap: "4px" }}>
                      <button className="btn btn-ghost btn-xs"><Icon.Eye /></button>
                      <button className="btn btn-ghost btn-xs"><Icon.Download /></button>
                      <button className="btn btn-ghost btn-xs"><Icon.MoreVertical /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card-footer">
            <button className="btn btn-ghost btn-sm">Ver todas as petições →</button>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Status dos Recursos */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Status dos Recursos</span>
            <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))" }}>Ver detalhes</button>
          </div>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", position: "relative" }}>
              <DonutChart
                segments={[
                  { value: 1, color: "#22c55e" },
                  { value: 0, color: "#f59e0b" },
                  { value: 1, color: "#ef4444" },
                  { value: 0, color: "#94a3b8" },
                ]}
                size={100}
                strokeWidth={18}
              />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "16px", fontFamily: "Outfit, sans-serif" }}>2</div>
                <div style={{ fontSize: "9px", color: "hsl(var(--text-muted))", fontWeight: 600 }}>Total</div>
              </div>
            </div>
            {[
              { label: "Providos", value: 1, pct: "50%", color: "#22c55e" },
              { label: "Parcialmente Providos", value: 0, pct: "0%", color: "#f59e0b" },
              { label: "Não Providos", value: 1, pct: "50%", color: "#ef4444" },
              { label: "Em Análise", value: 0, pct: "0%", color: "#94a3b8" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                <div style={{ width: "10px", height: "10px", background: s.color, flexShrink: 0 }}></div>
                <span style={{ flex: 1, fontSize: "12px" }}>{s.label}</span>
                <span style={{ fontSize: "12px", fontWeight: 700 }}>{s.value}</span>
                <span style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{s.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Prazos em Andamento */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Prazos em Andamento</span>
            <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))" }}>Ver todos</button>
          </div>
          <div className="card-body">
            {matter.prazos_recursos.map((p, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontWeight: 700, fontSize: "12px" }}>{p.title}</span>
                  <span className={`badge badge-${p.color}`} style={{ fontSize: "10px" }}>{p.days}</span>
                </div>
                <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginBottom: "6px" }}>Prazo final: {p.deadline}</div>
                <div className="progress-bar-track">
                  <div className="progress-bar-fill" style={{ width: `${p.pct}%`, backgroundColor: p.color === "danger" ? "hsl(var(--color-danger))" : "hsl(var(--color-warning))" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="card">
          <div className="card-header"><span className="card-title">Ações Rápidas</span></div>
          <div className="card-body">
            <div className="quick-actions">
              {["📄 Nova Petição", "⚖️ Interpor Recurso", "📎 Juntar Documento", "🔍 Consultar Movimentos"].map(a => (
                <button key={a} className="quick-action-btn">{a}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAudiencias = () => (
    <div className="process-hearings-grid" style={{ display: "grid", gridTemplateColumns: "260px 1fr 260px", gap: "16px" }}>
      {/* Left: Próximas */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="card">
          <div className="card-header process-module-header">
            <div>
              <span className="card-title">Próximas Audiências</span>
              <p>Agenda em formato de consulta, com local, horário e ações rápidas.</p>
            </div>
            <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))" }}>Ver todas</button>
          </div>
          <div className="process-hearing-card-list">
            {matter.audiencias.length === 0 ? (
              <div className="process-empty-state">
                <strong>Nenhuma audiência marcada</strong>
                <span>Quando houver nova audiência, ela aparecerá nesta agenda.</span>
              </div>
            ) : matter.audiencias.map((a) => (
              <article key={a.id} className={`process-hearing-card status-${a.status_color}`}>
                <div className="process-hearing-date">
                  <strong>{a.date.split("/")[0]}</strong>
                  <span>{a.date.split("/")[1] === "07" ? "JUL" : a.date.split("/")[1] === "08" ? "AGO" : "NOV"}</span>
                </div>
                <div>
                  <div className="process-event-title-row">
                    <h3>{a.type}</h3>
                    <StatusBadge status={a.status} />
                  </div>
                  <p>{a.room}</p>
                  <small>{a.date} às {a.time} · horário de Cuiabá/MT</small>
                  <div className="process-card-actions">
                    <button type="button" className="btn btn-gold btn-sm">Adicionar à agenda</button>
                    <button type="button" className="btn btn-secondary btn-sm">Ver documentos</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="process-hearing-compact-list" style={{ padding: "12px" }}>
            {matter.audiencias.map(a => (
              <div key={a.id} style={{ border: "1px solid hsl(var(--border-color))", marginBottom: "10px", padding: "12px", position: "relative" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <div style={{ background: a.status_color === "danger" ? "#fef2f2" : a.status_color === "warning" ? "#fffbeb" : "#eff6ff", border: `1px solid ${a.status_color === "danger" ? "#fecaca" : a.status_color === "warning" ? "#fde68a" : "#bfdbfe"}`, padding: "8px", minWidth: "44px", textAlign: "center" }}>
                    <div style={{ fontSize: "20px", fontWeight: 900, fontFamily: "Outfit, sans-serif", color: a.status_color === "danger" ? "#ef4444" : a.status_color === "warning" ? "#f59e0b" : "#3b82f6" }}>{a.date.split("/")[0]}</div>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: "hsl(var(--text-muted))", textTransform: "uppercase" }}>{a.date.split("/")[1] === "07" ? "JUL" : a.date.split("/")[1] === "08" ? "AGO" : "NOV"}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "12px" }}>{a.type}</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginTop: "2px" }}>{a.room}</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{a.time}</div>
                  </div>
                </div>
                {a.label && (
                  <span className={`badge badge-${a.status_color}`} style={{ position: "absolute", top: "8px", right: "8px", fontSize: "9px" }}>{a.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Info do Local */}
        <div className="card">
          <div className="card-header"><span className="card-title">Informações do Local</span></div>
          <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ fontSize: "12px", color: "hsl(var(--text-secondary))", display: "flex", gap: "6px" }}>
              <span>📍</span>
              <span>Fórum Cível da Comarca de Cuiabá - MT<br/>Av. Desembargador Milton Figueiredo Ferreira Mendes, S/N - Centro Político Administrativo, Cuiabá - MT, 78049-905</span>
            </div>
            <div style={{ fontSize: "12px", color: "hsl(var(--text-secondary))", display: "flex", gap: "6px" }}>
              <span>📞</span><span>(65) 3617-3000</span>
            </div>
            <div style={{ fontSize: "12px", color: "hsl(var(--gold-primary))", display: "flex", gap: "6px" }}>
              <span>🌐</span><span>www.tjmt.jus.br</span>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="card">
          <div className="card-header"><span className="card-title">Preparação da Audiência</span></div>
          <div className="card-body">
            <div className="process-checklist">
              {matter.checklist_audiencia.map((c, i) => (
                <label key={i} className="process-checklist-item">
                  <input type="checkbox" checked={c.status === "Concluído"} readOnly />
                  <span>
                    <strong>{c.item}</strong>
                    <small>{c.status}</small>
                  </span>
                  <StatusBadge status={c.status} />
                </label>
              ))}
            </div>
            <button className="btn btn-secondary btn-sm" style={{ marginTop: "8px" }}>Ver checklist completo →</button>
          </div>
        </div>
      </div>

      {/* Center: Calendário */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Calendário de Audiências</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button className="btn btn-ghost btn-xs">←</button>
            <span style={{ fontWeight: 700, fontSize: "13px" }}>Julho 2026</span>
            <button className="btn btn-ghost btn-xs">▼</button>
            <button className="btn btn-ghost btn-xs">→</button>
          </div>
          <button className="btn btn-gold btn-sm">Hoje</button>
        </div>
        <div className="card-body">
          <div className="calendar-grid">
            {["DOM","SEG","TER","QUA","QUI","SEX","SÁB"].map(d => (
              <div key={d} className="calendar-header-cell">{d}</div>
            ))}
            {/* June overflow */}
            {[29,30].map(d => <div key={`j${d}`} className="calendar-cell" style={{ color: "hsl(var(--text-muted))", opacity: 0.5 }}>{d}</div>)}
            <div className="calendar-cell">1</div><div className="calendar-cell">2</div><div className="calendar-cell">3</div><div className="calendar-cell">4</div><div className="calendar-cell">5</div>
            <div className="calendar-cell">6</div><div className="calendar-cell">7</div><div className="calendar-cell">8</div><div className="calendar-cell">9</div><div className="calendar-cell">10</div><div className="calendar-cell">11</div><div className="calendar-cell">12</div>
            <div className="calendar-cell">13</div><div className="calendar-cell">14</div><div className="calendar-cell">15</div><div className="calendar-cell">16</div>
            {/* today */}
            <div className="calendar-cell today">17</div>
            <div className="calendar-cell">18</div><div className="calendar-cell">19</div>
            <div className="calendar-cell" style={{ fontWeight: 700, color: "#6366f1" }}>20</div>
            <div className="calendar-cell has-event">21</div><div className="calendar-cell">22</div><div className="calendar-cell">23</div><div className="calendar-cell">24</div>
            <div className="calendar-cell has-event" style={{ fontWeight: 700, color: "#6366f1" }}>25</div>
            <div className="calendar-cell">26</div>
            <div className="calendar-cell">27</div><div className="calendar-cell">28</div><div className="calendar-cell">29</div><div className="calendar-cell">30</div><div className="calendar-cell">31</div>
            {[1,2].map(d => <div key={`a${d}`} className="calendar-cell" style={{ color: "hsl(var(--text-muted))", opacity: 0.5 }}>{d}</div>)}
          </div>
          {/* Legend */}
          <div style={{ display: "flex", gap: "16px", marginTop: "12px", flexWrap: "wrap" }}>
            {[{ label: "Conciliação", color: "#6366f1" }, { label: "Instrução", color: "#f59e0b" }, { label: "Julgamento", color: "#10b981" }, { label: "Outros", color: "#94a3b8" }].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                <div style={{ width: "8px", height: "8px", background: l.color }}></div>
                <span>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Histórico */}
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>Histórico de Audiências</div>
            <div className="process-hearing-history-list">
              {matter.audiencias_realizadas.map((a, i) => (
                <article key={i} className="process-hearing-history-card">
                  <strong>{a.type}</strong>
                  <span>{a.date} {a.time}</span>
                  <div>
                    <StatusBadge status={a.result} />
                    <StatusBadge status={a.presence} />
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm"><Icon.Download /> Baixar ata</button>
                </article>
              ))}
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo de Audiência</th>
                  <th>Resultado</th>
                  <th>Presença</th>
                  <th>Ata</th>
                </tr>
              </thead>
              <tbody>
                {matter.audiencias_realizadas.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "12px" }}>{a.date} {a.time}</td>
                    <td style={{ fontSize: "12px" }}>{a.type}</td>
                    <td><StatusBadge status={a.result} /></td>
                    <td><StatusBadge status={a.presence} /></td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button className="btn btn-ghost btn-xs"><Icon.Download /></button>
                        <button className="btn btn-ghost btn-xs"><Icon.MoreVertical /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Audiências Realizadas */}
        <div className="card">
          <div className="card-header"><span className="card-title">Audiências Realizadas</span></div>
          <div className="card-body">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", position: "relative" }}>
              <DonutChart
                segments={[
                  { value: 8, color: "#22c55e" },
                  { value: 7, color: "#f59e0b" },
                  { value: 1, color: "#ef4444" },
                ]}
                size={100}
                strokeWidth={18}
              />
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "20px", fontFamily: "Outfit, sans-serif" }}>8</div>
                <div style={{ fontSize: "10px", color: "hsl(var(--text-muted))", fontWeight: 700 }}>Total</div>
              </div>
            </div>
            {[
              { label: "Realizadas", value: 8, pct: "80%", color: "#22c55e" },
              { label: "Compareceu", value: 7, pct: "70%", color: "#f59e0b" },
              { label: "Não compareceu", value: 1, pct: "10%", color: "#ef4444" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <div style={{ width: "10px", height: "10px", background: s.color }}></div>
                <span style={{ flex: 1, fontSize: "12px" }}>{s.label}</span>
                <span style={{ fontWeight: 700, fontSize: "12px" }}>{s.value}</span>
                <span style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{s.pct}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Participantes */}
        <div className="card">
          <div className="card-header"><span className="card-title">Participantes</span></div>
          <div className="card-body">
            {matter.participantes.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div className="avatar" style={{ background: "#e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>👤</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "12px" }}>{p.name}</div>
                  <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))" }}>{p.role}</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Dicas */}
        <div className="card">
          <div className="card-header"><span className="card-title">💡 Dicas Importantes</span></div>
          <div className="card-body">
            {[
              "Chegue com antecedência mínima de 30 minutos",
              "Leve todos os documentos originais necessários",
              "Mantenha seus contatos atualizados",
              "Em caso de impossibilidade, avise com antecedência",
            ].map((d, i) => (
              <div key={i} style={{ display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "8px" }}>
                <div style={{ width: "16px", height: "16px", background: "hsl(var(--gold-primary))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "1px" }}>
                  <span style={{ fontSize: "9px", fontWeight: 900, color: "#0a0a0a" }}>{i + 1}</span>
                </div>
                <span style={{ fontSize: "12px", color: "hsl(var(--text-secondary))" }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinanceiro = () => {
    const fin = matter.financeiro;
    return (
      <div className="financial-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Resumo Financeiro */}
          <div className="financial-hero" style={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(222 47% 18%)", padding: "24px" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "hsl(43 74% 65%)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon.Scale /> Resumo Financeiro
            </div>
            <div className="financial-hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
              {[
                { label: "Total Investido", value: `R$ ${fin.total_investido}`, desc: "Valor total pago até o momento", color: "#94a3b8" },
                { label: "A Receber", value: `R$ ${fin.a_receber}`, desc: "Valores pretendidos na ação →", color: "#22c55e" },
                { label: "Previsão Atual", value: `R$ ${fin.previsao_atual}`, desc: "Estimativa de retorno líquido", color: "#f59e0b" },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ fontSize: "11px", color: "hsl(var(--sidebar-text-muted))", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>{s.label}</div>
                  <div style={{ fontSize: "22px", fontWeight: 900, color: s.color, fontFamily: "Outfit, sans-serif" }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "hsl(var(--sidebar-text-muted))", marginTop: "4px" }}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Evolução */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Evolução do Investimento</span>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: "11px" }}>Últimos 12 meses ▼</button>
            </div>
            <div className="card-body">
              <div style={{ fontSize: "12px", color: "hsl(var(--text-muted))", marginBottom: "8px" }}>Acompanhe seus gastos ao longo do processo</div>
              {/* Mini chart */}
              <div style={{ border: "1px solid hsl(var(--border-color))", padding: "20px", display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", position: "relative" }}>
                <div style={{ position: "absolute", inset: 0, padding: "16px", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                  <svg viewBox={`0 0 ${fin.chart_data.length * 40} 80`} style={{ width: "100%", height: "80px" }}>
                    <defs>
                      <linearGradient id="chartGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="hsl(43 74% 49%)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="hsl(43 74% 49%)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {(() => {
                      const data = fin.chart_data;
                      const max = Math.max(...data);
                      const min = Math.min(...data);
                      const range = max - min || 1;
                      const W = 40;
                      const H = 70;
                      const pts = data.map((v, i) => `${i * W},${H - ((v - min) / range) * H}`).join(" ");
                      const areaBase = `${(data.length - 1) * W},${H} 0,${H}`;
                      return (
                        <>
                          <polygon points={`${pts} ${areaBase}`} fill="url(#chartGrad)" />
                          <polyline points={pts} fill="none" stroke="hsl(43 74% 49%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          {data.map((v, i) => (
                            <circle key={i} cx={i * W} cy={H - ((v - min) / range) * H} r="3" fill="hsl(43 74% 49%)" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Lançamentos */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Lançamentos Financeiros</span>
              <button className="btn btn-gold btn-sm"><Icon.Plus /> Novo Lançamento</button>
            </div>
            <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", padding: "8px 16px 2px" }}>Histórico detalhado de receitas e despesas</div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Comprovante</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {fin.lancamentos.map((l, i) => (
                  <tr key={i}>
                    <td style={{ fontSize: "12px", fontFamily: "monospace" }}>{l.date}</td>
                    <td style={{ fontWeight: 600, maxWidth: "200px" }} className="truncate">{l.desc}</td>
                    <td><span className={`badge ${l.category === "Honorários" ? "badge-purple" : l.category === "Custas" ? "badge-info" : l.category === "Taxas" ? "badge-neutral" : "badge-success"}`}>{l.category}</span></td>
                    <td style={{ fontSize: "12px", color: l.neg ? "hsl(var(--color-danger))" : "hsl(var(--color-success))" }}>
                      {l.neg ? "↓ " : "↑ "}{l.type}
                    </td>
                    <td style={{ fontWeight: 700, color: l.neg ? "hsl(var(--color-danger))" : "hsl(var(--color-success))", fontFamily: "monospace" }}>
                      {l.value}
                    </td>
                    <td><button className="btn btn-ghost btn-xs"><Icon.Documentos /></button></td>
                    <td><button className="btn btn-ghost btn-xs"><Icon.MoreVertical /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="financial-entry-list">
              {fin.lancamentos.length === 0 ? (
                <div className="process-empty-state">
                  <strong>Nenhum lançamento financeiro</strong>
                  <span>Quando houver pagamentos ou reembolsos, eles aparecerão aqui.</span>
                </div>
              ) : fin.lancamentos.map((l, i) => (
                <article key={i} className={`financial-entry-card ${l.neg ? "expense" : "income"}`}>
                  <div>
                    <span>{l.date}</span>
                    <strong>{l.desc}</strong>
                    <small>{l.category} · {l.type}</small>
                  </div>
                  <em>{l.value}</em>
                  <div className="process-card-actions">
                    <button type="button" className="btn btn-secondary btn-sm"><Icon.Documentos /> Comprovante</button>
                    <button type="button" className="btn btn-gold btn-sm">Detalhes</button>
                  </div>
                </article>
              ))}
            </div>
            <div className="card-footer">
              <button className="btn btn-ghost btn-sm">Ver todos os lançamentos ▼</button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Distribuição */}
          <div className="card">
            <div className="card-header"><span className="card-title">Distribuição dos Gastos</span></div>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px", position: "relative" }}>
                <DonutChart
                  segments={fin.distribuicao.map(d => ({ value: d.pct, color: d.color }))}
                  size={100}
                  strokeWidth={18}
                />
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontWeight: 900, fontSize: "13px", fontFamily: "Outfit, sans-serif" }}>R$ {fin.total_investido}</div>
                  <div style={{ fontSize: "9px", color: "hsl(var(--text-muted))", fontWeight: 600 }}>Total investido</div>
                </div>
              </div>
              {fin.distribuicao.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                  <div style={{ width: "10px", height: "10px", background: d.color }}></div>
                  <span style={{ flex: 1, fontSize: "12px" }}>{d.label}</span>
                  <span style={{ fontWeight: 700, fontSize: "12px" }}>{d.pct}%</span>
                  <span style={{ fontSize: "11px", color: "hsl(var(--text-muted))", fontFamily: "monospace" }}>R$ {d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Previsão de Resultado */}
          <div className="card">
            <div className="card-header"><span className="card-title">Previsão de Resultado</span></div>
            <div className="card-body">
              <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginBottom: "12px" }}>Baseado no histórico do processo</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
                {[
                  { label: "Melhor cenário", value: fin.previsao.melhor, color: "#22c55e" },
                  { label: "Cenário provável", value: fin.previsao.provavel, color: "#f59e0b" },
                  { label: "Cenário conservador", value: fin.previsao.conservador, color: "#ef4444" },
                ].map((p, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "8px", border: `1px solid ${p.color}40`, background: `${p.color}08` }}>
                    <div style={{ fontSize: "9px", fontWeight: 700, color: "hsl(var(--text-muted))", textTransform: "uppercase", marginBottom: "4px" }}>{p.label}</div>
                    <div style={{ fontWeight: 900, fontSize: "13px", color: p.color, fontFamily: "Outfit, sans-serif" }}>R$ {p.value}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-ghost btn-sm" style={{ marginTop: "10px", fontSize: "11px" }}>Ver detalhes da projeção →</button>
            </div>
          </div>

          {/* Próximos Pagamentos */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Próximos Pagamentos</span>
              <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))" }}>Ver todos</button>
            </div>
            <div className="card-body">
              {fin.proximos_pagamentos.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", marginBottom: "14px", paddingBottom: "14px", borderBottom: "1px solid hsl(var(--border-color))" }}>
                  <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "6px 8px", textAlign: "center", flexShrink: 0, minWidth: "42px" }}>
                    <div style={{ fontSize: "16px", fontWeight: 900, color: "#3b82f6", fontFamily: "Outfit, sans-serif" }}>{p.date.split("/")[0]}</div>
                    <div style={{ fontSize: "9px", color: "#3b82f6", fontWeight: 700 }}>{p.date.split("/")[1]}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: "12px" }}>{p.desc}</div>
                    <div style={{ fontSize: "11px", color: "hsl(var(--text-muted))", marginTop: "2px" }}>{p.days}</div>
                  </div>
                  <div style={{ fontWeight: 900, fontSize: "14px", fontFamily: "Outfit, sans-serif", color: "hsl(var(--color-danger))" }}>R$ {p.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Documentos Financeiros */}
          <div className="card">
            <div className="card-header">
              <span className="card-title">Documentos Financeiros</span>
              <button className="btn btn-ghost btn-xs" style={{ color: "hsl(var(--gold-primary))" }}>Ver todos</button>
            </div>
            <div className="card-body">
              {fin.documentos_financeiros.map((d, i) => (
                <div key={i} className="file-item">
                  <span style={{ fontSize: "16px" }}>📄</span>
                  <span className="file-name" style={{ flex: 1 }}>{d.name}</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "hsl(var(--text-muted))", minWidth: "20px", textAlign: "right" }}>
                    {String(d.count).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ─── LAYOUT ───────────────────────────────────────────────────────────────
  return (
    <div className="app-layout">
      {/* ═══ SIDEBAR ═══ */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-mark">V|M</div>
          <div className="sidebar-logo-text">
            <h2>ADVOCACIA</h2>
            <span>Área do Cliente</span>
          </div>
          <button className="btn btn-ghost btn-xs" style={{ marginLeft: "auto", color: "hsl(var(--sidebar-text-muted))" }}>«</button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {sidebarGroups.map((group, gi) => (
            <div key={gi} className="sidebar-group">
              {group.label && <span className="sidebar-group-label">{group.label}</span>}
              {group.items.map(item => (
                <div
                  key={item.key}
                  className={`sidebar-link ${isActive(item.key) ? "active" : ""}`}
                  data-mobile-priority={mobilePrimaryKeys.has(item.key) ? "true" : undefined}
                  onClick={() => handleSidebarClick(item.key)}
                >
                  <span className="sidebar-icon"><item.Icon /></span>
                  <span>{item.label}</span>
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </div>
              ))}
            </div>
          ))}
          <button
            className={`sidebar-link mobile-more-link ${mobileMoreOpen ? "active" : ""}`}
            data-mobile-priority="true"
            type="button"
            onClick={() => setMobileMoreOpen(true)}
          >
            <span className="sidebar-icon"><Icon.MoreVertical /></span>
            <span>Mais</span>
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-help-card">
            <p>🎧 Precisa de ajuda?</p>
            <span>Fale com nossa equipe</span>
          </div>
          <div className="sidebar-user">
            <div className="sidebar-avatar">VM</div>
            <div className="sidebar-user-info">
              <p>{clientData.name}</p>
              <span>Cliente</span>
            </div>
            <button className="btn btn-ghost btn-xs" onClick={handleLogout} title="Sair" style={{ marginLeft: "auto", color: "hsl(var(--sidebar-text-muted))" }}>
              <Icon.Logout />
            </button>
          </div>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="main-content">
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-breadcrumb">
            {currentBc.map((b, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {i > 0 && <span className="sep">›</span>}
                {i === currentBc.length - 1 ? <span>{b}</span> : <span style={{ cursor: "pointer", color: "hsl(var(--text-muted))" }} onClick={() => i === 0 && navigate("dashboard")}>{b}</span>}
              </span>
            ))}
          </div>
          <div className="topbar-right">
            <div className="topbar-search">
              <Icon.Search />
              <input placeholder="Buscar no portal..." />
            </div>
            <button className="topbar-icon-btn" onClick={() => navigate("notificacoes")}>
              <Icon.Bell />
              {clientData.stats.notifications_count > 0 && <span className="notif-dot">{clientData.stats.notifications_count}</span>}
            </button>
            <div className="topbar-user" onClick={() => navigate("perfil")}>
              <div className="topbar-avatar">VM</div>
              <div>
                <div className="topbar-user-name">{clientData.name}</div>
                <div className="topbar-user-role">Cliente</div>
              </div>
              <span style={{ fontSize: "10px", color: "hsl(var(--text-muted))" }}>▼</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className={`page-content ${activeTab === "mensagens" ? "" : ""}`} style={activeTab === "mensagens" ? { overflow: "hidden", flex: 1 } : {}}>
          {activeTab === "dashboard" && !selectedMatter && renderDashboard()}
          {activeTab === "mensagens" && renderMensagens()}
          {activeTab === "perfil" && !selectedMatter && renderPerfil()}
          {(selectedMatter || activeTab === "processos") && activeTab !== "mensagens" && renderProcessoDetail()}
          {activeTab === "agenda" && !selectedMatter && (
            <div className="animate-fade-in">
              <div className="page-header">
                <h1>Agenda</h1>
                <p>Seus compromissos e eventos jurídicos.</p>
              </div>
              <div className="card" style={{ marginTop: "20px" }}>
                <div className="card-header"><span className="card-title">Próximos Compromissos</span></div>
                <div className="card-body" style={{ textAlign: "center", padding: "40px", color: "hsl(var(--text-muted))" }}>
                  <div style={{ fontSize: "32px", marginBottom: "12px" }}>📅</div>
                  <p>Nenhum compromisso agendado para os próximos dias.</p>
                </div>
              </div>
            </div>
          )}
          {(activeTab === "compromissos" || activeTab === "tarefas" || activeTab === "atendimentos" || activeTab === "notificacoes") && !selectedMatter && renderPortalSupportState()}
        </div>
      </main>

      <BottomSheet
        open={mobileMoreOpen}
        onOpenChange={setMobileMoreOpen}
        title="Mais opções"
        description="Acesse documentos, audiências, financeiro, perfil e suporte"
      >
        <div className="portal-mobile-more-grid">
          {mobileMoreItems.map((item) => (
            <button
              className="portal-mobile-more-item"
              key={item.key}
              type="button"
              onClick={() => handleSidebarClick(item.key)}
            >
              <span className="sidebar-icon"><item.Icon /></span>
              <span>{item.label}</span>
              {item.badge && <span className="sidebar-badge">{item.badge}</span>}
            </button>
          ))}
          <button className="portal-mobile-more-item is-danger" type="button" onClick={handleLogout}>
            <span className="sidebar-icon"><Icon.Logout /></span>
            <span>Sair da conta</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
