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
    origSetItem.call(this, key, value);
    if (this === localStorage && String(key).startsWith(PREFIX)) agendarEscrita(key, value);
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
  loginEl.hidden = true;
  if (started) return;
  started = true;
  try {
    await carregarDaNuvem(user.uid);
  } catch (err) {
    console.error(err);
    alert("Não foi possível carregar seus dados do Firebase. Verifique a conexão e as regras do Firestore.");
  }
  instalarEspelho();
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
  else { uidAtual = null; loginEl.hidden = false; }
});
