// Sincronização com Firebase: login Google + Firestore.
// O app (js/app.js) continua lendo/gravando em localStorage; este módulo
// espelha essas chaves "fluxo*" no Firestore, em users/{uid}/fluxo/{chave}.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, doc, setDoc }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const PREFIX = "fluxo";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const loginEl = document.getElementById("login");
const loginMsg = document.getElementById("login-msg");
let started = false;
let uidAtual = null;
let usuario = null;
const FOTO_KEY = "fluxo_perfil_foto";

// ---------- escrita (localStorage -> Firestore) ----------
const origSetItem = Storage.prototype.setItem;
const origRemoveItem = Storage.prototype.removeItem;
const timers = {};

function agendarEscrita(key, value) {
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    if (!uidAtual) return;
    setDoc(doc(db, "users", uidAtual, "fluxo", key), { value, atualizado: Date.now() })
      .catch(err => console.error("Erro ao salvar no Firebase:", err));
  }, 300);
}

function instalarEspelho() {
  Storage.prototype.setItem = function (key, value) {
    // Só envia à nuvem quando o valor realmente mudou (evita tempestade de gravações)
    const mudou = this === localStorage && String(key).startsWith(PREFIX) && localStorage.getItem(key) !== String(value);
    origSetItem.call(this, key, value);
    if (mudou) agendarEscrita(key, String(value));
  };
}

// ---------- leitura (Firestore -> localStorage) ----------
async function carregarDaNuvem(uid) {
  const snap = await getDocs(collection(db, "users", uid, "fluxo"));
  const nuvem = {};
  snap.forEach(d => { nuvem[d.id] = d.data().value; });

  // Remove chaves locais que não existem na nuvem (ex.: dados de exemplo antigos)
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const k = localStorage.key(i);
    if (k && k.startsWith(PREFIX) && !(k in nuvem)) origRemoveItem.call(localStorage, k);
  }
  Object.entries(nuvem).forEach(([k, v]) => origSetItem.call(localStorage, k, v));
}

// ---------- carregar o app depois de sincronizar ----------
function iniciarApp() {
  const s = document.createElement("script");
  s.src = "js/app.js";
  document.body.appendChild(s);
}

async function entrar(user) {
  uidAtual = user.uid;
  usuario = user;
  loginEl.hidden = true;
  if (started) return;
  started = true;
  atualizarAvatar();
  try {
    await Promise.race([
      carregarDaNuvem(user.uid),
      new Promise((_, rej) => setTimeout(() => rej(new Error("Tempo esgotado ao carregar do Firestore")), 12000))
    ]);
  } catch (err) {
    // Segue com o que já está no navegador e avisa no console
    console.error("Firebase:", err);
  }
  instalarEspelho();
  atualizarAvatar();
  iniciarApp();
}

document.getElementById("login-btn").addEventListener("click", async () => {
  loginMsg.textContent = "";
  try {
    await signInWithPopup(auth, provider);
  } catch (err) {
    loginMsg.textContent = "Não foi possível entrar. Tente novamente.";
    console.error(err);
  }
});

window.fluxoSair = async () => {
  await signOut(auth);
  location.reload();
};

onAuthStateChanged(auth, user => {
  if (user) entrar(user);
  else { uidAtual = null; usuario = null; loginEl.hidden = false; }
});

/* ================= Perfil: avatar no cabeçalho + popup ================= */
const $p = sel => document.querySelector(sel);
const CV = 240;                       // área de recorte em px
let pfImg = null, pfZoom = 1, pfX = 0, pfY = 0;
let pfModo = "ver";                   // "ver" | "ajustar"
let pfArr = null, pfMoveu = false;

function iniciais(nome) {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join("") || "?";
}

function fotoAtual() {
  return localStorage.getItem(FOTO_KEY) || (usuario && usuario.photoURL) || "";
}

function atualizarAvatar() {
  if (!usuario) return;
  const nome = usuario.displayName || usuario.email || "Usuário";
  const foto = fotoAtual();
  const av = $p("#av"), an = $p("#av-nome");
  if (!av || !an) return;
  an.textContent = nome;
  av.innerHTML = foto ? `<img src="${foto}" alt="">` : `<span>${iniciais(nome)}</span>`;
}

function geometriaRecorte() {
  const iw = pfImg.naturalWidth, ih = pfImg.naturalHeight;
  const s = Math.max(CV / iw, CV / ih) * pfZoom;
  const w = iw * s, h = ih * s;
  const maxX = (w - CV) / 2, maxY = (h - CV) / 2;
  pfX = Math.max(-maxX, Math.min(maxX, pfX));
  pfY = Math.max(-maxY, Math.min(maxY, pfY));
  return { x: (CV - w) / 2 + pfX, y: (CV - h) / 2 + pfY, w, h };
}

function desenharRecorte() {
  const cv = $p("#pf-cv"), c = cv.getContext("2d");
  c.fillStyle = "#eef3f1";
  c.fillRect(0, 0, CV, CV);
  if (!pfImg) return;
  const g = geometriaRecorte();
  c.drawImage(pfImg, g.x, g.y, g.w, g.h);
}

function mostrarModo(modo) {
  pfModo = modo;
  const ajustar = modo === "ajustar";
  $p("#pf-adj").hidden = !ajustar;
  $p("#pf-view").hidden = ajustar;
  $p("#pf-foot-view").hidden = ajustar;
  $p("#pf-foot-adj").hidden = !ajustar;
  $p("#pf-hint").textContent = ajustar ? "Ajuste o enquadramento e clique em Aplicar." : "Clique na foto para ajustar o enquadramento.";
  $p("#pf-cv").style.cursor = ajustar ? "grab" : "pointer";
}

function carregarImagemPerfil(src, emAjuste) {
  const img = new Image();
  img.onload = () => {
    pfImg = img; pfZoom = 1; pfX = 0; pfY = 0;
    $p("#pf-zoom").value = 1;
    desenharRecorte();
    if (emAjuste) mostrarModo("ajustar");
  };
  img.src = src;
}

window.perfilOpen = () => {
  $p("#pf-name").textContent = usuario ? (usuario.email || "") : "";
  mostrarModo("ver");
  pfImg = null;
  const atual = localStorage.getItem(FOTO_KEY);
  if (atual) carregarImagemPerfil(atual, false);
  else if (usuario && usuario.photoURL) carregarImagemPerfil(usuario.photoURL, false);
  else desenharRecorte();
  $p("#perfdlg").showModal();
};

window.perfFechar = () => $p("#perfdlg").close();

window.perfCancelar = () => {
  // volta a mostrar a foto salva, sem alterações
  mostrarModo("ver");
  const atual = localStorage.getItem(FOTO_KEY);
  if (atual) carregarImagemPerfil(atual, false);
  else if (usuario && usuario.photoURL) carregarImagemPerfil(usuario.photoURL, false);
  else { pfImg = null; desenharRecorte(); }
};

document.addEventListener("DOMContentLoaded", () => {
  const cv = $p("#pf-cv"), zoom = $p("#pf-zoom"), file = $p("#pf-file");
  if (!cv) return;

  file.addEventListener("change", () => {
    const f = file.files[0];
    if (!f || !f.type.startsWith("image/")) return;
    const r = new FileReader();
    r.onload = () => carregarImagemPerfil(r.result, true);
    r.readAsDataURL(f);
    file.value = "";
  });

  zoom.addEventListener("input", () => {
    pfZoom = parseFloat(zoom.value);
    desenharRecorte();
  });

  cv.addEventListener("pointerdown", e => {
    pfArr = { x: e.clientX, y: e.clientY, ox: pfX, oy: pfY };
    pfMoveu = false;
    cv.setPointerCapture(e.pointerId);
  });

  cv.addEventListener("pointermove", e => {
    if (!pfArr || pfModo !== "ajustar" || !pfImg) return;
    const k = CV / cv.getBoundingClientRect().width;
    const dx = (e.clientX - pfArr.x) * k, dy = (e.clientY - pfArr.y) * k;
    if (Math.abs(dx) + Math.abs(dy) > 3) pfMoveu = true;
    pfX = pfArr.ox + dx;
    pfY = pfArr.oy + dy;
    desenharRecorte();
  });

  cv.addEventListener("pointerup", () => {
    // clique simples na foto (sem arrastar) entra no modo de ajuste
    if (pfArr && !pfMoveu && pfModo === "ver" && (pfImg || usuario)) {
      if (!pfImg) return;
      mostrarModo("ajustar");
    }
    pfArr = null;
  });
  cv.addEventListener("pointercancel", () => { pfArr = null; });
});

window.perfApply = () => {
  if (!pfImg) return;
  const SAIDA = 256, k = SAIDA / CV;
  const out = document.createElement("canvas");
  out.width = out.height = SAIDA;
  const c = out.getContext("2d");
  c.fillStyle = "#fff";
  c.fillRect(0, 0, SAIDA, SAIDA);
  const g = geometriaRecorte();
  c.drawImage(pfImg, g.x * k, g.y * k, g.w * k, g.h * k);
  localStorage.setItem(FOTO_KEY, out.toDataURL("image/jpeg", 0.9));   // vai para o Firestore
  atualizarAvatar();
  mostrarModo("ver");
  carregarImagemPerfil(out.toDataURL("image/jpeg", 0.9), false);
};

window.perfRemove = () => {
  localStorage.setItem(FOTO_KEY, "");
  atualizarAvatar();
  mostrarModo("ver");
  pfImg = null;
  if (usuario && usuario.photoURL) carregarImagemPerfil(usuario.photoURL, false);
  else desenharRecorte();
};
