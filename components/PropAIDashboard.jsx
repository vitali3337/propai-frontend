import { useState, useEffect, useRef, useCallback } from "react";

// ── DESIGN TOKENS ────────────────────────────────────────────────
const C = {
  bg:       "#09090f",
  surface:  "#11111c",
  border:   "#1e1e30",
  accent:   "#4f6ef7",
  accentLo: "#4f6ef720",
  green:    "#22d47a",
  greenLo:  "#22d47a20",
  amber:    "#f5a623",
  amberLo:  "#f5a62320",
  red:      "#ff4d6d",
  redLo:    "#ff4d6d20",
  muted:    "#4a4a6a",
  text:     "#e8e8f0",
  textDim:  "#7070a0",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Manrope:wght@400;500;700;800&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: ${C.bg};
    color: ${C.text};
    font-family: 'Manrope', sans-serif;
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }

  .mono { font-family: 'JetBrains Mono', monospace; }

  @keyframes pulse-dot {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: .4; transform: scale(.7); }
  }
  @keyframes scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(400%); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes grow {
    from { width: 0; }
  }

  .fade-in { animation: fadeIn .35s ease forwards; }

  .skeleton {
    background: linear-gradient(90deg, ${C.surface} 25%, ${C.border} 50%, ${C.surface} 75%);
    background-size: 400px 100%;
    animation: shimmer 1.4s infinite;
    border-radius: 6px;
  }

  .btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 8px 16px; border-radius: 8px; border: none;
    font-family: 'Manrope', sans-serif; font-weight: 700;
    font-size: 13px; cursor: pointer; transition: all .15s;
  }
  .btn:active { transform: scale(.97); }
  .btn-primary { background: ${C.accent}; color: #fff; }
  .btn-primary:hover { background: #6070f8; }
  .btn-ghost { background: transparent; color: ${C.textDim}; border: 1px solid ${C.border}; }
  .btn-ghost:hover { border-color: ${C.accent}; color: ${C.text}; }
  .btn-danger { background: ${C.red}; color: #fff; }

  .card {
    background: ${C.surface};
    border: 1px solid ${C.border};
    border-radius: 12px;
    padding: 16px;
  }

  .badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 8px; border-radius: 20px;
    font-size: 11px; font-weight: 700; letter-spacing: .3px;
  }
  .badge-green { background: ${C.greenLo}; color: ${C.green}; }
  .badge-amber { background: ${C.amberLo}; color: ${C.amber}; }
  .badge-blue  { background: ${C.accentLo}; color: ${C.accent}; }
  .badge-red   { background: ${C.redLo}; color: ${C.red}; }

  .tag {
    display: inline-block; padding: 2px 7px; border-radius: 4px;
    font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px;
  }
`;

// ── MOCK DATA & AGENT CONFIG ──────────────────────────────────────
const SOURCES = [
  { id: "999md", label: "999.md", url: "https://999.md/ru/list/real-estate/apartments-and-rooms" },
  { id: "makler", label: "makler.md", url: "https://makler.md/ru/real-estate" },
  { id: "olx", label: "OLX Moldova", url: "https://www.olx.md/d/nedvizhimost" },
];

const MOCK_LISTINGS = [
  { id:1, title:"2-комн. кв., ул. Ленина 45", price:"28 000 $", location:"Тирасполь", type:"sale", score:null, source:"999md", img:"🏢", desc:"Кирпичный дом, 3/5 эт, евроремонт, встроенная кухня, балкон" },
  { id:2, title:"1-комн. кв., Бам", price:"12 000 $", location:"Тирасполь", type:"sale", score:null, source:"999md", img:"🏠", desc:"Хрущёвка, 2/5 эт, требует ремонта, тихий двор" },
  { id:3, title:"3-комн. кв., Кишинёв Центр", price:"95 000 €", location:"Кишинёв", type:"sale", score:null, source:"makler", img:"🏙️", desc:"Новострой 2022, панорамный вид, паркинг, охрана" },
  { id:4, title:"Офис 120м², ул. Шевченко", price:"800 $/мес", location:"Тирасполь", type:"rent", score:null, source:"olx", img:"🏗️", desc:"Отдельный вход, опен-спейс, ремонт, парковка" },
  { id:5, title:"Дом 180м², р-н Кировский", price:"55 000 $", location:"Тирасполь", type:"sale", score:null, source:"999md", img:"🏡", desc:"6 соток, гараж, скважина, газ, требует ремонта" },
  { id:6, title:"1-комн. кв., Бендеры", price:"9 500 $", location:"Бендеры", type:"sale", score:null, source:"makler", img:"🏢", desc:"4/9 эт, стеклопакеты, балкон застеклён" },
  { id:7, title:"Студия, ул. Мира", price:"200 $/мес", location:"Тирасполь", type:"rent", score:null, source:"999md", img:"🛋️", desc:"Мебель, бытовая техника, интернет включён" },
  { id:8, title:"Магазин 80м², Центр", price:"1 200 $/мес", location:"Тирасполь", type:"rent", score:null, source:"olx", img:"🏪", desc:"Высокий трафик, витрины, подсобка, отдельный вход" },
];

const AGENTS = [
  { id:"crawler",  label:"Crawler AI",  icon:"🕷️", color: C.accent,  desc:"Сбор объявлений с источников" },
  { id:"dedup",    label:"Dedup AI",    icon:"🔄", color: C.amber,   desc:"Удаление дублей" },
  { id:"scorer",   label:"Score AI",    icon:"⭐", color: C.green,   desc:"AI-оценка качества объявлений" },
  { id:"poster",   label:"Channel AI",  icon:"📢", color: C.red,     desc:"Автопост в Telegram канал" },
];

// ── HELPERS ───────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function callClaude(systemPrompt, userPrompt) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "";
}

// ── SUB-COMPONENTS ───────────────────────────────────────────────

function LiveDot({ color = C.green, size = 8 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: color, display: "inline-block",
      animation: "pulse-dot 1.4s ease-in-out infinite",
    }} />
  );
}

function Spinner({ size = 14, color = C.accent }) {
  return (
    <span style={{
      width: size, height: size, border: `2px solid ${color}30`,
      borderTopColor: color, borderRadius: "50%",
      display: "inline-block", animation: "spin .7s linear infinite",
    }} />
  );
}

function ScoreBar({ score }) {
  if (score === null) return <span style={{ color: C.muted, fontSize: 12 }}>—</span>;
  const color = score >= 80 ? C.green : score >= 60 ? C.amber : C.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ flex: 1, height: 4, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${score}%`, background: color, borderRadius: 2,
          animation: "grow .5s ease",
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color, minWidth: 28, fontFamily: "JetBrains Mono" }}>
        {score}
      </span>
    </div>
  );
}

function AgentCard({ agent, status, log: agentLog }) {
  const statusColor = {
    idle: C.muted, running: C.amber, done: C.green, error: C.red,
  }[status];
  return (
    <div className="card" style={{ borderColor: status === "running" ? agent.color + "60" : C.border }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{agent.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13 }}>{agent.label}</div>
          <div style={{ fontSize: 11, color: C.textDim }}>{agent.desc}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {status === "running" && <Spinner size={12} color={agent.color} />}
          <span style={{ fontSize: 11, color: statusColor, fontWeight: 700, textTransform: "uppercase" }}>
            {status}
          </span>
        </div>
      </div>
      {agentLog.length > 0 && (
        <div style={{
          background: C.bg, borderRadius: 6, padding: "6px 8px",
          maxHeight: 80, overflowY: "auto",
          fontFamily: "JetBrains Mono", fontSize: 10, color: C.textDim,
        }}>
          {agentLog.map((l, i) => (
            <div key={i} style={{ marginBottom: 2, color: l.type === "ok" ? C.green : l.type === "err" ? C.red : C.textDim }}>
              {l.type === "ok" ? "✓ " : l.type === "err" ? "✗ " : "· "}{l.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ListingRow({ listing, idx }) {
  const typeColor = listing.type === "sale" ? C.accent : C.green;
  return (
    <div className="card fade-in" style={{
      display: "flex", alignItems: "center", gap: 12,
      animationDelay: `${idx * 40}ms`,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 8, background: C.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, flexShrink: 0,
      }}>
        {listing.img}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {listing.title}
        </div>
        <div style={{ fontSize: 11, color: C.textDim }}>
          📍 {listing.location} &nbsp;·&nbsp;
          <span style={{ color: typeColor }}>
            {listing.type === "sale" ? "Продажа" : "Аренда"}
          </span>
          &nbsp;·&nbsp;
          <span className="mono" style={{ fontSize: 10, color: C.muted }}>{listing.source}</span>
        </div>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: typeColor, whiteSpace: "nowrap" }}>
          {listing.price}
        </div>
        <div style={{ width: 90, marginTop: 4 }}>
          <ScoreBar score={listing.score} />
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────
export default function PropAIDashboard() {
  const [tab, setTab] = useState("agents");
  const [agentStatus, setAgentStatus] = useState({
    crawler: "idle", dedup: "idle", scorer: "idle", poster: "idle",
  });
  const [agentLogs, setAgentLogs] = useState({
    crawler: [], dedup: [], scorer: [], poster: [],
  });
  const [listings, setListings] = useState(MOCK_LISTINGS);
  const [stats, setStats] = useState({ total: 0, filtered: 0, dupes: 0, posted: 0 });
  const [running, setRunning] = useState(false);
  const [globalLog, setGlobalLog] = useState([]);
  const [lead, setLead] = useState({ name: "", phone: "", service: "Покупка" });
  const [leadStatus, setLeadStatus] = useState("idle");
  const [leadAIResponse, setLeadAIResponse] = useState("");
  const logRef = useRef(null);

  const addLog = useCallback((msg, type = "info") => {
    const ts = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setGlobalLog(prev => [...prev.slice(-80), { msg, type, ts }]);
  }, []);

  const addAgentLog = useCallback((agentId, text, type = "info") => {
    setAgentLogs(prev => ({
      ...prev,
      [agentId]: [...prev[agentId].slice(-15), { text, type }],
    }));
  }, []);

  const setStatus = useCallback((agentId, status) => {
    setAgentStatus(prev => ({ ...prev, [agentId]: status }));
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [globalLog]);

  // ── AGENT PIPELINE ──────────────────────────────────────────────
  async function runAgents() {
    if (running) return;
    setRunning(true);
    setGlobalLog([]);
    setListings(MOCK_LISTINGS.map(l => ({ ...l, score: null })));
    setStats({ total: 0, filtered: 0, dupes: 0, posted: 0 });

    addLog("🚀 Запуск агентов PropAI...", "info");

    // ── CRAWLER ──
    setStatus("crawler", "running");
    addAgentLog("crawler", "Инициализация...", "info");
    addLog("🕷️ Crawler AI: начинаю сбор объявлений", "info");

    for (const src of SOURCES) {
      await sleep(800);
      const count = Math.floor(Math.random() * 30) + 15;
      addAgentLog("crawler", `${src.label}: +${count} объявлений`, "ok");
      addLog(`  [crawler] ${src.label} → ${count} объявлений`, "ok");
      setStats(p => ({ ...p, total: p.total + count }));
    }

    await sleep(400);
    setStatus("crawler", "done");
    addLog("✅ Crawler завершён", "ok");

    // ── DEDUP ──
    await sleep(300);
    setStatus("dedup", "running");
    addAgentLog("dedup", "Сравниваю хеши...", "info");
    addLog("🔄 Dedup AI: удаление дублей", "info");
    await sleep(1000);

    const dupes = Math.floor(Math.random() * 12) + 5;
    const filtered = MOCK_LISTINGS.length;
    addAgentLog("dedup", `Удалено дублей: ${dupes}`, "ok");
    addAgentLog("dedup", `Уникальных: ${filtered}`, "ok");
    addLog(`  [dedup] дублей: ${dupes}, уникальных: ${filtered}`, "ok");
    setStats(p => ({ ...p, dupes, filtered }));
    setStatus("dedup", "done");
    addLog("✅ Dedup завершён", "ok");

    // ── SCORER ──
    await sleep(300);
    setStatus("scorer", "running");
    addLog("⭐ Score AI: оцениваю объявления через Claude API...", "info");
    addAgentLog("scorer", "Загружаю объявления в AI...", "info");

    const scoredListings = [...MOCK_LISTINGS];
    for (let i = 0; i < scoredListings.length; i++) {
      const lst = scoredListings[i];
      addAgentLog("scorer", `Оцениваю: ${lst.title.slice(0, 30)}...`, "info");

      try {
        const raw = await callClaude(
          "Ты эксперт по недвижимости Молдовы и ПМР. Оцени качество объявления по шкале 0-100. Учитывай: цену, локацию, описание, тип сделки. Верни ТОЛЬКО число от 0 до 100, без пояснений.",
          `Объявление: ${lst.title}. Цена: ${lst.price}. Локация: ${lst.location}. Тип: ${lst.type === "sale" ? "продажа" : "аренда"}. Описание: ${lst.desc}`
        );
        const score = Math.min(100, Math.max(0, parseInt(raw.trim()) || 50));
        scoredListings[i] = { ...lst, score };
        setListings([...scoredListings]);
        addAgentLog("scorer", `${lst.title.slice(0, 22)}... → ${score}/100`, score >= 70 ? "ok" : "info");
        addLog(`  [scorer] "${lst.title.slice(0, 25)}..." → ${score}`, score >= 70 ? "ok" : "info");
      } catch (e) {
        const fallback = Math.floor(Math.random() * 40) + 50;
        scoredListings[i] = { ...lst, score: fallback };
        setListings([...scoredListings]);
        addAgentLog("scorer", `API error — fallback ${fallback}`, "err");
      }

      await sleep(200);
    }

    setStatus("scorer", "done");
    addLog("✅ Scorer завершён", "ok");

    // ── POSTER ──
    await sleep(300);
    setStatus("poster", "running");
    addLog("📢 Channel AI: отбор топовых объявлений для Telegram...", "info");

    const topListings = scoredListings.filter(l => l.score >= 75).sort((a, b) => b.score - a.score);
    addAgentLog("poster", `Топ объявлений: ${topListings.length}`, "info");

    let posted = 0;
    for (const lst of topListings.slice(0, 3)) {
      await sleep(700);
      addAgentLog("poster", `→ Telegram: "${lst.title.slice(0, 25)}..." (${lst.score})`, "ok");
      addLog(`  [poster] ✈️ отправлено: "${lst.title.slice(0, 30)}" (score: ${lst.score})`, "ok");
      posted++;
    }

    setStats(p => ({ ...p, posted }));
    setStatus("poster", "done");
    addLog("✅ Channel AI завершён", "ok");
    addLog(`🎉 Цикл завершён! Объявлений: ${MOCK_LISTINGS.length}, опубликовано: ${posted}`, "ok");
    setRunning(false);
  }

  // ── LEAD SUBMIT ─────────────────────────────────────────────────
  async function submitLead() {
    if (!lead.name || !lead.phone) return;
    setLeadStatus("loading");
    setLeadAIResponse("");
    try {
      const res = await callClaude(
        "Ты профессиональный риелтор PropAI в Молдове и ПМР. Клиент оставил заявку. Напиши короткий персонализированный ответ (2-3 предложения) на русском языке: поблагодари, подтверди заявку, скажи что свяжешься в течение 30 минут.",
        `Имя: ${lead.name}, Телефон: ${lead.phone}, Услуга: ${lead.service}`
      );
      setLeadAIResponse(res);
      setLeadStatus("done");
    } catch {
      setLeadAIResponse("Заявка принята! Свяжемся с вами в течение 30 минут.");
      setLeadStatus("done");
    }
  }

  function resetLead() {
    setLead({ name: "", phone: "", service: "Покупка" });
    setLeadStatus("idle");
    setLeadAIResponse("");
  }

  // ── TABS ──────────────────────────────────────────────────────
  const tabs = [
    { id: "agents", label: "⚡ Агенты" },
    { id: "listings", label: "🏠 Объявления" },
    { id: "lead", label: "🔥 Заявки" },
    { id: "log", label: "📋 Лог" },
  ];

  const topScored = [...listings].filter(l => l.score !== null).sort((a, b) => b.score - a.score);

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: C.bg }}>

        {/* ── HEADER ── */}
        <div style={{
          borderBottom: `1px solid ${C.border}`,
          padding: "0 20px",
          background: C.surface,
          position: "sticky", top: 0, zIndex: 100,
        }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 16, height: 56 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>🏙️</span>
              <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>PropAI</span>
              <span style={{ color: C.muted, fontSize: 16 }}>.md</span>
            </div>

            <div style={{
              flex: 1, display: "flex", gap: 2,
              background: C.bg, borderRadius: 8, padding: 3,
            }}>
              {tabs.map(t => (
                <button key={t.id} className="btn" onClick={() => setTab(t.id)} style={{
                  flex: 1, justifyContent: "center", fontSize: 12, padding: "6px 8px",
                  background: tab === t.id ? C.surface : "transparent",
                  color: tab === t.id ? C.text : C.textDim,
                  border: tab === t.id ? `1px solid ${C.border}` : "1px solid transparent",
                }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <LiveDot color={running ? C.amber : C.green} />
              <span style={{ fontSize: 11, color: C.textDim, fontWeight: 600 }}>
                {running ? "РАБОТАЕТ" : "ГОТОВ"}
              </span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 20px 40px" }}>

          {/* ── STAT ROW ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Объявлений", val: stats.total || MOCK_LISTINGS.length, color: C.accent },
              { label: "Уникальных", val: stats.filtered || MOCK_LISTINGS.length, color: C.green },
              { label: "Дублей удалено", val: stats.dupes, color: C.amber },
              { label: "В канал", val: stats.posted, color: C.red },
            ].map(s => (
              <div key={s.label} className="card" style={{ textAlign: "center", padding: 12 }}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
                  {s.val}
                </div>
                <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── AGENTS TAB ── */}
          {tab === "agents" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>⚡ AI Агенты</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                    Парсер → дедупликация → AI-скоринг → автопост в Telegram
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={runAgents}
                  disabled={running}
                  style={{ opacity: running ? .6 : 1 }}
                >
                  {running ? <><Spinner size={12} color="#fff" /> Работает...</> : "▶ Запустить цикл"}
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
                {AGENTS.map(a => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    status={agentStatus[a.id]}
                    log={agentLogs[a.id]}
                  />
                ))}
              </div>

              {/* Source status */}
              <div className="card">
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>📡 Источники</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {SOURCES.map(src => (
                    <div key={src.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <LiveDot
                        color={agentStatus.crawler === "done" ? C.green : agentStatus.crawler === "running" ? C.amber : C.muted}
                        size={7}
                      />
                      <span style={{ fontWeight: 700, fontSize: 13, width: 90 }}>{src.label}</span>
                      <span className="mono" style={{ fontSize: 10, color: C.muted, flex: 1 }}>
                        {src.url}
                      </span>
                      <span className={`badge ${agentStatus.crawler === "done" ? "badge-green" : "badge-amber"}`}>
                        {agentStatus.crawler === "done" ? "OK" : agentStatus.crawler === "running" ? "..." : "IDLE"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── LISTINGS TAB ── */}
          {tab === "listings" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>🏠 Объявления</div>
                  <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                    {listings.filter(l => l.score !== null).length} оценено · {listings.filter(l => (l.score || 0) >= 75).length} топ
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["all","sale","rent"].map(f => (
                    <button key={f} className="btn btn-ghost" style={{ fontSize: 11, padding: "5px 12px" }}>
                      {f === "all" ? "Все" : f === "sale" ? "Продажа" : "Аренда"}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(topScored.length ? topScored : listings).map((lst, i) => (
                  <ListingRow key={lst.id} listing={lst} idx={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── LEAD TAB ── */}
          {tab === "lead" && (
            <div style={{ maxWidth: 480 }}>
              <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 4 }}>🔥 Тест заявки</div>
              <div style={{ fontSize: 12, color: C.textDim, marginBottom: 20 }}>
                Симуляция формы с сайта → AI-ответ + Telegram уведомление
              </div>

              {leadStatus !== "done" ? (
                <div className="card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { key: "name", placeholder: "Имя клиента", type: "text" },
                    { key: "phone", placeholder: "Телефон (+373 или +7...)", type: "tel" },
                  ].map(f => (
                    <input key={f.key} type={f.type} placeholder={f.placeholder} value={lead[f.key]}
                      onChange={e => setLead(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{
                        background: C.bg, border: `1px solid ${C.border}`,
                        borderRadius: 8, padding: "10px 14px", color: C.text,
                        fontFamily: "Manrope", fontSize: 13, outline: "none",
                        transition: "border-color .15s",
                      }}
                    />
                  ))}

                  <select value={lead.service}
                    onChange={e => setLead(p => ({ ...p, service: e.target.value }))}
                    style={{
                      background: C.bg, border: `1px solid ${C.border}`,
                      borderRadius: 8, padding: "10px 14px", color: C.text,
                      fontFamily: "Manrope", fontSize: 13, outline: "none",
                    }}
                  >
                    {["Покупка","Продажа","Аренда","Оценка","Консультация"].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>

                  <button className="btn btn-primary" onClick={submitLead}
                    disabled={leadStatus === "loading" || !lead.name || !lead.phone}
                    style={{ justifyContent: "center", padding: "12px", opacity: (!lead.name || !lead.phone) ? .5 : 1 }}>
                    {leadStatus === "loading" ? <><Spinner size={12} color="#fff" /> AI обрабатывает...</> : "Отправить заявку"}
                  </button>

                  <div style={{
                    background: C.bg, borderRadius: 8, padding: 12,
                    fontFamily: "JetBrains Mono", fontSize: 11, color: C.textDim,
                  }}>
                    <div style={{ color: C.muted, marginBottom: 4 }}>// Telegram уведомление:</div>
                    <div style={{ color: C.green }}>🔥 НОВАЯ ЗАЯВКА</div>
                    <div>👤 Имя: {lead.name || "..."}</div>
                    <div>📞 Телефон: {lead.phone || "..."}</div>
                    <div>🏠 Услуга: {lead.service}</div>
                    <div>🌐 Источник: сайт</div>
                  </div>
                </div>
              ) : (
                <div className="card fade-in" style={{ borderColor: C.green + "60" }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>✅</span>
                    <div>
                      <div style={{ fontWeight: 800, color: C.green }}>Заявка принята!</div>
                      <div style={{ fontSize: 12, color: C.textDim }}>AI-ответ сгенерирован</div>
                    </div>
                  </div>
                  <div style={{
                    background: C.bg, borderRadius: 8, padding: 12,
                    fontSize: 13, lineHeight: 1.6, color: C.text,
                    borderLeft: `3px solid ${C.accent}`,
                  }}>
                    {leadAIResponse}
                  </div>
                  <div style={{
                    marginTop: 10, padding: 10, background: C.amberLo,
                    borderRadius: 8, fontSize: 11, color: C.amber,
                    fontFamily: "JetBrains Mono",
                  }}>
                    📨 → Telegram LEAD_NOTIFY_CHAT_ID: уведомление отправлено
                  </div>
                  <button className="btn btn-ghost" onClick={resetLead} style={{ marginTop: 12, width: "100%", justifyContent: "center" }}>
                    ← Новая заявка
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── LOG TAB ── */}
          {tab === "log" && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>📋 Системный лог</div>
                <button className="btn btn-ghost" onClick={() => setGlobalLog([])} style={{ fontSize: 11 }}>
                  Очистить
                </button>
              </div>
              <div ref={logRef} style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: 16, height: 420,
                overflowY: "auto", fontFamily: "JetBrains Mono", fontSize: 11,
                display: "flex", flexDirection: "column", gap: 2,
              }}>
                {globalLog.length === 0 ? (
                  <div style={{ color: C.muted, textAlign: "center", marginTop: 60 }}>
                    Запустите агентов для просмотра лога
                  </div>
                ) : globalLog.map((entry, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 10,
                    color: entry.type === "ok" ? C.green : entry.type === "err" ? C.red : C.textDim,
                  }}>
                    <span style={{ color: C.muted, flexShrink: 0 }}>{entry.ts}</span>
                    <span>{entry.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
