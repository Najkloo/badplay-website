(function(){
  'use strict';
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const toast=$('#toast');
  let toastTimer;
  const show=msg=>{if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),2200)};

  // Copy IP with fallback for older browsers / GitHub Pages previews.
  $$('.copy').forEach(btn=>btn.addEventListener('click',async()=>{
    const value=btn.dataset.copy||'badplay.pl';
    try{
      if(navigator.clipboard&&window.isSecureContext) await navigator.clipboard.writeText(value);
      else{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.left='-9999px';document.body.appendChild(t);t.focus();t.select();document.execCommand('copy');t.remove();}
      show('Skopiowano: '+value);btn.classList.add('copied');
      const status=btn.closest('.info-main')?.querySelector('.copy-status');
      if(status){status.classList.add('show');setTimeout(()=>status.classList.remove('show'),1800)}
      setTimeout(()=>btn.classList.remove('copied'),600);
    }catch(e){show('Skopiuj ręcznie: '+value)}
  }));

  // Mobile menu.
  const menu=$('#menu'),nav=$('#mainNav');
  const closeMenu=()=>{if(!nav)return;nav.classList.remove('open');menu?.classList.remove('open');menu?.setAttribute('aria-expanded','false');document.body.classList.remove('no-scroll');nav.removeAttribute('style')};
  menu?.addEventListener('click',()=>{
    const open=!nav.classList.contains('open');
    if(open){nav.classList.add('open');menu.classList.add('open');menu.setAttribute('aria-expanded','true');document.body.classList.add('no-scroll');Object.assign(nav.style,{display:'flex',position:'absolute',top:'68px',left:'14px',right:'14px',padding:'18px 20px',background:'rgba(9,9,10,.98)',border:'1px solid #29292e',flexDirection:'column',gap:'4px',zIndex:'90',boxShadow:'0 25px 70px rgba(0,0,0,.5)'})}else closeMenu();
  });
  $$('#mainNav a').forEach(a=>a.addEventListener('click',closeMenu));
  window.addEventListener('resize',()=>{if(innerWidth>900)closeMenu()});

  // Sticky header + page progress.
  const header=$('#header'),progress=$('#pageProgress');
  const scrollUI=()=>{
    header?.classList.toggle('scrolled',scrollY>30);
    if(progress){const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?(scrollY/max)*100:0)+'%'}
  };
  addEventListener('scroll',scrollUI,{passive:true});scrollUI();

  // Reveal animations with safe fallback.
  const revealObserver='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target)}}),{threshold:.08,rootMargin:'0px 0px -30px'}):null;
  $$('.reveal').forEach(el=>revealObserver?revealObserver.observe(el):el.classList.add('visible'));

  // Active navigation.
  const sections=$$('main section[id]'),links=$$('#mainNav a');
  if('IntersectionObserver' in window){const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id))}),{rootMargin:'-35% 0px -55% 0px'});sections.forEach(s=>sectionObserver.observe(s))}

  // Counter.
  const counter=$('[data-count]');
  if(counter&&'IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;const target=Number(counter.dataset.count),duration=1100,start=performance.now();const tick=now=>{const p=Math.min((now-start)/duration,1),ease=1-Math.pow(1-p,3);counter.textContent=Math.floor(ease*target);if(p<1)requestAnimationFrame(tick)};requestAnimationFrame(tick);io.disconnect()}),{threshold:.6});io.observe(counter)}

  // Cursor glow.
  const cursor=$('#cursorGlow');
  if(cursor&&!matchMedia('(pointer:coarse)').matches){let x=-500,y=-500,tx=-500,ty=-500;addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY},{passive:true});const move=()=>{x+=(tx-x)*.12;y+=(ty-y)*.12;cursor.style.left=x+'px';cursor.style.top=y+'px';requestAnimationFrame(move)};move()}

  // 3D tilt cards.
  $$('.tilt').forEach(card=>{
    card.addEventListener('pointermove',e=>{if(matchMedia('(pointer:coarse)').matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform=`perspective(950px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateY(-3px)`;card.style.setProperty('--mx',`${((x+.5)*100).toFixed(1)}%`);card.style.setProperty('--my',`${((y+.5)*100).toFixed(1)}%`)});
    card.addEventListener('pointerleave',()=>{card.style.transform=''});
  });

  // Background particles.
  const particles=$('#particles');
  if(particles){const frag=document.createDocumentFragment();for(let i=0;i<45;i++){const p=document.createElement('span');p.className='particle';p.style.left=(Math.random()*100)+'%';p.style.animationDuration=(8+Math.random()*16)+'s';p.style.animationDelay=(-Math.random()*20)+'s';p.style.opacity=(.08+Math.random()*.3).toFixed(2);p.style.transform=`scale(${.5+Math.random()*1.5})`;frag.appendChild(p)}particles.appendChild(frag)}

  // Hero parallax.
  const hero=$('.hero'),grid=$('.grid-bg'),glow=$('.glow-a');
  addEventListener('scroll',()=>{if(!hero)return;const y=Math.min(scrollY,700);grid?.style.setProperty('transform',`perspective(700px) rotateX(10deg) scale(1.2) translateY(${y*.05}px)`);glow?.style.setProperty('transform',`translate(${y*.03}px,${y*.08}px)`)},{passive:true});

  // BADPLAY 3D staff gallery — live Minecraft skins via MCHeads + skinview3d.
  const staffViewers = new Map();
  const staffData = {};
  $$('.staff-v5-card').forEach(card => {
    const username = card.dataset.player;
    staffData[username] = { role: card.dataset.role, index: card.dataset.index, name: username };
  });

  const skinSources = {
    // Skin #1 currently shown on MafiaBiedry's NameMC profile.
    MafiaBiedry: 'https://s.namemc.com/i/8d04dc14f6389ec6.png'
  };
  const skinUrl = username => `${skinSources[username] || `https://mc-heads.net/skin/${encodeURIComponent(username)}`}?v=badplay9`;

  function makeViewer(canvas, username, width = 360, height = 430) {
    if (!canvas || !window.skinview3d) return null;
    try {
      const host = canvas.closest('.skin3d-wrap,.skin3d-modal-view');
      if (host && !host.querySelector('.skin-fallback')) {
        const fallback = document.createElement('img');
        fallback.className = 'skin-fallback';
        fallback.alt = '';
        fallback.setAttribute('aria-hidden','true');
        fallback.src = username === 'MafiaBiedry' ? skinSources.MafiaBiedry : `https://mc-heads.net/body/${encodeURIComponent(username)}/400`;
        host.insertBefore(fallback, canvas);
      }
      const viewer = new skinview3d.SkinViewer({ canvas, width, height, skin: skinUrl(username) });
      viewer.background = 0x09090b;
      viewer.fov = 38;
      viewer.zoom = 0.78;
      viewer.globalLight.intensity = 2.8;
      viewer.cameraLight.intensity = 0.65;
      viewer.autoRotate = true;
      viewer.autoRotateSpeed = 0.22;
      // Start from a clean, frontal angle instead of showing the model from the side.
      if (viewer.playerObject) viewer.playerObject.rotation.y = 0;
      if (viewer.controls) {
        viewer.controls.rotateSpeed = 0.75;
      }
      viewer.animation = new skinview3d.IdleAnimation();
      viewer.animation.speed = 0.85;
      // Explicitly reload the texture so GitHub Pages/CDN timing cannot leave a blank canvas.
      if (typeof viewer.loadSkin === 'function') {
        Promise.resolve(viewer.loadSkin(skinUrl(username))).catch(() => {});
      }
      if (viewer.controls) {
        viewer.controls.enableRotate = true;
        viewer.controls.enableZoom = true;
        viewer.controls.enablePan = false;
      }
      canvas.closest('.skin3d-wrap,.skin3d-modal-view')?.classList.add('viewer-ready');
      return viewer;
    } catch (err) {
      console.warn('SkinView3D:', username, err);
      canvas.closest('.skin3d-wrap,.skin3d-modal-view')?.classList.add('viewer-error');
      return null;
    }
  }

  function initStaff3D() {
    if (!window.skinview3d) {
      console.warn('SkinView3D CDN nie został załadowany.');
      return;
    }
    $$('.skin3d').forEach(canvas => {
      const username = canvas.dataset.username;
      const viewer = makeViewer(canvas, username, 390, 455);
      if (viewer) staffViewers.set(username, viewer);
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initStaff3D, { once:true }); else initStaff3D();

  // Fullscreen 360° viewer.
  const skinModal = $('#skin3dModal');
  const modalCanvas = $('#modalSkinCanvas');
  const modalName = $('#modalStaffName');
  const modalRole = $('#modalStaffRole');
  const modalNo = $('#modalStaffNo');
  const modalNameMc = $('#modalNameMc');
  let modalViewer = null;
  let currentStaff = null;
  function roleMarkup(role) {
    const parts = String(role).split(/\s*\|\s*|\s+·\s+/).filter(Boolean);
    return parts.map(part => {
      const key = part.trim().toUpperCase();
      const cls = key === 'OWNER' ? 'role-owner' : key === 'DEVELOPER' ? 'role-developer' : key === 'HEAD ADMIN' ? 'role-head' : key === 'OPIEKUN' ? 'role-opiekun' : key === 'SENIOR MODERATOR' ? 'role-senior' : '';
      return cls ? `<i class=\"${cls}\">${part.trim()}</i>` : `<i>${part.trim()}</i>`;
    }).join('<b class=\"role-sep\"> · </b>');
  }
  function openStaff3D(card) {
    if (!skinModal || !modalCanvas) return;
    const username = card.dataset.player;
    const data = staffData[username] || {};
    currentStaff = username;
    modalName.textContent = username;
    modalRole.innerHTML = roleMarkup(data.role || '');
    modalNo.textContent = data.index || '01';
    modalNameMc.href = `https://pl.namemc.com/profile/${encodeURIComponent(username)}.1`;
    skinModal.classList.add('open');
    skinModal.setAttribute('aria-hidden','false');
    document.body.classList.add('no-scroll');
    if (modalViewer) { try { modalViewer.dispose(); } catch(e){} modalViewer = null; }
    requestAnimationFrame(() => { modalViewer = makeViewer(modalCanvas, username, Math.min(720, Math.floor(innerWidth * .72)), Math.min(760, Math.floor(innerHeight * .72))); });
  }
  function closeStaff3D() {
    skinModal?.classList.remove('open');
    skinModal?.setAttribute('aria-hidden','true');
    document.body.classList.remove('no-scroll');
    if (modalViewer) { try { modalViewer.dispose(); } catch(e){} modalViewer = null; }
  }
  $$('.staff-v5-card').forEach(card => {
    card.querySelector('.staff-v5-open')?.addEventListener('click', e => { e.stopPropagation(); openStaff3D(card); });
    card.querySelector('.skin3d-wrap')?.addEventListener('click', () => openStaff3D(card));
  });
  $$('[data-skin-close]').forEach(el => el.addEventListener('click', closeStaff3D));
  addEventListener('keydown', e => { if(e.key === 'Escape') closeStaff3D(); });

  // Map iframe: only reveal it after a real load; fallback after a timeout.
  const frame=$('#mapFrame'),loading=$('#mapLoading'),fallback=$('#mapFallback'),viewport=$('#mapViewport');
  let mapLoaded=false;
  if(frame){
    frame.addEventListener('load',()=>{mapLoaded=true;viewport?.classList.add('map-ready');loading?.classList.add('hidden')});
    frame.addEventListener('error',()=>{fallback?.classList.add('show');loading?.classList.add('hidden')});
    setTimeout(()=>{if(!mapLoaded){loading?.classList.add('hidden');fallback?.classList.add('show')}},8000);
  }

  // Small dynamic status pulse / time indicator in document title.
  const baseTitle=document.title;let titleFlip=false;
  setInterval(()=>{if(document.hidden)return;titleFlip=!titleFlip;document.title=titleFlip?'● BADPLAY — ONLINE':baseTitle},5000);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)document.title=baseTitle});

  // Keyboard shortcut: C copies IP, Esc closes overlays.
  addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key.toLowerCase()==='c'){$('.copy-main')?.click()}});

  // Easter egg: type BADPLAY.
  let secret='';addEventListener('keydown',e=>{secret=(secret+e.key.toLowerCase()).slice(-7);if(secret==='badplay'){document.body.classList.add('secret-mode');show('BADPLAY MODE AKTYWOWANY');setTimeout(()=>document.body.classList.remove('secret-mode'),3500)}});
})();
