const { useState, useEffect, useMemo, useCallback } = React;

// ============================================================
// CONSTANTES
// ============================================================
const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // exibe a semana começando na segunda
const PALETTE = ["#E8843C", "#4C9BD6", "#C77DD6", "#5EB87A", "#E3C84C", "#E36A5A"];
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ============================================================
// DADOS PADRÃO DO PROGRAMA (seed inicial)
// ============================================================
const DEFAULT_SESSIONS = {
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

// Deriva biblioteca e treinos a partir do programa padrão
const DEFAULT_LIBRARY = {};
const DEFAULT_WORKOUTS = {};
Object.entries(DEFAULT_SESSIONS).forEach(([key, s]) => {
  DEFAULT_WORKOUTS[key] = {
    key,
    name: s.name,
    tag: s.tag,
    accent: s.accent,
    headerWarn: s.headerWarn || "",
    items: s.exercises.map((e) => ({ exId: e.id, sets: e.sets, reps: e.reps, rest: e.rest })),
  };
  s.exercises.forEach((e) => {
    DEFAULT_LIBRARY[e.id] = { id: e.id, name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, warn: e.warn || "", note: e.note || "" };
  });
});
// Agenda padrão: seg=A1, ter=B1, qua=C1, qui=A2, sex=B2, sáb=D, dom=C2
const DEFAULT_SCHEDULE = { 0: "C2", 1: "A1", 2: "B1", 3: "C1", 4: "A2", 5: "B2", 6: "D" };

// ============================================================
// STORAGE (localStorage)
// ============================================================
const NS = "ciclo7:";
const KEY_LOGS = "logs:v1";
const KEY_PROGRESS = "progress:v1";
const KEY_LIBRARY = "library:v1";
const KEY_WORKOUTS = "workouts:v1";
const KEY_SCHEDULE = "schedule:v1";
const KEY_HISTORY = "history:v1";

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
// ICONS
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
  Pencil: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>),
  Trash: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>),
  X: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>),
  Up: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="18 15 12 9 6 15" /></svg>),
  Down: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="6 9 12 15 18 9" /></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>),
  Book: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>),
  Moon: (p) => (<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>),
  Calendar: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>),
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
    <div style={overlay} onClick={onClose}>
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

// ============================================================
// COMPLETION RING
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
  const [tab, setTab] = useState("today");
  const [lib, setLib] = useState({});
  const [workouts, setWorkouts] = useState({});
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [logs, setLogs] = useState({});
  const [progress, setProgress] = useState({});
  const [history, setHistory] = useState([]);
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [editingWorkout, setEditingWorkout] = useState(null); // draft object or "new"
  const [editingExercise, setEditingExercise] = useState(null); // { ex } or { ex: null }
  const [showSchedule, setShowSchedule] = useState(false);
  const [timer, setTimer] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const lg = await storeGet(KEY_LOGS, {});
      const pr = await storeGet(KEY_PROGRESS, {});
      const hs = await storeGet(KEY_HISTORY, []);
      let lb = await storeGet(KEY_LIBRARY, null);
      let wk = await storeGet(KEY_WORKOUTS, null);
      let sc = await storeGet(KEY_SCHEDULE, null);
      if (!lb) { lb = DEFAULT_LIBRARY; await storeSet(KEY_LIBRARY, lb); }
      if (!wk) { wk = DEFAULT_WORKOUTS; await storeSet(KEY_WORKOUTS, wk); }
      if (!sc) { sc = DEFAULT_SCHEDULE; await storeSet(KEY_SCHEDULE, sc); }
      setLogs(lg); setProgress(pr); setHistory(hs);
      setLib(lb); setWorkouts(wk); setSchedule(sc);
      setLoaded(true);
    })();
  }, []);

  // ---------- helpers ----------
  const todayIdx = new Date().getDay();
  const todayKey = schedule[todayIdx] || null;
  const todayWorkout = todayKey ? workouts[todayKey] : null;

  const sessionProgress = useCallback((key) => {
    const w = workouts[key];
    if (!w) return { done: 0, total: 0, pct: 0 };
    const p = progress[key];
    const total = w.items.length;
    const done = p ? w.items.filter((it) => p.checks && p.checks[it.exId]).length : 0;
    return { done, total, pct: total ? done / total : 0 };
  }, [progress, workouts]);

  const usageCount = useCallback((exId) => {
    return Object.values(workouts).reduce((acc, w) => acc + (w.items.some((it) => it.exId === exId) ? 1 : 0), 0);
  }, [workouts]);

  // ---------- mutations ----------
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
    const w = workouts[sessionKey];
    const nextH = [...history, { key: sessionKey, name: w ? w.name : sessionKey, tag: w ? w.tag : "", date: new Date().toISOString() }];
    setHistory(nextH);
    await storeSet(KEY_HISTORY, nextH);
    const next = { ...progress };
    delete next[sessionKey];
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
    setActiveWorkout(null);
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

  const saveExercise = async (ex) => {
    const next = { ...lib, [ex.id]: ex };
    setLib(next);
    await storeSet(KEY_LIBRARY, next);
    return ex;
  };

  const deleteExercise = async (exId) => {
    const next = { ...lib };
    delete next[exId];
    setLib(next);
    await storeSet(KEY_LIBRARY, next);
  };

  const saveWorkout = async (w) => {
    const next = { ...workouts, [w.key]: w };
    setWorkouts(next);
    await storeSet(KEY_WORKOUTS, next);
  };

  const deleteWorkout = async (key) => {
    const next = { ...workouts };
    delete next[key];
    setWorkouts(next);
    await storeSet(KEY_WORKOUTS, next);
    // limpa agenda
    const sc = { ...schedule };
    let changed = false;
    Object.keys(sc).forEach((d) => { if (sc[d] === key) { sc[d] = null; changed = true; } });
    if (changed) { setSchedule(sc); await storeSet(KEY_SCHEDULE, sc); }
    // limpa progresso pendente
    if (progress[key]) {
      const pr = { ...progress };
      delete pr[key];
      setProgress(pr);
      await storeSet(KEY_PROGRESS, pr);
    }
  };

  const setScheduleDay = async (dayIdx, key) => {
    const next = { ...schedule, [dayIdx]: key || null };
    setSchedule(next);
    await storeSet(KEY_SCHEDULE, next);
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
        <div style={{ fontSize: 11, color: "#6a6a72", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>Hipertrofia</div>
      </header>

      <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {activeWorkout && workouts[activeWorkout] ? (
          <SessionDetail
            sessionKey={activeWorkout}
            workout={workouts[activeWorkout]}
            lib={lib}
            progress={progress[activeWorkout]}
            onToggle={toggleCheck}
            onBack={() => setActiveWorkout(null)}
            onFinish={() => finishSession(activeWorkout)}
            onEdit={() => setEditingWorkout(workouts[activeWorkout])}
            onTimer={(s, a) => setTimer({ seconds: s, accent: a })}
            logSet={logSet}
            lastLog={lastLog}
            sp={sessionProgress(activeWorkout)}
          />
        ) : tab === "today" ? (
          <TodayView
            todayIdx={todayIdx}
            workout={todayWorkout}
            sp={todayKey ? sessionProgress(todayKey) : null}
            schedule={schedule}
            workouts={workouts}
            sessionProgress={sessionProgress}
            onOpen={(k) => setActiveWorkout(k)}
            onEditSchedule={() => setShowSchedule(true)}
          />
        ) : tab === "workouts" ? (
          <WorkoutsView
            workouts={workouts}
            onOpen={(k) => setActiveWorkout(k)}
            onEdit={(k) => setEditingWorkout(workouts[k])}
            onNew={() => setEditingWorkout("new")}
          />
        ) : tab === "library" ? (
          <LibraryView
            lib={lib}
            usageCount={usageCount}
            onEdit={(ex) => setEditingExercise({ ex })}
            onNew={() => setEditingExercise({ ex: null })}
          />
        ) : (
          <ProgressView logs={logs} lib={lib} workouts={workouts} history={history} />
        )}
      </main>

      {!activeWorkout && (
        <nav style={navBar}>
          {[
            { id: "today", label: "Hoje", icon: <Icon.Arrow /> },
            { id: "workouts", label: "Treinos", icon: <Icon.List /> },
            { id: "library", label: "Biblioteca", icon: <Icon.Book /> },
            { id: "progress", label: "Progresso", icon: <Icon.Chart /> },
          ].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={navBtn(tab === t.id)}>
              <span style={{ display: "flex" }}>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      )}

      {showSchedule && (
        <ScheduleEditor
          schedule={schedule}
          workouts={workouts}
          onSet={setScheduleDay}
          onClose={() => setShowSchedule(false)}
        />
      )}

      {editingWorkout && (
        <WorkoutEditor
          initial={editingWorkout === "new" ? null : editingWorkout}
          lib={lib}
          onSaveExercise={saveExercise}
          onSave={async (w) => { await saveWorkout(w); setEditingWorkout(null); }}
          onDelete={async (key) => { await deleteWorkout(key); setEditingWorkout(null); setActiveWorkout(null); }}
          onClose={() => setEditingWorkout(null)}
        />
      )}

      {editingExercise && (
        <ExerciseForm
          initial={editingExercise.ex}
          usage={editingExercise.ex ? usageCount(editingExercise.ex.id) : 0}
          onSave={async (ex) => { await saveExercise(ex); setEditingExercise(null); }}
          onDelete={editingExercise.ex ? async (id) => { await deleteExercise(id); setEditingExercise(null); } : null}
          onClose={() => setEditingExercise(null)}
        />
      )}

      {timer && <RestTimer seconds={timer.seconds} accent={timer.accent} onClose={() => setTimer(null)} />}
    </div>
  );
}

// ============================================================
// TODAY VIEW
// ============================================================
function TodayView({ todayIdx, workout, sp, schedule, workouts, sessionProgress, onOpen, onEditSchedule }) {
  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 4 }}>{DAYS[todayIdx]} · treino de hoje</div>

      {workout ? (
        <div style={{ ...card, marginTop: 14, padding: 22, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", background: workout.accent }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "inline-block", background: workout.accent, color: "#101013", fontWeight: 800, fontSize: 13, padding: "3px 11px", borderRadius: 6, letterSpacing: 1 }}>{workout.tag}</div>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 34, fontWeight: 700, lineHeight: 1.05, marginTop: 12, textTransform: "uppercase" }}>{workout.name}</div>
              <div style={{ color: "#8a8a92", fontSize: 14, marginTop: 6 }}>{workout.items.length} exercícios · {sp.done}/{sp.total} feitos</div>
            </div>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Ring pct={sp.pct} accent={workout.accent} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif" }}>{Math.round(sp.pct * 100)}<span style={{ fontSize: 15 }}>%</span></span>
              </div>
            </div>
          </div>
          <button onClick={() => onOpen(workout.key)} style={{ ...primaryBtn(workout.accent), marginTop: 20, width: "100%" }}>
            {sp.done > 0 ? "Continuar treino" : "Começar treino"} <Icon.Arrow />
          </button>
        </div>
      ) : (
        <div style={{ ...card, marginTop: 14, padding: 28, textAlign: "center" }}>
          <span style={{ color: "#3a3a42", display: "inline-flex", marginBottom: 12 }}><Icon.Moon width={42} height={42} /></span>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, textTransform: "uppercase" }}>Descanso</div>
          <div style={{ color: "#8a8a92", fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>Sem treino programado pra hoje.<br />Recuperação também é treino.</div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "28px 0 12px" }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700 }}>Sua semana</div>
        <button onClick={onEditSchedule} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px solid #2a2a30", borderRadius: 8, padding: "6px 12px", color: "#b0b0b8", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
          <Icon.Calendar /> Editar agenda
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {WEEK_ORDER.map((dayIdx) => {
          const key = schedule[dayIdx];
          const w = key ? workouts[key] : null;
          const isToday = dayIdx === todayIdx;
          const p = w ? sessionProgress(key) : null;
          return (
            <button
              key={dayIdx}
              onClick={() => w && onOpen(key)}
              style={{ ...rowCard, borderColor: isToday ? (w ? w.accent : "#3a3a42") : "#1f1f24", opacity: isToday ? 1 : 0.72, cursor: w ? "pointer" : "default" }}
            >
              <span style={{ width: 44, flexShrink: 0, fontSize: 11, fontWeight: 800, color: isToday ? "#f0f0f2" : "#6a6a72", textTransform: "uppercase", textAlign: "left" }}>{DAYS[dayIdx].slice(0, 3)}</span>
              {w ? (
                <React.Fragment>
                  <span style={{ width: 34, height: 34, borderRadius: 8, background: w.accent, color: "#101013", fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{w.tag}</span>
                  <span style={{ flex: 1, textAlign: "left" }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: 15 }}>{w.name}</span>
                    <span style={{ display: "block", fontSize: 12, color: "#7a7a82" }}>{isToday ? "Hoje" : ""} {w.items.length} exercícios</span>
                  </span>
                  {p && p.done > 0 && p.done < p.total && <span style={{ fontSize: 11, color: w.accent, fontWeight: 700 }}>{p.done}/{p.total}</span>}
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <span style={{ width: 34, height: 34, borderRadius: 8, background: "#1a1a1f", color: "#4a4a52", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon.Moon width={16} height={16} /></span>
                  <span style={{ flex: 1, textAlign: "left", color: "#6a6a72", fontWeight: 600, fontSize: 15 }}>Descanso</span>
                </React.Fragment>
              )}
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
// SCHEDULE EDITOR
// ============================================================
function ScheduleEditor({ schedule, workouts, onSet, onClose }) {
  return (
    <div style={overlay} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...panel, maxHeight: "85vh" }}>
        <div style={panelHeader}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>Agenda da semana</span>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>
        <div style={{ padding: "4px 18px 18px", overflowY: "auto" }}>
          <p style={{ color: "#7a7a82", fontSize: 13, lineHeight: 1.5, margin: "0 0 14px" }}>Escolha o treino de cada dia. Pode repetir treinos e deixar dias de descanso.</p>
          {WEEK_ORDER.map((dayIdx) => (
            <div key={dayIdx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 0", borderBottom: "1px solid #1c1c22" }}>
              <span style={{ width: 76, fontSize: 14, fontWeight: 700, color: "#d0d0d4" }}>{DAYS[dayIdx]}</span>
              <select
                value={schedule[dayIdx] || ""}
                onChange={(e) => onSet(dayIdx, e.target.value || null)}
                style={selectStyle}
              >
                <option value="">— Descanso —</option>
                {Object.values(workouts).map((w) => (
                  <option key={w.key} value={w.key}>{w.tag} · {w.name}</option>
                ))}
              </select>
            </div>
          ))}
          <button onClick={onClose} style={{ ...primaryBtn("#E8843C"), width: "100%", marginTop: 18 }}>Pronto</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// WORKOUTS VIEW
// ============================================================
function WorkoutsView({ workouts, onOpen, onEdit, onNew }) {
  const list = Object.values(workouts);
  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700 }}>Seus treinos</div>
        <button onClick={onNew} style={{ display: "flex", alignItems: "center", gap: 6, background: "#E8843C", border: "none", borderRadius: 8, padding: "8px 14px", color: "#101013", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
          <Icon.Plus /> Novo treino
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {list.map((w) => (
          <div key={w.key} style={{ ...card, padding: 0, display: "flex", alignItems: "stretch", overflow: "hidden" }}>
            <button onClick={() => onOpen(w.key)} style={{ flex: 1, padding: 18, display: "flex", alignItems: "center", gap: 14, cursor: "pointer", textAlign: "left", background: "none", border: "none", minWidth: 0 }}>
              <span style={{ width: 44, height: 44, borderRadius: 10, background: w.accent, color: "#101013", fontWeight: 800, fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{w.tag}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700, fontSize: 16, color: "#f0f0f2" }}>{w.name}</span>
                <span style={{ display: "block", fontSize: 13, color: "#7a7a82", marginTop: 2 }}>{w.items.length} exercícios</span>
              </span>
            </button>
            <button onClick={() => onEdit(w.key)} style={{ width: 54, background: "#191920", border: "none", borderLeft: "1px solid #1f1f24", color: "#9a9aa2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label={"Editar " + w.name}>
              <Icon.Pencil />
            </button>
          </div>
        ))}
        {list.length === 0 && (
          <div style={{ ...card, padding: 28, textAlign: "center", color: "#7a7a82", fontSize: 14 }}>Nenhum treino ainda. Crie o primeiro!</div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// SESSION DETAIL
// ============================================================
function SessionDetail({ sessionKey, workout, lib, progress, onToggle, onBack, onFinish, onEdit, onTimer, logSet, lastLog, sp }) {
  const checks = (progress && progress.checks) || {};
  return (
    <div>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#101013", borderBottom: "1px solid #1f1f24", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#9a9aa2", cursor: "pointer", display: "flex", padding: 0 }}>
            <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon.Arrow /></span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: workout.accent, color: "#101013", fontWeight: 800, fontSize: 11, padding: "2px 8px", borderRadius: 5 }}>{workout.tag}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{workout.name}</span>
            </div>
          </div>
          <button onClick={onEdit} style={iconBtn} aria-label="Editar treino"><Icon.Pencil /></button>
          <div style={{ position: "relative", width: 42, height: 42, flexShrink: 0 }}>
            <Ring pct={sp.pct} accent={workout.accent} size={42} stroke={4} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800 }}>{sp.done}/{sp.total}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: "18px 18px 30px" }}>
        {workout.headerWarn ? (
          <div style={{ ...card, padding: 16, borderColor: "#3a2424", background: "#1a1010", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ color: "#e36a5a", flexShrink: 0, marginTop: 1 }}><Icon.Warn /></span>
              <div style={{ fontSize: 13, color: "#d6a99e", lineHeight: 1.5 }}>{workout.headerWarn}</div>
            </div>
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {workout.items.map((it, idx) => {
            const base = lib[it.exId] || { name: "Exercício removido da biblioteca", warn: "", note: "" };
            const ex = { id: it.exId, name: base.name, warn: base.warn, note: base.note, sets: it.sets, reps: it.reps, rest: it.rest };
            return (
              <ExerciseCard
                key={it.exId + "-" + idx}
                ex={ex}
                idx={idx}
                accent={workout.accent}
                checked={!!checks[it.exId]}
                onToggle={() => onToggle(sessionKey, it.exId)}
                onTimer={() => onTimer(parseRest(it.rest), workout.accent)}
                logSet={logSet}
                last={lastLog(it.exId)}
              />
            );
          })}
          {workout.items.length === 0 && (
            <div style={{ ...card, padding: 24, textAlign: "center", color: "#7a7a82", fontSize: 14 }}>Treino vazio. Toque no lápis pra adicionar exercícios.</div>
          )}
        </div>

        {workout.items.length > 0 && (
          <button onClick={onFinish} style={{ ...primaryBtn(workout.accent), width: "100%", marginTop: 22, justifyContent: "center" }}>
            <Icon.Check /> Concluir treino
          </button>
        )}
        <p style={{ textAlign: "center", color: "#5a5a62", fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
          Concluir registra a sessão no histórico e limpa os checks.
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

          {(ex.warn || ex.note) ? (
            <div style={{ display: "flex", gap: 7, alignItems: "flex-start", marginTop: 10, padding: "8px 10px", borderRadius: 8, background: ex.warn ? "#1a1410" : "#15151a", border: ex.warn ? "1px solid #3a2f1f" : "1px solid #22222a" }}>
              {ex.warn ? <span style={{ color: "#E8843C", flexShrink: 0, marginTop: 1 }}><Icon.Warn /></span> : null}
              <span style={{ fontSize: 12.5, color: ex.warn ? "#c9b896" : "#9a9aa2", lineHeight: 1.45 }}>{ex.warn || ex.note}</span>
            </div>
          ) : null}

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
// WORKOUT EDITOR
// ============================================================
function WorkoutEditor({ initial, lib, onSaveExercise, onSave, onDelete, onClose }) {
  const isNew = !initial;
  const [draft, setDraft] = useState(() => initial ? JSON.parse(JSON.stringify(initial)) : { key: uid("w_"), name: "", tag: "", accent: PALETTE[0], headerWarn: "", items: [] });
  const [picking, setPicking] = useState(false);
  const [creatingEx, setCreatingEx] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState("");

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const moveItem = (i, dir) => {
    const items = [...draft.items];
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    [items[i], items[j]] = [items[j], items[i]];
    set({ items });
  };

  const removeItem = (i) => {
    const items = draft.items.filter((_, idx) => idx !== i);
    set({ items });
  };

  const updateItem = (i, patch) => {
    const items = draft.items.map((it, idx) => idx === i ? { ...it, ...patch } : it);
    set({ items });
  };

  const addExercise = (ex) => {
    if (draft.items.some((it) => it.exId === ex.id)) return;
    set({ items: [...draft.items, { exId: ex.id, sets: ex.sets, reps: ex.reps, rest: ex.rest }] });
  };

  const save = () => {
    const name = draft.name.trim();
    if (!name) { setError("Dá um nome pro treino."); return; }
    const tag = (draft.tag.trim() || name.slice(0, 2)).toUpperCase().slice(0, 3);
    onSave({ ...draft, name, tag });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0d0d0f", zIndex: 50, display: "flex", flexDirection: "column", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ ...panelHeader, borderBottom: "1px solid #1f1f24", flexShrink: 0 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>{isNew ? "Novo treino" : "Editar treino"}</span>
        <button onClick={onClose} style={iconBtn}><Icon.X /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px 30px" }}>
        <label style={labelStyle}>Nome do treino</label>
        <input value={draft.name} onChange={(e) => { set({ name: e.target.value }); setError(""); }} placeholder="Ex.: Peito e Tríceps" style={{ ...textInput, marginBottom: 14 }} />

        <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
          <div style={{ width: 110 }}>
            <label style={labelStyle}>Sigla (até 3)</label>
            <input value={draft.tag} onChange={(e) => set({ tag: e.target.value.toUpperCase().slice(0, 3) })} placeholder="A1" style={textInput} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Cor</label>
            <div style={{ display: "flex", gap: 8, paddingTop: 4 }}>
              {PALETTE.map((c) => (
                <button key={c} onClick={() => set({ accent: c })} aria-label={"cor " + c} style={{ width: 32, height: 32, borderRadius: "50%", background: c, border: draft.accent === c ? "3px solid #f0f0f2" : "3px solid transparent", cursor: "pointer" }} />
              ))}
            </div>
          </div>
        </div>

        <label style={labelStyle}>Aviso do treino (opcional)</label>
        <textarea value={draft.headerWarn} onChange={(e) => set({ headerWarn: e.target.value })} placeholder="Ex.: cuidados com quadril nessa sessão…" rows={2} style={{ ...textInput, resize: "vertical", marginBottom: 18, fontFamily: "inherit" }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Exercícios ({draft.items.length})</label>
          <button onClick={() => setPicking(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: draft.accent, border: "none", borderRadius: 8, padding: "7px 12px", color: "#101013", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>
            <Icon.Plus /> Adicionar
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {draft.items.map((it, i) => {
            const base = lib[it.exId] || { name: "Exercício removido" };
            return (
              <div key={it.exId + "-" + i} style={{ ...card, padding: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, color: "#5a5a62", fontWeight: 700, width: 20 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ flex: 1, fontWeight: 600, fontSize: 14, minWidth: 0, lineHeight: 1.3 }}>{base.name}</span>
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} style={{ ...iconBtn, opacity: i === 0 ? 0.3 : 1 }}><Icon.Up /></button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === draft.items.length - 1} style={{ ...iconBtn, opacity: i === draft.items.length - 1 ? 0.3 : 1 }}><Icon.Down /></button>
                  <button onClick={() => removeItem(i)} style={{ ...iconBtn, color: "#e36a5a" }}><Icon.X /></button>
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={miniLabel}>Séries</label>
                    <input inputMode="numeric" value={it.sets} onChange={(e) => updateItem(i, { sets: e.target.value.replace(/\D/g, "") })} style={{ ...textInput, padding: "8px 10px", textAlign: "center" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={miniLabel}>Reps</label>
                    <input value={it.reps} onChange={(e) => updateItem(i, { reps: e.target.value })} style={{ ...textInput, padding: "8px 10px", textAlign: "center" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={miniLabel}>Descanso</label>
                    <input value={it.rest} onChange={(e) => updateItem(i, { rest: e.target.value })} style={{ ...textInput, padding: "8px 10px", textAlign: "center" }} />
                  </div>
                </div>
              </div>
            );
          })}
          {draft.items.length === 0 && (
            <div style={{ ...card, padding: 20, textAlign: "center", color: "#7a7a82", fontSize: 13 }}>Nenhum exercício ainda. Toque em Adicionar.</div>
          )}
        </div>

        {error && <div style={{ color: "#e36a5a", fontSize: 13, fontWeight: 600, marginTop: 14 }}>{error}</div>}

        <button onClick={save} style={{ ...primaryBtn(draft.accent), width: "100%", marginTop: 20, justifyContent: "center" }}>
          <Icon.Check /> Salvar treino
        </button>

        {!isNew && onDelete && (
          <button onClick={() => confirmDel ? onDelete(draft.key) : setConfirmDel(true)} style={{ width: "100%", marginTop: 12, padding: "13px", background: confirmDel ? "#e36a5a" : "transparent", color: confirmDel ? "#101013" : "#e36a5a", border: "1.5px solid #e36a5a", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            {confirmDel ? "Confirmar exclusão" : "Excluir treino"}
          </button>
        )}
      </div>

      {picking && (
        <ExercisePicker
          lib={lib}
          existing={draft.items.map((it) => it.exId)}
          onPick={addExercise}
          onCreateNew={() => { setCreatingEx(true); }}
          onClose={() => setPicking(false)}
        />
      )}

      {creatingEx && (
        <ExerciseForm
          initial={null}
          usage={0}
          onSave={async (ex) => { await onSaveExercise(ex); addExercise(ex); setCreatingEx(false); }}
          onDelete={null}
          onClose={() => setCreatingEx(false)}
        />
      )}
    </div>
  );
}

// ============================================================
// EXERCISE PICKER
// ============================================================
function ExercisePicker({ lib, existing, onPick, onCreateNew, onClose }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const all = Object.values(lib).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const term = q.trim().toLowerCase();
    return term ? all.filter((e) => e.name.toLowerCase().includes(term)) : all;
  }, [lib, q]);

  return (
    <div style={{ ...overlay, zIndex: 70 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...panel, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={panelHeader}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>Adicionar exercício</span>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5a5a62", display: "flex" }}><Icon.Search /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na biblioteca…" style={{ ...textInput, paddingLeft: 36 }} />
          </div>
          <button onClick={onCreateNew} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#E8843C", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "12px 0 0" }}>
            <Icon.Plus /> Criar exercício novo
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {list.map((ex) => {
              const added = existing.includes(ex.id);
              return (
                <button key={ex.id} onClick={() => !added && onPick(ex)} disabled={added} style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: added ? "default" : "pointer", opacity: added ? 0.45 : 1, textAlign: "left", width: "100%" }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#f0f0f2", lineHeight: 1.3 }}>{ex.name}</span>
                    <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 2 }}>{ex.sets}× {ex.reps} · {ex.rest}</span>
                  </span>
                  <span style={{ color: added ? "#5EB87A" : "#E8843C", display: "flex", flexShrink: 0 }}>{added ? <Icon.Check /> : <Icon.Plus />}</span>
                </button>
              );
            })}
            {list.length === 0 && <div style={{ color: "#7a7a82", fontSize: 13, textAlign: "center", padding: 20 }}>Nada encontrado.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// EXERCISE FORM (criar/editar exercício)
// ============================================================
function ExerciseForm({ initial, usage, onSave, onDelete, onClose }) {
  const isNew = !initial;
  const [draft, setDraft] = useState(() => initial ? { ...initial } : { id: uid("ex_"), name: "", sets: 3, reps: "10-12", rest: "60s", warn: "", note: "" });
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState("");
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const save = () => {
    const name = draft.name.trim();
    if (!name) { setError("Dá um nome pro exercício."); return; }
    const sets = parseInt(draft.sets, 10) || 3;
    onSave({ ...draft, name, sets });
  };

  return (
    <div style={{ ...overlay, zIndex: 80 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...panel, maxHeight: "88vh", overflowY: "auto" }}>
        <div style={panelHeader}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>{isNew ? "Novo exercício" : "Editar exercício"}</span>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>
        <div style={{ padding: "4px 18px 20px" }}>
          <label style={labelStyle}>Nome</label>
          <input value={draft.name} onChange={(e) => { set({ name: e.target.value }); setError(""); }} placeholder="Ex.: Supino reto com halteres" style={{ ...textInput, marginBottom: 14 }} />

          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Séries</label>
              <input inputMode="numeric" value={draft.sets} onChange={(e) => set({ sets: e.target.value.replace(/\D/g, "") })} style={{ ...textInput, textAlign: "center" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Reps</label>
              <input value={draft.reps} onChange={(e) => set({ reps: e.target.value })} placeholder="8-12" style={{ ...textInput, textAlign: "center" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Descanso</label>
              <input value={draft.rest} onChange={(e) => set({ rest: e.target.value })} placeholder="60s" style={{ ...textInput, textAlign: "center" }} />
            </div>
          </div>

          <label style={labelStyle}>Dica de execução (opcional)</label>
          <textarea value={draft.note} onChange={(e) => set({ note: e.target.value })} rows={2} placeholder="Ex.: foco no peito superior…" style={{ ...textInput, resize: "vertical", marginBottom: 14, fontFamily: "inherit" }} />

          <label style={labelStyle}>Aviso de segurança ⚠️ (opcional)</label>
          <textarea value={draft.warn} onChange={(e) => set({ warn: e.target.value })} rows={2} placeholder="Ex.: cuidado com o ombro esquerdo…" style={{ ...textInput, resize: "vertical", marginBottom: 16, fontFamily: "inherit" }} />

          {error && <div style={{ color: "#e36a5a", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{error}</div>}

          <button onClick={save} style={{ ...primaryBtn("#E8843C"), width: "100%", justifyContent: "center" }}>
            <Icon.Check /> Salvar exercício
          </button>

          {!isNew && onDelete && (
            usage > 0 ? (
              <div style={{ textAlign: "center", color: "#7a7a82", fontSize: 12.5, marginTop: 14, lineHeight: 1.5 }}>
                Usado em {usage} treino{usage > 1 ? "s" : ""} — remova-o dos treinos antes de excluir.
              </div>
            ) : (
              <button onClick={() => confirmDel ? onDelete(draft.id) : setConfirmDel(true)} style={{ width: "100%", marginTop: 12, padding: "13px", background: confirmDel ? "#e36a5a" : "transparent", color: confirmDel ? "#101013" : "#e36a5a", border: "1.5px solid #e36a5a", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                {confirmDel ? "Confirmar exclusão" : "Excluir exercício"}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LIBRARY VIEW
// ============================================================
function LibraryView({ lib, usageCount, onEdit, onNew }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const all = Object.values(lib).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const term = q.trim().toLowerCase();
    return term ? all.filter((e) => e.name.toLowerCase().includes(term)) : all;
  }, [lib, q]);

  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700 }}>Biblioteca · {Object.keys(lib).length}</div>
        <button onClick={onNew} style={{ display: "flex", alignItems: "center", gap: 6, background: "#E8843C", border: "none", borderRadius: 8, padding: "8px 14px", color: "#101013", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
          <Icon.Plus /> Novo
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 14 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5a5a62", display: "flex" }}><Icon.Search /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exercício…" style={{ ...textInput, paddingLeft: 36 }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {list.map((ex) => {
          const uses = usageCount(ex.id);
          return (
            <button key={ex.id} onClick={() => onEdit(ex)} style={{ ...card, padding: "13px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", textAlign: "left", width: "100%" }}>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: "#f0f0f2", lineHeight: 1.3 }}>{ex.name}</span>
                  {ex.warn ? <span style={{ color: "#E8843C", display: "flex", flexShrink: 0 }}><Icon.Warn width={13} height={13} /></span> : null}
                </span>
                <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 3 }}>
                  {ex.sets}× {ex.reps} · {ex.rest}{uses > 0 ? ` · em ${uses} treino${uses > 1 ? "s" : ""}` : ""}
                </span>
              </span>
              <span style={{ color: "#5a5a62", display: "flex", flexShrink: 0 }}><Icon.Pencil /></span>
            </button>
          );
        })}
        {list.length === 0 && <div style={{ color: "#7a7a82", fontSize: 13, textAlign: "center", padding: 20 }}>Nada encontrado.</div>}
      </div>
    </div>
  );
}

// ============================================================
// PROGRESS VIEW
// ============================================================
function ProgressView({ logs, lib, workouts, history }) {
  const metaByEx = useMemo(() => {
    const m = {};
    Object.values(workouts).forEach((w) => w.items.forEach((it) => {
      if (!m[it.exId]) m[it.exId] = { tag: w.tag, accent: w.accent };
    }));
    return m;
  }, [workouts]);

  const logged = Object.entries(logs).filter(([, arr]) => arr && arr.length).sort((a, b) => {
    const la = new Date(a[1][a[1].length - 1].date).getTime();
    const lb = new Date(b[1][b[1].length - 1].date).getTime();
    return lb - la;
  });

  const totalSets = Object.values(logs).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0);
  const completedSessions = history.length;

  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ display: "flex", gap: 11, marginBottom: 22 }}>
        <MetricCard value={completedSessions} label="treinos concluídos" accent="#E8843C" icon={<Icon.Trophy />} />
        <MetricCard value={totalSets} label="cargas registradas" accent="#5EB87A" icon={<Icon.Dumbbell />} />
      </div>

      {logged.length === 0 ? (
        <div style={{ padding: "40px 30px", textAlign: "center" }}>
          <div style={{ color: "#3a3a42", display: "inline-flex", marginBottom: 16 }}><Icon.Chart width={48} height={48} /></div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>Sem registros de carga ainda</div>
          <div style={{ color: "#7a7a82", fontSize: 14, lineHeight: 1.5, maxWidth: 280, margin: "0 auto" }}>
            Registre a carga em cada exercício durante o treino e seu histórico de progressão aparece aqui.
          </div>
        </div>
      ) : (
        <React.Fragment>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 12 }}>Histórico de carga</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {logged.map(([exId, arr]) => {
              const libEx = lib[exId];
              const meta = metaByEx[exId] || {};
              const name = libEx ? libEx.name : "Exercício removido";
              const accent = meta.accent || "#8a8a92";
              const tag = meta.tag || "•";
              const last = arr[arr.length - 1];
              const first = arr[0];
              const delta = last.weight - first.weight;
              const isOpen = expanded === exId;
              return (
                <div key={exId} style={{ ...card, padding: 0, overflow: "hidden" }}>
                  <button onClick={() => setExpanded(isOpen ? null : exId)} style={{ width: "100%", padding: 16, background: "none", border: "none", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: accent, color: "#101013", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{tag}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#f0f0f2", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{name}</span>
                      <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 2 }}>{arr.length} registro{arr.length > 1 ? "s" : ""} · atual {last.weight}kg</span>
                    </span>
                    {delta !== 0 && (
                      <span style={{ fontSize: 13, fontWeight: 800, color: delta > 0 ? "#5EB87A" : "#e36a5a" }}>{delta > 0 ? "+" : ""}{delta}kg</span>
                    )}
                  </button>
                  {isOpen && (
                    <div style={{ padding: "0 16px 16px" }}>
                      <MiniChart arr={arr} accent={accent} />
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
        </React.Fragment>
      )}
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
const rowCard = { ...card, display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", width: "100%" };
const primaryBtn = (accent) => ({
  display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
  background: accent, color: "#101013", border: "none", borderRadius: 11,
  padding: "14px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer",
});
const pillBtn = (accent, filled) => ({
  padding: "12px 26px", borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer",
  border: filled ? "none" : `1.5px solid ${accent}`,
  background: filled ? accent : "transparent",
  color: filled ? "#101013" : accent,
});
const inputStyle = {
  width: 64, padding: "9px 10px", background: "#0d0d0f", border: "1px solid #2a2a30",
  borderRadius: 8, color: "#f0f0f2", fontSize: 14, fontWeight: 600, textAlign: "center",
  outline: "none",
};
const textInput = {
  width: "100%", padding: "12px 13px", background: "#0d0d0f", border: "1px solid #2a2a30",
  borderRadius: 10, color: "#f0f0f2", fontSize: 14.5, fontWeight: 500, outline: "none",
  boxSizing: "border-box",
};
const selectStyle = {
  flex: 1, padding: "11px 12px", background: "#0d0d0f", border: "1px solid #2a2a30",
  borderRadius: 10, color: "#f0f0f2", fontSize: 14, fontWeight: 600, outline: "none",
  appearance: "none", WebkitAppearance: "none",
};
const labelStyle = {
  display: "block", fontSize: 11.5, letterSpacing: 1, textTransform: "uppercase",
  color: "#7a7a82", fontWeight: 700, marginBottom: 6,
};
const miniLabel = {
  display: "block", fontSize: 10.5, letterSpacing: 0.5, textTransform: "uppercase",
  color: "#6a6a72", fontWeight: 700, marginBottom: 4,
};
const overlay = {
  position: "fixed", inset: 0, background: "rgba(10,10,12,0.82)", backdropFilter: "blur(8px)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 60, padding: 14,
};
const panel = {
  background: "#121215", border: "1px solid #26262b", borderRadius: 18, width: "100%",
  maxWidth: 440,
};
const panelHeader = {
  display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 18px",
};
const iconBtn = {
  background: "none", border: "none", color: "#9a9aa2", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center", padding: 6,
};
const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  body { margin: 0; }
  ::-webkit-scrollbar { width: 0; }
  button:focus-visible { outline: 2px solid #E8843C; outline-offset: 2px; }
  input:focus, textarea:focus, select:focus { border-color: #E8843C; }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

// ============================================================
// MOUNT
// ============================================================
const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(React.createElement(App));
