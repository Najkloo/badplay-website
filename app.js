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

  // Admin skin modal.
  const modal=$('#skinModal'),modalImg=$('#modalSkinImg'),modalNo=$('#modalSkinNo');
  const openModal=n=>{if(!modal)return;modalImg.src=`./assets/admin-${n}.png?v=3`;modalNo.textContent=String(n).padStart(2,'0');modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.classList.add('no-scroll')};
  const closeModal=()=>{modal?.classList.remove('open');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('no-scroll')};
  $$('.staff-card').forEach(card=>card.addEventListener('click',()=>openModal(card.dataset.skin)));
  $$('[data-close-modal]').forEach(el=>el.addEventListener('click',closeModal));
  addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});

  // Skin image fallback: if a GitHub Pages cache/path issue occurs, keep a polished card instead of broken-image icons.
  $$('.skin-stage img').forEach(img=>img.addEventListener('error',()=>{img.style.display='none';img.closest('.skin-stage')?.classList.add('image-error')}));

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
