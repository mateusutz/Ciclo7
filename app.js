const { useState, useEffect, useMemo, useCallback } = React;

// ============================================================
// DADOS DO TREINO
// ============================================================
const ROTATION = ["A1", "B1", "C1", "A2", "B2", "C2", "D"];

const SESSIONS = {
  A1: {
    name: "Peito e Tríceps",
    tag: "A1",
    accent: "#E8843C",
    exercises: [
      { id: "a1e1", name: "Supino reto com halteres", sets: 4, reps: "8-12", rest: "90s", warn: "Halteres em vez de barra dão liberdade pro ombro esquerdo encontrar a trajetória natural. Comece leve pra sentir a estabilidade." },
      { id: "a1e2", name: "Supino inclinado na máquina (Hammer)", sets: 4, reps: "8-12", rest: "90s", note: "Ênfase em peito superior — prioridade sua." },
      { id: "a1e3", name: "Crucifixo na máquina (peck deck)", sets: 3, reps: "12-15", rest: "60s" },
      { id: "a1e4", name: "Crossover na polia (de cima pra baixo)", sets: 3, reps: "12-15", rest: "60s" },
      { id: "a1e5", name: "Tríceps na polia com barra", sets: 3, reps: "10-12", rest: "60s" },
      { id: "a1e6", name: "Tríceps francês com halter (sentado)", sets: 3, reps: "10-12", rest: "60s" },
      { id: "a1e7", name: "Tríceps coice na polia", sets: 3, reps: "12-15", rest: "45s" },
    ],
  },
  B1: {
    name: "Costas e Bíceps",
    tag: "B1",
    accent: "#4C9BD6",
    exercises: [
      { id: "b1e1", name: "Puxada frontal na máquina/polia", sets: 4, reps: "8-12", rest: "90s" },
      { id: "b1e2", name: "Remada baixa sentado na polia", sets: 4, reps: "10-12", rest: "90s", warn: "Mantenha o tronco estável e evite puxar com tranco no final — protege o ombro esquerdo." },
      { id: "b1e3", name: "Remada na máquina (apoiado no peito)", sets: 3, reps: "10-12", rest: "60s", note: "O apoio no peito tira a lombar e o quadril da jogada." },
      { id: "b1e4", name: "Pulldown com braço estendido na polia", sets: 3, reps: "12-15", rest: "60s" },
      { id: "b1e5", name: "Rosca direta com barra W", sets: 3, reps: "10-12", rest: "60s" },
      { id: "b1e6", name: "Rosca alternada com halteres (sentado)", sets: 3, reps: "10-12", rest: "60s" },
      { id: "b1e7", name: "Rosca martelo na polia", sets: 3, reps: "12-15", rest: "45s" },
    ],
  },
  C1: {
    name: "Ombros e Abdômen",
    tag: "C1",
    accent: "#C77DD6",
    exercises: [
      { id: "c1e1", name: "Desenvolvimento na máquina (Hammer)", sets: 4, reps: "8-12", rest: "90s", warn: "Máquina em vez de halteres/barra livre pro ombro esquerdo trabalhar numa trajetória guiada e estável. Prioridade sua." },
      { id: "c1e2", name: "Elevação lateral com halteres", sets: 4, reps: "12-15", rest: "60s", note: "O exercício rei pro deltoide medial — largura do ombro." },
      { id: "c1e3", name: "Elevação lateral na polia (unilateral)", sets: 3, reps: "12-15", rest: "45s", note: "Faça o lado esquerdo primeiro e iguale o volume do direito a ele." },
      { id: "c1e4", name: "Crucifixo invertido na máquina (peck deck invertido)", sets: 3, reps: "12-15", rest: "60s", note: "Deltoide posterior — costuma ser fraco e ajuda na saúde do ombro." },
      { id: "c1e5", name: "Elevação frontal na polia", sets: 3, reps: "12-15", rest: "45s" },
      { id: "c1e6", name: "Abdominal na máquina", sets: 3, reps: "12-15", rest: "45s" },
      { id: "c1e7", name: "Prancha", sets: 3, reps: "falha", rest: "45s", warn: "Mantenha o quadril neutro, sem deixar cair. Se incomodar o quadril, troque por abdominal supra no solo." },
    ],
  },
  A2: {
    name: "Peito e Tríceps",
    tag: "A2",
    accent: "#E8843C",
    exercises: [
      { id: "a2e1", name: "Supino reto na máquina (Hammer)", sets: 4, reps: "8-12", rest: "90s" },
      { id: "a2e2", name: "Supino inclinado com halteres", sets: 4, reps: "8-12", rest: "90s", warn: "Mesma lógica de liberdade pro ombro esquerdo." },
      { id: "a2e3", name: "Crossover na polia (de baixo pra cima)", sets: 3, reps: "12-15", rest: "60s", note: "Pega o peito superior por outro ângulo." },
      { id: "a2e4", name: "Crucifixo com halteres no banco reto", sets: 3, reps: "12-15", rest: "60s" },
      { id: "a2e5", name: "Tríceps testa com barra W", sets: 3, reps: "10-12", rest: "60s" },
      { id: "a2e6", name: "Tríceps na polia com corda", sets: 3, reps: "12-15", rest: "45s" },
      { id: "a2e7", name: "Mergulho assistido na máquina", sets: 3, reps: "10-12", rest: "60s" },
    ],
  },
  B2: {
    name: "Costas e Bíceps",
    tag: "B2",
    accent: "#4C9BD6",
    exercises: [
      { id: "b2e1", name: "Puxada com pegada neutra (triângulo)", sets: 4, reps: "8-12", rest: "90s" },
      { id: "b2e2", name: "Remada cavalinho ou remada T (apoio no peito)", sets: 4, reps: "10-12", rest: "90s" },
      { id: "b2e3", name: "Remada unilateral na polia baixa", sets: 3, reps: "10-12", rest: "60s", note: "Trabalha cada lado isolado, equilibra o esquerdo." },
      { id: "b2e4", name: "Puxada na polia com braço estendido", sets: 3, reps: "12-15", rest: "60s" },
      { id: "b2e5", name: "Rosca scott na máquina", sets: 3, reps: "10-12", rest: "60s" },
      { id: "b2e6", name: "Rosca direta na polia baixa", sets: 3, reps: "10-12", rest: "60s" },
      { id: "b2e7", name: "Rosca martelo com halteres", sets: 3, reps: "12-15", rest: "45s" },
    ],
  },
  C2: {
    name: "Ombros e Abdômen",
    tag: "C2",
    accent: "#C77DD6",
    exercises: [
      { id: "c2e1", name: "Desenvolvimento com halteres sentado", sets: 4, reps: "8-12", rest: "90s", warn: "Se sentir o ombro esquerdo instável, volte pra máquina. Só use halteres se a sensação estiver boa. Prioridade sua." },
      { id: "c2e2", name: "Elevação lateral na máquina", sets: 4, reps: "12-15", rest: "60s" },
      { id: "c2e3", name: "Elevação lateral com halteres (sentado)", sets: 3, reps: "12-15", rest: "60s" },
      { id: "c2e4", name: "Crucifixo invertido na polia (cross)", sets: 3, reps: "12-15", rest: "45s" },
      { id: "c2e5", name: "Encolhimento com halteres (trapézio)", sets: 3, reps: "12-15", rest: "60s" },
      { id: "c2e6", name: "Abdominal na polia alta (ajoelhado)", sets: 3, reps: "12-15", rest: "45s" },
      { id: "c2e7", name: "Elevação de pernas suspenso ou no banco", sets: 3, reps: "12-15", rest: "45s", warn: "Faça controlado e sem balanço. Se puxar o quadril, troque por abdominal infra no solo com amplitude curta." },
    ],
  },
  D: {
    name: "Inferiores",
    tag: "D",
    accent: "#5EB87A",
    headerWarn: "Sessão inteira pensada pra poupar o quadril pós-artroscopia. Nada de carga axial pesada nem amplitude extrema. Se algum movimento gerar dor (não confunda com esforço muscular normal), pare.",
    exercises: [
      { id: "de1", name: "Cadeira extensora", sets: 4, reps: "12-15", rest: "75s", note: "Quadríceps com zero estresse de quadril." },
      { id: "de2", name: "Leg press com amplitude controlada (parcial)", sets: 4, reps: "12-15", rest: "90s", warn: "Limite a descida ao ponto antes do quadril 'encaixar' ou sentir tensão. Amplitude curta e segura é o objetivo." },
      { id: "de3", name: "Mesa flexora", sets: 4, reps: "12-15", rest: "75s", note: "Posteriores de coxa." },
      { id: "de4", name: "Cadeira flexora sentado", sets: 3, reps: "12-15", rest: "60s" },
      { id: "de5", name: "Cadeira adutora", sets: 3, reps: "15-20", rest: "45s", warn: "Amplitude moderada, sem forçar o final do movimento." },
      { id: "de6", name: "Panturrilha na máquina (em pé)", sets: 4, reps: "15-20", rest: "45s" },
      { id: "de7", name: "Panturrilha sentado", sets: 3, reps: "15-20", rest: "45s" },
    ],
  },
};

// ============================================================
// STORAGE HELPERS
// ============================================================
const KEY_LOGS = "logs:v1"; // { [exId]: [{date, weight, reps, note}] }
const KEY_PROGRESS = "progress:v1"; // { [sessionKey]: { date, checks: {exId:true} } }
const KEY_STATE = "appstate:v1"; // { rotationIndex }

const NS = "ciclo7:";
async function storeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
async function storeSet(key, value) {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
  } catch (e) {
    console.error("storage set failed", e);
  }
}

// ============================================================
// ICONS (inline svg, no deps)
// ============================================================
const Icon = {
  Check: (p) => (<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="20 6 9 17 4 12" /></svg>),
  Warn: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>),
  Dumbbell: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></svg>),
  Chart: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>),
  Timer: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M5 3 2 6" /><path d="m22 6-3-3" /></svg>),
  List: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>),
  Arrow: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>),
  Trophy: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>),
};

// ============================================================
// REST TIMER
// ============================================================
function parseRest(rest) {
  const m = String(rest).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 60;
}

function RestTimer({ seconds, accent, onClose }) {
  const [left, setLeft] = useState(seconds);
  const [running, setRunning] = useState(true);
  useEffect(() => {
    if (!running) return;
    if (left <= 0) { setRunning(false); return; }
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [running, left]);
  const mm = Math.floor(Math.max(left, 0) / 60);
  const ss = Math.max(left, 0) % 60;
  const done = left <= 0;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(10,10,12,0.82)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#7a7a82", marginBottom: 18, fontWeight: 700 }}>Descanso</div>
        <div style={{ fontSize: 92, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1, color: done ? accent : "#f4f4f5", fontFamily: "'Barlow Condensed', sans-serif" }}>
          {mm}:{String(ss).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 15, color: done ? accent : "#7a7a82", marginTop: 8, fontWeight: 600, minHeight: 22 }}>{done ? "Bora pra próxima série" : ""}</div>
        <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "center" }}>
          {!done && <button onClick={() => setRunning((r) => !r)} style={pillBtn(accent, false)}>{running ? "Pausar" : "Retomar"}</button>}
          <button onClick={onClose} style={pillBtn(accent, true)}>{done ? "Fechar" : "Pular"}</button>
        </div>
      </div>
    </div>
  );
}

const pillBtn = (accent, filled) => ({
  padding: "12px 26px", borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer",
  border: filled ? "none" : `1.5px solid ${accent}`,
  background: filled ? accent : "transparent",
  color: filled ? "#101013" : accent,
});

// ============================================================
// COMPLETION RING (signature element)
// ============================================================
function Ring({ pct, accent, size = 132, stroke = 11 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#26262b" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }} />
    </svg>
  );
}

// ============================================================
// MAIN APP
// ============================================================
function App() {
  const [tab, setTab] = useState("today"); // today | sessions | progress
  const [rotationIndex, setRotationIndex] = useState(0);
  const [logs, setLogs] = useState({});
  const [progress, setProgress] = useState({});
  const [activeSession, setActiveSession] = useState(null); // session key for detail view
  const [timer, setTimer] = useState(null); // {seconds, accent}
  const [loaded, setLoaded] = useState(false);

  // load
  useEffect(() => {
    (async () => {
      const st = await storeGet(KEY_STATE, { rotationIndex: 0 });
      const lg = await storeGet(KEY_LOGS, {});
      const pr = await storeGet(KEY_PROGRESS, {});
      setRotationIndex(st.rotationIndex || 0);
      setLogs(lg);
      setProgress(pr);
      setLoaded(true);
    })();
  }, []);

  const todayKey = ROTATION[rotationIndex % ROTATION.length];
  const todaySession = SESSIONS[todayKey];

  const sessionProgress = useCallback((key) => {
    const p = progress[key];
    const total = SESSIONS[key].exercises.length;
    const done = p ? Object.values(p.checks || {}).filter(Boolean).length : 0;
    return { done, total, pct: total ? done / total : 0 };
  }, [progress]);

  const toggleCheck = async (sessionKey, exId) => {
    const next = { ...progress };
    const cur = next[sessionKey] || { date: new Date().toISOString(), checks: {} };
    cur.checks = { ...cur.checks, [exId]: !cur.checks[exId] };
    cur.date = new Date().toISOString();
    next[sessionKey] = cur;
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
  };

  const finishSession = async (sessionKey) => {
    // clear checks for that session and advance rotation if it's today
    const next = { ...progress };
    delete next[sessionKey];
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
    if (sessionKey === todayKey) {
      const ni = (rotationIndex + 1) % ROTATION.length;
      setRotationIndex(ni);
      await storeSet(KEY_STATE, { rotationIndex: ni });
    }
    setActiveSession(null);
    setTab("today");
  };

  const logSet = async (exId, entry) => {
    const next = { ...logs };
    const arr = next[exId] ? [...next[exId]] : [];
    arr.push({ ...entry, date: new Date().toISOString() });
    next[exId] = arr;
    setLogs(next);
    await storeSet(KEY_LOGS, next);
  };

  const lastLog = (exId) => {
    const arr = logs[exId];
    return arr && arr.length ? arr[arr.length - 1] : null;
  };

  if (!loaded) {
    return <div style={{ ...root, alignItems: "center", justifyContent: "center", display: "flex" }}><div style={{ color: "#5a5a62" }}>Carregando…</div></div>;
  }

  return (
    <div style={root}>
      <style>{globalCss}</style>

      <header style={headerBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ color: "#E8843C", display: "flex" }}><Icon.Dumbbell /></span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 0.5, textTransform: "uppercase" }}>Ciclo<span style={{ color: "#E8843C" }}>7</span></span>
        </div>
        <div style={{ fontSize: 11, color: "#6a6a72", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>Hipertrofia · iniciante</div>
      </header>

      <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {activeSession ? (
          <SessionDetail
            sessionKey={activeSession}
            session={SESSIONS[activeSession]}
            progress={progress[activeSession]}
            onToggle={toggleCheck}
            onBack={() => setActiveSession(null)}
            onFinish={() => finishSession(activeSession)}
            onTimer={(s, a) => setTimer({ seconds: s, accent: a })}
            logSet={logSet}
            lastLog={lastLog}
            sp={sessionProgress(activeSession)}
          />
        ) : tab === "today" ? (
          <TodayView
            todayKey={todayKey}
            session={todaySession}
            sp={sessionProgress(todayKey)}
            onOpen={() => setActiveSession(todayKey)}
            rotation={ROTATION}
            rotationIndex={rotationIndex}
            sessionProgress={sessionProgress}
            onPick={(k) => setActiveSession(k)}
          />
        ) : tab === "sessions" ? (
          <SessionsView sessionProgress={sessionProgress} onOpen={(k) => setActiveSession(k)} />
        ) : (
          <ProgressView logs={logs} />
        )}
      </main>

      {!activeSession && (
        <nav style={navBar}>
          {[
            { id: "today", label: "Hoje", icon: <Icon.Arrow /> },
            { id: "sessions", label: "Treinos", icon: <Icon.List /> },
            { id: "progress", label: "Progresso", icon: <Icon.Chart /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={navBtn(tab === t.id)}>
              <span style={{ display: "flex" }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {timer && <RestTimer seconds={timer.seconds} accent={timer.accent} onClose={() => setTimer(null)} />}
    </div>
  );
}

// ============================================================
// TODAY VIEW
// ============================================================
function TodayView({ todayKey, session, sp, onOpen, rotation, rotationIndex, sessionProgress, onPick }) {
  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 4 }}>Treino de hoje</div>

      <div style={{ ...card, marginTop: 14, padding: 22, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: session.accent }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "inline-block", background: session.accent, color: "#101013", fontWeight: 800, fontSize: 13, padding: "3px 11px", borderRadius: 6, letterSpacing: 1 }}>{session.tag}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 700, lineHeight: 1.05, marginTop: 12, textTransform: "uppercase" }}>{session.name}</div>
            <div style={{ color: "#8a8a92", fontSize: 14, marginTop: 6 }}>{session.exercises.length} exercícios · {sp.done}/{sp.total} feitos</div>
          </div>
          <div style={{ position: "relative", flexShrink: 0 }}>
            <Ring pct={sp.pct} accent={session.accent} />
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif" }}>{Math.round(sp.pct * 100)}<span style={{ fontSize: 15 }}>%</span></span>
            </div>
          </div>
        </div>
        <button onClick={onOpen} style={{ ...primaryBtn(session.accent), marginTop: 20, width: "100%" }}>
          {sp.done > 0 ? "Continuar treino" : "Começar treino"} <Icon.Arrow />
        </button>
      </div>

      <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, margin: "28px 0 12px" }}>O ciclo de 7 dias</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {rotation.map((k, i) => {
          const s = SESSIONS[k];
          const isToday = i === rotationIndex % rotation.length;
          const p = sessionProgress(k);
          return (
            <button key={k + i} onClick={() => onPick(k)} style={{ ...rowCard, borderColor: isToday ? s.accent : "#1f1f24", opacity: isToday ? 1 : 0.72 }}>
              <span style={{ width: 34, height: 34, borderRadius: 8, background: s.accent, color: "#101013", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.tag}</span>
              <span style={{ flex: 1, textAlign: "left" }}>
                <span style={{ display: "block", fontWeight: 600, fontSize: 15 }}>{s.name}</span>
                <span style={{ display: "block", fontSize: 12, color: "#7a7a82" }}>{isToday ? "Hoje" : `Dia ${i + 1}`} · {s.exercises.length} exercícios</span>
              </span>
              {p.done > 0 && p.done < p.total && <span style={{ fontSize: 11, color: s.accent, fontWeight: 700 }}>{p.done}/{p.total}</span>}
            </button>
          );
        })}
      </div>

      <div style={{ ...card, marginTop: 24, padding: 18, borderColor: "#3a2f1f", background: "#1a1610" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ color: "#E8843C", flexShrink: 0, marginTop: 1 }}><Icon.Warn /></span>
          <div style={{ fontSize: 13, color: "#c9b896", lineHeight: 1.5 }}>
            <strong style={{ color: "#E8843C" }}>Lembrete do programa.</strong> Rode por 8–10 semanas antes de reavaliar. Qualidade de execução vale mais que quantidade — se uma sessão pesar, corte os 2 últimos isoladores.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SESSIONS VIEW
// ============================================================
function SessionsView({ sessionProgress, onOpen }) {
  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 14 }}>Todos os treinos</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {ROTATION.map((k, i) => {
          const s = SESSIONS[k];
          const p = sessionProgress(k);
          return (
            <button key={k + i} onClick={() => onOpen(k)} style={{ ...card, padding: 18, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", width: "100%" }}>
              <span style={{ width: 44, height: 44, borderRadius: 10, background: s.accent, color: "#101013", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{s.tag}</span>
              <span style={{ flex: 1 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 16 }}>{s.name}</span>
                <span style={{ display: "block", fontSize: 13, color: "#7a7a82", marginTop: 2 }}>{s.exercises.length} exercícios</span>
              </span>
              <span style={{ color: "#5a5a62", display: "flex" }}><Icon.Arrow /></span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// SESSION DETAIL
// ============================================================
function SessionDetail({ sessionKey, session, progress, onToggle, onBack, onFinish, onTimer, logSet, lastLog, sp }) {
  const checks = (progress && progress.checks) || {};
  return (
    <div>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#101013", borderBottom: "1px solid #1f1f24", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#9a9aa2", cursor: "pointer", fontSize: 15, display: "flex", alignItems: "center", gap: 4, padding: 0 }}>
            <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon.Arrow /></span>
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: session.accent, color: "#101013", fontWeight: 800, fontSize: 11, padding: "2px 8px", borderRadius: 5 }}>{session.tag}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>{session.name}</span>
            </div>
          </div>
          <div style={{ position: "relative", width: 42, height: 42 }}>
            <Ring pct={sp.pct} accent={session.accent} size={42} stroke={4} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{sp.done}/{sp.total}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 18px 30px" }}>
        {session.headerWarn && (
          <div style={{ ...card, padding: 16, borderColor: "#3a2424", background: "#1a1010", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#e36a5a", flexShrink: 0, marginTop: 1 }}><Icon.Warn /></span>
              <div style={{ fontSize: 13, color: "#d6a99e", lineHeight: 1.5 }}>{session.headerWarn}</div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {session.exercises.map((ex, idx) => (
            <ExerciseCard
              key={ex.id}
              ex={ex}
              idx={idx}
              accent={session.accent}
              checked={!!checks[ex.id]}
              onToggle={() => onToggle(sessionKey, ex.id)}
              onTimer={() => onTimer(parseRest(ex.rest), session.accent)}
              logSet={logSet}
              last={lastLog(ex.id)}
            />
          ))}
        </div>

        <button onClick={onFinish} style={{ ...primaryBtn(session.accent), width: "100%", marginTop: 22, justifyContent: "center" }}>
          <Icon.Check /> {sessionKey === ROTATION[0] ? "Concluir e avançar ciclo" : "Concluir treino"}
        </button>
        <p style={{ textAlign: "center", color: "#5a5a62", fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
          Concluir limpa os checks e, se for o treino de hoje, avança pro próximo dia do ciclo.
        </p>
      </div>
    </div>
  );
}

function ExerciseCard({ ex, idx, accent, checked, onToggle, onTimer, logSet, last }) {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const save = () => {
    if (!weight) return;
    logSet(ex.id, { weight: parseFloat(weight), reps: reps || ex.reps });
    setWeight(""); setReps("");
    setOpen(false);
  };

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", borderColor: checked ? accent + "66" : "#1f1f24" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <button onClick={onToggle} aria-label="marcar concluído" style={{
          width: 56, flexShrink: 0, border: "none", cursor: "pointer",
          background: checked ? accent : "#1a1a1f",
          color: checked ? "#101013" : "#3a3a42",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all .2s",
        }}>
          <span style={{ width: 26, height: 26, borderRadius: "50%", border: checked ? "none" : "2px solid #3a3a42", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {checked && <Icon.Check />}
          </span>
        </button>

        <div style={{ flex: 1, padding: "13px 14px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#5a5a62", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{String(idx + 1).padStart(2, "0")}</span>
            <span style={{ fontWeight: 600, fontSize: 15, lineHeight: 1.25, textDecoration: checked ? "line-through" : "none", color: checked ? "#7a7a82" : "#f0f0f2" }}>{ex.name}</span>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
            <Stat label="Séries" value={ex.sets} accent={accent} />
            <Stat label="Reps" value={ex.reps} accent={accent} />
            <button onClick={onTimer} style={{ display: "flex", alignItems: "center", gap: 5, background: "#1a1a1f", border: "1px solid #2a2a30", borderRadius: 7, padding: "4px 9px", color: "#b0b0b8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
              <Icon.Timer /> {ex.rest}
            </button>
          </div>

          {(ex.warn || ex.note) && (
            <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 10, padding: "8px 10px", borderRadius: 8, background: ex.warn ? "#1a1410" : "#15151a", border: ex.warn ? "1px solid #3a2f1f" : "1px solid #22222a" }}>
              {ex.warn && <span style={{ color: "#E8843C", flexShrink: 0, marginTop: 1 }}><Icon.Warn /></span>}
              <span style={{ fontSize: 12.5, color: ex.warn ? "#c9b896" : "#9a9aa2", lineHeight: 1.45 }}>{ex.warn || ex.note}</span>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 11 }}>
            <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", color: accent, fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0 }}>
              <Icon.Plus /> Registrar carga
            </button>
            {last && (
              <span style={{ fontSize: 12, color: "#7a7a82" }}>
                Última: <strong style={{ color: "#b0b0b8" }}>{last.weight}kg × {last.reps}</strong>
              </span>
            )}
          </div>

          {open && (
            <div style={{ display: "flex", gap: 8, marginTop: 11, alignItems: "center" }}>
              <input inputMode="decimal" placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} />
              <span style={{ color: "#5a5a62" }}>×</span>
              <input inputMode="numeric" placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)} style={inputStyle} />
              <button onClick={save} style={{ ...primaryBtn(accent), padding: "9px 16px", fontSize: 13 }}>Salvar</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const Stat = ({ label, value, accent }) => (
  <span style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
    <span style={{ fontSize: 18, fontWeight: 800, color: accent, fontFamily: "'Barlow Condensed', sans-serif" }}>{value}</span>
    <span style={{ fontSize: 11, color: "#6a6a72", textTransform: "uppercase", letterSpacing: 0.5, fontWeight: 600 }}>{label}</span>
  </span>
);

// ============================================================
// PROGRESS VIEW
// ============================================================
function ProgressView({ logs }) {
  const allExercises = useMemo(() => {
    const map = {};
    Object.values(SESSIONS).forEach((s) => s.exercises.forEach((e) => { map[e.id] = { name: e.name, tag: s.tag, accent: s.accent }; }));
    return map;
  }, []);

  const logged = Object.entries(logs).filter(([, arr]) => arr && arr.length).sort((a, b) => {
    const la = new Date(a[1][a[1].length - 1].date).getTime();
    const lb = new Date(b[1][b[1].length - 1].date).getTime();
    return lb - la;
  });

  const totalSets = Object.values(logs).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0);
  const exercisesTracked = logged.length;

  const [expanded, setExpanded] = useState(null);

  if (logged.length === 0) {
    return (
      <div style={{ padding: "60px 30px", textAlign: "center" }}>
        <div style={{ color: "#3a3a42", display: "inline-flex", marginBottom: 16 }}><Icon.Chart width={48} height={48} /></div>
        <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Sem registros ainda</div>
        <div style={{ color: "#7a7a82", fontSize: 14, lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>
          Registre a carga em cada exercício durante o treino e seu histórico de progressão aparece aqui.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ display: "flex", gap: 11, marginBottom: 22 }}>
        <MetricCard value={totalSets} label="séries registradas" accent="#E8843C" icon={<Icon.Dumbbell />} />
        <MetricCard value={exercisesTracked} label="exercícios acompanhados" accent="#5EB87A" icon={<Icon.Trophy />} />
      </div>

      <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 12 }}>Histórico de carga</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {logged.map(([exId, arr]) => {
          const meta = allExercises[exId] || { name: exId, accent: "#888" };
          const last = arr[arr.length - 1];
          const first = arr[0];
          const delta = last.weight - first.weight;
          const isOpen = expanded === exId;
          return (
            <div key={exId} style={{ ...card, padding: 0, overflow: "hidden" }}>
              <button onClick={() => setExpanded(isOpen ? null : exId)} style={{ width: "100%", padding: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ width: 30, height: 30, borderRadius: 7, background: meta.accent, color: "#101013", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{meta.tag}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#f0f0f2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.name}</span>
                  <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 2 }}>{arr.length} registro{arr.length > 1 ? "s" : ""} · atual {last.weight}kg</span>
                </span>
                {delta !== 0 && (
                  <span style={{ fontSize: 13, fontWeight: 800, color: delta > 0 ? "#5EB87A" : "#e36a5a" }}>{delta > 0 ? "+" : ""}{delta}kg</span>
                )}
              </button>
              {isOpen && (
                <div style={{ padding: "0 16px 16px" }}>
                  <MiniChart arr={arr} accent={meta.accent} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 12 }}>
                    {[...arr].reverse().map((l, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: i < arr.length - 1 ? "1px solid #1c1c22" : "none" }}>
                        <span style={{ color: "#9a9aa2" }}>{new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</span>
                        <span style={{ fontWeight: 700, color: "#e0e0e4" }}>{l.weight}kg × {l.reps}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MetricCard({ value, label, accent, icon }) {
  return (
    <div style={{ ...card, flex: 1, padding: 16 }}>
      <span style={{ color: accent, display: "inline-flex", marginBottom: 8 }}>{icon}</span>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11.5, color: "#7a7a82", marginTop: 4, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function MiniChart({ arr, accent }) {
  const weights = arr.map((a) => a.weight);
  const max = Math.max(...weights);
  const min = Math.min(...weights);
  const range = max - min || 1;
  const W = 280, H = 60, pad = 6;
  const pts = weights.map((w, i) => {
    const x = pad + (i / Math.max(weights.length - 1, 1)) * (W - 2 * pad);
    const y = H - pad - ((w - min) / range) * (H - 2 * pad);
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3.5" fill={accent} />)}
    </svg>
  );
}

// ============================================================
// STYLES
// ============================================================
const root = {
  maxWidth: 480, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column",
  background: "#0d0d0f", color: "#f0f0f2",
  fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
};
const headerBar = {
  display: "flex", justifyContent: "space-between", alignItems: "center",
  padding: "16px 18px", borderBottom: "1px solid #1a1a1f", flexShrink: 0,
};
const navBar = {
  display: "flex", borderTop: "1px solid #1a1a1f", background: "#0d0d0f", flexShrink: 0,
  paddingBottom: "env(safe-area-inset-bottom, 0px)",
};
const navBtn = (active) => ({
  flex: 1, padding: "12px 0 14px", background: "none", border: "none", cursor: "pointer",
  display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
  color: active ? "#E8843C" : "#5a5a62", fontSize: 11, fontWeight: 600,
  borderTop: active ? "2px solid #E8843C" : "2px solid transparent", marginTop: -1,
});
const card = { background: "#141417", border: "1px solid #1f1f24", borderRadius: 14 };
const rowCard = { ...card, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", width: "100%" };
const primaryBtn = (accent) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: accent, color: "#101013", border: "none", borderRadius: 11,
  padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer",
});
const inputStyle = {
  width: 64, padding: "9px 10px", background: "#0d0d0f", border: "1px solid #2a2a30",
  borderRadius: 8, color: "#f0f0f2", fontSize: 14, fontWeight: 600, textAlign: "center",
  outline: "none",
};
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 0; }
  button:focus-visible { outline: 2px solid #E8843C; outline-offset: 2px; }
  input:focus { border-color: #E8843C; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;


// ============================================================
// MOUNT
// ============================================================
const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(React.createElement(App));
