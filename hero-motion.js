/* Scroll controls affect the home hero only; no stored content is rewritten. */
globalThis.CaressanoHeroMotion = (() => {
  const defaults = {scrollEnabled:'on',scrollStrength:75,scrollTextTravel:0,scrollFade:'off',scrollHeight:100,scrollMobileHeight:85,scrollMobile:'soft',scrollNav:'dynamic',scrollNavThreshold:80,scrollNavTopOpacity:0,scrollNavTopBg:'#f4f4f2',scrollNavTopText:'#111111',scrollNavBg:'#f4f4f2',scrollNavText:'#111111',scrollNavHeight:68,scrollNavDuration:250};
  const limits={scrollStrength:[0,100],scrollTextTravel:[0,60],scrollHeight:[60,140],scrollMobileHeight:[60,120],scrollNavThreshold:[0,500],scrollNavTopOpacity:[0,100],scrollNavHeight:[54,100],scrollNavDuration:[0,1000]};
  function normalize(raw={}) {
    if(!raw||typeof raw!=='object')raw={};
    const v={...defaults};
    for(const [key,[min,max]] of Object.entries(limits)){
      const n=raw[key]==null||raw[key]===''?NaN:Number(raw[key]);
      if(Number.isFinite(n))v[key]=Math.min(max,Math.max(min,n));
    }
    for(const key of ['scrollEnabled','scrollFade'])if(['on','off'].includes(raw[key]))v[key]=raw[key];
    if(['off','soft','full'].includes(raw.scrollMobile))v.scrollMobile=raw.scrollMobile;
    if(['dynamic','original'].includes(raw.scrollNav))v.scrollNav=raw.scrollNav;
    for(const key of ['scrollNavTopBg','scrollNavTopText','scrollNavBg','scrollNavText'])if(/^#[0-9a-f]{6}$/i.test(raw[key]||''))v[key]=raw[key];
    return v;
  }
  function frame(v,y,height,mobile,reduced){
    const enabled=v.scrollEnabled==='on';
    const moving=enabled&&!reduced&&!(mobile&&v.scrollMobile==='off');
    const factor=mobile&&v.scrollMobile==='soft'?.35:1;
    const progress=Math.min(1,Math.max(0,y/Math.max(1,height)));
    return {photo:moving?Math.max(0,Math.min(y,height))*v.scrollStrength/100*factor:0,
      text:moving?-Math.max(0,Math.min(y,height))*v.scrollTextTravel/100*factor:0,
      opacity:moving&&v.scrollFade==='on'?Math.max(0,1-progress*1.4):1,
      scrolled:enabled&&v.scrollNav==='dynamic'&&y>v.scrollNavThreshold};
  }
  let settings=normalize(), preview=null, hero, nav, style, raf=0, listening=false;
  function update(){
    raf=0;if(!hero)return;
    const v=settings,mobile=matchMedia('(max-width:760px)').matches,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
    const rect=hero.getBoundingClientRect(),f=frame(v,-rect.top,rect.height,mobile,reduced);
    hero.style.setProperty('--cm-photo-y',f.photo+'px');hero.style.setProperty('--cm-text-y',f.text+'px');hero.style.setProperty('--cm-text-alpha',String(f.opacity));
    document.body.classList.toggle('cm-nav-scrolled',f.scrolled);
    document.body.classList.toggle('cm-reduced',reduced);
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(update)}
  function apply(raw={}){
    hero=document.querySelector('body.v5-home.v5-clean .clean-hero');if(!hero)return;
    nav=document.querySelector('.v5-nav');settings=normalize({...raw,...(preview||{})});
    const v=settings,on=v.scrollEnabled==='on';
    document.body.classList.toggle('cm-scroll',on);
    document.body.classList.toggle('cm-nav-dynamic',on&&v.scrollNav==='dynamic');
    if(!style){style=document.createElement('style');style.id='caressanoHeroMotionRules';document.head.appendChild(style)}
    style.textContent=on?`
      body.v5-home.v5-clean.cm-scroll .clean-hero{height:${v.scrollHeight}svh!important;min-height:360px!important;max-height:none!important;overflow:hidden!important;isolation:isolate}
      body.v5-home.v5-clean.cm-scroll .clean-photo-slot{transform:translate3d(0,var(--cm-photo-y,0px),0)!important;animation:none!important;transition:filter .5s ease!important;will-change:transform}
      body.v5-home.v5-clean.cm-scroll .clean-lockup{translate:0 var(--cm-text-y,0px)!important;opacity:var(--cm-text-alpha,1)!important;transition:none!important}
      body.v5-home.v5-clean.cm-scroll .clean-hero~section{position:relative;z-index:1}
      body.v5-home.v5-clean.cm-nav-dynamic .v5-nav{background:${v.scrollNavTopBg}${Math.round(v.scrollNavTopOpacity*2.55).toString(16).padStart(2,'0')}!important;color:${v.scrollNavTopText}!important;opacity:1!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;transition:background-color ${v.scrollNavDuration}ms ease,color ${v.scrollNavDuration}ms ease,height ${v.scrollNavDuration}ms ease!important}
      body.v5-home.v5-clean.cm-nav-dynamic .v5-nav .v5-link{color:inherit!important}
      body.v5-home.v5-clean.cm-nav-scrolled .v5-nav{background:${v.scrollNavBg}!important;color:${v.scrollNavText}!important;height:${v.scrollNavHeight}px!important;box-shadow:0 1px 0 rgba(0,0,0,.08)}
      @media(max-width:760px){body.v5-home.v5-clean.cm-scroll .clean-hero{height:${v.scrollMobileHeight}svh!important;min-height:320px!important}}
      @media(prefers-reduced-motion:reduce){body.v5-home.v5-clean.cm-scroll .clean-photo-slot{will-change:auto}body.v5-home.v5-clean.cm-nav-dynamic .v5-nav{transition:none!important}}
    `:'';
    if(!on){hero.style.removeProperty('--cm-photo-y');hero.style.removeProperty('--cm-text-y');hero.style.removeProperty('--cm-text-alpha');document.body.classList.remove('cm-nav-scrolled')}
    if(!listening){
      window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('pageshow',schedule);
      matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',schedule);
      matchMedia('(max-width:760px)').addEventListener('change',schedule);listening=true;
    }
    update();
  }
  window.addEventListener('message',event=>{
    if(window.parent===window||event.source!==window.parent||event.origin!==location.origin||!new URLSearchParams(location.search).has('caressanoMotionPreview'))return;
    if(event.data?.type!=='caressano-motion-preview')return;
    preview=normalize(event.data.settings);apply(preview);
  });
  return {defaults,normalize,frame,apply};
})();
