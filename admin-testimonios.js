import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ref = collection(db, "testimonios");

const loginBox = document.getElementById('adminLoginBox');
const panel = document.getElementById('adminPanel');
const loginForm = document.getElementById('adminLoginForm');
const loginMsg = document.getElementById('adminLoginMsg');
const lista = document.getElementById('adminTestimoniosLista');
const userText = document.getElementById('adminUserText');
const logoutBtn = document.getElementById('adminLogoutBtn');

let unsubscribe = null;

function escapeHTML(txt){
  return String(txt || '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function estrellasHTML(n){
  const total = Math.max(1, Math.min(5, Number(n) || 5));
  return "★".repeat(total) + "☆".repeat(5-total);
}
function fechaTexto(fecha){
  try{ return fecha?.toDate ? fecha.toDate().toLocaleString('es-PE') : 'Sin fecha'; }catch(e){ return 'Sin fecha'; }
}
function renderAdmin(items){
  const ordenados = [...items].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
  lista.innerHTML = ordenados.length ? ordenados.map(t=>`
    <article class="admin-review ${t.aprobado ? 'aprobado' : 'pendiente'}">
      <div class="admin-review-top">
        <div>
          <h3>${escapeHTML(t.nombre)}</h3>
          <span>${escapeHTML(t.servicio || 'Servicio')} · ${fechaTexto(t.createdAt)}</span>
        </div>
        <strong class="estado ${t.aprobado ? 'ok' : 'wait'}">${t.aprobado ? 'Publicado' : 'Pendiente'}</strong>
      </div>
      <div class="testimonio-stars">${estrellasHTML(t.estrellas)}</div>
      <p>${escapeHTML(t.comentario)}</p>
      <div class="admin-actions">
        ${t.aprobado ? `<button class="btn-admin btn-ocultar" data-action="ocultar" data-id="${t.id}">Ocultar</button>` : `<button class="btn-admin btn-aprobar" data-action="aprobar" data-id="${t.id}">Aprobar</button>`}
        <button class="btn-admin btn-eliminar" data-action="eliminar" data-id="${t.id}">Eliminar</button>
      </div>
    </article>`).join('') : '<p class="admin-empty">No hay opiniones registradas todavía.</p>';
}

loginForm.addEventListener('submit', async e=>{
  e.preventDefault();
  loginMsg.textContent='';
  try{
    await signInWithEmailAndPassword(auth, loginForm.email.value.trim(), loginForm.password.value);
  }catch(error){
    loginMsg.textContent='No se pudo iniciar sesión. Verifica correo y contraseña.';
  }
});

logoutBtn.addEventListener('click', ()=>signOut(auth));

lista.addEventListener('click', async e=>{
  const btn = e.target.closest('button[data-action]');
  if(!btn) return;
  const id = btn.dataset.id;
  const action = btn.dataset.action;
  const documento = doc(db, 'testimonios', id);
  if(action === 'aprobar') await updateDoc(documento, {aprobado:true});
  if(action === 'ocultar') await updateDoc(documento, {aprobado:false});
  if(action === 'eliminar'){
    if(confirm('¿Seguro que deseas eliminar esta opinión?')) await deleteDoc(documento);
  }
});

onAuthStateChanged(auth, user=>{
  if(user && user.email === ADMIN_EMAIL){
    loginBox.style.display='none';
    panel.style.display='block';
    userText.textContent = user.email;
    unsubscribe = onSnapshot(ref, snap=>renderAdmin(snap.docs.map(d=>({id:d.id, ...d.data()}))));
  }else{
    if(user) signOut(auth);
    if(unsubscribe) unsubscribe();
    loginBox.style.display='block';
    panel.style.display='none';
  }
});
