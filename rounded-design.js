globalThis.CaressanoRounded=(()=>{
 const colors={pageBg:'#0d0d0d',pageText:'#f4f1e9',navBg:'#f1f1ef',navText:'#111111',cardBg:'#171717',cardText:'#f4f1e9',borderColor:'#73736f',newsBg:'#151515',newsText:'#f4f1e9',aboutBg:'#0d0d0d',aboutText:'#f4f1e9',ctaBg:'#ffffff',ctaText:'#111111',buttonBg:'#111111',buttonText:'#ffffff',profileButtonBg:'#f4f1e9',profileButtonText:'#111111'};
 const defaults={...colors,radius:28,gap:20,photoSizingRevision:2,modelAspect:'original',profileAspect:'original',galleryAspect:'original',aboutAspect:'original',bannerAspect:'portrait',newsAspect:'portrait',photoFit:'cover',textStyles:{}};
 const ratios={portrait:'3 / 4',landscape:'4 / 3',square:'1 / 1',wide:'16 / 9'};
 const targets=[
 ['nav','Encabezado · enlaces','.v5-nav .v5-link',11,10],['hero','Portada · CARESSANO','.clean-brand',150,48],['heroSub','Portada · MODELS AGENCY','.clean-subtitle',12,8],['heroValues','Portada · valores','.clean-values',13,11],
 ['newsLabel','Novedades · etiqueta','.v5-represent-kicker',11,10],['newsTitle','Novedades · títulos','.news-represent-item h2',64,30],['newsBody','Novedades · descripciones','.news-represent-item p',16,13],['newsLink','Novedades · botones','.news-represent-link',12,11],['newsMedia','Novedades · leyenda de foto','#newsFeatureMedia span',12,10],
 ['introLabel','Modelos · etiqueta de introducción','.models-intro .kicker',11,10],['introTitle','Modelos · título de introducción','.models-intro h1',88,36],['introAccent','Modelos · acento del título','.models-intro h1 em',88,36],['introBody','Modelos · descripción','.models-intro>p',16,13],['boardLabel','Modelos · OUR BOARD','.compact-models .kicker',11,10],['boardTitle','Modelos · título del listado','.compact-models .section-head h2',72,38],['boardCount','Modelos · cantidad','#modelCount',10,9],['cardName','Tarjetas · nombres','.model-meta h3',28,16],['cardCategory','Tarjetas · categorías','.model-meta>span',10,8],['cardLink','Tarjetas · ver perfil','.model-meta>small',10,8],
 ['castingLabel','Convocatoria · etiqueta','.models-contact .kicker',11,10],['castingTitle','Convocatoria · título','.casting-title',52,27],['castingBody','Convocatoria · descripción','.models-contact>div>p:not(.kicker)',15,12],['castingDetails','Convocatoria · datos','.models-contact .mini-contact',11,10],['castingButton','Convocatoria · botón','.models-contact a.button',12,10],
 ['profileName','Perfil · nombre','.profile-copy h1',66,27],['profileCategory','Perfil · categoría','.profile-copy .kicker',11,9],['profileBio','Perfil · biografía','.profile-bio',16,12],['profileStats','Perfil · medidas','.profile-measures',13,10],['profileButton','Perfil · solicitar portfolio','.profile-copy .button',12,10],['profileBooking','Perfil · invitación a trabajar','.booking p',30,19],['profileContact','Perfil · botón de contacto','.booking .button',12,10],['profileBack','Perfil · volver','.rd-profile-back',11,10],
 ['aboutLabel','Nosotros · etiqueta','.nosotros-kicker',11,10],['aboutTitle','Nosotros · título','.nosotros-intro h1',100,42],['aboutLead','Nosotros · introducción','.nosotros-lead',20,14],['aboutHeads','Nosotros · títulos de bloques','.nosotros-block h2',40,26],['aboutBody','Nosotros · textos de bloques','.nosotros-block p,.nosotros-block li',16,13],['aboutNumbers','Nosotros · números','.nosotros-block .block-number',12,10],
 ['drawerTitle','Contacto · título','.v5-drawer h2',48,34],['drawerHeads','Contacto · etiquetas','.v5-drawer h3',12,11],['drawerLinks','Contacto · enlaces','.v5-drawer a',15,12],['footer','Pie de página · textos','.models-footer,body.profile-page>footer',10,9]
 ];
 function normalize(raw={}){
  if(!raw||typeof raw!=='object')raw={};const out={...defaults};
  for(const k of Object.keys(colors))if(/^#[a-f\d]{6}$/i.test(raw[k]||''))out[k]=raw[k];
  for(const [k,min,max] of [['radius',0,60],['gap',8,48]])if(Number.isFinite(Number(raw[k])))out[k]=Math.min(max,Math.max(min,Number(raw[k])));
  for(const k of ['modelAspect','profileAspect','galleryAspect','aboutAspect','bannerAspect','newsAspect'])if((raw.photoSizingRevision===2||!['modelAspect','profileAspect','galleryAspect','aboutAspect'].includes(k))&&['original',...Object.keys(ratios)].includes(raw[k]))out[k]=raw[k];
  if(['cover','contain'].includes(raw.photoFit))out.photoFit=raw.photoFit;
  out.textStyles=raw.textStyles&&typeof raw.textStyles==='object'?raw.textStyles:{};return out;
 }
 function font(v){return typeof v==='string'&&v.length<180&&/^[a-zA-Z0-9\s,'".-]+$/.test(v)?v:null}
 function textRules(config){
  const rules=[];
  for(const [id,,selector,desktop,mobile] of targets){
   const s=config.textStyles[id]||{},selectors=selector.split(',').map(x=>'body.cm-design.cm-design.cm-design '+x.trim()).join(',');
   const n=(v,fallback)=>Number.isFinite(Number(v))&&Number(v)>=8&&Number(v)<=240?Number(v):fallback;
   let css=`font-size:${n(s.size,desktop)}px!important;`;
   if(/^#[a-f\d]{6}$/i.test(s.color||''))css+=`color:${s.color}!important;`;
   if(font(s.font))css+=`font-family:${font(s.font)}!important;`;
   rules.push(`${selectors}{${css}}`,`@media(max-width:1000px) and (min-width:761px){${selectors}{font-size:${n(s.tablet,Math.round(desktop*.8))}px!important}}`,`@media(max-width:760px){${selectors}{font-size:${n(s.mobile,mobile)}px!important}}`);
  }
  return rules.join('\n');
 }
 let preview=null,tag;
 function imageAspect(el,aspect,fallback,fit){
  const ratio=aspect==='original'?null:(ratios[aspect]||ratios[fallback]);if(ratio){el.style.setProperty('--rd-ratio',ratio);el.classList.add('rd-aspect')}else{el.classList.remove('rd-aspect');el.style.removeProperty('--rd-ratio')}
  if(fit){el.style.setProperty('--rd-fit',fit)}
 }
 function apply(){
  if(document.body.classList.contains('admin-page')||document.getElementById('adminShell'))return;
  let visual={};try{visual=JSON.parse(siteStorage.getItem('caressanoVisualDemo')||'{}')||{}}catch{}
  const config=normalize(preview||visual.roundedDesign||{});
  document.body.classList.add('cm-design');
  if(!tag){tag=document.createElement('style');tag.id='caressanoRoundedRules';document.head.appendChild(tag)}
  tag.textContent=`:root{--rd-bg:${config.pageBg};--rd-text:${config.pageText};--rd-nav:${config.navBg};--rd-nav-text:${config.navText};--rd-card:${config.cardBg};--rd-card-text:${config.cardText};--rd-border:${config.borderColor};--rd-radius:${config.radius}px;--rd-gap:${config.gap}px;--rd-news:${config.newsBg};--rd-news-text:${config.newsText};--rd-about:${config.aboutBg};--rd-about-text:${config.aboutText};--rd-cta:${config.ctaBg};--rd-cta-text:${config.ctaText};--rd-button:${config.buttonBg};--rd-button-text:${config.buttonText};--rd-profile-button:${config.profileButtonBg};--rd-profile-button-text:${config.profileButtonText}}\n`+textRules(config);
  scheduleHeader();
  const data=getData();
  document.querySelectorAll('.model-card[data-model-id]').forEach(card=>{const model=data.models.find(m=>m.id===card.dataset.modelId);const photo=card.querySelector('.model-photo');if(photo)imageAspect(photo,model?.photoAspect,config.modelAspect,model?.photoFit||config.photoFit)});
  const profile=document.getElementById('profile'),model=profile?data.models.find(m=>m.id===profile.dataset.modelId):null;
  if(model){
   const main=profile.querySelector('.profile-main-photo');if(main)imageAspect(main,model.profilePhotoAspect,config.profileAspect,model.profilePhotoFit||'contain');
   const gallery=model.gallery?.length?model.gallery:[model.image];
   profile.querySelectorAll('.gallery-photo,.gallery-video').forEach((el,i)=>{const item=normalizeMedia(gallery[i]);imageAspect(el,item.aspect,config.galleryAspect,item.fit||config.photoFit)});
  }
  let about={};try{about=JSON.parse(siteStorage.getItem('caressanoAboutDemo')||'{}')||{}}catch{}
  document.querySelectorAll('.nosotros-photo-slot').forEach((el,i)=>imageAspect(el,about.photos?.[i]?.aspect,config.aboutAspect,about.photos?.[i]?.fit||config.photoFit));
  document.querySelectorAll('.premium-reel-item').forEach(el=>imageAspect(el,el.dataset.aspect,config.bannerAspect,config.photoFit));
  const news=document.getElementById('newsFeatureMedia');if(news)imageAspect(news,null,config.newsAspect,config.photoFit);
 }
 window.addEventListener('message',event=>{
  if(window.parent===window||event.source!==window.parent||event.origin!==location.origin||!new URLSearchParams(location.search).has('caressanoDesignPreview'))return;
  if(event.data?.type==='caressano-design-preview'){preview=normalize(event.data.settings);apply()}
 });
 let headerFrame=0;
 function headerContrast(){
  headerFrame=0;const nav=document.querySelector('.v5-nav');if(!nav||!document.body.classList.contains('cm-design'))return;
  const r=nav.getBoundingClientRect();let color=null;
  for(const node of document.elementsFromPoint(innerWidth/2,Math.min(innerHeight-1,r.bottom+8))){
   if(nav.contains(node)||node===nav)continue;
   const c=getComputedStyle(node).backgroundColor,values=c.match(/[\d.]+/g);
   if(values&&values.length>=3&&(values.length===3||Number(values[3])>.8)){color=values.slice(0,3).map(Number);break}
  }
  if(!color)color=[13,13,13];const light=color[0]*.2126+color[1]*.7152+color[2]*.0722>150;
  document.body.classList.toggle('rd-header-over-light',light);
 }
 function scheduleHeader(){if(!headerFrame)headerFrame=requestAnimationFrame(headerContrast)}
 window.addEventListener('scroll',scheduleHeader,{passive:true});window.addEventListener('resize',scheduleHeader);window.addEventListener('DOMContentLoaded',scheduleHeader);
 return{defaults,normalize,targets,ratios,apply};
})();



