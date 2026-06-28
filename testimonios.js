import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const testimoniosRef = collection(db, "testimonios");

function estrellasHTML(n){
  const total = Math.max(1, Math.min(5, Number(n) || 5));
  return Array.from({length:5}, (_,i)=>`<span class="${i < total ? 'filled' : 'empty'}">★</span>`).join('');
}

function iniciales(nombre){
  const limpio = String(nombre || 'Cliente').trim();
  const partes = limpio.split(/\s+/).slice(0,2);
  return partes.map(p=>p[0]?.toUpperCase() || '').join('') || 'C';
}

function fechaTexto(fecha){
  try{
    if(!fecha) return "Reciente";
    const d = fecha.toDate ? fecha.toDate() : new Date(fecha);
    return d.toLocaleDateString('es-PE', {day:'2-digit', month:'long', year:'numeric'});
  }catch(e){ return "Reciente"; }
}

function servicioIcono(servicio){
  const map = {
    "Gastronomía":"🍲",
    "Piscina":"🏊",
    "Camping":"🏕️",
    "Hospedaje":"🏡",
    "Eventos":"🎉",
    "Sonido":"🎶"
  };
  return map[servicio] || "🌿";
}

function renderTestimonios(lista){
  const contenedores = document.querySelectorAll('[data-testimonios-lista]');
  if(!contenedores.length) return;
  const ordenados = [...lista].sort((a,b)=>{
    const fa = a.createdAt?.seconds || 0;
    const fb = b.createdAt?.seconds || 0;
    return fb-fa;
  });
  const html = ordenados.length ? ordenados.map(t=>`
    <article class="testimonio-card trust-style">
      <div class="testimonio-head trust-head">
        <div class="testimonio-avatar trust-avatar">${iniciales(t.nombre)}</div>
        <div>
          <h3>${escapeHTML(t.nombre || 'Cliente')}</h3>
          <div class="testimonio-stars trust-stars" aria-label="${t.estrellas || 5} estrellas">${estrellasHTML(t.estrellas)}</div>
        </div>
      </div>
      <p class="trust-comment">“${escapeHTML(t.comentario || '')}”</p>
      <div class="trust-footer">
        <img src="imagenes1/logo-icono.png" alt="Rinconcito Ancashino">
        <div>
          <strong>Rinconcito Ancashino</strong>
          <span>${servicioIcono(t.servicio)} ${escapeHTML(t.servicio || 'Visita campestre')} · ${fechaTexto(t.createdAt)}</span>
        </div>
      </div>
    </article>
  `).join('') : `
    <div class="testimonios-empty">
      <h3>🌿 Aún estamos reuniendo opiniones reales</h3>
      <p>Sé de los primeros visitantes en dejar tu experiencia sobre Rinconcito Ancashino.</p>
    </div>`;
  contenedores.forEach(c=>c.innerHTML = html);
}

function escapeHTML(txt){
  return String(txt).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

const q = query(testimoniosRef, where("aprobado", "==", true));
onSnapshot(q, snap=>{
  const datos = snap.docs.map(d=>({id:d.id, ...d.data()}));
  renderTestimonios(datos);
}, err=>{
  console.error(err);
  renderTestimonios([]);
});

const form = document.getElementById('formTestimonio');
if(form){
  const mensaje = document.getElementById('mensajeTestimonio');
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nombre = form.nombre.value.trim();
    const servicio = form.servicio.value;
    const estrellas = Number(form.estrellas.value);
    const comentario = form.comentario.value.trim();
    if(!nombre || !servicio || !estrellas || comentario.length < 8){
      mensaje.textContent = 'Completa tu nombre, servicio, calificación y un comentario un poco más detallado.';
      mensaje.className = 'form-msg error';
      return;
    }
    try{
      await addDoc(testimoniosRef, {
        nombre,
        servicio,
        estrellas,
        comentario,
        aprobado:true,
        createdAt: serverTimestamp()
      });
      form.reset();
      mensaje.textContent = '¡Gracias por tu opinión! La revisaremos y luego aparecerá publicada en la web.';
      mensaje.className = 'form-msg ok';
    }catch(error){
      console.error(error);
      mensaje.textContent = 'No se pudo enviar la opinión. Intenta nuevamente en unos minutos.';
      mensaje.className = 'form-msg error';
    }
  });
}
