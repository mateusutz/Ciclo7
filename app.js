const { useState, useEffect, useMemo, useCallback, useRef } = React;

// ============================================================
// CONSTANTES E HELPERS
// ============================================================
const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];
const PALETTE = ["#E8843C", "#4C9BD6", "#C77DD6", "#5EB87A", "#E3C84C", "#E36A5A"];
const MUSCLES = {
  peito: { name: "Peito", color: "#E8843C" },
  costas: { name: "Costas", color: "#4C9BD6" },
  ombros: { name: "Ombros", color: "#C77DD6" },
  biceps: { name: "Bíceps", color: "#5EB87A" },
  triceps: { name: "Tríceps", color: "#E3C84C" },
  trapezio: { name: "Trapézio", color: "#6FAFD6" },
  antebraco: { name: "Antebraços", color: "#8FCBA0" },
  abdomen: { name: "Abdômen", color: "#E36A5A" },
  anterior: { name: "Anterior de coxa", color: "#D69B4C" },
  posterior: { name: "Posterior de coxa", color: "#A0C77D" },
  gluteos: { name: "Glúteos", color: "#D67DA8" },
  panturrilha: { name: "Panturrilhas", color: "#7D9BD6" },
  adutores: { name: "Adutores", color: "#C98FD6" },
  flexores: { name: "Flexores do quadril", color: "#D6A77D" },
  lombar: { name: "Lombar/eretores", color: "#9B8FD6" },
};
const MUSCLE_ORDER = ["peito","costas","ombros","biceps","triceps","trapezio","antebraco","abdomen","anterior","posterior","gluteos","panturrilha","adutores","flexores","lombar"];
const muscleName = (id) => (MUSCLES[id] ? MUSCLES[id].name : id);
const muscleColor = (id) => (MUSCLES[id] ? MUSCLES[id].color : "#8a8a92");
const exMuscles = (ex) => (ex && ex.muscles) ? ex.muscles : { p: "", s: [] };
const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
// aceita vírgula OU ponto como separador decimal (ex.: "17,5" -> 17.5)
const parseNum = (v) => {
  if (v == null) return NaN;
  return parseFloat(String(v).replace(",", "."));
};
const ytId = (url) => {
  if (!url) return null;
  const m = String(url).match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
};
const fmtClock = (s) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0") : m + ":" + String(sec).padStart(2, "0");
};
const fmtDur = (s) => {
  if (s == null) return "";
  const m = Math.round(s / 60);
  if (m < 1) return "<1 min";
  if (m < 60) return m + " min";
  const h = Math.floor(m / 60), mm = m % 60;
  return h + "h" + String(mm).padStart(2, "0");
};
const weekStartMs = (d) => {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7;
  dt.setHours(0, 0, 0, 0);
  dt.setDate(dt.getDate() - day);
  return dt.getTime();
};
function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.frequency.value = 880; o.type = "sine";
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    o.start(); o.stop(ctx.currentTime + 0.55);
    setTimeout(() => { try { ctx.close(); } catch (e) {} }, 800);
  } catch (e) {}
}
function notifyRestDone() {
  try { if (navigator.vibrate) navigator.vibrate([300, 120, 300]); } catch (e) {}
  beep();
  setTimeout(beep, 650);
}

// ============================================================
// DADOS PADRÃO DO PROGRAMA (seed inicial)
// ============================================================
const DEFAULT_SESSIONS = {
  A1: {
    name: "Peito e Tríceps",
    tag: "A1",
    accent: "#E8843C",
    exercises: [
      { id: "a1e1", name: "Supino reto com halteres", sets: 4, reps: "8-12", rest: "90s", warn: "Halteres em vez de barra dão liberdade pro ombro esquerdo encontrar a trajetória natural. Comece leve pra sentir a estabilidade.", muscles: { p: "peito", s: ["triceps", "ombros"] } },
      { id: "a1e2", name: "Supino inclinado na máquina (Hammer)", sets: 4, reps: "8-12", rest: "90s", note: "Ênfase em peito superior — prioridade sua.", muscles: { p: "peito", s: ["triceps", "ombros"] } },
      { id: "a1e3", name: "Crucifixo na máquina (peck deck)", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "peito", s: [] } },
      { id: "a1e4", name: "Crossover na polia (de cima pra baixo)", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "peito", s: [] } },
      { id: "a1e5", name: "Tríceps na polia com barra", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "triceps", s: [] } },
      { id: "a1e6", name: "Tríceps francês com halter (sentado)", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "triceps", s: [] } },
      { id: "a1e7", name: "Tríceps coice na polia", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "triceps", s: [] } },
    ],
  },
  B1: {
    name: "Costas e Bíceps",
    tag: "B1",
    accent: "#4C9BD6",
    exercises: [
      { id: "b1e1", name: "Puxada frontal na máquina/polia", sets: 4, reps: "8-12", rest: "90s", muscles: { p: "costas", s: ["biceps"] } },
      { id: "b1e2", name: "Remada baixa sentado na polia", sets: 4, reps: "10-12", rest: "90s", warn: "Mantenha o tronco estável e evite puxar com tranco no final — protege o ombro esquerdo.", muscles: { p: "costas", s: ["biceps", "trapezio"] } },
      { id: "b1e3", name: "Remada na máquina (apoiado no peito)", sets: 3, reps: "10-12", rest: "60s", note: "O apoio no peito tira a lombar e o quadril da jogada.", muscles: { p: "costas", s: ["biceps", "trapezio"] } },
      { id: "b1e4", name: "Pulldown com braço estendido na polia", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "costas", s: [] } },
      { id: "b1e5", name: "Rosca direta com barra W", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "biceps", s: ["antebraco"] } },
      { id: "b1e6", name: "Rosca alternada com halteres (sentado)", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "biceps", s: ["antebraco"] } },
      { id: "b1e7", name: "Rosca martelo na polia", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "biceps", s: ["antebraco"] } },
    ],
  },
  C1: {
    name: "Ombros e Abdômen",
    tag: "C1",
    accent: "#C77DD6",
    exercises: [
      { id: "c1e1", name: "Desenvolvimento na máquina (Hammer)", sets: 4, reps: "8-12", rest: "90s", warn: "Máquina em vez de halteres/barra livre pro ombro esquerdo trabalhar numa trajetória guiada e estável. Prioridade sua.", muscles: { p: "ombros", s: ["triceps"] } },
      { id: "c1e2", name: "Elevação lateral com halteres", sets: 4, reps: "12-15", rest: "60s", note: "O exercício rei pro deltoide medial — largura do ombro.", muscles: { p: "ombros", s: [] } },
      { id: "c1e3", name: "Elevação lateral na polia (unilateral)", sets: 3, reps: "12-15", rest: "45s", note: "Faça o lado esquerdo primeiro e iguale o volume do direito a ele.", muscles: { p: "ombros", s: [] } },
      { id: "c1e4", name: "Crucifixo invertido na máquina (peck deck invertido)", sets: 3, reps: "12-15", rest: "60s", note: "Deltoide posterior — costuma ser fraco e ajuda na saúde do ombro.", muscles: { p: "ombros", s: ["trapezio"] } },
      { id: "c1e5", name: "Elevação frontal na polia", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "ombros", s: [] } },
      { id: "c1e6", name: "Abdominal na máquina", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "abdomen", s: [] } },
      { id: "c1e7", name: "Prancha", sets: 3, reps: "falha", rest: "45s", warn: "Mantenha o quadril neutro, sem deixar cair. Se incomodar o quadril, troque por abdominal supra no solo.", muscles: { p: "abdomen", s: ["lombar"] } },
    ],
  },
  A2: {
    name: "Peito e Tríceps",
    tag: "A2",
    accent: "#E8843C",
    exercises: [
      { id: "a2e1", name: "Supino reto na máquina (Hammer)", sets: 4, reps: "8-12", rest: "90s", muscles: { p: "peito", s: ["triceps", "ombros"] } },
      { id: "a2e2", name: "Supino inclinado com halteres", sets: 4, reps: "8-12", rest: "90s", warn: "Mesma lógica de liberdade pro ombro esquerdo.", muscles: { p: "peito", s: ["triceps", "ombros"] } },
      { id: "a2e3", name: "Crossover na polia (de baixo pra cima)", sets: 3, reps: "12-15", rest: "60s", note: "Pega o peito superior por outro ângulo.", muscles: { p: "peito", s: [] } },
      { id: "a2e4", name: "Crucifixo com halteres no banco reto", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "peito", s: [] } },
      { id: "a2e5", name: "Tríceps testa com barra W", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "triceps", s: [] } },
      { id: "a2e6", name: "Tríceps na polia com corda", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "triceps", s: [] } },
      { id: "a2e7", name: "Mergulho assistido na máquina", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "triceps", s: ["peito", "ombros"] } },
    ],
  },
  B2: {
    name: "Costas e Bíceps",
    tag: "B2",
    accent: "#4C9BD6",
    exercises: [
      { id: "b2e1", name: "Puxada com pegada neutra (triângulo)", sets: 4, reps: "8-12", rest: "90s", muscles: { p: "costas", s: ["biceps"] } },
      { id: "b2e2", name: "Remada cavalinho ou remada T (apoio no peito)", sets: 4, reps: "10-12", rest: "90s", muscles: { p: "costas", s: ["biceps", "trapezio"] } },
      { id: "b2e3", name: "Remada unilateral na polia baixa", sets: 3, reps: "10-12", rest: "60s", note: "Trabalha cada lado isolado, equilibra o esquerdo.", muscles: { p: "costas", s: ["biceps"] } },
      { id: "b2e4", name: "Puxada na polia com braço estendido", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "costas", s: [] } },
      { id: "b2e5", name: "Rosca scott na máquina", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "biceps", s: [] } },
      { id: "b2e6", name: "Rosca direta na polia baixa", sets: 3, reps: "10-12", rest: "60s", muscles: { p: "biceps", s: ["antebraco"] } },
      { id: "b2e7", name: "Rosca martelo com halteres", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "biceps", s: ["antebraco"] } },
    ],
  },
  C2: {
    name: "Ombros e Abdômen",
    tag: "C2",
    accent: "#C77DD6",
    exercises: [
      { id: "c2e1", name: "Desenvolvimento com halteres sentado", sets: 4, reps: "8-12", rest: "90s", warn: "Se sentir o ombro esquerdo instável, volte pra máquina. Só use halteres se a sensação estiver boa. Prioridade sua.", muscles: { p: "ombros", s: ["triceps"] } },
      { id: "c2e2", name: "Elevação lateral na máquina", sets: 4, reps: "12-15", rest: "60s", muscles: { p: "ombros", s: [] } },
      { id: "c2e3", name: "Elevação lateral com halteres (sentado)", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "ombros", s: [] } },
      { id: "c2e4", name: "Crucifixo invertido na polia (cross)", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "ombros", s: ["trapezio"] } },
      { id: "c2e5", name: "Encolhimento com halteres (trapézio)", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "trapezio", s: [] } },
      { id: "c2e6", name: "Abdominal na polia alta (ajoelhado)", sets: 3, reps: "12-15", rest: "45s", muscles: { p: "abdomen", s: [] } },
      { id: "c2e7", name: "Elevação de pernas suspenso ou no banco", sets: 3, reps: "12-15", rest: "45s", warn: "Faça controlado e sem balanço. Se puxar o quadril, troque por abdominal infra no solo com amplitude curta.", muscles: { p: "abdomen", s: ["flexores"] } },
    ],
  },
  D: {
    name: "Inferiores",
    tag: "D",
    accent: "#5EB87A",
    headerWarn: "Sessão inteira pensada pra poupar o quadril pós-artroscopia. Nada de carga axial pesada nem amplitude extrema. Se algum movimento gerar dor (não confunda com esforço muscular normal), pare.",
    exercises: [
      { id: "de1", name: "Cadeira extensora", sets: 4, reps: "12-15", rest: "75s", note: "Quadríceps com zero estresse de quadril.", muscles: { p: "anterior", s: [] } },
      { id: "de2", name: "Leg press com amplitude controlada (parcial)", sets: 4, reps: "12-15", rest: "90s", warn: "Limite a descida ao ponto antes do quadril 'encaixar' ou sentir tensão. Amplitude curta e segura é o objetivo.", muscles: { p: "anterior", s: ["gluteos", "posterior"] } },
      { id: "de3", name: "Mesa flexora", sets: 4, reps: "12-15", rest: "75s", note: "Posteriores de coxa.", muscles: { p: "posterior", s: [] } },
      { id: "de4", name: "Cadeira flexora sentado", sets: 3, reps: "12-15", rest: "60s", muscles: { p: "posterior", s: [] } },
      { id: "de5", name: "Cadeira adutora", sets: 3, reps: "15-20", rest: "45s", warn: "Amplitude moderada, sem forçar o final do movimento.", muscles: { p: "adutores", s: [] } },
      { id: "de6", name: "Panturrilha na máquina (em pé)", sets: 4, reps: "15-20", rest: "45s", muscles: { p: "panturrilha", s: [] } },
      { id: "de7", name: "Panturrilha sentado", sets: 3, reps: "15-20", rest: "45s", muscles: { p: "panturrilha", s: [] } },
    ],
  },
};

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
    DEFAULT_LIBRARY[e.id] = { id: e.id, name: e.name, sets: e.sets, reps: e.reps, rest: e.rest, warn: e.warn || "", note: e.note || "", video: "", muscles: e.muscles || { p: "", s: [] } };
  });
});
const DEFAULT_SCHEDULE = { 0: "C2", 1: "A1", 2: "B1", 3: "C1", 4: "A2", 5: "B2", 6: "D" };

// ============================================================
// STORAGE — Firestore (nuvem, offline-first) com fallback localStorage
// ============================================================
const NS = "ciclo7:";
const KEY_LOGS = "logs:v1";
const KEY_PROGRESS = "progress:v1";
const KEY_LIBRARY = "library:v1";
const KEY_WORKOUTS = "workouts:v1";
const KEY_SCHEDULE = "schedule:v1";
const KEY_HISTORY = "history:v1";
const ALL_KEYS = [KEY_LOGS, KEY_PROGRESS, KEY_LIBRARY, KEY_WORKOUTS, KEY_SCHEDULE, KEY_HISTORY];

// uid do usuário logado; setado pelo App ao autenticar. Sem uid, cai no localStorage.
let CURRENT_UID = null;
const setCurrentUid = (uid) => { CURRENT_UID = uid; };
const docRef = (key) => window.fbDb.collection("users").doc(CURRENT_UID).collection("state").doc(key.replace(/:/g, "_"));

async function storeGet(key, fallback) {
  if (CURRENT_UID && window.fbDb) {
    try {
      const snap = await docRef(key).get();
      if (snap.exists) {
        const d = snap.data();
        return d && "value" in d ? d.value : fallback;
      }
      return fallback;
    } catch (e) {
      console.warn("Firestore get falhou, usando cache local:", key, e && e.code);
      // fallback de leitura local
    }
  }
  try {
    const raw = localStorage.getItem(NS + key);
    return raw != null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function storeSet(key, value) {
  // sempre espelha no localStorage (boot rápido / fallback offline sem login)
  try { localStorage.setItem(NS + key, JSON.stringify(value)); } catch (e) {}
  if (CURRENT_UID && window.fbDb) {
    try {
      // não dá await no set: a persistência offline resolve a fila e sincroniza sozinha
      docRef(key).set({ value: value, updatedAt: Date.now() });
    } catch (e) {
      console.warn("Firestore set falhou:", key, e && e.code);
    }
  }
}

const ACERVO_KEYS = [KEY_LIBRARY, KEY_WORKOUTS, KEY_SCHEDULE];
const HISTORICO_KEYS = [KEY_HISTORY, KEY_LOGS];

function downloadJson(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function exportKeys(kind, keys) {
  const data = {};
  keys.forEach((k) => {
    const raw = localStorage.getItem(NS + k);
    if (raw != null) {
      try { data[k] = JSON.parse(raw); } catch (e) {}
    }
  });
  const payload = { app: "ciclo7", kind, version: 4, exportedAt: new Date().toISOString(), data };
  const tag = kind === "acervo" ? "acervo" : "historico";
  downloadJson(payload, "ciclo7-" + tag + "-" + new Date().toISOString().slice(0, 10) + ".json");
}

const exportAcervo = () => exportKeys("acervo", ACERVO_KEYS);
const exportHistorico = () => exportKeys("historico", HISTORICO_KEYS);

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
  Play: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="none" {...p}><polygon points="6 4 20 12 6 20" /></svg>),
  Swap: (p) => (<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16 3h5v5" /><path d="M21 3l-7 7" /><path d="M8 21H3v-5" /><path d="M3 21l7-7" /></svg>),
  Refresh: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-15 6.7L3 16" /><path d="M3 21v-5h5" /></svg>),
  Download: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>),
  Upload: (p) => (<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>),
  Logout: (p) => (<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>),
};

// ============================================================
// HELPERS DE TREINO
// ============================================================
function parseRest(rest) {
  const m = String(rest).match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 60;
}
const plannedSets = (it) => parseInt(it.sets, 10) || 0;

// ============================================================
// VIDEO MODAL
// ============================================================
function VideoModal({ videoId, title, onClose }) {
  return (
    <div style={{ ...overlay, zIndex: 90 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 440 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#f0f0f2", paddingRight: 8, lineHeight: 1.3 }}>{title}</span>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>
        <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 14, overflow: "hidden", background: "#000", border: "1px solid #26262b" }}>
          <iframe
            src={"https://www.youtube-nocookie.com/embed/" + videoId}
            title={title}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div style={{ textAlign: "center", color: "#7a7a82", fontSize: 12, marginTop: 10 }}>O vídeo precisa de internet pra carregar.</div>
      </div>
    </div>
  );
}

// ============================================================
// REST TIMER (modal + chip flutuante, controlados pelo App)
// ============================================================
function RestTimerModal({ left, total, accent, finished, onCancel, onMinimize, onExtend }) {
  const mm = Math.floor(Math.max(left, 0) / 60);
  const ss = Math.max(left, 0) % 60;
  return (
    <div style={overlay} onClick={onMinimize}>
      <div onClick={(e) => e.stopPropagation()} style={{ textAlign: "center", padding: 32 }}>
        <div style={{ fontSize: 13, letterSpacing: 2, textTransform: "uppercase", color: "#7a7a82", marginBottom: 18, fontWeight: 700 }}>Descanso</div>
        <div style={{ fontSize: 92, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1, color: finished ? accent : "#f4f4f5", fontFamily: "'Barlow Condensed', sans-serif" }}>
          {mm}:{String(ss).padStart(2, "0")}
        </div>
        <div style={{ fontSize: 15, color: finished ? accent : "#7a7a82", marginTop: 8, fontWeight: 600, minHeight: 22 }}>{finished ? "Bora pra próxima série" : ""}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 28, justifyContent: "center", flexWrap: "wrap" }}>
          {!finished && <button onClick={onExtend} style={pillBtn(accent, false)}>+30s</button>}
          {!finished && <button onClick={onMinimize} style={pillBtn(accent, false)}>Minimizar</button>}
          <button onClick={onCancel} style={pillBtn(accent, true)}>{finished ? "Fechar" : "Pular"}</button>
        </div>
      </div>
    </div>
  );
}

function TimerChip({ left, accent, finished, onClick }) {
  return (
    <button onClick={onClick} style={{
      position: "fixed", left: "50%", transform: "translateX(-50%)",
      bottom: "calc(74px + env(safe-area-inset-bottom, 0px))", zIndex: 55,
      display: "flex", alignItems: "center", gap: 8, padding: "11px 20px",
      borderRadius: 999, cursor: "pointer",
      background: finished ? accent : "#17171c",
      border: "1.5px solid " + accent,
      color: finished ? "#101013" : accent,
      fontWeight: 800, fontSize: 15, fontVariantNumeric: "tabular-nums",
      boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    }}>
      <Icon.Timer /> {finished ? "Descanso acabou" : fmtClock(left)}
    </button>
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
// LOGIN SCREEN
// ============================================================
// ============================================================
// LOADING SCREEN (transição com movimento)
// ============================================================
function LoadingScreen({ label }) {
  const size = 96;
  const stroke = 6;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ ...root, alignItems: "center", justifyContent: "center", display: "flex", flexDirection: "column", gap: 22 }}>
      <style>{globalCss}</style>
      <div style={{ position: "relative", width: size, height: size }}>
        {/* anel base */}
        <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1f1f24" strokeWidth={stroke} />
        </svg>
        {/* arco que gira */}
        <svg width={size} height={size} style={{ position: "absolute", inset: 0, animation: "ciclo7-spin 1s linear infinite" }}>
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E8843C" strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.72}
          />
        </svg>
        {/* halter no centro, com pulso */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#E8843C", animation: "ciclo7-pulse 1.4s ease-in-out infinite" }}>
          <Icon.Dumbbell width={34} height={34} />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 24, letterSpacing: 0.5, textTransform: "uppercase", color: "#f0f0f2" }}>Ciclo<span style={{ color: "#E8843C" }}>7</span></span>
        <span style={{ color: "#5a5a62", fontSize: 13, fontWeight: 600 }}>{label || "preparando seu treino"}<span className="ciclo7-dots"></span></span>
      </div>
    </div>
  );
}

function LoginScreen() {
  const [mode, setMode] = useState("in"); // "in" = entrar, "up" = criar conta
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState(""); // mensagens neutras/positivas
  const [pendingCred, setPendingCred] = useState(null); // credencial de senha aguardando vínculo via Google

  const mapErr = (code) => {
    const m = {
      "auth/invalid-email": "Email inválido.",
      "auth/missing-password": "Digite a senha.",
      "auth/weak-password": "A senha precisa de pelo menos 6 caracteres.",
      "auth/email-already-in-use": "Esse email já tem conta. Tente entrar.",
      "auth/invalid-credential": "Email ou senha incorretos.",
      "auth/wrong-password": "Email ou senha incorretos.",
      "auth/user-not-found": "Não achei conta com esse email.",
      "auth/too-many-requests": "Muitas tentativas. Aguarde um pouco.",
      "auth/popup-closed-by-user": "Login cancelado.",
      "auth/network-request-failed": "Sem conexão. Verifique a internet.",
    };
    return m[code] || "Algo deu errado. Tente de novo.";
  };

  // Descobre quais métodos de login já existem pra um email
  const methodsFor = async (mail) => {
    try { return await window.fbAuth.fetchSignInMethodsForEmail(mail.trim()); }
    catch (e) { return []; }
  };

  const google = async () => {
    setErr(""); setInfo(""); setBusy(true);
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await window.fbAuth.signInWithPopup(provider);
      // Se havia uma senha pendente de vínculo, vincula agora à conta Google
      if (pendingCred && result && result.user) {
        try {
          await result.user.linkWithCredential(pendingCred);
        } catch (e) { /* já vinculada ou senha incompatível: segue logado mesmo assim */ }
        setPendingCred(null);
      }
    } catch (e) {
      if (e && (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment")) {
        try { const p = new firebase.auth.GoogleAuthProvider(); await window.fbAuth.signInWithRedirect(p); return; } catch (e2) { setErr(mapErr(e2 && e2.code)); }
      } else if (e && e.code === "auth/account-exists-with-different-credential") {
        setErr("Esse email já usa senha. Entre com email e senha.");
        setMode("in");
      } else {
        setErr(mapErr(e && e.code));
      }
      setBusy(false);
    }
  };

  const emailAuth = async () => {
    setErr(""); setInfo("");
    const mail = email.trim();
    if (!mail) { setErr("Digite o email."); return; }
    if (!pass) { setErr("Digite a senha."); return; }
    setBusy(true);
    try {
      if (mode === "up") {
        // Antes de criar, verifica se o email já existe com outro método
        const methods = await methodsFor(mail);
        if (methods.includes("google.com") && !methods.includes("password")) {
          // Email é Google: guarda a senha e conduz ao login Google pra vincular
          const cred = firebase.auth.EmailAuthProvider.credential(mail, pass);
          setPendingCred(cred);
          setBusy(false);
          setInfo("Esse email já entra com Google. Toque em \"Continuar com Google\" — a senha que você digitou será vinculada à sua conta.");
          return;
        }
        await window.fbAuth.createUserWithEmailAndPassword(mail, pass);
      } else {
        await window.fbAuth.signInWithEmailAndPassword(mail, pass);
      }
    } catch (e) {
      // Conta existe só com Google e tentou entrar com senha
      if (e && (e.code === "auth/invalid-credential" || e.code === "auth/user-not-found" || e.code === "auth/wrong-password")) {
        const methods = await methodsFor(mail);
        if (methods.includes("google.com") && !methods.includes("password")) {
          if (mode === "in") {
            setErr("Esse email entra com Google. Toque em \"Continuar com Google\".");
          } else {
            const cred = firebase.auth.EmailAuthProvider.credential(mail, pass);
            setPendingCred(cred);
            setInfo("Esse email já entra com Google. Toque em \"Continuar com Google\" — sua senha será vinculada.");
          }
          setBusy(false);
          return;
        }
      }
      setErr(mapErr(e && e.code));
      setBusy(false);
    }
  };

  const resetPass = async () => {
    setErr(""); setInfo("");
    const mail = email.trim();
    if (!mail) { setErr("Digite o email no campo acima pra enviar o link de redefinição."); return; }
    setBusy(true);
    try {
      const methods = await methodsFor(mail);
      if (methods.length && !methods.includes("password")) {
        setInfo("Esse email entra com Google — não tem senha pra redefinir. Use \"Continuar com Google\".");
        setBusy(false);
        return;
      }
      await window.fbAuth.sendPasswordResetEmail(mail);
      setInfo("Enviei um link de redefinição pra " + mail + ". Verifique sua caixa de entrada (e o spam).");
    } catch (e) {
      setErr(mapErr(e && e.code));
    }
    setBusy(false);
  };

  return (
    <div style={{ ...root, alignItems: "center", justifyContent: "center", display: "flex", padding: "0 26px" }}>
      <style>{globalCss}</style>
      <div style={{ width: "100%", maxWidth: 360 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, justifyContent: "center", marginBottom: 6 }}>
          <span style={{ color: "#E8843C", display: "flex" }}><Icon.Dumbbell width={30} height={30} /></span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 40, letterSpacing: 0.5, textTransform: "uppercase", lineHeight: 1 }}>Ciclo<span style={{ color: "#E8843C" }}>7</span></span>
        </div>
        <p style={{ textAlign: "center", color: "#7a7a82", fontSize: 13.5, margin: "0 0 30px" }}>Seu treino, em qualquer aparelho.</p>

        <button onClick={google} disabled={busy} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: pendingCred ? "#E8843C" : "#fff", color: pendingCred ? "#101013" : "#1a1a1a", border: "none", borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1 }}>
          {!pendingCred && <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"/><path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z"/><path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.9 11.42 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z"/></svg>}
          {pendingCred ? "Continuar com Google e vincular" : "Continuar com Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
          <div style={{ flex: 1, height: 1, background: "#26262b" }} />
          <span style={{ fontSize: 12, color: "#5a5a62", fontWeight: 600 }}>ou</span>
          <div style={{ flex: 1, height: 1, background: "#26262b" }} />
        </div>

        <input type="email" inputMode="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => { setEmail(e.target.value); setErr(""); setInfo(""); }} style={{ ...textInput, marginBottom: 10 }} />
        <input type="password" autoComplete={mode === "up" ? "new-password" : "current-password"} placeholder="Senha" value={pass} onChange={(e) => { setPass(e.target.value); setErr(""); setInfo(""); }} onKeyDown={(e) => { if (e.key === "Enter") emailAuth(); }} style={{ ...textInput, marginBottom: mode === "in" ? 6 : 14 }} />

        {mode === "in" && (
          <div style={{ textAlign: "right", marginBottom: 12 }}>
            <button onClick={resetPass} disabled={busy} style={{ background: "none", border: "none", color: "#8a8a92", fontSize: 12.5, fontWeight: 600, cursor: "pointer", padding: 0 }}>Esqueci minha senha</button>
          </div>
        )}

        {err && <div style={{ color: "#e36a5a", fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: "center", lineHeight: 1.45 }}>{err}</div>}
        {info && <div style={{ color: "#5EB87A", fontSize: 13, fontWeight: 600, marginBottom: 14, textAlign: "center", lineHeight: 1.45 }}>{info}</div>}

        <button onClick={emailAuth} disabled={busy} style={{ ...primaryBtn("#E8843C"), width: "100%", justifyContent: "center", opacity: busy ? 0.6 : 1 }}>
          {mode === "up" ? "Criar conta" : "Entrar"}
        </button>

        <div style={{ textAlign: "center", marginTop: 18, fontSize: 13.5, color: "#8a8a92" }}>
          {mode === "up" ? "Já tem conta? " : "Ainda não tem conta? "}
          <button onClick={() => { setMode(mode === "up" ? "in" : "up"); setErr(""); setInfo(""); }} style={{ background: "none", border: "none", color: "#E8843C", fontWeight: 700, cursor: "pointer", fontSize: 13.5, padding: 0 }}>
            {mode === "up" ? "Entrar" : "Criar conta"}
          </button>
        </div>
      </div>
    </div>
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
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [editingExercise, setEditingExercise] = useState(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [pendingFinish, setPendingFinish] = useState(null);
  const [loaded, setLoaded] = useState(false);

  // ---------- auth ----------
  const [authUser, setAuthUser] = useState(undefined); // undefined = verificando, null = deslogado, obj = logado
  const [authReady, setAuthReady] = useState(false);

  // timer global de descanso
  const [timer, setTimer] = useState(null); // { endAt, total, accent, minimized, finished }
  const [now, setNow] = useState(Date.now());

  // ---------- botão "voltar" do Android: fecha overlays em vez de sair do app ----------
  // pilha lógica de camadas abertas, da mais externa pra mais interna
  const closeTopLayer = useCallback(() => {
    if (editingExercise) { setEditingExercise(null); return true; }
    if (editingWorkout) { setEditingWorkout(null); return true; }
    if (pendingFinish) { setPendingFinish(null); return true; }
    if (showSchedule) { setShowSchedule(false); return true; }
    if (activeWorkout) { setActiveWorkout(null); return true; }
    if (tab !== "today") { setTab("today"); return true; }
    return false;
  }, [editingExercise, editingWorkout, pendingFinish, showSchedule, activeWorkout, tab]);

  const anyLayerOpen = !!(editingExercise || editingWorkout || pendingFinish || showSchedule || activeWorkout) || tab !== "today";

  // mantém um "amortecedor" no histórico sempre que há camada aberta
  useEffect(() => {
    if (!authUser) return;
    if (anyLayerOpen) {
      // empilha um estado-sentinela só se ainda não houver um nosso no topo
      if (!window.history.state || !window.history.state.ciclo7Layer) {
        window.history.pushState({ ciclo7Layer: true }, "");
      }
    }
  }, [anyLayerOpen, authUser]);

  useEffect(() => {
    const onPop = (e) => {
      // ao voltar, se há camada aberta, fecha a do topo e re-empilha o amortecedor
      const closed = closeTopLayer();
      if (closed) {
        // se ainda restou camada aberta, recoloca o sentinela pra continuar capturando
        // (o próximo efeito de anyLayerOpen cuida disso no re-render)
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeTopLayer]);

  // observa login/logout
  useEffect(() => {
    if (!window.fbAuth) { setAuthReady(true); setAuthUser(null); return; }
    const unsub = window.fbAuth.onAuthStateChanged((u) => {
      setCurrentUid(u ? u.uid : null);
      setAuthUser(u || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // carrega os dados quando há usuário logado
  useEffect(() => {
    if (!authReady) return;
    if (!authUser) { setLoaded(false); return; }
    let cancelled = false;
    (async () => {
      setLoaded(false);
      const lg = await storeGet(KEY_LOGS, {});
      const pr = await storeGet(KEY_PROGRESS, {});
      const hs = await storeGet(KEY_HISTORY, []);
      let lb = await storeGet(KEY_LIBRARY, null);
      let wk = await storeGet(KEY_WORKOUTS, null);
      let sc = await storeGet(KEY_SCHEDULE, null);
      if (!lb) { lb = DEFAULT_LIBRARY; await storeSet(KEY_LIBRARY, lb); }
      if (!wk) { wk = DEFAULT_WORKOUTS; await storeSet(KEY_WORKOUTS, wk); }
      if (!sc) { sc = DEFAULT_SCHEDULE; await storeSet(KEY_SCHEDULE, sc); }
      // migração: adiciona muscles a exercícios salvos antes desse recurso
      let libMigrated = false;
      Object.values(lb).forEach((ex) => {
        if (!ex.muscles) {
          const seed = DEFAULT_LIBRARY[ex.id];
          ex.muscles = seed ? seed.muscles : { p: "", s: [] };
          libMigrated = true;
        }
      });
      if (libMigrated) await storeSet(KEY_LIBRARY, lb);
      // migração: formato antigo de checks -> contagem de séries
      let migrated = false;
      Object.entries(pr).forEach(([k, p]) => {
        if (p && p.checks && !p.sets) {
          const w = wk[k];
          p.sets = {};
          if (w) w.items.forEach((it) => { if (p.checks[it.exId]) p.sets[it.exId] = plannedSets(it); });
          delete p.checks;
          migrated = true;
        }
      });
      if (migrated) await storeSet(KEY_PROGRESS, pr);
      // migração: garante id único em cada entrada de histórico
      let histMigrated = false;
      hs.forEach((h, idx) => {
        if (!h.id) { h.id = "h_legacy_" + idx + "_" + (h.date || ""); histMigrated = true; }
      });
      if (histMigrated) await storeSet(KEY_HISTORY, hs);
      if (cancelled) return;
      setLogs(lg); setProgress(pr); setHistory(hs);
      setLib(lb); setWorkouts(wk); setSchedule(sc);
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [authReady, authUser]);

  // tick do timer
  useEffect(() => {
    if (!timer) return;
    const iv = setInterval(() => setNow(Date.now()), 400);
    return () => clearInterval(iv);
  }, [timer]);

  const timerLeft = timer ? Math.max(0, Math.ceil((timer.endAt - now) / 1000)) : 0;

  useEffect(() => {
    if (timer && !timer.finished && timer.endAt - now <= 0) {
      setTimer((t) => (t ? { ...t, finished: true } : t));
      notifyRestDone();
    }
  }, [now, timer]);

  const startTimer = useCallback((seconds, accent) => {
    setNow(Date.now());
    setTimer({ endAt: Date.now() + seconds * 1000, total: seconds, accent, minimized: false, finished: false });
  }, []);

  const extendTimer = () => setTimer((t) => (t ? { ...t, endAt: t.endAt + 30000, finished: false } : t));

  // ---------- derived ----------
  const todayIdx = new Date().getDay();
  const todayKey = schedule[todayIdx] || null;
  const todayWorkout = todayKey ? workouts[todayKey] : null;

  const effectiveId = useCallback((sessionKey, origId) => {
    const p = progress[sessionKey];
    return (p && p.subs && p.subs[origId]) || origId;
  }, [progress]);

  const sessionProgress = useCallback((key) => {
    const w = workouts[key];
    if (!w) return { done: 0, total: 0, pct: 0, setsDone: 0, setsTotal: 0 };
    const p = progress[key];
    const total = w.items.length;
    let done = 0, setsDone = 0, setsTotal = 0;
    w.items.forEach((it) => {
      const planned = plannedSets(it);
      setsTotal += planned;
      const eff = (p && p.subs && p.subs[it.exId]) || it.exId;
      const c = Math.min((p && p.sets && p.sets[eff]) || 0, planned);
      setsDone += c;
      if (planned > 0 && c >= planned) done += 1;
    });
    return { done, total, pct: total ? done / total : 0, setsDone, setsTotal };
  }, [progress, workouts]);

  const usageCount = useCallback((exId) => {
    return Object.values(workouts).reduce((acc, w) => acc + (w.items.some((it) => it.exId === exId) ? 1 : 0), 0);
  }, [workouts]);

  // ---------- mutations ----------
  const setSetCount = async (sessionKey, exId, count, opts = {}) => {
    const next = { ...progress };
    const cur = next[sessionKey] ? { ...next[sessionKey] } : { startedAt: null, sets: {}, subs: {} };
    if (!cur.startedAt) cur.startedAt = new Date().toISOString();
    const prev = (cur.sets && cur.sets[exId]) || 0;
    cur.sets = { ...(cur.sets || {}), [exId]: count };
    cur.date = new Date().toISOString();
    next[sessionKey] = cur;
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
    if (count > prev && opts.rest) startTimer(opts.rest, opts.accent || "#E8843C");
  };

  const setSub = async (sessionKey, origId, newId) => {
    const next = { ...progress };
    const cur = next[sessionKey] ? { ...next[sessionKey] } : { startedAt: null, sets: {}, subs: {} };
    const subs = { ...(cur.subs || {}) };
    const prevEff = subs[origId] || origId;
    if (newId) subs[origId] = newId; else delete subs[origId];
    // zera a contagem do exercício anterior nesse slot
    const sets = { ...(cur.sets || {}) };
    delete sets[prevEff];
    cur.subs = subs;
    cur.sets = sets;
    cur.date = new Date().toISOString();
    next[sessionKey] = cur;
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
  };

  const requestFinish = (sessionKey) => setPendingFinish(sessionKey);

  const resetSession = async (sessionKey) => {
    const next = { ...progress };
    delete next[sessionKey];
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
    setTimer(null);
  };

  const finalizeSession = async (sessionKey, note) => {
    const w = workouts[sessionKey];
    const p = progress[sessionKey];
    const sp = sessionProgress(sessionKey);
    const startedAt = p && p.startedAt ? new Date(p.startedAt).getTime() : null;
    const duration = startedAt ? Math.max(0, Math.round((Date.now() - startedAt) / 1000)) : null;
    // volume por grupo muscular: primário conta 1 série, secundário 0.5
    const muscleSets = {};
    if (w) {
      w.items.forEach((it) => {
        const planned = plannedSets(it);
        const eff = (p && p.subs && p.subs[it.exId]) || it.exId;
        const c = Math.min((p && p.sets && p.sets[eff]) || 0, planned);
        if (c <= 0) return;
        const ex = lib[eff];
        const m = exMuscles(ex);
        if (m.p) muscleSets[m.p] = (muscleSets[m.p] || 0) + c;
        (m.s || []).forEach((sid) => { muscleSets[sid] = (muscleSets[sid] || 0) + c * 0.5; });
      });
    }
    const entry = {
      id: uid("h_"),
      key: sessionKey,
      name: w ? w.name : sessionKey,
      tag: w ? w.tag : "",
      accent: w ? w.accent : "#8a8a92",
      date: new Date().toISOString(),
      duration,
      exDone: sp.done,
      exTotal: sp.total,
      setsDone: sp.setsDone,
      setsTotal: sp.setsTotal,
      muscleSets,
      note: (note || "").trim(),
    };
    const nextH = [...history, entry];
    setHistory(nextH);
    await storeSet(KEY_HISTORY, nextH);
    const next = { ...progress };
    delete next[sessionKey];
    setProgress(next);
    await storeSet(KEY_PROGRESS, next);
    setPendingFinish(null);
    setActiveWorkout(null);
    setTab("today");
  };

  const deleteHistoryEntry = async (id) => {
    const nextH = history.filter((h) => h.id !== id);
    setHistory(nextH);
    await storeSet(KEY_HISTORY, nextH);
  };

  const logSet = async (exId, entry) => {
    const next = { ...logs };
    const arr = next[exId] ? [...next[exId]] : [];
    arr.push({ ...entry, date: new Date().toISOString() });
    next[exId] = arr;
    setLogs(next);
    await storeSet(KEY_LOGS, next);
  };

  const deleteLog = async (exId, rec) => {
    const next = { ...logs };
    if (!next[exId]) return;
    // remove a primeira ocorrência que casa com o registro (data+peso+série+reps)
    let removed = false;
    const arr = next[exId].filter((e) => {
      if (removed) return true;
      const match = e.date === rec.date && e.weight === rec.weight && (e.set || null) === (rec.set || null) && (e.reps || "") === (rec.reps || "");
      if (match) { removed = true; return false; }
      return true;
    });
    if (arr.length) next[exId] = arr;
    else delete next[exId]; // remove o exercício do histórico se ficou sem registros
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
    const sc = { ...schedule };
    let changed = false;
    Object.keys(sc).forEach((d) => { if (sc[d] === key) { sc[d] = null; changed = true; } });
    if (changed) { setSchedule(sc); await storeSet(KEY_SCHEDULE, sc); }
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

  if (!authReady || authUser === undefined) {
    return <LoadingScreen label="verificando login" />;
  }

  if (!authUser) {
    return <LoginScreen />;
  }

  if (!loaded) {
    return <LoadingScreen label="preparando seu treino" />;
  }

  return (
    <div style={root}>
      <style>{globalCss}</style>

      <header style={headerBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <span style={{ color: "#E8843C", display: "flex" }}><Icon.Dumbbell /></span>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, letterSpacing: 0.5, textTransform: "uppercase" }}>Ciclo<span style={{ color: "#E8843C" }}>7</span></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ fontSize: 11, color: "#6a6a72", letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>Hipertrofia</div>
          <button onClick={() => { if (window.fbAuth) window.fbAuth.signOut(); }} style={{ ...iconBtn, color: "#6a6a72" }} aria-label="Sair da conta" title="Sair"><Icon.Logout /></button>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {activeWorkout && workouts[activeWorkout] ? (
          <SessionDetail
            sessionKey={activeWorkout}
            workout={workouts[activeWorkout]}
            lib={lib}
            progress={progress[activeWorkout]}
            sp={sessionProgress(activeWorkout)}
            onSetCount={setSetCount}
            onSub={setSub}
            onBack={() => setActiveWorkout(null)}
            onFinish={() => requestFinish(activeWorkout)}
            onReset={() => resetSession(activeWorkout)}
            onEdit={() => setEditingWorkout(workouts[activeWorkout])}
            onTimer={(s, a) => startTimer(s, a)}
            logSet={logSet}
            lastLog={lastLog}
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
          <ProgressView logs={logs} lib={lib} workouts={workouts} history={history} onDeleteSession={deleteHistoryEntry} onDeleteLog={deleteLog} />
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

      {pendingFinish && (
        <NoteModal
          accent={workouts[pendingFinish] ? workouts[pendingFinish].accent : "#E8843C"}
          onSave={(note) => finalizeSession(pendingFinish, note)}
          onSkip={() => finalizeSession(pendingFinish, "")}
          onClose={() => setPendingFinish(null)}
        />
      )}

      {timer && !timer.minimized && (
        <RestTimerModal
          left={timerLeft}
          total={timer.total}
          accent={timer.accent}
          finished={timer.finished}
          onCancel={() => setTimer(null)}
          onMinimize={() => setTimer((t) => (t ? { ...t, minimized: true } : t))}
          onExtend={extendTimer}
        />
      )}
      {timer && timer.minimized && (
        <TimerChip
          left={timerLeft}
          accent={timer.accent}
          finished={timer.finished}
          onClick={() => timer.finished ? setTimer(null) : setTimer((t) => (t ? { ...t, minimized: false } : t))}
        />
      )}
    </div>
  );
}

// ============================================================
// NOTE MODAL (nota da sessão ao concluir)
// ============================================================
function NoteModal({ accent, onSave, onSkip, onClose }) {
  const [note, setNote] = useState("");
  return (
    <div style={{ ...overlay, zIndex: 85 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={panel}>
        <div style={panelHeader}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>Como foi o treino?</span>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>
        <div style={{ padding: "0 18px 18px" }}>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Anotação opcional — ex.: ombro incomodou no supino, subi carga no voador…"
            style={{ ...textInput, resize: "vertical", fontFamily: "inherit" }}
            autoFocus
          />
          <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
            <button onClick={onSkip} style={{ flex: 1, padding: "13px", background: "transparent", color: "#9a9aa2", border: "1.5px solid #2a2a30", borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Pular</button>
            <button onClick={() => onSave(note)} style={{ ...primaryBtn(accent), flex: 2, justifyContent: "center" }}><Icon.Check /> Concluir</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// TODAY VIEW
// ============================================================
function TodayView({ todayIdx, workout, sp, schedule, workouts, sessionProgress, onOpen, onEditSchedule }) {
  const [pickOther, setPickOther] = useState(false);
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
              <div style={{ color: "#8a8a92", fontSize: 14, marginTop: 6 }}>{workout.items.length} exercícios · {sp.setsDone}/{sp.setsTotal} séries</div>
            </div>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <Ring pct={sp.pct} accent={workout.accent} />
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif" }}>{Math.round(sp.pct * 100)}<span style={{ fontSize: 15 }}>%</span></span>
              </div>
            </div>
          </div>
          <button onClick={() => onOpen(workout.key)} style={{ ...primaryBtn(workout.accent), marginTop: 20, width: "100%" }}>
            {sp.setsDone > 0 ? "Continuar treino" : "Começar treino"} <Icon.Arrow />
          </button>
        </div>
      ) : (
        <div style={{ ...card, marginTop: 14, padding: 28, textAlign: "center" }}>
          <span style={{ color: "#3a3a42", display: "inline-flex", marginBottom: 12 }}><Icon.Moon width={42} height={42} /></span>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 700, textTransform: "uppercase" }}>Descanso</div>
          <div style={{ color: "#8a8a92", fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>Sem treino programado pra hoje.<br />Recuperação também é treino.</div>
        </div>
      )}

      <button onClick={() => setPickOther(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", marginTop: 12, background: "none", border: "1px dashed #3a3a42", borderRadius: 12, padding: "13px", color: "#b0b0b8", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
        <Icon.Swap /> {workout ? "Fazer outro treino hoje" : "Escolher um treino pra hoje"}
      </button>

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
                    <span style={{ display: "block", fontWeight: 600, fontSize: 15, color: "#f0f0f2" }}>{w.name}</span>
                    <span style={{ display: "block", fontSize: 12, color: "#7a7a82" }}>{isToday ? "Hoje" : ""} {w.items.length} exercícios</span>
                  </span>
                  {p && p.setsDone > 0 && p.done < p.total && <span style={{ fontSize: 11, color: w.accent, fontWeight: 700 }}>{p.done}/{p.total}</span>}
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

      {pickOther && (
        <div style={overlay} onClick={() => setPickOther(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ ...panel, maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
            <div style={panelHeader}>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>Treino de hoje</span>
              <button onClick={() => setPickOther(false)} style={iconBtn}><Icon.X /></button>
            </div>
            <div style={{ padding: "0 18px 8px" }}>
              <p style={{ color: "#8a8a92", fontSize: 13, lineHeight: 1.5, margin: "0 0 14px" }}>Escolha qualquer treino pra fazer hoje. Isso <strong style={{ color: "#c9c9ce" }}>não muda a sua agenda</strong> — vale só pra esta sessão.</p>
            </div>
            <div style={{ padding: "0 18px 18px", overflowY: "auto" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                {Object.values(workouts).map((w) => {
                  const wp = sessionProgress(w.key);
                  const isScheduled = workout && w.key === workout.key;
                  return (
                    <button key={w.key} onClick={() => { setPickOther(false); onOpen(w.key); }} style={{ ...rowCard, cursor: "pointer", borderColor: isScheduled ? w.accent : "#1f1f24" }}>
                      <span style={{ width: 38, height: 38, borderRadius: 9, background: w.accent, color: "#101013", fontWeight: 800, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{w.tag}</span>
                      <span style={{ flex: 1, textAlign: "left", minWidth: 0 }}>
                        <span style={{ display: "block", fontWeight: 600, fontSize: 15, color: "#f0f0f2" }}>{w.name}</span>
                        <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 1 }}>
                          {w.items.length} exercícios{isScheduled ? " · previsto pra hoje" : ""}{wp.setsDone > 0 ? " · " + wp.setsDone + "/" + wp.setsTotal + " séries" : ""}
                        </span>
                      </span>
                      <Icon.Arrow />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
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
function SessionDetail({ sessionKey, workout, lib, progress, sp, onSetCount, onSub, onBack, onFinish, onReset, onEdit, onTimer, logSet, lastLog }) {
  const subs = (progress && progress.subs) || {};
  const setCounts = (progress && progress.sets) || {};
  const startedAt = progress && progress.startedAt ? new Date(progress.startedAt).getTime() : null;
  const [swapping, setSwapping] = useState(null); // origId em troca
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetNonce, setResetNonce] = useState(0);
  const hasProgress = sp.setsDone > 0 || Object.keys(subs).length > 0;

  // cronômetro da sessão
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const iv = setInterval(() => forceTick((x) => x + 1), 1000);
    return () => clearInterval(iv);
  }, [startedAt]);
  const elapsed = startedAt ? Math.floor((Date.now() - startedAt) / 1000) : null;

  return (
    <div>
      <div style={{ position: "sticky", top: 0, zIndex: 20, background: "#101013", borderBottom: "1px solid #1f1f24", padding: "14px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "#9a9aa2", cursor: "pointer", display: "flex", padding: 0 }}>
            <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon.Arrow /></span>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ background: workout.accent, color: "#101013", fontWeight: 800, fontSize: 11, padding: "2px 8px", borderRadius: 5 }}>{workout.tag}</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 21, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{workout.name}</span>
            </div>
            {elapsed != null && (
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 3, color: "#8a8a92", fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                <Icon.Timer width={12} height={12} /> {fmtClock(elapsed)}
              </div>
            )}
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
            const effId = subs[it.exId] || it.exId;
            const isSub = effId !== it.exId;
            const base = lib[effId] || { name: "Exercício removido da biblioteca", warn: "", note: "", video: "" };
            const planned = plannedSets(it);
            const ex = { id: effId, origId: it.exId, name: base.name, warn: base.warn, note: base.note, video: base.video || "", sets: planned, reps: it.reps, rest: it.rest };
            return (
              <ExerciseCard
                key={it.exId + "-" + idx + "-r" + resetNonce}
                ex={ex}
                idx={idx}
                accent={workout.accent}
                setsDone={Math.min(setCounts[effId] || 0, planned)}
                isSub={isSub}
                onSetChange={(count) => onSetCount(sessionKey, effId, count, { rest: parseRest(it.rest), accent: workout.accent })}
                onToggleAll={() => {
                  const cur = Math.min(setCounts[effId] || 0, planned);
                  onSetCount(sessionKey, effId, cur >= planned ? 0 : planned, {});
                }}
                onSwap={() => setSwapping(it.exId)}
                onUndoSub={() => onSub(sessionKey, it.exId, null)}
                onTimer={() => onTimer(parseRest(it.rest), workout.accent)}
                logSet={logSet}
                last={lastLog(effId)}
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

        {workout.items.length > 0 && hasProgress && (
          <button
            onClick={() => { if (confirmReset) { onReset(); setConfirmReset(false); setResetNonce((n) => n + 1); } else setConfirmReset(true); }}
            style={{ width: "100%", marginTop: 12, padding: "13px", background: confirmReset ? "#e36a5a" : "transparent", color: confirmReset ? "#101013" : "#9a9aa2", border: "1.5px solid " + (confirmReset ? "#e36a5a" : "#2e2e36"), borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            <Icon.Refresh /> {confirmReset ? "Confirmar — apagar o andamento" : "Reiniciar treino"}
          </button>
        )}
        {confirmReset && (
          <p style={{ textAlign: "center", color: "#b8736a", fontSize: 12, marginTop: 8, lineHeight: 1.5 }}>
            Zera as séries, substituições e o cronômetro desta sessão. As cargas já registradas em sessões concluídas não são afetadas.
          </p>
        )}
        <p style={{ textAlign: "center", color: "#5a5a62", fontSize: 12, marginTop: 10, lineHeight: 1.5 }}>
          Concluir registra a sessão no histórico (com duração e séries) e limpa o andamento.
        </p>
      </div>

      {swapping && (
        <ExercisePicker
          lib={lib}
          existing={[subs[swapping] || swapping]}
          title="Substituir nesta sessão"
          closeOnPick={true}
          onPick={(ex) => { onSub(sessionKey, swapping, ex.id === swapping ? null : ex.id); setSwapping(null); }}
          onCreateNew={null}
          onClose={() => setSwapping(null)}
        />
      )}
    </div>
  );
}

// ============================================================
// EXERCISE CARD (com séries individuais)
// ============================================================
function ExerciseCard({ ex, idx, accent, setsDone, isSub, onSetChange, onToggleAll, onSwap, onUndoSub, onTimer, logSet, last }) {
  const [open, setOpen] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const vid = ytId(ex.video);
  const checked = ex.sets > 0 && setsDone >= ex.sets;

  const save = () => {
    if (!weight) return;
    const setNum = setsDone + 1;
    if (setNum > ex.sets) return;
    logSet(ex.id, { weight: parseNum(weight), reps: reps || ex.reps, set: setNum });
    onSetChange(setNum); // marca a série como concluída
    setWeight(""); setReps("");
    if (setNum >= ex.sets) setOpen(false); // fecha só na última série
  };

  const tapSet = (i) => {
    const newCount = i < setsDone ? i : i + 1;
    onSetChange(newCount);
  };

  return (
    <div style={{ ...card, padding: 0, overflow: "hidden", borderColor: checked ? accent + "66" : "#1f1f24" }}>
      <div style={{ display: "flex", alignItems: "stretch" }}>
        <button onClick={onToggleAll} aria-label="marcar exercício completo" style={{
          width: 50, flexShrink: 0, border: "none", cursor: "pointer",
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

          {isSub && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#E3C84C", background: "#221f10", border: "1px solid #3a3520", borderRadius: 5, padding: "2px 7px" }}>Substituído nesta sessão</span>
              <button onClick={onUndoSub} style={{ background: "none", border: "none", color: "#8a8a92", fontSize: 11.5, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline" }}>desfazer</button>
            </div>
          )}

          {exMuscles(ex).p && (
            <div style={{ marginTop: 8 }}><MuscleChips muscles={ex.muscles} /></div>
          )}

          {ex.sets > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
              {Array.from({ length: ex.sets }).map((_, i) => {
                const done = i < setsDone;
                return (
                  <button key={i} onClick={() => tapSet(i)} aria-label={"série " + (i + 1)} style={{
                    width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                    border: done ? "none" : "1.5px solid #2e2e36",
                    background: done ? accent : "#16161b",
                    color: done ? "#101013" : "#8a8a92",
                    fontWeight: 800, fontSize: 13.5,
                    transition: "all .15s",
                  }}>{i + 1}</button>
                );
              })}
              <span style={{ fontSize: 11, color: "#6a6a72", fontWeight: 700, marginLeft: 4 }}>{setsDone}/{ex.sets}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
            <Stat label="Reps" value={ex.reps} accent={accent} />
            <button onClick={onTimer} style={chipBtn("#b0b0b8")}>
              <Icon.Timer /> {ex.rest}
            </button>
            {vid ? (
              <button onClick={() => setShowVideo(true)} style={chipBtn(accent, 700)}>
                <Icon.Play /> Vídeo
              </button>
            ) : null}
            <button onClick={onSwap} style={chipBtn("#b0b0b8")}>
              <Icon.Swap /> Trocar
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
                Última: <strong style={{ color: "#b0b0b8" }}>{last.weight}kg × {last.reps}{last.set ? " · S" + last.set : ""}</strong>
              </span>
            )}
          </div>

          {open && (
            <div style={{ display: "flex", gap: 8, marginTop: 11, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: accent, background: "#1a1a1f", border: "1px solid #2a2a30", borderRadius: 6, padding: "5px 8px" }}>S{Math.min(setsDone + 1, ex.sets)}</span>
              <input inputMode="decimal" placeholder={last ? String(last.weight) : "kg"} value={weight} onChange={(e) => setWeight(e.target.value)} style={inputStyle} />
              <span style={{ color: "#5a5a62" }}>×</span>
              <input inputMode="numeric" placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)} style={inputStyle} />
              <button onClick={save} style={{ ...primaryBtn(accent), padding: "9px 16px", fontSize: 13 }}>Salvar</button>
            </div>
          )}

          {showVideo && vid ? <VideoModal videoId={vid} title={ex.name} onClose={() => setShowVideo(false)} /> : null}
        </div>
      </div>
    </div>
  );
}

const MuscleChips = ({ muscles, size = "sm" }) => {
  const m = muscles || { p: "", s: [] };
  const list = [];
  if (m.p) list.push({ id: m.p, primary: true });
  (m.s || []).forEach((id) => list.push({ id, primary: false }));
  if (!list.length) return null;
  const fs = size === "sm" ? 10.5 : 11.5;
  const pad = size === "sm" ? "2px 7px" : "3px 9px";
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
      {list.map((it, i) => {
        const c = muscleColor(it.id);
        return (
          <span key={i} style={{
            fontSize: fs, fontWeight: 700, padding: pad, borderRadius: 6, lineHeight: 1.2,
            color: it.primary ? "#101013" : c,
            background: it.primary ? c : "transparent",
            border: "1px solid " + c + (it.primary ? "" : "55"),
            opacity: it.primary ? 1 : 0.92,
          }}>{muscleName(it.id)}</span>
        );
      })}
    </div>
  );
};

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
          title="Adicionar exercício"
          closeOnPick={false}
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
function ExercisePicker({ lib, existing, title, closeOnPick, onPick, onCreateNew, onClose }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("");
  const usedMuscles = useMemo(() => {
    const present = new Set();
    Object.values(lib).forEach((ex) => {
      const m = exMuscles(ex);
      if (m.p) present.add(m.p);
      (m.s || []).forEach((x) => present.add(x));
    });
    return MUSCLE_ORDER.filter((id) => present.has(id));
  }, [lib]);
  const list = useMemo(() => {
    const all = Object.values(lib).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const term = q.trim().toLowerCase();
    return all.filter((e) => {
      if (term && !e.name.toLowerCase().includes(term)) return false;
      if (filter) {
        const m = exMuscles(e);
        if (m.p !== filter && !(m.s || []).includes(filter)) return false;
      }
      return true;
    });
  }, [lib, q, filter]);

  return (
    <div style={{ ...overlay, zIndex: 70 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ ...panel, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
        <div style={panelHeader}>
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22, fontWeight: 700, textTransform: "uppercase" }}>{title || "Adicionar exercício"}</span>
          <button onClick={onClose} style={iconBtn}><Icon.X /></button>
        </div>
        <div style={{ padding: "0 18px 12px" }}>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5a5a62", display: "flex" }}><Icon.Search /></span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar na biblioteca…" style={{ ...textInput, paddingLeft: 36 }} />
          </div>
          {usedMuscles.length > 0 && (
            <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingTop: 12, paddingBottom: 2, WebkitOverflowScrolling: "touch" }}>
              <button onClick={() => setFilter("")} style={filterChip(filter === "", "#E8843C")}>Todos</button>
              {usedMuscles.map((id) => (
                <button key={id} onClick={() => setFilter(filter === id ? "" : id)} style={filterChip(filter === id, muscleColor(id))}>
                  {muscleName(id)}
                </button>
              ))}
            </div>
          )}
          {onCreateNew && (
            <button onClick={onCreateNew} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#E8843C", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "12px 0 0" }}>
              <Icon.Plus /> Criar exercício novo
            </button>
          )}
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "0 18px 18px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {list.map((ex) => {
              const added = existing.includes(ex.id);
              return (
                <button key={ex.id} onClick={() => { if (!added) { onPick(ex); if (closeOnPick) onClose(); } }} disabled={added} style={{ ...card, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10, cursor: added ? "default" : "pointer", opacity: added ? 0.45 : 1, textAlign: "left", width: "100%" }}>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#f0f0f2", lineHeight: 1.3 }}>{ex.name}</span>
                    {exMuscles(ex).p ? <span style={{ display: "block", marginTop: 6 }}><MuscleChips muscles={ex.muscles} /></span> : null}
                    <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 6 }}>{ex.sets}× {ex.reps} · {ex.rest}</span>
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
// EXERCISE FORM
// ============================================================
function ExerciseForm({ initial, usage, onSave, onDelete, onClose }) {
  const isNew = !initial;
  const [draft, setDraft] = useState(() => initial ? { ...initial, muscles: initial.muscles ? { p: initial.muscles.p || "", s: [...(initial.muscles.s || [])] } : { p: "", s: [] } } : { id: uid("ex_"), name: "", sets: 3, reps: "10-12", rest: "60s", warn: "", note: "", video: "", muscles: { p: "", s: [] } });
  const [confirmDel, setConfirmDel] = useState(false);
  const [error, setError] = useState("");
  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));

  const toggleMuscle = (id) => setDraft((d) => {
    const m = { p: d.muscles.p, s: [...d.muscles.s] };
    if (m.p === id) {
      m.p = "";
      if (!m.s.includes(id)) m.s.push(id);
    } else if (m.s.includes(id)) {
      m.s = m.s.filter((x) => x !== id);
    } else {
      if (!m.p) m.p = id;
      else m.s.push(id);
    }
    return { ...d, muscles: m };
  });

  const makePrimary = (id) => setDraft((d) => {
    const m = { p: id, s: d.muscles.s.filter((x) => x !== id) };
    if (d.muscles.p && d.muscles.p !== id) m.s = [d.muscles.p, ...m.s];
    return { ...d, muscles: m };
  });

  const muscleState = (id) => draft.muscles.p === id ? "p" : (draft.muscles.s.includes(id) ? "s" : "");

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

          <label style={labelStyle}>Grupos musculares</label>
          <div style={{ fontSize: 11.5, color: "#7a7a82", marginBottom: 8, lineHeight: 1.4 }}>
            Toque pra marcar. 1º toque = <span style={{ color: "#f0f0f2", fontWeight: 700 }}>primário</span>, 2º = secundário, 3º remove. Toque longo não precisa — use "tornar primário" no chip.
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 6 }}>
            {MUSCLE_ORDER.map((id) => {
              const st = muscleState(id);
              const c = muscleColor(id);
              return (
                <button key={id} onClick={() => toggleMuscle(id)} style={{
                  fontSize: 12, fontWeight: 700, padding: "6px 11px", borderRadius: 8, cursor: "pointer",
                  color: st === "p" ? "#101013" : (st === "s" ? c : "#8a8a92"),
                  background: st === "p" ? c : (st === "s" ? c + "22" : "#16161b"),
                  border: "1.5px solid " + (st ? c : "#2a2a30"),
                  transition: "all .12s",
                }}>
                  {st === "p" && "★ "}{muscleName(id)}
                </button>
              );
            })}
          </div>
          {draft.muscles.s.length > 0 && (
            <div style={{ fontSize: 11.5, color: "#7a7a82", marginBottom: 4 }}>
              Secundários selecionados — toque em um pra tornar primário:
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                {draft.muscles.s.map((id) => (
                  <button key={id} onClick={() => makePrimary(id)} style={{
                    fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, cursor: "pointer",
                    color: muscleColor(id), background: "transparent", border: "1px solid " + muscleColor(id) + "55",
                  }}>{muscleName(id)} → ★</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ marginBottom: 16 }} />

          <label style={labelStyle}>Vídeo de demonstração (opcional)</label>
          <input value={draft.video || ""} onChange={(e) => set({ video: e.target.value })} placeholder="Cole o link do YouTube" style={{ ...textInput, marginBottom: 4 }} />
          <div style={{ fontSize: 11.5, fontWeight: 600, marginBottom: 12, minHeight: 15, color: draft.video ? (ytId(draft.video) ? "#5EB87A" : "#e36a5a") : "transparent" }}>
            {draft.video ? (ytId(draft.video) ? "✓ Vídeo reconhecido" : "Link não reconhecido — cole um link do YouTube") : "."}
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
  const [filter, setFilter] = useState(""); // id de músculo, "" = todos

  const usedMuscles = useMemo(() => {
    const present = new Set();
    Object.values(lib).forEach((ex) => {
      const m = exMuscles(ex);
      if (m.p) present.add(m.p);
      (m.s || []).forEach((x) => present.add(x));
    });
    return MUSCLE_ORDER.filter((id) => present.has(id));
  }, [lib]);

  const list = useMemo(() => {
    const all = Object.values(lib).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    const term = q.trim().toLowerCase();
    return all.filter((e) => {
      if (term && !e.name.toLowerCase().includes(term)) return false;
      if (filter) {
        const m = exMuscles(e);
        if (m.p !== filter && !(m.s || []).includes(filter)) return false;
      }
      return true;
    });
  }, [lib, q, filter]);

  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700 }}>Biblioteca · {Object.keys(lib).length}</div>
        <button onClick={onNew} style={{ display: "flex", alignItems: "center", gap: 6, background: "#E8843C", border: "none", borderRadius: 8, padding: "8px 14px", color: "#101013", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
          <Icon.Plus /> Novo
        </button>
      </div>

      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#5a5a62", display: "flex" }}><Icon.Search /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar exercício…" style={{ ...textInput, paddingLeft: 36 }} />
      </div>

      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 12, WebkitOverflowScrolling: "touch" }}>
        <button onClick={() => setFilter("")} style={filterChip(filter === "", "#E8843C")}>Todos</button>
        {usedMuscles.map((id) => (
          <button key={id} onClick={() => setFilter(filter === id ? "" : id)} style={filterChip(filter === id, muscleColor(id))}>
            {muscleName(id)}
          </button>
        ))}
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
                  {ytId(ex.video) ? <span style={{ color: "#5EB87A", display: "flex", flexShrink: 0 }}><Icon.Play width={12} height={12} /></span> : null}
                </span>
                {exMuscles(ex).p ? <span style={{ display: "block", marginTop: 7 }}><MuscleChips muscles={ex.muscles} /></span> : null}
                <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 6 }}>
                  {ex.sets}× {ex.reps} · {ex.rest}{uses > 0 ? " · em " + uses + " treino" + (uses > 1 ? "s" : "") : ""}
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
function ProgressView({ logs, lib, workouts, history, onDeleteSession, onDeleteLog }) {
  // ---------- filtro de período ----------
  const PERIODS = [
    { id: "7", label: "7 dias", days: 7 },
    { id: "30", label: "30 dias", days: 30 },
    { id: "90", label: "90 dias", days: 90 },
    { id: "all", label: "Tudo", days: null },
  ];
  const [period, setPeriod] = useState("30");
  const periodStart = useMemo(() => {
    const p = PERIODS.find((x) => x.id === period);
    if (!p || p.days == null) return 0;
    const d = new Date(); d.setHours(0, 0, 0, 0);
    return d.getTime() - (p.days - 1) * 24 * 3600 * 1000;
  }, [period]);

  // logs e history recortados ao período escolhido
  const fLogs = useMemo(() => {
    if (!periodStart) return logs;
    const out = {};
    Object.entries(logs).forEach(([exId, arr]) => {
      if (!arr) return;
      const kept = arr.filter((e) => new Date(e.date).getTime() >= periodStart);
      if (kept.length) out[exId] = kept;
    });
    return out;
  }, [logs, periodStart]);

  const fHistory = useMemo(() => {
    if (!periodStart) return history;
    return history.filter((h) => new Date(h.date).getTime() >= periodStart);
  }, [history, periodStart]);

  const metaByEx = useMemo(() => {
    const m = {};
    Object.values(workouts).forEach((w) => w.items.forEach((it) => {
      if (!m[it.exId]) m[it.exId] = { tag: w.tag, accent: w.accent };
    }));
    return m;
  }, [workouts]);

  const logged = Object.entries(fLogs).filter(([, arr]) => arr && arr.length).sort((a, b) => {
    const la = new Date(a[1][a[1].length - 1].date).getTime();
    const lb = new Date(b[1][b[1].length - 1].date).getTime();
    return lb - la;
  });

  const totalSets = Object.values(fLogs).reduce((acc, arr) => acc + (arr ? arr.length : 0), 0);
  const completedSessions = fHistory.length;

  // volume semanal: nº de semanas conforme o período (até 12), ou 8 no "Tudo"
  const weekly = useMemo(() => {
    const MS_WEEK = 7 * 24 * 3600 * 1000;
    const cur = weekStartMs(new Date());
    const p = PERIODS.find((x) => x.id === period);
    let nWeeks = 8;
    if (p && p.days != null) nWeeks = Math.max(2, Math.ceil(p.days / 7));
    nWeeks = Math.min(nWeeks, 13);
    const buckets = [];
    for (let i = nWeeks - 1; i >= 0; i--) {
      const start = cur - i * MS_WEEK;
      buckets.push({ start, label: new Date(start).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }), sets: 0 });
    }
    fHistory.forEach((h) => {
      if (!h.setsDone) return;
      const ws = weekStartMs(h.date);
      const b = buckets.find((bk) => bk.start === ws);
      if (b) b.sets += h.setsDone;
    });
    const any = buckets.some((b) => b.sets > 0);
    return any ? buckets : null;
  }, [fHistory, period]);

  const [expanded, setExpanded] = useState(null);
  const [expandedSession, setExpandedSession] = useState(null);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // id da sessão aguardando confirmação
  const [confirmDeleteLog, setConfirmDeleteLog] = useState(null); // "exId:origIndex" aguardando confirmação

  // volume por grupo muscular no período (séries ponderadas)
  const muscleVolume = useMemo(() => {
    const totals = {};
    fHistory.forEach((h) => {
      if (!h.muscleSets) return;
      Object.entries(h.muscleSets).forEach(([mid, v]) => {
        totals[mid] = (totals[mid] || 0) + v;
      });
    });
    const rows = MUSCLE_ORDER.filter((id) => totals[id] > 0).map((id) => ({ id, sets: totals[id] }));
    rows.sort((a, b) => b.sets - a.sets);
    return rows.length ? rows : null;
  }, [fHistory]);

  const sessionsDesc = useMemo(() => [...fHistory].reverse(), [fHistory]);
  const sessionsShown = showAllSessions ? sessionsDesc : sessionsDesc.slice(0, 8);

  return (
    <div style={{ padding: "22px 18px 30px" }}>
      <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 6, marginBottom: 18, WebkitOverflowScrolling: "touch" }}>
        {PERIODS.map((p) => (
          <button key={p.id} onClick={() => setPeriod(p.id)} style={filterChip(period === p.id, "#E8843C")}>{p.label}</button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 11, marginBottom: 22 }}>
        <MetricCard value={completedSessions} label="treinos concluídos" accent="#E8843C" icon={<Icon.Trophy />} />
        <MetricCard value={totalSets} label="cargas registradas" accent="#5EB87A" icon={<Icon.Dumbbell />} />
      </div>

      {weekly && (
        <React.Fragment>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 12 }}>Volume semanal (séries)</div>
          <div style={{ ...card, padding: "16px 14px 10px", marginBottom: 22 }}>
            <WeeklyBars buckets={weekly} />
          </div>
        </React.Fragment>
      )}

      {muscleVolume && (
        <React.Fragment>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 4 }}>Volume por grupo · {period === "all" ? "tudo" : (PERIODS.find((x) => x.id === period) || {}).label}</div>
          <div style={{ fontSize: 11.5, color: "#7a7a82", marginBottom: 12, lineHeight: 1.4 }}>Séries ponderadas — primário conta 1, secundário 0,5.</div>
          <div style={{ ...card, padding: "16px 16px 14px", marginBottom: 22 }}>
            <MuscleVolumeBars rows={muscleVolume} />
          </div>
        </React.Fragment>
      )}

      {sessionsDesc.length > 0 && (
        <React.Fragment>
          <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 12 }}>Histórico de sessões</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
            {sessionsShown.map((h, i) => {
              const accent = h.accent || (workouts[h.key] ? workouts[h.key].accent : "#8a8a92");
              const hasDetails = h.note || h.duration != null;
              const sid = h.id || (h.date + "-" + i);
              const isOpen = expandedSession === sid;
              const isConfirming = confirmDelete === sid;
              const d = new Date(h.date);
              return (
                <div key={sid} style={{ ...card, padding: 0, overflow: "hidden" }}>
                  <button onClick={() => hasDetails && setExpandedSession(isOpen ? null : sid)} style={{ width: "100%", padding: "13px 14px", background: "none", border: "none", cursor: hasDetails ? "pointer" : "default", textAlign: "left", display: "flex", alignItems: "center", gap: 11 }}>
                    <span style={{ width: 32, height: 32, borderRadius: 8, background: accent, color: "#101013", fontWeight: 800, fontSize: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{h.tag || "•"}</span>
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: "block", fontWeight: 600, fontSize: 14, color: "#f0f0f2" }}>{h.name}</span>
                      <span style={{ display: "block", fontSize: 12, color: "#7a7a82", marginTop: 2 }}>
                        {d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
                        {h.exTotal != null ? " · " + h.exDone + "/" + h.exTotal + " exercícios" : ""}
                        {h.setsDone != null ? " · " + h.setsDone + " séries" : ""}
                      </span>
                    </span>
                    <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                      {h.duration != null && <span style={{ fontSize: 12.5, fontWeight: 800, color: "#b0b0b8" }}>{fmtDur(h.duration)}</span>}
                      {h.note && <span style={{ color: "#E3C84C", display: "flex" }}><Icon.Pencil width={12} height={12} /></span>}
                    </span>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); setConfirmDelete(isConfirming ? null : sid); }}
                      style={{ ...iconBtn, color: isConfirming ? "#e36a5a" : "#5a5a62", flexShrink: 0, marginLeft: 2 }}
                      aria-label="Excluir sessão"
                    ><Icon.Trash width={15} height={15} /></span>
                  </button>
                  {isOpen && h.note && (
                    <div style={{ padding: "0 14px 13px 57px", fontSize: 13, color: "#c9c9ce", lineHeight: 1.5 }}>{h.note}</div>
                  )}
                  {isConfirming && (
                    <div style={{ padding: "0 14px 13px", display: "flex", alignItems: "center", gap: 10, borderTop: "1px solid #1f1f24", paddingTop: 12 }}>
                      <span style={{ flex: 1, fontSize: 12.5, color: "#b8736a", lineHeight: 1.4 }}>Excluir esta sessão do histórico? Não afeta as cargas já registradas.</span>
                      <button onClick={() => setConfirmDelete(null)} style={{ background: "none", border: "1px solid #2e2e36", borderRadius: 8, padding: "7px 12px", color: "#9a9aa2", fontSize: 12.5, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Cancelar</button>
                      <button onClick={() => { onDeleteSession(sid); setConfirmDelete(null); if (isOpen) setExpandedSession(null); }} style={{ background: "#e36a5a", border: "none", borderRadius: 8, padding: "7px 12px", color: "#101013", fontSize: 12.5, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>Excluir</button>
                    </div>
                  )}
                </div>
              );
            })}
            {sessionsDesc.length > 8 && (
              <button onClick={() => setShowAllSessions((s) => !s)} style={{ background: "none", border: "none", color: "#8a8a92", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: "6px 0" }}>
                {showAllSessions ? "Mostrar menos" : "Mostrar todas (" + sessionsDesc.length + ")"}
              </button>
            )}
          </div>
        </React.Fragment>
      )}

      {logged.length === 0 ? (
        <div style={{ padding: "30px 30px", textAlign: "center" }}>
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
                        {[...arr].reverse().map((l, i) => {
                          const logId = exId + ":" + l.date + ":" + i;
                          const isConfirming = confirmDeleteLog === logId;
                          return (
                            <div key={logId} style={{ borderBottom: i < arr.length - 1 ? "1px solid #1c1c22" : "none" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, padding: "6px 0", gap: 10 }}>
                                <span style={{ color: "#9a9aa2", flexShrink: 0 }}>{new Date(l.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}{l.set ? " · S" + l.set : ""}</span>
                                <span style={{ flex: 1, textAlign: "right", fontWeight: 700, color: "#e0e0e4" }}>{l.weight}kg × {l.reps}</span>
                                <span
                                  role="button"
                                  tabIndex={0}
                                  onClick={() => setConfirmDeleteLog(isConfirming ? null : logId)}
                                  style={{ ...iconBtn, padding: 4, color: isConfirming ? "#e36a5a" : "#4a4a52", flexShrink: 0 }}
                                  aria-label="Excluir registro"
                                ><Icon.Trash width={14} height={14} /></span>
                              </div>
                              {isConfirming && (
                                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0 10px", justifyContent: "flex-end" }}>
                                  <span style={{ flex: 1, fontSize: 12, color: "#b8736a", lineHeight: 1.4 }}>Excluir este registro de carga?</span>
                                  <button onClick={() => setConfirmDeleteLog(null)} style={{ background: "none", border: "1px solid #2e2e36", borderRadius: 7, padding: "5px 10px", color: "#9a9aa2", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>Cancelar</button>
                                  <button onClick={() => { onDeleteLog(exId, l); setConfirmDeleteLog(null); }} style={{ background: "#e36a5a", border: "none", borderRadius: 7, padding: "5px 10px", color: "#101013", fontSize: 12, fontWeight: 800, cursor: "pointer", flexShrink: 0 }}>Excluir</button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </React.Fragment>
      )}

      <BackupCard />
    </div>
  );
}

function WeeklyBars({ buckets }) {
  const max = Math.max(...buckets.map((b) => b.sets), 1);
  const W = 320, H = 110, padB = 22, padT = 16;
  const bw = W / buckets.length;
  return (
    <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{ display: "block" }}>
      {buckets.map((b, i) => {
        const h = b.sets > 0 ? Math.max(((H - padB - padT) * b.sets) / max, 3) : 2;
        const x = i * bw + bw * 0.18;
        const y = H - padB - h;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bw * 0.64} height={h} rx={4} fill={b.sets > 0 ? "#E8843C" : "#26262b"} opacity={b.sets > 0 ? 1 : 0.6} />
            {b.sets > 0 && <text x={x + bw * 0.32} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="800" fill="#d0d0d4">{b.sets}</text>}
            <text x={x + bw * 0.32} y={H - 7} textAnchor="middle" fontSize="9" fontWeight="600" fill="#6a6a72">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function BackupSection({ kind, title, desc, expectedKeys, onExport }) {
  const fileRef = useRef(null);
  const [pendingImport, setPendingImport] = useState(null);
  const [msg, setMsg] = useState("");
  const [msgColor, setMsgColor] = useState("#e36a5a");

  const handleFile = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        if (parsed.app !== "ciclo7" || !parsed.data || typeof parsed.data !== "object") {
          setMsgColor("#e36a5a"); setMsg("Arquivo inválido — não parece um backup do Ciclo7.");
          setPendingImport(null); return;
        }
        // valida que o arquivo é do tipo certo (acervo vs histórico)
        if (parsed.kind && parsed.kind !== kind) {
          const outro = parsed.kind === "acervo" ? "acervo" : "histórico";
          setMsgColor("#e36a5a"); setMsg("Esse arquivo é de " + outro + ". Use-o na seção de " + outro + ".");
          setPendingImport(null); return;
        }
        // confere que contém ao menos uma das chaves esperadas
        const keysInFile = Object.keys(parsed.data).filter((k) => expectedKeys.includes(k));
        if (!keysInFile.length) {
          setMsgColor("#e36a5a"); setMsg("O arquivo não tem dados de " + title.toLowerCase() + ".");
          setPendingImport(null); return;
        }
        setMsg(""); setPendingImport(parsed);
      } catch (err) {
        setMsgColor("#e36a5a"); setMsg("Não consegui ler o arquivo. É um .json de backup?");
        setPendingImport(null);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const confirmImport = async () => {
    try {
      for (const [k, v] of Object.entries(pendingImport.data)) {
        if (expectedKeys.includes(k)) await storeSet(k, v);
      }
      window.location.reload();
    } catch (err) {
      setMsgColor("#e36a5a"); setMsg("Erro ao importar. Tenta de novo.");
      setPendingImport(null);
    }
  };

  return (
    <div style={{ ...card, padding: 18, marginBottom: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f2", marginBottom: 4 }}>{title}</div>
      <p style={{ color: "#8a8a92", fontSize: 12.5, lineHeight: 1.5, margin: "0 0 14px" }}>{desc}</p>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onExport} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", background: "#1a1a1f", border: "1px solid #2a2a30", borderRadius: 10, color: "#e0e0e4", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
          <Icon.Download /> Exportar
        </button>
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "12px", background: "#1a1a1f", border: "1px solid #2a2a30", borderRadius: 10, color: "#e0e0e4", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
          <Icon.Upload /> Importar
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleFile} style={{ display: "none" }} />
      </div>
      {pendingImport && (
        <div style={{ marginTop: 14, padding: 14, background: "#1a1610", border: "1px solid #3a2f1f", borderRadius: 10 }}>
          <div style={{ fontSize: 13, color: "#c9b896", lineHeight: 1.5, marginBottom: 10 }}>
            <strong style={{ color: "#E8843C" }}>Atenção:</strong> importar substitui {kind === "acervo" ? "seu acervo (biblioteca, treinos e agenda)" : "seu histórico (sessões e cargas)"} pelo conteúdo do backup{pendingImport.exportedAt ? " (de " + new Date(pendingImport.exportedAt).toLocaleDateString("pt-BR") + ")" : ""}. Não dá pra desfazer.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setPendingImport(null)} style={{ flex: 1, padding: "10px", background: "transparent", color: "#9a9aa2", border: "1px solid #2a2a30", borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
            <button onClick={confirmImport} style={{ flex: 1, padding: "10px", background: "#E8843C", color: "#101013", border: "none", borderRadius: 9, fontSize: 13, fontWeight: 800, cursor: "pointer" }}>Confirmar importação</button>
          </div>
        </div>
      )}
      {msg && <div style={{ marginTop: 10, color: msgColor, fontSize: 13, fontWeight: 600, lineHeight: 1.4 }}>{msg}</div>}
    </div>
  );
}

function BackupCard() {
  return (
    <div style={{ marginTop: 26 }}>
      <div style={{ fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: "#6a6a72", fontWeight: 700, marginBottom: 12 }}>Backup dos dados</div>
      <BackupSection
        kind="acervo"
        title="Acervo (exercícios, treinos e agenda)"
        desc="Sua biblioteca de exercícios, os treinos montados e a agenda da semana. Útil pra levar sua configuração pra outro lugar."
        expectedKeys={ACERVO_KEYS}
        onExport={exportAcervo}
      />
      <BackupSection
        kind="historico"
        title="Histórico (treinos feitos e cargas)"
        desc="As sessões que você concluiu e o histórico de cargas por exercício. Útil pra guardar seu progresso."
        expectedKeys={HISTORICO_KEYS}
        onExport={exportHistorico}
      />
    </div>
  );
}

function MuscleVolumeBars({ rows }) {
  const max = Math.max(...rows.map((r) => r.sets), 1);
  const fmt = (n) => Number.isInteger(n) ? String(n) : n.toFixed(1).replace(".", ",");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {rows.map((r) => {
        const c = muscleColor(r.id);
        const pct = (r.sets / max) * 100;
        return (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 96, flexShrink: 0, fontSize: 12, fontWeight: 600, color: "#c0c0c6", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{muscleName(r.id)}</span>
            <div style={{ flex: 1, height: 18, background: "#16161b", borderRadius: 6, overflow: "hidden", position: "relative" }}>
              <div style={{ width: pct + "%", height: "100%", background: c, borderRadius: 6, transition: "width .4s", minWidth: 3 }} />
            </div>
            <span style={{ width: 30, flexShrink: 0, textAlign: "right", fontSize: 12.5, fontWeight: 800, color: "#e0e0e4", fontVariantNumeric: "tabular-nums" }}>{fmt(r.sets)}</span>
          </div>
        );
      })}
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
  const path = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  return (
    <svg width="100%" viewBox={"0 0 " + W + " " + H} style={{ display: "block" }}>
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
  padding: "12px 22px", borderRadius: 999, fontSize: 15, fontWeight: 700, cursor: "pointer",
  border: filled ? "none" : "1.5px solid " + accent,
  background: filled ? accent : "transparent",
  color: filled ? "#101013" : accent,
});
const chipBtn = (color, weight) => ({
  display: "flex", alignItems: "center", gap: 5, background: "#1a1a1f",
  border: "1px solid #2a2a30", borderRadius: 7, padding: "4px 9px",
  color: color, fontSize: 12, fontWeight: weight || 600, cursor: "pointer",
});
const filterChip = (active, color) => ({
  flexShrink: 0, whiteSpace: "nowrap", cursor: "pointer",
  fontSize: 12.5, fontWeight: 700, padding: "7px 13px", borderRadius: 999,
  color: active ? "#101013" : color,
  background: active ? color : "transparent",
  border: "1.5px solid " + (active ? color : color + "44"),
  transition: "all .12s",
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
  @keyframes ciclo7-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes ciclo7-pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(0.86); opacity: 0.62; } }
  .ciclo7-dots::after { content: ""; animation: ciclo7-dots 1.4s steps(1) infinite; }
  @keyframes ciclo7-dots { 0% { content: ""; } 25% { content: "."; } 50% { content: ".."; } 75% { content: "..."; } 100% { content: ""; } }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
`;

// ============================================================
// MOUNT
// ============================================================
const rootEl = document.getElementById("root");
ReactDOM.createRoot(rootEl).render(React.createElement(App));
