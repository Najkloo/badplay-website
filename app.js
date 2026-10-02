(function(){
  const toast=document.getElementById('toast');let timer;
  function show(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('show'),2200)}
  document.querySelectorAll('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{const value=btn.dataset.copy;try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(value);else{const t=document.createElement('textarea');t.value=value;t.style.position='fixed';t.style.opacity='0';document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}show('Skopiowano: '+value)}catch(e){show('Nie udało się skopiować adresu')}}));
  const menu=document.getElementById('menu');const nav=document.querySelector('nav');menu?.addEventListener('click',()=>{const open=nav.classList.toggle('open');if(open){nav.style.display='flex';nav.style.position='absolute';nav.style.top='68px';nav.style.left='14px';nav.style.right='14px';nav.style.padding='20px';nav.style.background='#0b0b0b';nav.style.border='1px solid #292929';nav.style.flexDirection='column'}else nav.removeAttribute('style')});
})();
