import React, { useState, useMemo, useRef, createContext, useContext, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  LayoutDashboard, Users, CalendarDays, Package, MapPin, Boxes, Search, Plus, X,
  Phone, MessageCircle, Upload, FileText, Trash2, Pencil, Download, Printer,
  ChevronLeft, ChevronRight, Check, Clock, AlertTriangle, Stethoscope, Ear,
  ClipboardList, FileCheck2, Building2, ChevronDown, ArrowRight, BadgeCheck,
  CalendarClock, Wallet, PackageCheck, PackageSearch, UserPlus, Save,
  MoreVertical, Gift, Truck, ShieldCheck, ArrowLeft, RefreshCw, Menu, Sparkles,
  LogOut
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { AuthProvider, useAuth } from "./auth/AuthProvider.jsx";
import Login from "./auth/Login.jsx";
import { isSupabaseConfigured } from "./lib/supabaseClient.js";
import * as api from "./data/api.js";
import { exportPedidoXlsx } from "./lib/exportPedidoXlsx.js";
import imouvirLogo from "./assets/imouvir-logo.png";

/* =========================================================================
   IMOUVIR · CRM — Design tokens
   Paleta derivada do site institucional (theme-color #0a7f83)
   ========================================================================= */
const C = {
  teal: "#0a7f83",
  tealDark: "#075e61",
  tealDarker: "#0b2e2f",
  tealInk: "#06282a",
  cream: "#f5f8f7",
  card: "#ffffff",
  ink: "#132625",
  sub: "#5c7473",
  border: "#e3ebe9",
  coral: "#ff6b4a",
  coralDark: "#e2532f",
  amber: "#c98a1f",
  amberBg: "#fbf1de",
  green: "#1f8f61",
  greenBg: "#e3f5ec",
  red: "#d64545",
  redBg: "#fbe9e8",
  blue: "#3272a6",
  blueBg: "#e8f1f8",
};

const FONTS = `
.imv-t-105{font-size:10.5px}
.imv-t-11{font-size:11px}
.imv-t-115{font-size:11.5px}
.imv-t-12{font-size:12px}
.imv-t-125{font-size:12.5px}
.imv-t-13{font-size:13px}
.imv-t-135{font-size:13.5px}
.imv-t-14{font-size:14px}
.imv-t-15{font-size:15px}
.imv-t-16{font-size:16px}
.imv-t-165{font-size:16.5px}
.imv-t-17{font-size:17px}
.imv-t-19{font-size:19px}
.imv-t-24{font-size:24px}
.imv-minw-20{min-width:20px}
.imv-minw-160{min-width:160px}
.imv-minw-180{min-width:180px}
.imv-minw-220{min-width:220px}
.imv-maxw-560{max-width:560px}
.imv-maxw-820{max-width:820px}
.imv-w-248{width:248px}
.imv-w-62p{width:62%}
.imv-z-60{z-index:60}
.imv-trk-014{letter-spacing:0.14em}
.imv-mt-1px{margin-top:1px}
.imv-gap-2px{gap:2px}
.imv-hover-tint5:hover{background:rgba(0,0,0,0.05)}
.imv-hover-tint3:hover{background:rgba(0,0,0,0.03)}
@media (min-width: 1024px){ .imv-w-248{width:248px} }

@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap');
`;


const CONDICOES_PAGAMENTO = [
  { codigo: "001", descricao: "DEPÓSITO EM CONTA" },
  { codigo: "CIELO", descricao: "PAGAMENTO CARTÃO" },
  { codigo: "009", descricao: "BOLETO 30 DIAS" },
  { codigo: "102", descricao: "2X BOLETO" },
  { codigo: "011", descricao: "3X BOLETO" },
  { codigo: "086", descricao: "4X BOLETO" },
  { codigo: "105", descricao: "5X BOLETO" },
  { codigo: "100", descricao: "6X BOLETO" },
];

const FABRICANTES = ["ATOMED PRODUTOS MEDICOS E DE AUX. HUMANO LTDA.", "TELEX", "Outra distribuidora"];


/* =========================================================================
   Helpers
   ========================================================================= */
function onlyDigits(s = "") { return String(s).replace(/\D/g, ""); }

function formatPhone(v = "") {
  const d = onlyDigits(v).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function waLink(phone, message) {
  const d = onlyDigits(phone);
  if (!d) return null;
  const full = d.startsWith("55") ? d : `55${d}`;
  return `https://wa.me/${full}?text=${encodeURIComponent(message || "")}`;
}

function formatBRL(n) {
  const v = Number(n) || 0;
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function pad2(n) { return String(n).padStart(2, "0"); }

/* Datas "YYYY-MM-DD" vindas do banco (colunas `date`) são puros calendários,
   sem fuso — não podem passar por `new Date(string)`, pois o JS interpreta
   esse formato como UTC e o navegador exibe no fuso local, deslocando o dia
   (ex.: em UTC-3/4 sempre recua 1 dia). Por isso tratamos essas strings
   diretamente, sem criar um Date a partir delas. */
function isDateOnlyString(v) {
  return typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);
}

function formatDateBR(dateLike) {
  if (isDateOnlyString(dateLike)) {
    const [y, m, d] = dateLike.slice(0, 10).split("-");
    return `${d}/${m}/${y}`;
  }
  const d = new Date(dateLike);
  if (isNaN(d)) return "—";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function formatDateInputValue(dateLike) {
  if (isDateOnlyString(dateLike)) return dateLike.slice(0, 10);
  const d = new Date(dateLike);
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDays(dateLike, days) {
  const d = new Date(dateLike);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a, b) {
  return formatDateInputValue(a) === formatDateInputValue(b);
}

function startOfMonth(d) { const x = new Date(d); x.setDate(1); x.setHours(0, 0, 0, 0); return x; }
function endOfMonth(d) { const x = new Date(d); x.setMonth(x.getMonth() + 1, 0); x.setHours(23, 59, 59, 999); return x; }

function cx(...a) { return a.filter(Boolean).join(" "); }

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

const today = new Date();


/* =========================================================================
   Contexto global
   ========================================================================= */
const CRM = createContext(null);
const useCRM = () => useContext(CRM);

const STATUS_PACIENTE = ["Novo Contato", "Teste Agendado", "Aguardando Decisão", "Pedido em Andamento", "Aguardando Retorno", "Adaptado", "Inativo"];
const STATUS_PACIENTE_COR = {
  "Novo Contato": C.blue, "Teste Agendado": C.amber, "Aguardando Decisão": C.coral,
  "Pedido em Andamento": C.teal, "Aguardando Retorno": C.amber, "Adaptado": C.green, "Inativo": C.sub,
};
const TIPOS_AGENDAMENTO = ["Avaliação e Teste", "Confirmação de Retorno", "Entrega e Adaptação", "Retorno de Acompanhamento"];
const STATUS_AGENDAMENTO = ["Agendado", "Confirmado", "Realizado", "Não Compareceu", "Cancelado"];
const STATUS_AGENDAMENTO_COR = {
  "Agendado": C.amber, "Confirmado": C.green, "Realizado": C.blue, "Não Compareceu": C.red, "Cancelado": C.sub,
};
const STATUS_PEDIDO = ["Aguardando Faturamento", "Faturado", "Enviado", "Entregue e Documentado"];
const STATUS_PEDIDO_COR = {
  "Aguardando Faturamento": C.amber, "Faturado": C.blue, "Enviado": C.teal, "Entregue e Documentado": C.green,
};
const TIPOS_DOCUMENTO = ["Audiometria", "Comprovante de Pagamento", "Documento Pessoal", "Termo Assinado", "Outro"];

/* =========================================================================
   Primitivos de UI
   ========================================================================= */
function Btn({ children, variant = "primary", size = "md", icon: Icon, className, ...props }) {
  const sizes = { sm: "px-3 py-1.5 imv-t-13 gap-1.5", md: "px-4 py-2.5 text-sm gap-2", lg: "px-5 py-3 imv-t-15 gap-2" };
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap";
  const styles = {
    primary: { background: `linear-gradient(180deg, ${C.teal}, ${C.tealDark})`, color: "#fff", boxShadow: "0 1px 2px rgba(6,40,42,0.25)" },
    coral: { background: `linear-gradient(180deg, ${C.coral}, ${C.coralDark})`, color: "#fff", boxShadow: "0 1px 2px rgba(226,83,47,0.3)" },
    ghost: { background: "transparent", color: C.ink, border: `1px solid ${C.border}` },
    subtle: { background: C.cream, color: C.tealDark, border: `1px solid ${C.border}` },
    danger: { background: C.redBg, color: C.red, border: `1px solid #f2c9c7` },
    whatsapp: { background: "linear-gradient(180deg,#2fbd60,#22a552)", color: "#fff" },
  };
  return (
    <button className={cx(base, sizes[size], className)} style={styles[variant]} {...props}>
      {Icon ? <Icon size={size === "sm" ? 14 : 16} strokeWidth={2.3} /> : null}
      {children}
    </button>
  );
}

function IconBtn({ icon: Icon, title, onClick, tone = "default", size = 16 }) {
  const tones = { default: C.sub, danger: C.red, teal: C.teal };
  return (
    <button
      title={title}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-md imv-hover-tint5 transition-colors"
      style={{ width: 30, height: 30, color: tones[tone] }}
    >
      <Icon size={size} />
    </button>
  );
}

function Badge({ children, color = C.sub, bg }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 imv-t-115 font-bold uppercase tracking-wide"
      style={{ color, background: bg || `${color}1a` }}
    >
      {children}
    </span>
  );
}

function StatusDot({ color }) {
  return <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: color }} />;
}

function Field({ label, children, hint, required }) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="imv-t-125 font-bold" style={{ color: C.tealDark }}>
          {label} {required ? <span style={{ color: C.coral }}>*</span> : null}
        </span>
      ) : null}
      {children}
      {hint ? <span className="imv-t-115" style={{ color: C.sub }}>{hint}</span> : null}
    </label>
  );
}

const inputStyle = {
  border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "9px 12px", fontSize: 14,
  color: C.ink, background: "#fff", outline: "none", fontFamily: "Inter, sans-serif", width: "100%",
};

function Input(props) { return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />; }
function Textarea(props) { return <textarea {...props} style={{ ...inputStyle, ...(props.style || {}), resize: "vertical" }} />; }
function Select({ children, ...props }) {
  return (
    <div className="relative">
      <select {...props} style={{ ...inputStyle, appearance: "none", paddingRight: 32 }} className="cursor-pointer">
        {children}
      </select>
      <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
    </div>
  );
}

function Modal({ open, onClose, title, subtitle, children, width = 560, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-8 px-4" style={{ background: "rgba(6,40,42,0.45)" }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full rounded-2xl shadow-2xl" style={{ maxWidth: width, background: C.card, border: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-4 px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h3 className="imv-t-17 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{title}</h3>
            {subtitle ? <p className="mt-0.5 imv-t-13" style={{ color: C.sub }}>{subtitle}</p> : null}
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5 shrink-0"><X size={18} style={{ color: C.sub }} /></button>
        </div>
        <div className="px-6 py-5" style={{ maxHeight: "70vh", overflowY: "auto" }}>{children}</div>
        {footer ? <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${C.border}`, background: C.cream, borderRadius: "0 0 16px 16px" }}>{footer}</div> : null}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-16 text-center" style={{ background: C.cream, border: `1.5px dashed ${C.border}` }}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: `${C.teal}14` }}>
        <Icon size={24} style={{ color: C.teal }} />
      </div>
      <div>
        <p className="imv-t-15 font-bold" style={{ color: C.ink }}>{title}</p>
        <p className="mx-auto mt-1 max-w-sm imv-t-135" style={{ color: C.sub }}>{text}</p>
      </div>
      {action}
    </div>
  );
}

function Avatar({ nome, size = 38 }) {
  const initials = (nome || "?").split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();
  const hues = [C.teal, C.coral, C.blue, C.amber, C.green];
  const hue = hues[(nome || "").length % hues.length];
  return (
    <div className="flex items-center justify-center rounded-full font-bold shrink-0" style={{ width: size, height: size, background: `${hue}20`, color: hue, fontSize: size * 0.36, fontFamily: "Manrope, sans-serif" }}>
      {initials}
    </div>
  );
}

/* Onda sonora — elemento de assinatura visual (identidade auditiva) */
function SoundWave({ size = 22, color = "#ffffff", animate = true, bars = 5 }) {
  const heights = [0.4, 0.75, 1, 0.6, 0.85];
  return (
    <div className="flex items-end imv-gap-2px" style={{ height: size }}>
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={animate ? "imv-wave-bar" : ""}
          style={{
            width: Math.max(2, size * 0.11), height: `${(heights[i % heights.length]) * 100}%`,
            background: color, borderRadius: 2, animationDelay: `${i * 0.12}s`,
          }}
        />
      ))}
    </div>
  );
}

function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.12)" }}>
        <SoundWave size={18} color="#ffffff" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="imv-t-15 font-extrabold tracking-tight text-white" style={{ fontFamily: "Manrope, sans-serif" }}>IMOUVIR</div>
          <div className="imv-t-105 font-semibold uppercase imv-trk-014" style={{ color: "rgba(255,255,255,0.55)" }}>CRM · Saúde Auditiva</div>
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Sidebar & Topbar
   ========================================================================= */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "pacientes", label: "Pacientes", icon: Users },
  { id: "agenda", label: "Agenda", icon: CalendarDays },
  { id: "pedidos", label: "Pedidos", icon: Package },
  { id: "catalogo", label: "Catálogo de Aparelhos", icon: Boxes },
  { id: "unidades", label: "Unidades", icon: MapPin },
];

function Sidebar({ page, setPage, mobileOpen, setMobileOpen, profile, user, signOut }) {
  const { patients, appointments, orders } = useCRM();
  const nomeUsuario = profile?.nome || user?.email || "Usuário";
  const cargoUsuario = profile?.cargo || "Equipe IMOUVIR";
  const pendentesAmanha = appointments.filter((a) => isSameDay(a.data, addDays(today, 1)) && a.status !== "Cancelado" && a.status !== "Realizado" && !a.confirmadoEm).length;
  const pedidosAguardando = orders.filter((o) => o.status === "Aguardando Faturamento").length;

  const badgeFor = (id) => {
    if (id === "agenda" && pendentesAmanha > 0) return pendentesAmanha;
    if (id === "pedidos" && pedidosAguardando > 0) return pedidosAguardando;
    return null;
  };

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={cx("fixed z-40 flex h-full imv-w-248 flex-col justify-between px-4 py-5 transition-transform lg:sticky lg:top-0 lg:translate-x-0", mobileOpen ? "translate-x-0" : "-translate-x-full")}
        style={{ background: `linear-gradient(185deg, ${C.tealDarker}, ${C.tealInk})` }}
      >
        <div>
          <div className="px-1.5 pb-6">
            <Logo />
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active = page === item.id;
              const badge = badgeFor(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => { setPage(item.id); setMobileOpen(false); }}
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 imv-t-135 font-semibold transition-colors"
                  style={{ background: active ? "rgba(255,255,255,0.14)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.65)" }}
                >
                  <span className="flex items-center gap-3">
                    <item.icon size={17} strokeWidth={2.2} />
                    {item.label}
                  </span>
                  {badge ? (
                    <span className="flex h-5 imv-minw-20 items-center justify-center rounded-full px-1 imv-t-105 font-extrabold" style={{ background: C.coral, color: "#fff" }}>
                      {badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl px-3.5 py-3.5" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5">
            <Avatar nome={nomeUsuario} size={34} />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate imv-t-13 font-bold text-white">{nomeUsuario}</div>
              <div className="imv-t-11" style={{ color: "rgba(255,255,255,0.55)" }}>{cargoUsuario}</div>
            </div>
            <button title="Sair" onClick={signOut} className="rounded-md p-1.5" style={{ color: "rgba(255,255,255,0.55)" }}>
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, onMenu, right }) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b px-5 py-4 backdrop-blur lg:px-8" style={{ background: "rgba(245,248,247,0.9)", borderColor: C.border }}>
      <div className="flex items-center gap-3">
        <button onClick={onMenu} className="rounded-lg p-1.5 hover:bg-black/5 lg:hidden"><Menu size={20} style={{ color: C.ink }} /></button>
        <div>
          <h1 className="imv-t-19 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{title}</h1>
          {subtitle ? <p className="imv-t-13" style={{ color: C.sub }}>{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}

/* =========================================================================
   Dashboard
   ========================================================================= */
function Dashboard({ goTo }) {
  const { patients, appointments, orders, units } = useCRM();

  const amanha = appointments
    .filter((a) => isSameDay(a.data, addDays(today, 1)) && a.status !== "Cancelado")
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const pacientesAtivos = patients.filter((p) => p.status !== "Inativo").length;
  const pedidosAndamento = orders.filter((o) => o.status !== "Entregue e Documentado").length;
  const aguardandoFaturamento = orders.filter((o) => o.status === "Aguardando Faturamento");
  const faturamentoMes = orders
    .filter((o) => o.nf && new Date(o.nf.data).getMonth() === today.getMonth() && new Date(o.nf.data).getFullYear() === today.getFullYear())
    .reduce((s, o) => s + o.itens.reduce((si, it) => si + it.quantidade * it.precoUnitario, 0), 0);

  const semanaData = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(today, i);
    const count = appointments.filter((a) => isSameDay(a.data, d) && a.status !== "Cancelado").length;
    return { dia: `${DIAS_SEMANA[d.getDay()]} ${pad2(d.getDate())}`, agendamentos: count };
  });

  const pedidosPorStatus = STATUS_PEDIDO.map((s) => ({ name: s, value: orders.filter((o) => o.status === s).length })).filter((x) => x.value > 0);
  const pieCores = { "Aguardando Faturamento": C.amber, "Faturado": C.blue, "Enviado": C.teal, "Entregue e Documentado": C.green };

  const pacientesPorStatus = STATUS_PACIENTE.map((s) => ({ status: s, n: patients.filter((p) => p.status === s).length }));

  return (
    <div className="flex flex-col gap-6 p-5 lg:p-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard icon={Users} label="Pacientes ativos" value={pacientesAtivos} tone={C.teal} onClick={() => goTo("pacientes")} />
        <KpiCard icon={CalendarClock} label="Confirmar amanhã" value={amanha.filter((a) => !a.confirmadoEm).length} tone={C.coral} onClick={() => goTo("agenda")} />
        <KpiCard icon={PackageSearch} label="Aguardando faturamento" value={aguardandoFaturamento.length} tone={C.amber} onClick={() => goTo("pedidos")} />
        <KpiCard icon={Wallet} label="Faturado este mês" value={formatBRL(faturamentoMes)} tone={C.green} small />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Confirmações de amanhã */}
        <div className="rounded-2xl p-5 xl:col-span-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Confirmações de amanhã · {formatDateBR(addDays(today, 1))}</h3>
            <Badge color={C.coral}>{amanha.length} agendamento{amanha.length === 1 ? "" : "s"}</Badge>
          </div>
          {amanha.length === 0 ? (
            <EmptyState icon={CalendarDays} title="Nenhum agendamento amanhã" text="Quando houver atendimentos marcados para amanhã, eles aparecem aqui para confirmação rápida via WhatsApp." />
          ) : (
            <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
              {amanha.map((a) => {
                const p = patients.find((x) => x.id === a.pacienteId);
                const u = units.find((x) => x.id === a.unidadeId);
                const msg = `Olá ${p?.nome?.split(" ")[0] || ""}, aqui é da IMOUVIR! Passando para confirmar seu atendimento amanhã, dia ${formatDateBR(a.data)} às ${a.hora}, com ${a.profissional || "nossa equipe"} — ${u?.cidade || ""}. Podemos confirmar sua presença? 😊`;
                return (
                  <div key={a.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar nome={p?.nome} size={36} />
                    <div className="imv-minw-160 flex-1">
                      <div className="imv-t-135 font-bold" style={{ color: C.ink }}>{p?.nome}</div>
                      <div className="imv-t-12" style={{ color: C.sub }}>{a.tipo} · {a.hora} · {u?.cidade}</div>
                    </div>
                    {a.confirmadoEm ? (
                      <Badge color={C.green}><Check size={11} /> Confirmado</Badge>
                    ) : (
                      <a href={waLink(p?.telefone, msg)} target="_blank" rel="noreferrer">
                        <Btn variant="whatsapp" size="sm" icon={MessageCircle}>Confirmar</Btn>
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline pacientes */}
        <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-4 imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Jornada dos pacientes</h3>
          <div className="flex flex-col gap-3">
            {pacientesPorStatus.map((s) => (
              <div key={s.status}>
                <div className="mb-1 flex items-center justify-between imv-t-125">
                  <span className="flex items-center gap-1.5 font-semibold" style={{ color: C.ink }}>
                    <StatusDot color={STATUS_PACIENTE_COR[s.status]} /> {s.status}
                  </span>
                  <span className="font-bold" style={{ color: C.sub }}>{s.n}</span>
                </div>
                <div className="h-1.5 w-full rounded-full" style={{ background: C.cream }}>
                  <div className="h-1.5 rounded-full" style={{ width: `${patients.length ? (s.n / patients.length) * 100 : 0}%`, background: STATUS_PACIENTE_COR[s.status] }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Bar chart agendamentos */}
        <div className="rounded-2xl p-5 lg:col-span-3" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-1 imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Agendamentos — próximos 7 dias</h3>
          <p className="mb-3 imv-t-125" style={{ color: C.sub }}>Distribuição de atendimentos marcados por dia.</p>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer>
              <BarChart data={semanaData} barSize={28}>
                <CartesianGrid vertical={false} stroke={C.border} />
                <XAxis dataKey="dia" tick={{ fontSize: 11, fill: C.sub }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: C.sub }} axisLine={false} tickLine={false} width={24} />
                <Tooltip cursor={{ fill: "rgba(10,127,131,0.06)" }} contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                <Bar dataKey="agendamentos" radius={[6, 6, 0, 0]} fill={C.teal} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart pedidos */}
        <div className="rounded-2xl p-5 lg:col-span-2" style={{ background: C.card, border: `1px solid ${C.border}` }}>
          <h3 className="mb-1 imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Pedidos por etapa</h3>
          <p className="mb-3 imv-t-125" style={{ color: C.sub }}>Status de todos os pedidos ativos.</p>
          {pedidosPorStatus.length === 0 ? (
            <EmptyState icon={Package} title="Sem pedidos" text="Novos pedidos aparecerão aqui." />
          ) : (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pedidosPorStatus} dataKey="value" nameKey="name" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {pedidosPorStatus.map((entry, i) => <Cell key={i} fill={pieCores[entry.name]} />)}
                  </Pie>
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 11.5 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Pedidos aguardando faturamento */}
      <div className="rounded-2xl p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="imv-t-15 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Pedidos aguardando faturamento</h3>
          <button onClick={() => goTo("pedidos")} className="flex items-center gap-1 imv-t-125 font-bold" style={{ color: C.teal }}>Ver todos <ArrowRight size={13} /></button>
        </div>
        {aguardandoFaturamento.length === 0 ? (
          <EmptyState icon={PackageCheck} title="Tudo faturado" text="Não há pedidos pendentes de faturamento no momento." />
        ) : (
          <div className="flex flex-col divide-y" style={{ borderColor: C.border }}>
            {aguardandoFaturamento.map((o) => {
              const p = patients.find((x) => x.id === o.pacienteId);
              const total = o.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
              return (
                <div key={o.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="rounded-lg px-2.5 py-1 font-mono imv-t-12 font-bold" style={{ background: C.cream, color: C.tealDark }}>{o.numero}</div>
                  <div className="imv-minw-160 flex-1 imv-t-135 font-bold" style={{ color: C.ink }}>{p?.nome}</div>
                  <div className="imv-t-13 font-bold" style={{ color: C.ink }}>{formatBRL(total)}</div>
                  <Badge color={STATUS_PEDIDO_COR[o.status]}>{o.status}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, tone, onClick, small }) {
  return (
    <button onClick={onClick} disabled={!onClick} className="flex flex-col gap-3 rounded-2xl p-4 text-left transition-transform disabled:cursor-default lg:p-5" style={{ background: C.card, border: `1px solid ${C.border}` }}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${tone}18` }}>
        <Icon size={19} style={{ color: tone }} />
      </div>
      <div>
        <div className={small ? "imv-t-19 font-extrabold" : "imv-t-24 font-extrabold"} style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{value}</div>
        <div className="imv-t-125 font-semibold" style={{ color: C.sub }}>{label}</div>
      </div>
    </button>
  );
}

/* =========================================================================
   Pacientes
   ========================================================================= */
function PacientesPage() {
  const { patients } = useCRM();
  const [query, setQuery] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [selectedId, setSelectedId] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const filtered = patients.filter((p) => {
    const matchQ = (p.nome + p.telefone + p.cidade).toLowerCase().includes(query.toLowerCase());
    const matchS = statusFiltro === "Todos" || p.status === statusFiltro;
    return matchQ && matchS;
  });

  const selected = patients.find((p) => p.id === selectedId);

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 imv-minw-220">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
          <Input placeholder="Buscar por nome, telefone ou cidade…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="w-full sm:w-56">
          <Select value={statusFiltro} onChange={(e) => setStatusFiltro(e.target.value)}>
            <option>Todos</option>
            {STATUS_PACIENTE.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </div>
        <Btn icon={UserPlus} onClick={() => setShowNew(true)}>Novo Paciente</Btn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Nenhum paciente encontrado" text="Ajuste a busca ou cadastre um novo paciente para iniciar o acompanhamento." />
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => {
            const pendencias = p.documentos.length === 0;
            return (
              <button key={p.id} onClick={() => setSelectedId(p.id)} className="flex flex-col gap-3 rounded-2xl p-4 text-left transition-shadow hover:shadow-md" style={{ background: C.card, border: `1px solid ${C.border}` }}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar nome={p.nome} />
                    <div>
                      <div className="imv-t-14 font-bold leading-tight" style={{ color: C.ink }}>{p.nome}</div>
                      <div className="imv-t-12" style={{ color: C.sub }}>{p.cidade}/{p.uf}</div>
                    </div>
                  </div>
                  <Badge color={STATUS_PACIENTE_COR[p.status]}>{p.status}</Badge>
                </div>
                <div className="flex items-center justify-between imv-t-125" style={{ color: C.sub }}>
                  <span className="flex items-center gap-1.5"><Phone size={13} /> {formatPhone(p.telefone)}</span>
                  {pendencias ? <span className="flex items-center gap-1 font-semibold" style={{ color: C.coral }}><AlertTriangle size={12} /> Sem exame</span> : <span className="flex items-center gap-1 font-semibold" style={{ color: C.green }}><FileCheck2 size={12} /> {p.documentos.length} doc.</span>}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selected && <PatientDrawer patient={selected} onClose={() => setSelectedId(null)} />}
      {showNew && <NewPatientModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewPatientModal({ onClose }) {
  const { createPatientFn } = useCRM();
  const [form, setForm] = useState({ nome: "", telefone: "", cpf: "", dataNascimento: "", cidade: "", uf: "", endereco: "", fonoaudiologo: "", observacoes: "" });
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = async () => {
    if (!form.nome.trim() || !onlyDigits(form.telefone)) return;
    setSaving(true);
    await createPatientFn({ ...form, telefone: onlyDigits(form.telefone), status: "Novo Contato" }, "Paciente cadastrado no CRM.");
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title="Novo paciente" subtitle="Cadastre os dados iniciais de contato." width={540}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar} disabled={saving}>{saving ? "Salvando…" : "Salvar paciente"}</Btn></>}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><Field label="Nome completo" required><Input value={form.nome} onChange={set("nome")} placeholder="Ex.: Maria da Silva" /></Field></div>
        <Field label="WhatsApp" required><Input value={formatPhone(form.telefone)} onChange={set("telefone")} placeholder="(65) 99999-9999" /></Field>
        <Field label="CPF"><Input value={form.cpf} onChange={set("cpf")} placeholder="000.000.000-00" /></Field>
        <Field label="Data de nascimento"><Input type="date" value={form.dataNascimento} onChange={set("dataNascimento")} /></Field>
        <Field label="Cidade"><Input value={form.cidade} onChange={set("cidade")} placeholder="Ex.: Cuiabá" /></Field>
        <Field label="UF"><Input value={form.uf} onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))} maxLength={2} placeholder="MT" /></Field>
        <div className="sm:col-span-2"><Field label="Endereço"><Input value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro, CEP" /></Field></div>
        <div className="sm:col-span-2"><Field label="Fonoaudiólogo responsável"><Input value={form.fonoaudiologo} onChange={set("fonoaudiologo")} placeholder="Ex.: Dra. Camila Rezende" /></Field></div>
        <div className="sm:col-span-2"><Field label="Observações"><Textarea rows={3} value={form.observacoes} onChange={set("observacoes")} placeholder="Queixa principal, indicação, etc." /></Field></div>
      </div>
    </Modal>
  );
}

function PatientDrawer({ patient, onClose }) {
  const { appointments, orders, units, updatePatientFieldsFn, addPatientHistoricoFn, addPatientDocumentosFn, removePatientDocumentoFn } = useCRM();
  const [tab, setTab] = useState("dados");
  const [draft, setDraft] = useState(patient);
  const [savingDados, setSavingDados] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { setDraft(patient); }, [patient.id]);

  const setDraftField = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));

  const salvarDados = async () => {
    setSavingDados(true);
    await updatePatientFieldsFn(patient.id, {
      nome: draft.nome, telefone: draft.telefone, dataNascimento: draft.dataNascimento, cpf: draft.cpf,
      cidade: draft.cidade, uf: draft.uf, endereco: draft.endereco, fonoaudiologo: draft.fonoaudiologo, observacoes: draft.observacoes,
    });
    setSavingDados(false);
  };

  const alterarStatus = async (novoStatus) => {
    await updatePatientFieldsFn(patient.id, { status: novoStatus });
    await addPatientHistoricoFn(patient.id, `Status alterado para "${novoStatus}".`);
  };

  const handleFiles = async (fileList, tipo) => {
    setUploading(true);
    await addPatientDocumentosFn(patient.id, fileList, tipo);
    setUploading(false);
  };

  const removeDoc = (doc) => removePatientDocumentoFn(patient.id, doc);

  const handleDownload = async (doc) => {
    const url = await api.getDocumentUrl(doc.storagePath);
    window.open(url, "_blank", "noopener");
  };

  const patientAppointments = appointments.filter((a) => a.pacienteId === patient.id).sort((a, b) => new Date(b.data) - new Date(a.data));
  const patientOrders = orders.filter((o) => o.pacienteId === patient.id);

  const tabs = [
    { id: "dados", label: "Dados Gerais" },
    { id: "docs", label: `Documentos (${patient.documentos.length})` },
    { id: "agenda", label: `Agendamentos (${patientAppointments.length})` },
    { id: "pedidos", label: `Pedidos (${patientOrders.length})` },
    { id: "historico", label: "Histórico" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "rgba(6,40,42,0.45)" }} onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex h-full w-full imv-maxw-560 flex-col" style={{ background: C.card }}>
        <div className="flex items-start justify-between gap-3 px-6 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="flex items-center gap-3">
            <Avatar nome={patient.nome} size={46} />
            <div>
              <h3 className="imv-t-165 font-extrabold leading-tight" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{patient.nome}</h3>
              <div className="mt-1 flex items-center gap-2">
                <Select value={patient.status} onChange={(e) => alterarStatus(e.target.value)} style={{ width: "auto" }}>
                  {STATUS_PACIENTE.map((s) => <option key={s}>{s}</option>)}
                </Select>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-black/5"><X size={18} style={{ color: C.sub }} /></button>
        </div>

        <div className="flex items-center gap-3 px-6 py-3" style={{ borderBottom: `1px solid ${C.border}`, background: C.cream }}>
          <a href={waLink(patient.telefone, `Olá ${patient.nome.split(" ")[0]}, aqui é da IMOUVIR!`)} target="_blank" rel="noreferrer" className="flex-1">
            <Btn variant="whatsapp" size="sm" icon={MessageCircle} className="w-full">{formatPhone(patient.telefone)}</Btn>
          </a>
          <span className="imv-t-125 font-semibold" style={{ color: C.sub }}>{patient.cidade}{patient.uf ? `/${patient.uf}` : ""}</span>
        </div>

        <div className="flex gap-1 overflow-x-auto px-4 pt-3" style={{ borderBottom: `1px solid ${C.border}` }}>
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className="whitespace-nowrap rounded-t-lg px-3.5 py-2.5 imv-t-125 font-bold" style={{ color: tab === t.id ? C.teal : C.sub, borderBottom: tab === t.id ? `2.5px solid ${C.teal}` : "2.5px solid transparent" }}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {tab === "dados" && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nome completo"><Input value={draft.nome} onChange={setDraftField("nome")} /></Field>
                <Field label="WhatsApp"><Input value={formatPhone(draft.telefone)} onChange={(e) => setDraft((d) => ({ ...d, telefone: onlyDigits(e.target.value) }))} /></Field>
                <Field label="Data de nascimento"><Input type="date" value={draft.dataNascimento} onChange={setDraftField("dataNascimento")} /></Field>
                <Field label="CPF"><Input value={draft.cpf} onChange={setDraftField("cpf")} placeholder="000.000.000-00" /></Field>
                <Field label="Cidade"><Input value={draft.cidade} onChange={setDraftField("cidade")} /></Field>
                <Field label="UF"><Input value={draft.uf} maxLength={2} onChange={(e) => setDraft((d) => ({ ...d, uf: e.target.value.toUpperCase() }))} /></Field>
                <div className="sm:col-span-2"><Field label="Endereço"><Input value={draft.endereco} onChange={setDraftField("endereco")} placeholder="Rua, número, bairro, CEP" /></Field></div>
                <div className="sm:col-span-2"><Field label="Fonoaudiólogo responsável"><Input value={draft.fonoaudiologo} onChange={setDraftField("fonoaudiologo")} /></Field></div>
                <div className="sm:col-span-2"><Field label="Observações"><Textarea rows={4} value={draft.observacoes} onChange={setDraftField("observacoes")} /></Field></div>
              </div>
              <div>
                <Btn icon={Save} onClick={salvarDados} disabled={savingDados}>{savingDados ? "Salvando…" : "Salvar alterações"}</Btn>
              </div>
            </div>
          )}

          {tab === "docs" && (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border-2 border-dashed p-5 text-center" style={{ borderColor: C.border }}>
                <Upload size={22} className="mx-auto mb-2" style={{ color: C.teal }} />
                <p className="imv-t-13 font-semibold" style={{ color: C.ink }}>Anexar exame ou comprovante</p>
                <p className="mb-3 imv-t-12" style={{ color: C.sub }}>Audiometria trazida pessoalmente ou recebida por WhatsApp — o arquivo fica salvo na pasta digital do paciente.</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {TIPOS_DOCUMENTO.map((tipo) => (
                    <label key={tipo} className="cursor-pointer">
                      <input type="file" multiple hidden disabled={uploading} onChange={(e) => e.target.files.length && handleFiles(e.target.files, tipo)} />
                      <span className="inline-flex items-center rounded-lg px-3 py-1.5 imv-t-12 font-bold" style={{ background: C.cream, color: C.tealDark, border: `1px solid ${C.border}`, opacity: uploading ? 0.5 : 1 }}>+ {tipo}</span>
                    </label>
                  ))}
                </div>
                {uploading && <p className="mt-2 imv-t-12" style={{ color: C.sub }}>Enviando…</p>}
              </div>

              {patient.documentos.length === 0 ? (
                <EmptyState icon={FileText} title="Nenhum documento anexado" text="Anexe a audiometria do paciente para liberar o teste com o aparelho." />
              ) : (
                <div className="flex flex-col gap-2">
                  {patient.documentos.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${C.teal}18` }}><FileText size={16} style={{ color: C.teal }} /></div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate imv-t-13 font-bold" style={{ color: C.ink }}>{d.nome}</div>
                        <div className="imv-t-115" style={{ color: C.sub }}>{d.tipo} · {(d.tamanho / 1024).toFixed(0)} KB · {formatDateBR(d.dataUpload)}</div>
                      </div>
                      <IconBtn icon={Download} title="Baixar" tone="teal" onClick={() => handleDownload(d)} />
                      <IconBtn icon={Trash2} title="Remover" tone="danger" onClick={() => removeDoc(d)} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "agenda" && (
            <div className="flex flex-col gap-2">
              {patientAppointments.length === 0 ? <EmptyState icon={CalendarDays} title="Sem agendamentos" text="Este paciente ainda não possui atendimentos marcados." /> :
                patientAppointments.map((a) => {
                  const u = units.find((x) => x.id === a.unidadeId);
                  return (
                    <div key={a.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${STATUS_AGENDAMENTO_COR[a.status]}18` }}><CalendarDays size={16} style={{ color: STATUS_AGENDAMENTO_COR[a.status] }} /></div>
                      <div className="flex-1">
                        <div className="imv-t-13 font-bold" style={{ color: C.ink }}>{a.tipo}</div>
                        <div className="imv-t-115" style={{ color: C.sub }}>{formatDateBR(a.data)} às {a.hora} · {u?.cidade}</div>
                      </div>
                      <Badge color={STATUS_AGENDAMENTO_COR[a.status]}>{a.status}</Badge>
                    </div>
                  );
                })}
            </div>
          )}

          {tab === "pedidos" && (
            <div className="flex flex-col gap-2">
              {patientOrders.length === 0 ? <EmptyState icon={Package} title="Sem pedidos" text="Nenhum pedido de aparelho registrado para este paciente ainda." /> :
                patientOrders.map((o) => {
                  const total = o.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
                  return (
                    <div key={o.id} className="rounded-xl p-3" style={{ background: C.cream, border: `1px solid ${C.border}` }}>
                      <div className="flex items-center justify-between">
                        <span className="font-mono imv-t-125 font-bold" style={{ color: C.tealDark }}>{o.numero}</span>
                        <Badge color={STATUS_PEDIDO_COR[o.status]}>{o.status}</Badge>
                      </div>
                      <div className="mt-1.5 imv-t-125" style={{ color: C.sub }}>{o.itens.map((i) => i.nome).join(", ")}</div>
                      <div className="mt-1 imv-t-13 font-bold" style={{ color: C.ink }}>{formatBRL(total)}</div>
                    </div>
                  );
                })}
            </div>
          )}

          {tab === "historico" && (
            <div className="flex flex-col gap-0">
              {patient.historico.map((h, i) => (
                <div key={h.id} className="flex gap-3 pb-5">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full shrink-0" style={{ background: C.teal }} />
                    {i < patient.historico.length - 1 && <span className="w-px flex-1" style={{ background: C.border }} />}
                  </div>
                  <div>
                    <p className="imv-t-13 font-medium" style={{ color: C.ink }}>{h.texto}</p>
                    <p className="imv-t-115" style={{ color: C.sub }}>{formatDateBR(h.data)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   Agenda / Calendário
   ========================================================================= */
function AgendaPage() {
  const { appointments, patients, units } = useCRM();
  const [cursor, setCursor] = useState(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState(today);
  const [showNew, setShowNew] = useState(false);
  const [editing, setEditing] = useState(null);

  const monthStart = startOfMonth(cursor);
  const gridStart = addDays(monthStart, -monthStart.getDay());
  const days = Array.from({ length: 42 }).map((_, i) => addDays(gridStart, i));

  const dayAppointments = appointments
    .filter((a) => isSameDay(a.data, selectedDay))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const countFor = (d) => appointments.filter((a) => isSameDay(a.data, d) && a.status !== "Cancelado").length;

  return (
    <div className="flex flex-col gap-5 p-5 lg:flex-row lg:p-8">
      {/* Calendário */}
      <div className="rounded-2xl p-5 lg:imv-w-62p" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="imv-t-16 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{MESES[cursor.getMonth()]} {cursor.getFullYear()}</h3>
          <div className="flex items-center gap-1">
            <IconBtn icon={ChevronLeft} title="Mês anterior" onClick={() => setCursor(addDays(startOfMonth(cursor), -1))} />
            <Btn variant="subtle" size="sm" onClick={() => { setCursor(startOfMonth(today)); setSelectedDay(today); }}>Hoje</Btn>
            <IconBtn icon={ChevronRight} title="Próximo mês" onClick={() => setCursor(addDays(endOfMonth(cursor), 1))} />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center imv-t-11 font-bold" style={{ color: C.sub }}>
          {DIAS_SEMANA.map((d) => <div key={d} className="py-1.5">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((d, i) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const isToday = isSameDay(d, today);
            const isSelected = isSameDay(d, selectedDay);
            const n = countFor(d);
            return (
              <button key={i} onClick={() => setSelectedDay(d)}
                className="flex aspect-square flex-col items-center justify-center gap-0.5 rounded-xl imv-t-13 font-semibold transition-colors"
                style={{
                  background: isSelected ? C.teal : isToday ? `${C.teal}14` : "transparent",
                  color: isSelected ? "#fff" : inMonth ? C.ink : C.border,
                  border: isToday && !isSelected ? `1.5px solid ${C.teal}` : "1.5px solid transparent",
                }}>
                {d.getDate()}
                {n > 0 && <span className="h-1.5 w-1.5 rounded-full" style={{ background: isSelected ? "#fff" : C.coral }} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lista do dia */}
      <div className="flex flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="imv-t-16 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>{formatDateBR(selectedDay)}</h3>
            <p className="imv-t-125" style={{ color: C.sub }}>{dayAppointments.length} atendimento(s) marcado(s)</p>
          </div>
          <Btn icon={Plus} onClick={() => setShowNew(true)}>Agendar</Btn>
        </div>

        {dayAppointments.length === 0 ? (
          <EmptyState icon={CalendarDays} title="Sem atendimentos neste dia" text="Clique em “Agendar” para marcar uma avaliação, retorno ou entrega." />
        ) : (
          <div className="flex flex-col gap-3">
            {dayAppointments.map((a) => {
              const p = patients.find((x) => x.id === a.pacienteId);
              const u = units.find((x) => x.id === a.unidadeId);
              const isTomorrow = isSameDay(a.data, addDays(today, 1));
              const msg = `Olá ${p?.nome?.split(" ")[0] || ""}, aqui é da IMOUVIR! Passando para confirmar seu atendimento no dia ${formatDateBR(a.data)} às ${a.hora}, com ${a.profissional || "nossa equipe"} — unidade ${u?.cidade || ""}. Podemos confirmar sua presença? 😊`;
              return (
                <div key={a.id} className="rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}`, borderLeft: `4px solid ${STATUS_AGENDAMENTO_COR[a.status]}` }}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 flex-col items-center justify-center rounded-xl font-mono font-extrabold leading-none" style={{ background: C.cream, color: C.tealDark, fontSize: 12.5 }}>
                        {a.hora}
                      </div>
                      <div>
                        <div className="imv-t-14 font-bold" style={{ color: C.ink }}>{p?.nome}</div>
                        <div className="imv-t-125" style={{ color: C.sub }}>{a.tipo} · {u?.cidade} · {a.profissional || "Sem profissional definido"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge color={STATUS_AGENDAMENTO_COR[a.status]}>{a.status}</Badge>
                      <IconBtn icon={Pencil} title="Editar" onClick={() => setEditing(a)} />
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a href={waLink(p?.telefone, msg)} target="_blank" rel="noreferrer"><Btn variant="whatsapp" size="sm" icon={MessageCircle}>{a.confirmadoEm ? "Reenviar confirmação" : "Confirmar via WhatsApp"}</Btn></a>
                    {!a.confirmadoEm && <Btn variant="subtle" size="sm" icon={Check} onClick={() => setEditing({ ...a, __markConfirmed: true })}>Marcar confirmado</Btn>}
                    {a.confirmadoEm && <span className="flex items-center gap-1 imv-t-12 font-semibold" style={{ color: C.green }}><BadgeCheck size={14} /> Confirmado {formatDateBR(a.confirmadoEm)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showNew && <AppointmentModal defaultDate={selectedDay} onClose={() => setShowNew(false)} />}
      {editing && <AppointmentModal appointment={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function AppointmentModal({ appointment, defaultDate, onClose }) {
  const { patients, units, createAppointmentFn, updateAppointmentFn, deleteAppointmentFn } = useCRM();
  const isEdit = !!appointment && !appointment.__markConfirmed;
  const autoConfirm = appointment?.__markConfirmed;

  const [form, setForm] = useState({
    pacienteId: appointment?.pacienteId || patients[0]?.id || "",
    tipo: appointment?.tipo || TIPOS_AGENDAMENTO[0],
    data: appointment?.data || formatDateInputValue(defaultDate || today),
    hora: appointment?.hora || "09:00",
    unidadeId: appointment?.unidadeId || units[0]?.id,
    profissional: appointment?.profissional || "",
    status: appointment?.status || "Agendado",
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (autoConfirm) {
      updateAppointmentFn(appointment.id, { status: "Confirmado", confirmadoEm: new Date().toISOString() });
      onClose();
    }
    // eslint-disable-next-line
  }, []);
  if (autoConfirm) return null;

  const salvar = async () => {
    if (isEdit) {
      await updateAppointmentFn(appointment.id, form);
    } else {
      await createAppointmentFn({ ...form, confirmadoEm: null });
    }
    onClose();
  };

  const excluir = async () => { await deleteAppointmentFn(appointment.id); onClose(); };

  return (
    <Modal open onClose={onClose} title={isEdit ? "Editar agendamento" : "Novo agendamento"} width={520}
      footer={
        <div className="flex w-full items-center justify-between">
          {isEdit ? <Btn variant="danger" size="sm" icon={Trash2} onClick={excluir}>Excluir</Btn> : <span />}
          <div className="flex gap-2"><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar</Btn></div>
        </div>
      }>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="Paciente" required>
            <Select value={form.pacienteId} onChange={set("pacienteId")}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="Tipo de atendimento"><Select value={form.tipo} onChange={set("tipo")}>{TIPOS_AGENDAMENTO.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Unidade"><Select value={form.unidadeId} onChange={set("unidadeId")}>{units.map((u) => <option key={u.id} value={u.id}>{u.cidade}/{u.uf}</option>)}</Select></Field>
        <Field label="Data"><Input type="date" value={form.data} onChange={set("data")} /></Field>
        <Field label="Hora"><Input type="time" value={form.hora} onChange={set("hora")} /></Field>
        <Field label="Profissional"><Input value={form.profissional} onChange={set("profissional")} placeholder="Ex.: Dra. Camila Rezende" /></Field>
        <Field label="Status"><Select value={form.status} onChange={set("status")}>{STATUS_AGENDAMENTO.map((s) => <option key={s}>{s}</option>)}</Select></Field>
      </div>
    </Modal>
  );
}

/* =========================================================================
   Pedidos
   ========================================================================= */
function PedidosPage() {
  const { orders, patients, deleteOrderFn } = useCRM();
  const [statusFiltro, setStatusFiltro] = useState("Todos");
  const [showNew, setShowNew] = useState(false);
  const [openOrder, setOpenOrder] = useState(null);

  const filtered = orders.filter((o) => statusFiltro === "Todos" || o.status === statusFiltro).sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));

  const excluirPedido = (e, o) => {
    e.stopPropagation();
    if (window.confirm(`Excluir o pedido ${o.numero}? Essa ação não pode ser desfeita.`)) {
      deleteOrderFn(o.id);
    }
  };

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-1 gap-1.5 overflow-x-auto">
          {["Todos", ...STATUS_PEDIDO].map((s) => (
            <button key={s} onClick={() => setStatusFiltro(s)} className="whitespace-nowrap rounded-full px-3.5 py-1.5 imv-t-125 font-bold" style={{ background: statusFiltro === s ? C.teal : C.cream, color: statusFiltro === s ? "#fff" : C.sub }}>
              {s}
            </button>
          ))}
        </div>
        <Btn icon={Plus} onClick={() => setShowNew(true)}>Novo Pedido</Btn>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="Nenhum pedido nesta etapa" text="Crie um novo pedido a partir do catálogo de aparelhos configurado." />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((o) => {
            const p = patients.find((x) => x.id === o.pacienteId);
            const total = o.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
            const totalBoni = o.bonificacao.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
            return (
              <div
                key={o.id}
                role="button"
                tabIndex={0}
                onClick={() => setOpenOrder(o)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpenOrder(o); }}
                className="flex flex-wrap items-center gap-4 rounded-2xl p-4 text-left transition-shadow hover:shadow-md cursor-pointer"
                style={{ background: C.card, border: `1px solid ${C.border}` }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: `${STATUS_PEDIDO_COR[o.status]}18` }}>
                  <Package size={19} style={{ color: STATUS_PEDIDO_COR[o.status] }} />
                </div>
                <div className="imv-minw-180 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono imv-t-125 font-bold" style={{ color: C.tealDark }}>{o.numero}</span>
                    <span className="imv-t-135 font-bold" style={{ color: C.ink }}>{p?.nome}</span>
                  </div>
                  <div className="imv-t-12" style={{ color: C.sub }}>{o.itens.map((i) => `${i.quantidade}x ${i.nome}`).join(", ")}{totalBoni > 0 ? ` · +${o.bonificacao.length} item(ns) de bonificação` : ""}</div>
                </div>
                <div className="text-right">
                  <div className="imv-t-14 font-extrabold" style={{ color: C.ink }}>{formatBRL(total)}</div>
                  <div className="imv-t-11" style={{ color: C.sub }}>{formatDateBR(o.criadoEm)}</div>
                </div>
                <Badge color={STATUS_PEDIDO_COR[o.status]}>{o.status}</Badge>
                <IconBtn icon={Trash2} title="Excluir pedido" tone="danger" onClick={(e) => excluirPedido(e, o)} />
              </div>
            );
          })}
        </div>
      )}

      {showNew && <OrderFormModal onClose={() => setShowNew(false)} />}
      {openOrder && <OrderDetailModal order={openOrder} onClose={() => setOpenOrder(null)} />}
    </div>
  );
}

function ItemPicker({ label, items, onAdd }) {
  const { catalog } = useCRM();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  // Sem texto digitado, o botão de lista suspensa mostra o catálogo completo;
  // com texto, filtra por nome/código.
  const results = query.length > 0
    ? catalog.filter((c) => (c.nome + c.codigo).toLowerCase().includes(query.toLowerCase()))
    : catalog;

  return (
    <div className="relative">
      <Field label={label}>
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Buscar por nome ou código do aparelho/acessório…"
          />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            title="Ver lista completa do catálogo"
            className="flex shrink-0 items-center justify-center rounded-lg px-3"
            style={{ border: `1.5px solid ${C.border}`, background: "#fff" }}
          >
            <ChevronDown size={16} style={{ color: C.sub }} />
          </button>
        </div>
      </Field>
      {open && (
        <div className="absolute z-10 mt-1 max-h-64 w-full overflow-y-auto rounded-xl shadow-lg" style={{ background: "#fff", border: `1px solid ${C.border}` }}>
          {results.length === 0 ? (
            <p className="px-3.5 py-3 imv-t-12" style={{ color: C.sub }}>Nenhum item encontrado.</p>
          ) : (
            results.map((r) => (
              <button key={r.id} onClick={() => { onAdd(r); setQuery(""); setOpen(false); }} className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left imv-hover-tint3">
                <div>
                  <div className="imv-t-13 font-semibold" style={{ color: C.ink }}>{r.nome}</div>
                  <div className="font-mono imv-t-11" style={{ color: C.sub }}>Cód. {r.codigo || "—"} · {r.cat}</div>
                </div>
                <span className="imv-t-125 font-bold" style={{ color: C.teal }}>{formatBRL(r.preco)}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ItemsTable({ itens, setItens, bonificacao }) {
  const total = itens.reduce((s, it) => s + (Number(it.quantidade) || 0) * (Number(it.precoUnitario) || 0), 0);
  // Enquanto o usuário digita, aceitamos o texto cru (mesmo vazio) para não
  // "travar" o campo em 1 — o valor só é validado/arredondado ao sair do campo.
  const updateQty = (i, q) => setItens(itens.map((it, idx) => (idx === i ? { ...it, quantidade: q } : it)));
  const commitQty = (i) => setItens(itens.map((it, idx) => (idx === i ? { ...it, quantidade: Math.max(1, Math.round(Number(it.quantidade)) || 1) } : it)));
  const remove = (i) => setItens(itens.filter((_, idx) => idx !== i));

  if (itens.length === 0) return <p className="rounded-lg px-3 py-3 text-center imv-t-125" style={{ background: C.cream, color: C.sub }}>Nenhum item adicionado ainda.</p>;

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: `1px solid ${C.border}` }}>
      <table className="w-full imv-t-125">
        <thead><tr style={{ background: C.cream, color: C.sub }}>
          <th className="px-3 py-2 text-left font-bold">Código</th><th className="px-3 py-2 text-left font-bold">Descrição</th>
          <th className="w-20 px-2 py-2 text-center font-bold">Qtd</th>
          <th className="w-28 px-2 py-2 text-right font-bold">Total</th><th className="w-10 px-2 py-2"></th>
        </tr></thead>
        <tbody>
          {itens.map((it, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
              <td className="px-3 py-2 font-mono" style={{ color: C.sub }}>{it.codigo || "—"}</td>
              <td className="px-3 py-2 font-semibold" style={{ color: C.ink }}>{it.nome}{bonificacao ? <Gift size={11} className="ml-1 inline" style={{ color: C.coral }} /> : null}</td>
              <td className="px-2 py-2"><input type="number" min={1} value={it.quantidade} onChange={(e) => updateQty(i, e.target.value)} onBlur={() => commitQty(i)} className="w-full rounded-md px-1.5 py-1 text-center" style={{ border: `1px solid ${C.border}` }} /></td>
              <td className="px-2 py-2 text-right font-bold" style={{ color: C.ink }}>{formatBRL((Number(it.quantidade) || 0) * (Number(it.precoUnitario) || 0))}</td>
              <td className="px-2 py-2 text-center"><IconBtn icon={X} title="Remover" tone="danger" onClick={() => remove(i)} /></td>
            </tr>
          ))}
        </tbody>
        <tfoot><tr style={{ borderTop: `1.5px solid ${C.border}`, background: C.cream }}>
          <td colSpan={3} className="px-3 py-2.5 text-right font-bold" style={{ color: C.ink }}>TOTAL</td>
          <td className="px-2 py-2.5 text-right font-extrabold" style={{ color: C.teal }}>{formatBRL(total)}</td><td />
        </tr></tfoot>
      </table>
    </div>
  );
}

function OrderFormModal({ order: editingOrder, onClose }) {
  const isEdit = Boolean(editingOrder);
  const { patients, units, orders, createOrderFn, updateOrderFn, updatePatientFieldsFn, addPatientHistoricoFn } = useCRM();
  const [pacienteId, setPacienteId] = useState(editingOrder?.pacienteId || patients[0]?.id || "");
  const [unidadeId, setUnidadeId] = useState(editingOrder?.unidadeId || units[0]?.id || "");
  const [enderecoCustom, setEnderecoCustom] = useState(editingOrder?.enderecoEntregaCustom || "");
  const [usarEnderecoCustom, setUsarEnderecoCustom] = useState(Boolean(editingOrder?.enderecoEntregaCustom));
  const [condicaoPagamento, setCondicaoPagamento] = useState(editingOrder?.condicaoPagamento || CONDICOES_PAGAMENTO[2].codigo);
  const [fonoaudiologo, setFonoaudiologo] = useState(editingOrder?.fonoaudiologo || "");
  const [itens, setItens] = useState(() => (editingOrder?.itens || []).map((i) => ({ ...i })));
  const [bonificacao, setBonificacao] = useState(() => (editingOrder?.bonificacao || []).map((i) => ({ ...i })));
  const [saving, setSaving] = useState(false);

  const paciente = patients.find((p) => p.id === pacienteId);
  const unidade = units.find((u) => u.id === unidadeId);

  const addItem = (setter, list) => (r) => {
    if (list.find((i) => i.catalogoId === r.id)) return;
    setter([...list, { catalogoId: r.id, nome: r.nome, codigo: r.codigo, quantidade: 1, precoUnitario: r.preco }]);
  };

  const sanitizeItens = (list) => list.map((it) => ({
    ...it,
    quantidade: Math.max(1, Math.round(Number(it.quantidade)) || 1),
    precoUnitario: Number(it.precoUnitario) || 0,
  }));

  const salvar = async () => {
    if (!pacienteId || itens.length === 0) return;
    setSaving(true);
    const dadosPedido = {
      pacienteId, unidadeId, enderecoEntregaCustom: usarEnderecoCustom ? enderecoCustom : "",
      condicaoPagamento, fonoaudiologo: fonoaudiologo || paciente?.fonoaudiologo || "",
      itens: sanitizeItens(itens), bonificacao: sanitizeItens(bonificacao),
    };
    if (isEdit) {
      await updateOrderFn(editingOrder.id, dadosPedido);
    } else {
      const ano = String(new Date().getFullYear()).slice(-2);
      const seq = 660 + orders.length + 1;
      const numero = `${seq}.${unidade?.codigo || "00"}.${ano}`;
      const novoPedido = await createOrderFn({ ...dadosPedido, numero, idFabrica: String(900000 + orders.length + 1), status: "Aguardando Faturamento" });
      await updatePatientFieldsFn(pacienteId, { status: "Pedido em Andamento" });
      await addPatientHistoricoFn(pacienteId, `Pedido ${numero} criado e enviado para faturamento.`);
      await exportPedidoXlsx({ order: novoPedido, paciente, unidade });
    }
    setSaving(false);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? `Editar pedido ${editingOrder.numero}` : "Novo pedido de aparelho"} subtitle="Selecione o paciente, defina o endereço de entrega e monte os itens do pedido e da bonificação." width={720}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar} disabled={!pacienteId || itens.length === 0 || saving}>{saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Criar pedido e exportar"}</Btn></>}>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Paciente" required><Select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>{patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</Select></Field>
          <Field label="Fonoaudiólogo responsável"><Input value={fonoaudiologo} onChange={(e) => setFonoaudiologo(e.target.value)} placeholder={paciente?.fonoaudiologo || "Ex.: Dra. Camila Rezende"} /></Field>
          <Field label="Unidade"><Select value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>{units.map((u) => <option key={u.id} value={u.id}>{u.cidade}/{u.uf}</option>)}</Select></Field>
          <Field label="Condição de pagamento"><Select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)}>{CONDICOES_PAGAMENTO.map((c) => <option key={c.codigo} value={c.codigo}>{c.descricao}</option>)}</Select></Field>
        </div>

        <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
          <label className="flex items-center gap-2 imv-t-125 font-bold" style={{ color: C.tealDark }}>
            <input type="checkbox" checked={usarEnderecoCustom} onChange={(e) => setUsarEnderecoCustom(e.target.checked)} /> Entregar em endereço diferente da unidade
          </label>
          {usarEnderecoCustom ? (
            <Textarea rows={2} className="mt-2" value={enderecoCustom} onChange={(e) => setEnderecoCustom(e.target.value)} placeholder="Destinatário, empresa/instituição, rua, número, bairro, cidade, UF, CEP" />
          ) : (
            <p className="mt-2 imv-t-125" style={{ color: C.sub }}>{unidade?.endereco || `Endereço da unidade ${unidade?.cidade} ainda não cadastrado — configure em “Unidades”.`}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <p className="imv-t-125 font-bold" style={{ color: C.tealDark }}>Itens do pedido (pagos pelo paciente)</p>
          <ItemPicker items={itens} onAdd={addItem(setItens, itens)} />
          <ItemsTable itens={itens} setItens={setItens} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="flex items-center gap-1.5 imv-t-125 font-bold" style={{ color: C.coralDark }}><Gift size={13} /> Itens de bonificação (sem custo ao paciente)</p>
          <ItemPicker items={bonificacao} onAdd={addItem(setBonificacao, bonificacao)} />
          <ItemsTable itens={bonificacao} setItens={setBonificacao} bonificacao />
        </div>
      </div>
    </Modal>
  );
}

function OrderDetailModal({ order: orderProp, onClose }) {
  const { patients, units, orders, updateOrderStatusFn, addPatientHistoricoFn, updatePatientFieldsFn } = useCRM();
  const [showBilling, setShowBilling] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const order = orders.find((o) => o.id === orderProp.id) || orderProp;
  const paciente = patients.find((p) => p.id === order.pacienteId);
  const unidade = units.find((u) => u.id === order.unidadeId);
  const total = order.itens.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);
  const totalBoni = order.bonificacao.reduce((s, it) => s + it.quantidade * it.precoUnitario, 0);

  const avancarStatus = async (novo) => {
    await updateOrderStatusFn(order.id, novo);
    await addPatientHistoricoFn(order.pacienteId, `Pedido ${order.numero} → status "${novo}".`);
    if (novo === "Entregue e Documentado") await updatePatientFieldsFn(order.pacienteId, { status: "Adaptado" });
  };

  const idx = STATUS_PEDIDO.indexOf(order.status);

  return (
    <>
      <Modal open onClose={onClose} title={`Pedido ${order.numero}`} subtitle={paciente?.nome} width={680}
        footer={
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              {STATUS_PEDIDO.map((s, i) => <span key={s} className="h-1.5 w-6 rounded-full" style={{ background: i <= idx ? C.teal : C.border }} />)}
            </div>
            <div className="flex flex-wrap gap-2">
              <Btn variant="subtle" icon={Pencil} onClick={() => setShowEdit(true)}>Editar</Btn>
              <Btn variant="subtle" icon={Download} onClick={() => exportPedidoXlsx({ order, paciente, unidade })}>Exportar XLSX</Btn>
              {order.status === "Aguardando Faturamento" && <Btn icon={FileCheck2} onClick={() => setShowBilling(true)}>Registrar faturamento</Btn>}
              {order.status === "Faturado" && <Btn icon={Truck} onClick={() => avancarStatus("Enviado")}>Marcar como enviado</Btn>}
              {order.status === "Enviado" && <Btn icon={PackageCheck} onClick={() => avancarStatus("Entregue e Documentado")}>Confirmar entrega</Btn>}
              {order.nf && <Btn variant="subtle" icon={Printer} onClick={() => setShowTerms(true)}>Gerar Termos</Btn>}
            </div>
          </div>
        }>
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MiniInfo label="ID Fábrica" value={order.idFabrica} mono />
            <MiniInfo label="Unidade" value={`${unidade?.cidade}/${unidade?.uf}`} />
            <MiniInfo label="Pagamento" value={CONDICOES_PAGAMENTO.find((c) => c.codigo === order.condicaoPagamento)?.descricao} />
            <MiniInfo label="Fonoaudiólogo" value={order.fonoaudiologo || "—"} />
          </div>

          <div className="rounded-xl p-3.5" style={{ background: C.cream }}>
            <p className="mb-1 imv-t-115 font-bold uppercase tracking-wide" style={{ color: C.sub }}>Endereço de entrega</p>
            <p className="imv-t-13" style={{ color: C.ink }}>{order.enderecoEntregaCustom || unidade?.endereco || "Endereço não cadastrado."}</p>
          </div>

          <div><p className="mb-2 imv-t-125 font-bold" style={{ color: C.tealDark }}>Itens do pedido</p><ItemsTable itens={order.itens} setItens={() => {}} /></div>
          {order.bonificacao.length > 0 && <div><p className="mb-2 flex items-center gap-1.5 imv-t-125 font-bold" style={{ color: C.coralDark }}><Gift size={13} /> Bonificação</p><ItemsTable itens={order.bonificacao} setItens={() => {}} bonificacao /></div>}

          {order.nf && (
            <div className="rounded-xl p-3.5" style={{ background: C.greenBg, border: "1px solid #bfe4d3" }}>
              <p className="mb-1 flex items-center gap-1.5 imv-t-125 font-bold" style={{ color: C.green }}><ShieldCheck size={14} /> Faturado</p>
              <p className="imv-t-13" style={{ color: C.ink }}>NF {order.nf.numero} · {formatDateBR(order.nf.data)} · {order.nf.fabricante}</p>
              {order.series.length > 0 && <p className="mt-1 imv-t-12" style={{ color: C.sub }}>Nº de série: {order.series.map((s) => s.numeroSerie).join(", ")}</p>}
            </div>
          )}
        </div>
      </Modal>
      {showBilling && <BillingModal order={order} onClose={() => setShowBilling(false)} onDone={() => { setShowBilling(false); }} />}
      {showTerms && <TermsPrintModal order={order} paciente={paciente} unidade={unidade} onClose={() => setShowTerms(false)} />}
      {showEdit && <OrderFormModal order={order} onClose={() => setShowEdit(false)} />}
    </>
  );
}

function MiniInfo({ label, value, mono }) {
  return (
    <div>
      <p className="imv-t-11 font-bold uppercase tracking-wide" style={{ color: C.sub }}>{label}</p>
      <p className={cx("imv-t-13 font-bold", mono && "font-mono")} style={{ color: C.ink }}>{value}</p>
    </div>
  );
}

function BillingModal({ order, onClose, onDone }) {
  const { catalog, setOrderBillingFn, addPatientHistoricoFn } = useCRM();
  const aparelhos = order.itens.filter((it) => catalog.find((c) => c.id === it.catalogoId)?.cat === "APARELHOS AASI" || /RADIANT|CAPTIVATE|TREK|CV\d/i.test(it.nome));
  const [nf, setNf] = useState({ numero: "", data: formatDateInputValue(today), fabricante: FABRICANTES[0] });
  const [series, setSeries] = useState(
    aparelhos.flatMap((it) => Array.from({ length: it.quantidade }).map((_, i) => ({ catalogoId: it.catalogoId, nome: it.nome, numeroSerie: "" })))
  );
  const [saving, setSaving] = useState(false);

  const setSerie = (i, v) => setSeries(series.map((s, idx) => (idx === i ? { ...s, numeroSerie: v } : s)));

  const salvar = async () => {
    setSaving(true);
    await setOrderBillingFn(order.id, nf, series);
    await addPatientHistoricoFn(order.pacienteId, `Pedido ${order.numero} faturado — NF ${nf.numero}.`);
    setSaving(false);
    onDone();
  };

  return (
    <Modal open onClose={onClose} title="Registrar faturamento" subtitle={`Pedido ${order.numero}`} width={560}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar} disabled={!nf.numero || saving}>{saving ? "Salvando…" : "Salvar faturamento"}</Btn></>}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Nº da Nota Fiscal" required><Input value={nf.numero} onChange={(e) => setNf({ ...nf, numero: e.target.value })} placeholder="124.081" /></Field>
          <Field label="Data da NF"><Input type="date" value={nf.data} onChange={(e) => setNf({ ...nf, data: e.target.value })} /></Field>
          <Field label="Fabricante/Distribuidora"><Select value={nf.fabricante} onChange={(e) => setNf({ ...nf, fabricante: e.target.value })}>{FABRICANTES.map((f) => <option key={f}>{f}</option>)}</Select></Field>
        </div>
        {series.length > 0 && (
          <div>
            <p className="mb-2 imv-t-125 font-bold" style={{ color: C.tealDark }}>Números de série dos aparelhos</p>
            <div className="flex flex-col gap-2">
              {series.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-40 truncate imv-t-125 font-semibold" style={{ color: C.ink }}>{s.nome}</span>
                  <Input value={s.numeroSerie} onChange={(e) => setSerie(i, e.target.value)} placeholder="NS — número de série" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* Termo de Recebimento + Termo de Responsabilidade — versão imprimível,
   fiel ao modelo real utilizado pela IMOUVIR (gera PDF via impressão do navegador).
   Em produção, o mesmo conteúdo será preenchido automaticamente em .docx via
   python-docx a partir deste mesmo template. */
function TermoLogo() {
  return (
    <div className="flex justify-center">
      <img src={imouvirLogo} alt="IMOUVIR" style={{ height: 36, objectFit: "contain" }} />
    </div>
  );
}

function TermoConteudo({ order, paciente, unidade, cidadeAssinatura, dataHoje }) {
  return (
    <>
  <div className="imv-term-page rounded-xl p-6" style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111" }}>
            <TermoLogo />
            <h2 className="mt-3 text-center imv-t-16 font-extrabold">Termo de Recebimento</h2>
            <p className="mt-1 text-center imv-t-115 font-semibold text-gray-500">PROJETO SAÚDE AUDITIVA – INSTITUTO MAÇÔNICO OUVIR - IMOUVIR</p>
            <p className="mt-2 imv-t-125 leading-snug" style={{ fontSize: 11 }}>
              Através deste termo confirmo o recebimento do(s) aparelho(s) auditivo(s) e respectiva nota fiscal descritos no quadro abaixo, bem como recebi as orientações e cuidados necessários para proteção e bom funcionamento do(s) aparelho(s).
            </p>
            <p className="mt-2 imv-t-125 font-bold text-center">{order.numero} - PCT {(paciente?.nome || "").toUpperCase()}</p>

            <table className="mt-1.5 w-full border-collapse leading-tight" style={{ fontSize: 10.5 }}>
              <tbody>
                <tr><td className="border border-gray-400 px-2 py-0.5 font-semibold" colSpan={1}>NF {order.nf?.numero} DE {formatDateBR(order.nf?.data)}</td><td className="border border-gray-400 px-2 py-0.5">{order.nf?.fabricante}</td></tr>
                {order.series.length > 0 ? order.series.map((s, i) => (
                  <tr key={i}><td className="border border-gray-400 px-2 py-0.5">NS – {s.numeroSerie || "____________"}</td><td className="border border-gray-400 px-2 py-0.5">{s.nome}</td></tr>
                )) : <tr><td className="border border-gray-400 px-2 py-0.5">NS – ____________</td><td className="border border-gray-400 px-2 py-0.5"></td></tr>}
              </tbody>
            </table>

            <p className="mt-2 imv-t-11 font-bold uppercase leading-tight text-center">
              Garantia do fabricante – 1 ano para defeitos de fabricação do aparelho, com exceção dos receptores, que possuem 3 meses de garantia — sujeito à análise e aprovação do laboratório da empresa.
            </p>

            <h3 className="mt-2 imv-t-13 font-extrabold">Cuidados a serem observados para preservação do Aparelho Auditivo</h3>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-5 leading-tight" style={{ fontSize: 10 }}>
              <li>Proteja seu aparelho auditivo de sujeira. Certifique-se sempre que seus dedos estejam limpos e secos antes de tocar em seus aparelhos auditivos. A entrada do microfone é muito pequena e pode ser obstruída se for manipulada incorretamente.</li>
              <li>Evite impactos. Evite derrubar seu aparelho auditivo sobre superfícies duras. Isto pode ocorrer enquanto você limpa ou troca a pilha. Seja cuidadoso ao inserir ou remover seu aparelho auditivo.</li>
              <li>Não exponha seu aparelho auditivo a altas temperaturas. Não o exponha ao calor. Proteja-o da luz solar (em casa ou no carro) e não o deixe próximo a aquecedores.</li>
              <li>Proteja seu aparelho auditivo de umidade. Remova-o antes de tomar banho ou nadar. Devido à umidade, não o deixe no banheiro. Recomendamos que você remova a pilha durante a noite e deixe seu compartimento aberto.</li>
              <li>Mantenha seu aparelho auditivo fora do alcance de crianças e animais domésticos.</li>
              <li>Evite o contato com fixadores para cabelo ou maquiagem. Remova seu aparelho auditivo antes de aplicar produtos corporais ou cosméticos.</li>
              <li>Limpe cuidadosamente seu aparelho auditivo com um pano macio seco. Álcool, solventes ou produtos de limpeza podem danificá-lo.</li>
              <li>Faça sempre a higiene adequada do seu ouvido, para que seus aparelhos auditivos ofereçam o melhor desempenho.</li>
              <li>Guarde seus aparelhos auditivos em local seguro. Quando não estiver usando, remova as pilhas e guarde-os dentro do estojo com o desumidificador.</li>
              <li>Só efetue reparos com especialistas. Chaves de fenda e óleo em contato com a parte elétrica ou micro-mecânica podem causar danos irreparáveis.</li>
            </ul>

            <div className="mt-3 text-center imv-t-12 imv-avoid-break">
              <p>{cidadeAssinatura}, {formatDateBR(dataHoje)}</p>
              <p className="mt-4 border-t border-gray-400 pt-1 mx-auto w-64">Assinatura</p>
            </div>
          </div>

          <div className="imv-page-2 imv-term-page rounded-xl p-6" style={{ background: "#fff", fontFamily: "Arial, Helvetica, sans-serif", color: "#111" }}>
            <TermoLogo />
            <h2 className="mt-3 text-center imv-t-15 font-extrabold">TERMO DE RESPONSABILIDADE E AUTORIZAÇÃO<br />DE USO E DIREITOS DE IMAGEM INDIVIDUAL</h2>
            <p className="mt-1 imv-t-105 leading-tight" style={{ fontSize: 10 }}>
              Conforme assinatura abaixo, DECLARO que concordo, sem ressalvas, em participar de campanhas de divulgação do “INSTITUTO MAÇÔNICO OUVIR”, por livre e espontânea vontade, ora assumindo toda e qualquer RESPONSABILIDADE por minha participação.
            </p>

            <table className="mt-1.5 w-full border-collapse leading-none imv-avoid-break" style={{ fontSize: 10 }}>
              <tbody>
                <tr><td className="border border-gray-400 px-1.5 py-px font-semibold" colSpan={2}>Nome: {paciente?.nome}</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px">CPF: {paciente?.cpf || "____________"}</td><td className="border border-gray-400 px-1.5 py-px"></td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px" colSpan={2}>Endereço: {paciente?.endereco || "____________"}</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px">CEP: ____________</td><td className="border border-gray-400 px-1.5 py-px">Cidade/Estado: {paciente?.cidade}/{paciente?.uf}</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px" colSpan={2}>Data Nasc.: {paciente?.dataNascimento ? formatDateBR(paciente.dataNascimento) : "____________"}</td></tr>
                <tr><td className="border border-gray-400 bg-gray-100 px-1.5 py-px font-bold" colSpan={2}>DADOS DO RESPONSÁVEL (quando o paciente for menor de idade)</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px" colSpan={2}>Nome: ____________________________________________</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px">CPF: ____________________</td><td className="border border-gray-400 px-1.5 py-px">RG: ____________________</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px" colSpan={2}>Endereço: ____________________________________________</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px">CEP: ____________</td><td className="border border-gray-400 px-1.5 py-px">Cidade/Estado: ____________</td></tr>
                <tr><td className="border border-gray-400 px-1.5 py-px">Data Nasc.: ____________</td><td className="border border-gray-400 px-1.5 py-px">Fone: ____________</td></tr>
              </tbody>
            </table>

            <p className="mt-1 imv-t-105 leading-tight" style={{ fontSize: 10 }}>
              DECLARO ter ciência de que é uma campanha de propaganda do “INSTITUTO MAÇÔNICO OUVIR”, com cunho de divulgação de seus serviços oferecidos, pela qual CONCORDO e AUTORIZO o uso de minha imagem, na divulgação da instituição, nas formas e por prazo INDETERMINADO.
            </p>
            <p className="mt-1 imv-t-105 leading-tight" style={{ fontSize: 10 }}>
              Assim, nos termos acima e em razão da aludida participação, AUTORIZO o “INSTITUTO MAÇÔNICO OUVIR”, a utilizar minha imagem, nome, depoimento e voz, com ou sem sincronização, nos materiais de comunicação utilizado pelo “INSTITUTO MAÇÔNICO OUVIR”, para veiculação, armazenamento digital/eletrônico e divulgação na mídia em geral, escrita, falada, televisada ou eletrônica, de difusão e transmissão por qualquer meio de comunicação, dentre os quais citam, sem exclusão de qualquer outro aqui não previsto, televisão, rádio, jornal, revista, internet, rede de computador, redes sociais, e-mails, folders, flyers, home page, blog, ilustração de programa de computador, vídeo, obra multimídia, catálogos, seminários, eventos, relatório anual, press release, boletim informativo, folheto, cartão, podendo ainda usar a imagem para publicação em editorial educativo ou cultural, painel eletrônico, banner, faixas, outdoor, cartaz, display, mural, poster, encarte, mala direta, cartão postal. Material de identidade visual, materiais e meios de comunicação que o “INSTITUTO MAÇÔNICO OUVIR” deseje utilizar para divulgação ao público interno e/ou externo, com finalidade institucional e/ou publicitária.
            </p>
            <p className="mt-1 imv-t-105 leading-tight" style={{ fontSize: 10 }}>
              Esta AUTORIZAÇÃO é concedida a título gratuito, para divulgação em todo o território nacional, por prazo indeterminado, a partir da data de aceite desta autorização, para uso nas mídias e canais de veiculação acima autorizados, sem qualquer restrição de inserções e quantidade das imagens que serão escolhidas a exclusivo critério do “INSTITUTO MAÇÔNICO OUVIR”.
            </p>
            <p className="mt-1 imv-t-105 leading-tight" style={{ fontSize: 10 }}>
              A AUTORIZAÇÃO ora conferida abrange todos os direitos relacionados à veiculação da imagem, nome, voz, depoimento e opinião do LICENCIANTE podendo o “INSTITUTO MAÇÔNICO OUVIR”, ainda editar os materiais com os conteúdos autorizados, realizar dublagem e obras derivadas.
            </p>
            <p className="mt-1 imv-t-105 leading-tight" style={{ fontSize: 10 }}>
              O “INSTITUTO MAÇÔNICO OUVIR”, estão isentos de qualquer responsabilidade decorrente do uso indevido das imagens captadas, especialmente em sites e comunidades virtuais, tais como You Tube, Facebook, Twitter, Instagram etc.
            </p>

            <div className="mt-3 text-center imv-t-12 imv-avoid-break">
              <p>{cidadeAssinatura}, {formatDateBR(dataHoje)}</p>
              <p className="mt-5 border-t border-gray-400 pt-1 mx-auto w-64">Assinatura</p>
            </div>
          </div>
    </>
  );
}

function TermsPrintModal({ order, paciente, unidade, onClose }) {
  const cidadeAssinatura = unidade?.cidade ? `${unidade.cidade}/${unidade.uf}` : "____________";
  const dataHoje = new Date();
  const conteudo = <TermoConteudo order={order} paciente={paciente} unidade={unidade} cidadeAssinatura={cidadeAssinatura} dataHoje={dataHoje} />;

  return (
    <>
      <div className="imv-screen-only fixed inset-0 imv-z-60 overflow-y-auto py-6" style={{ background: "rgba(6,40,42,0.55)" }}>
        <style>{`
          @media print { .imv-screen-only { display: none !important; } }
        `}</style>
        <div className="mx-auto flex imv-maxw-820 flex-col gap-3 px-4">
          <div className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.card }}>
            <span className="imv-t-13 font-bold" style={{ color: C.ink }}>Prévia de impressão — Termo de Recebimento e Responsabilidade</span>
            <div className="flex gap-2">
              <Btn variant="ghost" size="sm" onClick={onClose}>Fechar</Btn>
              <Btn size="sm" icon={Printer} onClick={() => window.print()}>Imprimir / Salvar PDF</Btn>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {conteudo}
          </div>
        </div>
      </div>
      {createPortal(
        <div id="imv-print-portal">
          <style>{`
            @page { size: 210mm 297mm; margin: 10mm; }
            #imv-print-portal { display: none; }
            @media print {
              #root { display: none !important; }
              #imv-print-portal { display: block; }
              .imv-page-2 { page-break-before: always; }
              .imv-avoid-break { page-break-inside: avoid; }
              .imv-term-page { padding: 0 !important; }
            }
          `}</style>
          {conteudo}
        </div>,
        document.body
      )}
    </>
  );
}

/* =========================================================================
   Catálogo de Aparelhos
   ========================================================================= */
function CatalogoPage() {
  const { catalog, deleteCatalogItemFn } = useCRM();
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("Todas");
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const categorias = ["Todas", ...Array.from(new Set(catalog.map((c) => c.cat)))];
  const filtered = catalog.filter((c) => (cat === "Todas" || c.cat === cat) && (c.nome + c.codigo).toLowerCase().includes(query.toLowerCase()));

  const remove = (id) => deleteCatalogItemFn(id);

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 imv-minw-220">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: C.sub }} />
          <Input placeholder="Buscar por nome ou código…" value={query} onChange={(e) => setQuery(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <div className="w-full sm:w-64"><Select value={cat} onChange={(e) => setCat(e.target.value)}>{categorias.map((c) => <option key={c}>{c}</option>)}</Select></div>
        <Btn icon={Plus} onClick={() => setShowNew(true)}>Novo item</Btn>
      </div>

      <p className="imv-t-125" style={{ color: C.sub }}>{filtered.length} de {catalog.length} itens cadastrados · cada aparelho/acessório possui código único junto à fábrica.</p>

      <div className="overflow-hidden rounded-2xl" style={{ background: C.card, border: `1px solid ${C.border}` }}>
        <table className="w-full imv-t-13">
          <thead><tr style={{ background: C.cream }}>
            <th className="px-4 py-3 text-left font-bold" style={{ color: C.sub }}>Categoria</th>
            <th className="px-4 py-3 text-left font-bold" style={{ color: C.sub }}>Descrição</th>
            <th className="px-4 py-3 text-left font-bold" style={{ color: C.sub }}>Código</th>
            <th className="px-4 py-3 text-right font-bold" style={{ color: C.sub }}>Preço</th>
            <th className="w-20 px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {filtered.slice(0, 120).map((c) => (
              <tr key={c.id} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-4 py-2.5"><span className="imv-t-11 font-bold uppercase" style={{ color: C.teal }}>{c.cat}</span></td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: C.ink }}>{c.nome}</td>
                <td className="px-4 py-2.5 font-mono" style={{ color: C.sub }}>{c.codigo || "—"}</td>
                <td className="px-4 py-2.5 text-right font-bold" style={{ color: C.ink }}>{formatBRL(c.preco)}</td>
                <td className="px-4 py-2.5"><div className="flex justify-end gap-1"><IconBtn icon={Pencil} title="Editar" onClick={() => setEditing(c)} /><IconBtn icon={Trash2} title="Excluir" tone="danger" onClick={() => remove(c.id)} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 120 && <p className="px-4 py-3 text-center imv-t-12" style={{ color: C.sub }}>Mostrando 120 de {filtered.length} — refine a busca para ver outros itens.</p>}
      </div>

      {(showNew || editing) && <CatalogItemModal item={editing} onClose={() => { setShowNew(false); setEditing(null); }} />}
    </div>
  );
}

function CatalogItemModal({ item, onClose }) {
  const { createCatalogItemFn, updateCatalogItemFn } = useCRM();
  const [form, setForm] = useState({ cat: item?.cat || "APARELHOS AASI", nome: item?.nome || "", codigo: item?.codigo || "", preco: item?.preco || 0 });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = async () => {
    if (!form.nome.trim()) return;
    if (item) await updateCatalogItemFn(item.id, { ...form, preco: Number(form.preco) });
    else await createCatalogItemFn({ ...form, preco: Number(form.preco) });
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={item ? "Editar item do catálogo" : "Novo item no catálogo"} width={480}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar</Btn></>}>
      <div className="flex flex-col gap-4">
        <Field label="Categoria"><Input value={form.cat} onChange={set("cat")} placeholder="Ex.: APARELHOS AASI" /></Field>
        <Field label="Nome / descrição" required><Input value={form.nome} onChange={set("nome")} /></Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Código de fábrica"><Input value={form.codigo} onChange={set("codigo")} /></Field>
          <Field label="Preço (R$)"><Input type="number" step="0.01" value={form.preco} onChange={set("preco")} /></Field>
        </div>
      </div>
    </Modal>
  );
}

/* =========================================================================
   Unidades
   ========================================================================= */
function UnidadesPage() {
  const { units, deleteUnitFn } = useCRM();
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const remove = (id) => deleteUnitFn(id);

  return (
    <div className="flex flex-col gap-5 p-5 lg:p-8">
      <div className="flex items-center justify-between">
        <p className="imv-t-13" style={{ color: C.sub }}>{units.length} unidades de atendimento cadastradas.</p>
        <Btn icon={Plus} onClick={() => setShowNew(true)}>Nova unidade</Btn>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {units.map((u) => (
          <div key={u.id} className="flex flex-col gap-3 rounded-2xl p-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${C.teal}18` }}><Building2 size={18} style={{ color: C.teal }} /></div>
                <div>
                  <div className="imv-t-14 font-bold" style={{ color: C.ink }}>{u.cidade}{u.sede ? <Badge color={C.teal}>Sede</Badge> : null}</div>
                  <div className="imv-t-12" style={{ color: C.sub }}>{u.uf} · código {u.codigo}</div>
                </div>
              </div>
              <div className="flex gap-1"><IconBtn icon={Pencil} title="Editar" onClick={() => setEditing(u)} /><IconBtn icon={Trash2} title="Excluir" tone="danger" onClick={() => remove(u.id)} /></div>
            </div>
            {u.endereco ? (
              <p className="imv-t-125 leading-relaxed" style={{ color: C.ink }}>{u.endereco}</p>
            ) : (
              <p className="flex items-center gap-1.5 imv-t-12 font-semibold" style={{ color: C.coral }}><AlertTriangle size={12} /> Endereço não cadastrado</p>
            )}
            {u.telefone ? <p className="flex items-center gap-1.5 imv-t-125" style={{ color: C.sub }}><Phone size={12} /> {formatPhone(u.telefone)}</p> : null}
          </div>
        ))}
      </div>
      {(showNew || editing) && <UnitModal unit={editing} onClose={() => { setShowNew(false); setEditing(null); }} />}
    </div>
  );
}

function UnitModal({ unit, onClose }) {
  const { createUnitFn, updateUnitFn } = useCRM();
  const [form, setForm] = useState({ codigo: unit?.codigo || "", cidade: unit?.cidade || "", uf: unit?.uf || "", endereco: unit?.endereco || "", telefone: unit?.telefone || "" });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const salvar = async () => {
    if (!form.cidade.trim()) return;
    if (unit) await updateUnitFn(unit.id, form);
    else await createUnitFn(form);
    onClose();
  };

  return (
    <Modal open onClose={onClose} title={unit ? "Editar unidade" : "Nova unidade"} width={480}
      footer={<><Btn variant="ghost" onClick={onClose}>Cancelar</Btn><Btn icon={Save} onClick={salvar}>Salvar</Btn></>}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2"><Field label="Cidade" required><Input value={form.cidade} onChange={set("cidade")} /></Field></div>
          <Field label="UF"><Input value={form.uf} maxLength={2} onChange={(e) => setForm((f) => ({ ...f, uf: e.target.value.toUpperCase() }))} /></Field>
        </div>
        <Field label="Código interno"><Input value={form.codigo} onChange={set("codigo")} placeholder="Ex.: 13" /></Field>
        <Field label="Endereço completo"><Textarea rows={3} value={form.endereco} onChange={set("endereco")} placeholder="Rua, número, bairro, cidade, UF, CEP" /></Field>
        <Field label="Telefone"><Input value={formatPhone(form.telefone)} onChange={(e) => setForm((f) => ({ ...f, telefone: onlyDigits(e.target.value) }))} /></Field>
      </div>
    </Modal>
  );
}

/* =========================================================================
   App
   ========================================================================= */
const PAGE_META = {
  dashboard: { title: "Dashboard", subtitle: "Visão geral de pacientes, agenda e pedidos." },
  pacientes: { title: "Pacientes", subtitle: "Pasta digital de cada paciente — dados, exames e histórico." },
  agenda: { title: "Agenda", subtitle: "Calendário de atendimentos com confirmação via WhatsApp." },
  pedidos: { title: "Pedidos", subtitle: "Do fechamento da venda ao termo de entrega assinado." },
  catalogo: { title: "Catálogo de Aparelhos", subtitle: "Itens configurados com nome e código junto à fábrica." },
  unidades: { title: "Unidades", subtitle: "Endereços de atendimento por cidade." },
};

export default function App() {
  return (
    <AuthProvider>
      <style>{FONTS}</style>
      <style>{`
        .imv-wave-bar { animation: imvwave 1s ease-in-out infinite alternate; }
        @keyframes imvwave { from { transform: scaleY(0.5); } to { transform: scaleY(1); } }
        @media (prefers-reduced-motion: reduce) { .imv-wave-bar { animation: none; } }
      `}</style>
      <Root />
    </AuthProvider>
  );
}

function FullScreenNotice({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6" style={{ background: C.tealDarker, fontFamily: "Inter, sans-serif" }}>
      {children}
    </div>
  );
}

function Root() {
  if (!isSupabaseConfigured) {
    return (
      <FullScreenNotice>
        <div className="max-w-md rounded-2xl p-8 text-center" style={{ background: "#fff" }}>
          <h2 className="imv-t-17 font-extrabold" style={{ color: C.ink, fontFamily: "Manrope, sans-serif" }}>Configuração do Supabase pendente</h2>
          <p className="mt-2 imv-t-13" style={{ color: C.sub }}>
            Defina as variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> (no <code>.env</code> local e nas Environment Variables do projeto na Vercel) para conectar o CRM ao banco de dados.
          </p>
        </div>
      </FullScreenNotice>
    );
  }

  const { session, loading } = useAuth();
  if (loading) return <FullScreenNotice><SoundWave size={28} color="#fff" /></FullScreenNotice>;
  if (!session) return <Login />;
  return <CrmApp />;
}

function CrmApp() {
  const { profile, user, signOut } = useAuth();
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [orders, setOrders] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [units, setUnits] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let alive = true;
    setDataLoading(true);
    Promise.all([api.listPatients(), api.listAppointments(), api.listOrders(), api.listCatalog(), api.listUnits()])
      .then(([p, a, o, c, u]) => {
        if (!alive) return;
        setPatients(p);
        setAppointments(a);
        setOrders(o);
        setCatalog(c);
        setUnits(u);
        setLoadError(null);
      })
      .catch((err) => { if (alive) setLoadError(err.message || String(err)); })
      .finally(() => { if (alive) setDataLoading(false); });
    return () => { alive = false; };
  }, []);

  const createPatientFn = async (form, historicoTexto) => {
    const novo = await api.createPatient(form, historicoTexto);
    setPatients((prev) => [novo, ...prev]);
    return novo;
  };
  const updatePatientFieldsFn = async (id, fields) => {
    await api.updatePatient(id, fields);
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...fields } : p)));
  };
  const addPatientHistoricoFn = async (id, texto) => {
    const h = await api.addHistorico(id, texto);
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, historico: [h, ...p.historico] } : p)));
  };
  const addPatientDocumentosFn = async (id, fileList, tipo) => {
    const novos = await Promise.all(Array.from(fileList).map((f) => api.addDocumento(id, f, tipo)));
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, documentos: [...novos, ...p.documentos] } : p)));
    await addPatientHistoricoFn(id, `${novos.length} documento(s) anexado(s) — ${tipo}.`);
  };
  const removePatientDocumentoFn = async (id, doc) => {
    await api.removeDocumento(doc);
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, documentos: p.documentos.filter((d) => d.id !== doc.id) } : p)));
  };

  const createAppointmentFn = async (form) => {
    const novo = await api.createAppointment(form);
    setAppointments((prev) => [...prev, novo]);
    return novo;
  };
  const updateAppointmentFn = async (id, fields) => {
    await api.updateAppointment(id, fields);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...fields } : a)));
  };
  const deleteAppointmentFn = async (id) => {
    await api.deleteAppointment(id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const createCatalogItemFn = async (item) => {
    const novo = await api.createCatalogItem(item);
    setCatalog((prev) => [novo, ...prev]);
  };
  const updateCatalogItemFn = async (id, fields) => {
    await api.updateCatalogItem(id, fields);
    setCatalog((prev) => prev.map((c) => (c.id === id ? { ...c, ...fields } : c)));
  };
  const deleteCatalogItemFn = async (id) => {
    await api.deleteCatalogItem(id);
    setCatalog((prev) => prev.filter((c) => c.id !== id));
  };

  const createUnitFn = async (unit) => {
    const novo = await api.createUnit(unit);
    setUnits((prev) => [...prev, novo]);
  };
  const updateUnitFn = async (id, fields) => {
    await api.updateUnit(id, fields);
    setUnits((prev) => prev.map((u) => (u.id === id ? { ...u, ...fields } : u)));
  };
  const deleteUnitFn = async (id) => {
    await api.deleteUnit(id);
    setUnits((prev) => prev.filter((u) => u.id !== id));
  };

  const createOrderFn = async (order) => {
    const novo = await api.createOrder(order);
    setOrders((prev) => [novo, ...prev]);
    return novo;
  };
  const updateOrderFn = async (id, order) => {
    const { itens, bonificacao } = await api.updateOrder(id, order);
    setOrders((prev) => prev.map((o) => (o.id === id ? {
      ...o,
      pacienteId: order.pacienteId, unidadeId: order.unidadeId,
      enderecoEntregaCustom: order.enderecoEntregaCustom || "", condicaoPagamento: order.condicaoPagamento,
      fonoaudiologo: order.fonoaudiologo || "", itens, bonificacao,
    } : o)));
  };
  const updateOrderStatusFn = async (id, status) => {
    await api.updateOrderStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  };
  const setOrderBillingFn = async (id, nf, series) => {
    await api.setOrderBilling(id, nf, series);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "Faturado", nf, series } : o)));
  };
  const deleteOrderFn = async (id) => {
    await api.deleteOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  const ctx = {
    patients, appointments, orders, catalog, units,
    createPatientFn, updatePatientFieldsFn, addPatientHistoricoFn, addPatientDocumentosFn, removePatientDocumentoFn,
    createAppointmentFn, updateAppointmentFn, deleteAppointmentFn,
    createCatalogItemFn, updateCatalogItemFn, deleteCatalogItemFn,
    createUnitFn, updateUnitFn, deleteUnitFn,
    createOrderFn, updateOrderFn, updateOrderStatusFn, setOrderBillingFn, deleteOrderFn,
  };

  const meta = PAGE_META[page];

  return (
    <CRM.Provider value={ctx}>
      <div className="flex min-h-screen w-full" style={{ background: C.cream, fontFamily: "Inter, sans-serif" }}>
        <Sidebar page={page} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} profile={profile} user={user} signOut={signOut} />
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar
            title={meta.title}
            subtitle={meta.subtitle}
            onMenu={() => setMobileOpen(true)}
            right={
              <div className="hidden items-center gap-2 rounded-full px-3 py-1.5 sm:flex" style={{ background: `${C.teal}14` }}>
                <Sparkles size={13} style={{ color: C.teal }} />
                <span className="imv-t-115 font-bold" style={{ color: C.tealDark }}>IMOUVIR CRM</span>
              </div>
            }
          />
          {dataLoading ? (
            <div className="flex flex-1 items-center justify-center p-10">
              <p className="imv-t-13 font-semibold" style={{ color: C.sub }}>Carregando dados…</p>
            </div>
          ) : loadError ? (
            <div className="p-10">
              <p className="imv-t-13 font-semibold" style={{ color: C.red }}>Erro ao carregar dados do banco: {loadError}</p>
            </div>
          ) : (
            <>
              {page === "dashboard" && <Dashboard goTo={setPage} />}
              {page === "pacientes" && <PacientesPage />}
              {page === "agenda" && <AgendaPage />}
              {page === "pedidos" && <PedidosPage />}
              {page === "catalogo" && <CatalogoPage />}
              {page === "unidades" && <UnidadesPage />}
            </>
          )}
        </div>
      </div>
    </CRM.Provider>
  );
}
