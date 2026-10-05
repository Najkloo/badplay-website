(function(){
  'use strict';
  const $=(s,p=document)=>p.querySelector(s);
  const $$=(s,p=document)=>[...p.querySelectorAll(s)];
  const toast=$('#toast'); let toastTimer;

  function show(msg){
    if(!toast)return;
    toast.textContent=msg; toast.classList.add('show');
    clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.classList.remove('show'),2200);
  }

  // Kopiowanie IP + mikroanimacja przycisku.
  $$('.copy').forEach(btn=>btn.addEventListener('click',async()=>{
    const value=btn.dataset.copy;
    try{
      if(navigator.clipboard&&window.isSecureContext) await navigator.clipboard.writeText(value);
      else{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove();}
      show('Skopiowano: '+value);
      btn.classList.add('copied');
      const status=btn.parentElement?.querySelector('.copy-status');
      if(status){status.classList.add('show');setTimeout(()=>status.classList.remove('show'),1800);}
      setTimeout(()=>btn.classList.remove('copied'),500);
    }catch(e){show('Nie udało się skopiować adresu');}
  }));

  // Mobilne menu.
  const menu=$('#menu'), nav=$('#mainNav');
  menu?.addEventListener('click',()=>{
    const open=nav.classList.toggle('open'); menu.classList.toggle('open',open); document.body.classList.toggle('no-scroll',open);
    if(open){nav.style.display='flex';nav.style.position='absolute';nav.style.top='68px';nav.style.left='14px';nav.style.right='14px';nav.style.padding='20px';nav.style.background='rgba(11,11,11,.98)';nav.style.border='1px solid #292929';nav.style.flexDirection='column';nav.style.zIndex='60';}
    else nav.removeAttribute('style');
  });
  $$('#mainNav a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu?.classList.remove('open');document.body.classList.remove('no-scroll');nav.removeAttribute('style');}));

  // Sticky header.
  const header=$('#header');
  const onScroll=()=>header?.classList.toggle('scrolled',window.scrollY>30);
  window.addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // Scroll reveal.
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');revealObserver.unobserve(entry.target);}}),{threshold:.12});
  $$('.reveal').forEach(el=>revealObserver.observe(el));

  // Aktywna sekcja w menu.
  const sections=$$('main section[id]'); const links=$$('#mainNav a');
  const sectionObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){links.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id));}}),{rootMargin:'-35% 0px -55% 0px'});
  sections.forEach(s=>sectionObserver.observe(s));

  // Licznik skali.
  const counter=$('[data-count]');
  if(counter){
    const io=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;let start=0,target=Number(counter.dataset.count),duration=1000,startTime=null;function tick(ts){if(!startTime)startTime=ts;const p=Math.min((ts-startTime)/duration,1);counter.textContent=Math.floor((1-Math.pow(1-p,3))*target);if(p<1)requestAnimationFrame(tick);else counter.textContent=target;};requestAnimationFrame(tick);io.disconnect();}),{threshold:.7});io.observe(counter);
  }

  // Kursor + światło podążające za myszką.
  const cursor=$('#cursorGlow');
  window.addEventListener('pointermove',e=>{if(cursor){cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';}} ,{passive:true});

  // Delikatny tilt kart.
  $$('.tilt').forEach(card=>{
    card.addEventListener('pointermove',e=>{
      if(matchMedia('(pointer:coarse)').matches)return;
      const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`perspective(900px) rotateX(${(-y*5).toFixed(2)}deg) rotateY(${(x*5).toFixed(2)}deg) translateY(-2px)`;
      card.style.setProperty('--mx',`${((x+.5)*100).toFixed(1)}%`);card.style.setProperty('--my',`${((y+.5)*100).toFixed(1)}%`);
    });
    card.addEventListener('pointerleave',()=>{card.style.transform='';});
  });

  // Losowe gwiazdy/cząsteczki tła.
  const particles=$('#particles');
  if(particles){for(let i=0;i<42;i++){const p=document.createElement('span');p.className='particle';p.style.left=(Math.random()*100)+'%';p.style.animationDuration=(8+Math.random()*16)+'s';p.style.animationDelay=(-Math.random()*20)+'s';p.style.opacity=(.12+Math.random()*.35).toFixed(2);p.style.transform=`scale(${.5+Math.random()*1.5})`;particles.appendChild(p);}}

  // Prosty efekt parallax dla siatki i glow.
  const hero=$('.hero');
  window.addEventListener('scroll',()=>{
    if(!hero)return;const y=Math.min(window.scrollY,700);$('.grid-bg')?.style.setProperty('transform',`perspective(700px) rotateX(10deg) scale(1.2) translateY(${y*.05}px)`);$('.glow-a')?.style.setProperty('transform',`translate(${y*.03}px,${y*.08}px)`);
  },{passive:true});

  // Jeśli iframe mapy nie załaduje się, po chwili pokazujemy bezpieczny fallback.
  const frame=$('.map-viewport iframe'), fallback=$('.map-fallback');
  if(frame&&fallback){let loaded=false;frame.addEventListener('load',()=>loaded=true);setTimeout(()=>{if(!loaded)fallback.style.display='flex';},7000);}

  // Easter egg: wpisz BADPLAY.
  let secret='';window.addEventListener('keydown',e=>{secret=(secret+e.key.toLowerCase()).slice(-7);if(secret==='badplay'){document.body.classList.add('secret-mode');show('BADPLAY MODE AKTYWOWANY');setTimeout(()=>document.body.classList.remove('secret-mode'),3500);}});
})();
