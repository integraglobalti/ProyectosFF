
function toggleMenu(){document.getElementById('menuNav').classList.toggle('show')}
function mostrarGaleria(card){card.classList.toggle('active')}

function obtenerDatosReserva(){
  return {
    cliente:(document.getElementById('cliente')?.value || '').trim(),
    telefono:(document.getElementById('telefono')?.value || '').trim(),
    correo:(document.getElementById('correo')?.value || '').trim(),
    fecha:document.getElementById('fecha')?.value || '',
    hora:document.getElementById('hora')?.value || '',
    personas:(document.getElementById('personas')?.value || '').trim(),
    tipo:document.getElementById('tipo')?.value || '',
    detalle:(document.getElementById('detalle')?.value || '').trim()
  };
}

function formatearFechaReserva(fecha){
  if(!fecha) return 'Por definir';
  const partes=fecha.split('-');
  if(partes.length!==3) return fecha;

  const anio=parseInt(partes[0],10);
  const mes=parseInt(partes[1],10);
  const dia=parseInt(partes[2],10);

  if(!anio || !mes || !dia || anio<2026 || anio>2100){
    return `${partes[2]}/${partes[1]}/${partes[0]} ⚠️ revisar fecha`;
  }

  const meses=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${String(dia).padStart(2,'0')} de ${meses[mes-1]} de ${anio}`;
}

function mensajePorServicio(tipo){
  const mensajes={
    'Gastronomía':{
      titulo:'🍲 ¡Hola Rinconcito Ancashino! 🌿',
      intro:'Me gustaría reservar una mesa para disfrutar de sus platos típicos.'
    },
    'Hospedaje':{
      titulo:'🏡 ¡Hola Rinconcito Ancashino! 🌄',
      intro:'Estoy interesado(a) en hospedarme en sus instalaciones y quisiera consultar disponibilidad.'
    },
    'Camping':{
      titulo:'🏕️ ¡Hola Rinconcito Ancashino! 🌲🔥',
      intro:'Quisiera consultar disponibilidad para vivir una experiencia de camping en contacto con la naturaleza.'
    },
    'Piscina':{
      titulo:'🏊 ¡Hola Rinconcito Ancashino! ☀️💦',
      intro:'Quisiera consultar disponibilidad para disfrutar de la piscina y pasar un gran día campestre.'
    },
    'Eventos':{
      titulo:'🎉 ¡Hola Rinconcito Ancashino! 🎶🌿',
      intro:'Estoy interesado(a) en realizar un evento especial en sus instalaciones.'
    },
    'Alquiler de equipo de sonido':{
      titulo:'🎶 ¡Hola Rinconcito Ancashino! 🎤',
      intro:'Quisiera consultar disponibilidad para el alquiler de equipo de sonido.'
    }
  };
  return mensajes[tipo] || {
    titulo:'🌿 ¡Hola Rinconcito Ancashino! 😊',
    intro:'Quiero vivir una experiencia campestre y consultar disponibilidad.'
  };
}

function etiquetaServicio(tipo){
  const etiquetas={
    'Gastronomía':'🍲 Experiencia elegida: Gastronomía',
    'Hospedaje':'🏡 Experiencia elegida: Hospedaje',
    'Camping':'🏕️ Experiencia elegida: Camping',
    'Piscina':'🏊 Experiencia elegida: Piscina',
    'Eventos':'🎉 Experiencia elegida: Eventos',
    'Alquiler de equipo de sonido':'🎶 Experiencia elegida: Alquiler de equipo de sonido'
  };
  return etiquetas[tipo] || `✨ Experiencia elegida: ${tipo || 'Por definir'}`;
}

function crearMensajeReserva(){
  const d=obtenerDatosReserva();
  const base=mensajePorServicio(d.tipo);
  const detalle=d.detalle || 'Sin comentarios adicionales.';
  const telefono=d.telefono ? `\n📞 Teléfono: ${d.telefono}` : '';
  const correo=d.correo ? `\n📧 Correo: ${d.correo}` : '';

  return `${base.titulo}\n\n${base.intro}\n\n👤 Nombre: ${d.cliente || 'Por completar'}${telefono}${correo}\n${etiquetaServicio(d.tipo)}\n📅 Fecha: ${formatearFechaReserva(d.fecha)}\n⏰ Hora: ${d.hora || 'Por definir'}\n👥 Personas: ${d.personas || 'Por definir'}\n\n📝 Comentarios:\n${detalle}\n\n✨ Quedo atento(a) a su confirmación.\n🌿 Gracias por elegir Rinconcito Ancashino. Será un gusto recibirlos.\n¡Muchas gracias! 😊`;
}

function actualizarVistaReserva(){
  const preview=document.getElementById('previewReserva');
  if(preview) preview.textContent=crearMensajeReserva();
}

function consultarFechaWhatsApp(){
  const d=obtenerDatosReserva();
  if(d.cliente===''||d.fecha===''||d.hora===''||d.personas===''||d.tipo===''){
    alert('Por favor completa nombre, fecha, hora, cantidad de personas y servicio.');
    return;
  }

  const anio=parseInt(d.fecha.split('-')[0],10);
  if(anio<2026 || anio>2100){
    alert('La fecha parece incorrecta. Verifica el año antes de enviar la reserva.');
    return;
  }

  const mensaje=crearMensajeReserva();

  // Usamos URLSearchParams para conservar correctamente acentos y emojis en WhatsApp.
  const parametros=new URLSearchParams({
    phone:'51995523885',
    text:mensaje,
    type:'phone_number',
    app_absent:'0'
  });

  window.open(`https://api.whatsapp.com/send?${parametros.toString()}`,'_blank');
}

document.addEventListener('DOMContentLoaded', function(){
  const fecha=document.getElementById('fecha');
  if(fecha){
    const hoy=new Date();
    const yyyy=hoy.getFullYear();
    const mm=String(hoy.getMonth()+1).padStart(2,'0');
    const dd=String(hoy.getDate()).padStart(2,'0');
    fecha.min=`${yyyy}-${mm}-${dd}`;
  }
  const params=new URLSearchParams(window.location.search);
  const servicioParam=params.get('servicio');
  const tipoSelect=document.getElementById('tipo');
  if(servicioParam && tipoSelect){
    const servicio=decodeURIComponent(servicioParam).replace(/\+/g,' ');
    const opciones=[...tipoSelect.options];
    const encontrada=opciones.find(o=>o.value.toLowerCase()===servicio.toLowerCase());
    if(encontrada){
      tipoSelect.value=encontrada.value;
      const detalle=document.getElementById('detalle');
      if(detalle && !detalle.value){
        detalle.value=`Hola, deseo consultar disponibilidad para ${encontrada.value}.`;
      }
    }
  }
  actualizarVistaReserva();
});

// PRO MOBILE: cerrar menú al tocar un enlace y mejorar navegación táctil
document.addEventListener('DOMContentLoaded', function(){
  const menu = document.getElementById('menuNav');
  if(menu){
    menu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=> menu.classList.remove('show'));
    });
  }
});
