
// PERSISTENCIA V6: espejo duradero en IndexedDB. Evita perder cambios al cerrar y volver a abrir.
const HERO_IMAGE_KEY="caressanoHeroImagePersistent";
const CARESSANO_PERSIST_KEYS=["caressanoDemo","caressanoAboutDemo","caressanoVisualDemo","caressanoHomeDemo","caressanoBannerDemo","caressanoNewsDemo","caressanoNewsStyleDemo","caressanoModelsCopyDemo","caressanoSectionalStorageRev","caressanoPublicStableHeroRev"];
function caressanoDB(){return new Promise((resolve,reject)=>{const q=indexedDB.open("caressanoModelsPersistent",1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains("settings"))q.result.createObjectStore("settings")};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function durablePut(key,value){try{const db=await caressanoDB();await new Promise((res,rej)=>{const tx=db.transaction("settings","readwrite");tx.objectStore("settings").put(value,key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}catch(e){console.warn("Persistencia IndexedDB:",e)}}
async function durableGet(key){try{const db=await caressanoDB();const value=await new Promise((res,rej)=>{const tx=db.transaction("settings","readonly"),q=tx.objectStore("settings").get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});db.close();return value}catch(e){console.warn("Lectura IndexedDB:",e);return undefined}}
async function durableDelete(key){try{const db=await caressanoDB();await new Promise((res,rej)=>{const tx=db.transaction("settings","readwrite");tx.objectStore("settings").delete(key);tx.oncomplete=res;tx.onerror=()=>rej(tx.error)});db.close()}catch(e){console.warn("Persistencia IndexedDB:",e)}}
async function durableRestore(){try{const db=await caressanoDB();let restored=false;for(const key of CARESSANO_PERSIST_KEYS){const val=await new Promise((res,rej)=>{const tx=db.transaction("settings","readonly"),q=tx.objectStore("settings").get(key);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)});if(val!==undefined){localStorage.setItem(key,val);restored=true}}db.close();return restored}catch(e){console.warn("Restauración persistente:",e);return false}}
function mirrorExistingSettings(){CARESSANO_PERSIST_KEYS.forEach(k=>{const v=localStorage.getItem(k);if(v!==null)durablePut(k,v)});try{navigator.storage?.persist?.()}catch(e){}}
// V7: IndexedDB es la copia maestra al reabrir. localStorage queda como caché rápida.
// Así, si el navegador o una inicialización deja valores viejos en localStorage, no pisan lo guardado.
async function durableSyncAll(){for(const k of CARESSANO_PERSIST_KEYS){const v=localStorage.getItem(k);if(v!==null)await durablePut(k,v)}}


// V4: sanea ajustes visuales antiguos que podían mover la portada al guardar texto.
(function caressanoStableHeroMigration(){try{const key="caressanoPublicStableHeroRev";if(localStorage.getItem(key)==="1")return;const v=JSON.parse(localStorage.getItem("caressanoVisualDemo")||"null");if(v){delete v.heroFit;delete v.heroScale;delete v.heroPosX;delete v.heroPosY;delete v.motionPreset;delete v.motionSpeed;delete v.imageZoom;localStorage.setItem("caressanoVisualDemo",JSON.stringify(v))}const b=JSON.parse(localStorage.getItem("caressanoBannerDemo")||"null");if(b&&Number(b.speed)<72){b.speed=82;localStorage.setItem("caressanoBannerDemo",JSON.stringify(b))}localStorage.setItem(key,"1")}catch(e){console.warn("Ajuste estable omitido",e)}})();
const DEFAULTS = {
  content:{
    hero:{kicker:"FASHION / TALENT / IDENTITY",line1:"CREAMOS",line2:"TALENTO.",line3:"CONSTRUIMOS CARRERAS.",description:"Descubrimos, formamos y representamos modelos con visión internacional.",button:"VER MODELOS →",note:"NEW FACES · NEW STORIES"},
    editorial:{kicker:"NUEVA GENERACIÓN",title:"NUEVAS CARAS.\nNUEVAS POSIBILIDADES.",description:"Caressano conecta talento, industria y oportunidades para crear carreras con identidad.",button:"CONOCER LA AGENCIA →"},
    manifesto:{kicker:"NUESTRA VISIÓN",title:"El talento abre puertas. La disciplina las mantiene abiertas. La autenticidad las convierte en legado."},
    casting:{title:"¿TENÉS LO QUE SE NECESITA PARA SER PARTE DE CARESSANO?",description:"Buscamos personas mayores de 18 años con identidad, compromiso y potencial."},
    contact:{location:"Río Cuarto, Córdoba, Argentina",email:"info@caressanomodels.com",phone:"+54 9 358 123 4567",socials:"Instagram"},
    footer:{text:"Más que una agencia: un puente entre talento y oportunidades."}
  },
  images:{hero:"",editorial:"",manifesto:""},
  models:[
    {id:"valentin-cabral",name:"VALENTÍN CABRAL",category:"MEN / MODEL",bio:"",height:"",details:"",image:"images/valentin-cabral/05.jpg",gallery:["images/valentin-cabral/01.jpg","images/valentin-cabral/02.jpg","images/valentin-cabral/03.jpg","images/valentin-cabral/04.jpg","images/valentin-cabral/05.jpg"]},
    ...Array.from({length:10},(_,i)=>({id:`proximamente-${i+1}`,name:`PRÓXIMAMENTE ${String(i+1).padStart(2,"0")}`,category:"MODEL / SOON",bio:"",height:"",details:"",image:"",gallery:[],placeholder:true}))
  ]};

function getData(){
  try { return JSON.parse(localStorage.getItem("caressanoDemo")) || structuredClone(DEFAULTS); }
  catch(e){ return structuredClone(DEFAULTS); }
}
function saveData(d){localStorage.setItem("caressanoDemo",JSON.stringify(d))}
function setByPath(obj,path,value){const p=path.split(".");let x=obj;for(let i=0;i<p.length-1;i++)x=x[p[i]];x[p[p.length-1]]=value}
function getByPath(obj,path){return path.split(".").reduce((x,k)=>x?.[k],obj)}
function normalizeMedia(x){return typeof x==="string"?{src:x,type:"image"}:{src:"",type:"image",...(x||{})}}
function mediaHtml(raw,cls=""){const m=normalizeMedia(raw);if(!m.src)return `<div class="${cls}"></div>`;return m.type==="video"?`<video class="${cls}" src="${m.src}" muted loop autoplay playsinline></video>`:`<div class="${cls}" style="background-image:url('${m.src}')"></div>`}

function applyContent(){
  let raw;try{raw=JSON.parse(localStorage.getItem("caressanoDemo"))}catch(e){}
  if(!raw)return;
  document.querySelectorAll("[data-edit]").forEach(el=>{
    const v=getByPath(raw.content||{},el.dataset.edit);
    if(v!==undefined)el.textContent=v;
  });
  const map={heroImage:raw.images?.hero,editorialImage:raw.images?.editorial,manifestoImage:raw.images?.manifesto};
  Object.entries(map).forEach(([id,src])=>{const el=document.getElementById(id); if(el && src) el.style.backgroundImage=`url("${src}")`});
}
function renderModels(){
  const d=getData(), grid=document.getElementById("models");
  if(!grid)return;
  const visible=d.models.filter(m=>m.placeholder || m.published!==false);
  document.getElementById("modelCount").textContent=`${visible.length.toString().padStart(2,"0")} PERFILES`;
  grid.innerHTML=visible.map((m,i)=> m.placeholder ? `
    <div class="model-card model-card-empty reveal" aria-label="Espacio reservado para futuro modelo">
      <div class="photo model-photo placeholder-${i%4}"></div>
      <div class="model-meta"><span>${m.category}</span><h3>${m.name}</h3><small>ESPACIO RESERVADO</small></div>
    </div>` : `
    <a class="model-card reveal" href="modelo.html?id=${encodeURIComponent(m.id)}">
      <div class="photo model-photo model-photo-custom ${!m.image?'placeholder-'+(i%4):''}" ${m.image?`style="background-image:url('${m.image}');--model-w:${Number(m.photoWidth)||100}%;--model-h:${Number(m.photoHeight)||390}px;--model-fit:${m.photoFit==="contain"?"contain":"cover"};--model-filter:${m.photoFilter==="mono"?"grayscale(1)":"none"}"`:""}></div>
      <div class="model-meta"><span>${m.category}</span><h3>${m.name}</h3><small>VER PERFIL →</small></div>
    </a>`).join("");
  observeReveals();
  initModelsCarousel();
}
function initModelsCarousel(){
  const grid=document.getElementById("models"),prev=document.getElementById("modelsPrev"),next=document.getElementById("modelsNext");
  if(!grid||!prev||!next)return;
  const step=()=>Math.max(1,grid.clientWidth);
  prev.onclick=()=>grid.scrollBy({left:-step(),behavior:"smooth"});
  next.onclick=()=>grid.scrollBy({left:step(),behavior:"smooth"});
}
function observeReveals(){
  const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}}),{threshold:.12});
  document.querySelectorAll(".reveal:not(.visible)").forEach(e=>obs.observe(e));
}

function applyGlobalContact(){
  const d=getData(), c=d.content?.contact||{};
  const instagram=(c.instagram||"caressanomodels").replace(/^@/,"");
  const icon=n=>({instagram:`<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" class="fill"/></svg>`,mail:`<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`,whatsapp:`<svg viewBox="0 0 24 24"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.4-4A8 8 0 1 1 20 11.5Z"/><path d="M9 8.5c.5 3 2 4.5 5 5l1-1.3 2 .9c-.2 1.7-1.3 2.5-2.8 2.4-4.4-.4-7.2-3.2-7.6-7.6-.1-1.5.7-2.6 2.4-2.8l.9 2-1.3 1Z"/></svg>`,location:`<svg viewBox="0 0 24 24"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></svg>`}[n]||"");
  document.querySelectorAll('.v5-drawer a[href*="instagram.com"]').forEach(a=>{a.href=`https://www.instagram.com/${instagram}/`;a.innerHTML=`${icon("instagram")}<span>@${instagram.toUpperCase()}</span>`});
  document.querySelectorAll('.v5-drawer a[href^="mailto:"]').forEach(a=>{if(c.email){a.href=`mailto:${c.email}`;a.innerHTML=`${icon("mail")}<span>${c.email.toUpperCase()}</span>`}});
  document.querySelectorAll('.v5-drawer a[href^="tel:"]').forEach(a=>{if(c.phone){a.href=`https://wa.me/${String(c.phone).replace(/\D/g,"")}`;a.target="_blank";a.innerHTML=`${icon("whatsapp")}<span>${c.phone}</span>`}});
  document.querySelectorAll('.v5-drawer .drawer-location').forEach(a=>{if(c.maps)a.href=c.maps;if(c.location)a.innerHTML=`${icon("location")}<span>${String(c.location).toUpperCase()}</span>`});
}
function escapeHTML(value){return String(value??"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;")}
function richTextHtml(value){
  const safe=String(value||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
  return safe.replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\n/g,"<br>");
}
function modelsCopyDefaults(){return {introKicker:"CARESSANO / TALENTO",introTitle:"Talent &",introAccent:"Discipline.",introCopy:"Una selección de perfiles representados por Caressano. Explorá cada perfil para conocer su identidad, medidas y portfolio.",introTitleColor:"#f3f3ef",introTitleFont:"\'Bodoni Moda\', Didot, serif",introTitleSize:82,boardKicker:"OUR BOARD",boardTitle:"Modelos.",boardTitleColor:"#f3f3ef",boardTitleFont:"\'Bodoni Moda\', Didot, serif",boardTitleSize:72,castingTitle:"¿Querés ser parte de Caressano Models?",castingTitleColor:"#f3f3ef",castingTitleFont:"\'Bodoni Moda\', Didot, serif",castingTitleSize:64,profilePortfolioKicker:"PORTFOLIO",profilePortfolioTitle:"Presencia.",profilePortfolioAccent:"Identidad."}}
function getModelsCopy(){try{return {...modelsCopyDefaults(),...(JSON.parse(localStorage.getItem("caressanoModelsCopyDemo"))||{})}}catch(e){return modelsCopyDefaults()}}
function applyModelsCopy(){
  if(!localStorage.getItem("caressanoModelsCopyDemo"))return;
  const m=getModelsCopy(),intro=document.querySelector(".models-intro-heading");
  if(intro){const kicker=intro.querySelector(".kicker"),title=intro.querySelector("h1"),copy=document.querySelector(".models-intro > p");if(kicker)kicker.textContent=m.introKicker;if(title){title.innerHTML=`${escapeHTML(m.introTitle)}<br><em>${escapeHTML(m.introAccent)}</em>`;title.style.color=m.introTitleColor;title.style.fontFamily=m.introTitleFont;title.style.fontSize=`${Number(m.introTitleSize)||82}px`}if(copy)copy.textContent=m.introCopy}
  const board=document.querySelector(".compact-models .section-head");if(board){const kicker=board.querySelector(".kicker"),title=board.querySelector("h2");if(kicker)kicker.textContent=m.boardKicker;if(title){title.textContent=m.boardTitle;title.style.color=m.boardTitleColor;title.style.fontFamily=m.boardTitleFont;title.style.fontSize=`${Number(m.boardTitleSize)||72}px`}}
  const casting=document.querySelector(".casting-title");if(casting){casting.textContent=m.castingTitle;casting.style.color=m.castingTitleColor;casting.style.fontFamily=m.castingTitleFont;casting.style.fontSize=`${Number(m.castingTitleSize)||64}px`}
}
function applyHomeAdminContent(){
  if(!document.body.classList.contains("v5-home"))return;
  let h;try{h=JSON.parse(localStorage.getItem("caressanoHomeDemo"))}catch(e){}
  if(!h)return;
  const values=document.querySelector(".clean-values");if(values&&h.values)values.innerHTML=String(h.values).split(/\n+/).map(x=>x.trim()).filter(Boolean).join("<br>")+"<span></span>";
  const brand=document.querySelector(".clean-brand");if(brand&&h.brand)brand.textContent=h.brand;
  const sub=document.querySelector(".clean-subtitle");if(sub&&h.subtitle)sub.innerHTML=`<span></span>${h.subtitle}<span></span>`;const lock=document.querySelector(".clean-lockup");if(lock){lock.style.transform=`translate(${Number(h.brandX)||0}vw,${Number(h.brandY)||0}vh)`;lock.style.display=h.brandVisible===false?"none":"";}
  const kicker=document.querySelector(".v5-represent-kicker");if(kicker&&h.representKicker)kicker.textContent=h.representKicker;
  const title=document.querySelector(".v5-represent h2");if(title&&h.representTitle)title.textContent=h.representTitle;
  const copy=document.querySelector(".v5-represent-copy");if(copy&&h.representCopy)copy.textContent=h.representCopy;
  const cta=document.querySelector(".v5-instagram-cta");if(cta){if(h.representCta)cta.textContent=h.representCta;if(h.representUrl)cta.href=h.representUrl}
}
function applyAboutAdminContent(){
  if(!document.body.classList.contains("nosotros-page"))return;
  let a;try{a=JSON.parse(localStorage.getItem("caressanoAboutDemo"))}catch(e){}
  if(!a)return;
  const lead=document.querySelector(".nosotros-lead");if(lead){if(a.intro)lead.textContent=a.intro;if(a.introSize)lead.style.fontSize=`${a.introSize}px`}
  const copyWrap=document.querySelector(".nosotros-copy");
  if(copyWrap&&Array.isArray(a.blocks)){
    copyWrap.innerHTML=a.blocks.map((b,i)=>`<div class="nosotros-block"><span>${String(i+1).padStart(2,"0")}</span><h2 style="${b.titleSize?`font-size:${Number(b.titleSize)}px`:""}">${String(b.title||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;")}</h2><p style="${b.textSize?`font-size:${Number(b.textSize)}px`:""}">${richTextHtml(b.text)}</p></div>`).join("");
  }else{
    const blocks=document.querySelectorAll(".nosotros-block");
    [[a.b1title,a.b1text,a.b1titleSize,a.b1textSize],[a.b2title,a.b2text,a.b2titleSize,a.b2textSize],[a.b3title,a.b3text,a.b3titleSize,a.b3textSize]].forEach((v,i)=>{if(!blocks[i])return;const h=blocks[i].querySelector("h2"),p=blocks[i].querySelector("p");if(v[0])h.textContent=v[0];if(v[2])h.style.fontSize=`${v[2]}px`;if(v[3])p.style.fontSize=`${v[3]}px`;if(v[1])p.innerHTML=richTextHtml(v[1])});
  }
  const photoWrap=document.querySelector(".nosotros-photos");
  if(photoWrap&&Array.isArray(a.photos)){
    const norm=p=>{const q=typeof p==="string"?{src:p}:{...(p||{})};return {src:"",width:38,height:420,x:58,y:6,z:1,type:"image",filter:"natural",...q}};
    const photoFilter={natural:"none",editorial:"saturate(.9) contrast(1.04)",muted:"saturate(.62) contrast(1.03)",mono:"grayscale(1) contrast(1.05)"};
    photoWrap.innerHTML=a.photos.map((raw,i)=>{const p=norm(raw),m=normalizeMedia(p.media||p);if(!m.src)return "";const w=Math.max(40,Math.min(100,+p.width||100)),h=Math.max(180,Math.min(900,+p.height||520)),x=Math.max(0,Math.min(100,+p.x||50)),y=Math.max(0,Math.min(100,+p.y||50)),zoom=Math.max(80,Math.min(220,+p.zoom||100)),fit=p.fit==="contain"?"contain":"cover",flt=photoFilter[p.filter]||"none";return `<div class="nosotros-photo-slot premium-media-slot about-grid-media" style="--about-w:${w}%;--about-h:${h}px;--about-x:${x}%;--about-y:${y}%;--about-zoom:${zoom}%;--about-fit:${fit};--about-filter:${flt}"><i style="background-image:url('${m.src}')"></i></div>`}).join("");
  }
}




function editorializeAbout(){
  if(!document.body.classList.contains("nosotros-page"))return;
  const copy=document.querySelector(".nosotros-copy"), photoWrap=document.querySelector(".nosotros-photos");
  if(!copy)return;
  const blocks=[...copy.querySelectorAll(".nosotros-block")];
  const photos=photoWrap?[...photoWrap.querySelectorAll(".nosotros-photo-slot")]:[];
  const fallback=["hero-people-approved.jpg","hero-portraits-v5.jpg","hero-approved-framed-v5.jpg"];
  blocks.forEach((block,i)=>{
    if(i>2)return;
    const span=block.querySelector(":scope > span"),h=block.querySelector(":scope > h2"),p=block.querySelector(":scope > p");
    if(!span||!h||!p)return;
    let c=block.querySelector(".about-editorial-copy");
    if(!c){c=document.createElement("div");c.className="about-editorial-copy";c.append(span,h,p);block.prepend(c)}
    let m=block.querySelector(".about-editorial-media");
    if(!m){m=document.createElement("div");m.className="about-editorial-media";block.append(m)}
    if(!m.firstElementChild){
      const photo=photos[i];
      if(photo)m.append(photo);
      else{const slot=document.createElement("div");slot.className="nosotros-photo-slot premium-media-slot about-grid-media";slot.style.cssText="--about-w:100%;--about-h:620px;--about-x:50%;--about-y:50%;--about-zoom:100%;--about-fit:cover;--about-filter:none";slot.innerHTML=`<i style="background-image:url('${fallback[i]}')"></i>`;m.append(slot)}
    }
  });
}

// ===== NOVEDADES · ESTILO WE REPRESENT =====
function applyNews(){
  if(!document.body.classList.contains("v5-home"))return;
  const root=document.getElementById("newsCollage"),section=document.querySelector(".caressano-news-represent"),media=document.getElementById("newsFeatureMedia");if(!root)return;
  let items,style;try{items=JSON.parse(localStorage.getItem("caressanoNewsDemo"))}catch(e){}try{style=JSON.parse(localStorage.getItem("caressanoNewsStyleDemo"))}catch(e){}
  items=Array.isArray(items)?items:[];style={image:"",sectionBg:"#090909",textColor:"#ffffff",bodyColor:"#ffffff",buttonBg:"#ffffff",buttonText:"#090909",imageWidth:46,imageHeight:620,imageFit:"cover",imageFilter:"natural",...(style||{})};
  if(!items.length){items=[{title:"NOVEDADES.",subtitle:"Próximamente vas a encontrar acá las novedades de Caressano Models Agency.",url:"https://www.instagram.com/caressanomodels/",cta:"VER NOVEDADES"}]}
  root.innerHTML=items.map((n,i)=>{const hasUrl=!!(n.url&&String(n.url).trim()),href=hasUrl?escapeHTML(n.url):"#";return `<article class="news-represent-item ${i===0?'is-main':''}"><h2>${escapeHTML(n.title||'NOVEDADES.')}</h2><p class="v5-represent-copy">${escapeHTML(n.subtitle||'')}</p><a class="v5-instagram-cta news-represent-link" href="${href}" ${hasUrl?'target="_blank" rel="noopener"':''}>${escapeHTML(n.cta||'VER NOVEDAD')} →</a></article>`}).join('');
  if(section){section.style.setProperty('--news-bg',style.sectionBg);section.style.setProperty('--news-text',style.textColor);section.style.setProperty('--news-body',style.bodyColor);section.style.setProperty('--news-btn-bg',style.buttonBg);section.style.setProperty('--news-btn-text',style.buttonText);section.style.setProperty('--news-image-width',Math.max(25,Math.min(65,Number(style.imageWidth)||46))+'vw');section.style.setProperty('--news-image-height',Math.max(420,Math.min(900,Number(style.imageHeight)||620))+'px')}
  if(media){if(style.image){media.classList.add('has-image');media.style.backgroundImage=`url("${String(style.image).replace(/"/g,'%22')}")`;media.style.backgroundSize=style.imageFit==='contain'?'contain':'cover';media.style.filter=style.imageFilter==='mono'?'grayscale(1)':'none';media.innerHTML=''}else{media.classList.remove('has-image');media.style.backgroundImage='';media.style.backgroundSize='cover';media.style.filter='none';media.innerHTML='<span>CARESSANO / NEWS</span>'}}
}

function applyAboutBanner(){const host=document.getElementById("aboutMediaBanner"),track=document.getElementById("aboutMediaBannerTrack");if(!host||!track)return;let a;try{a=JSON.parse(localStorage.getItem("caressanoAboutDemo"))||{}}catch(e){a={}}const b={enabled:false,mode:"photos",height:300,speed:82,gap:20,itemWidth:30,media:[],...(a.banner||{})};host.hidden=!b.enabled;if(!b.enabled)return;host.style.setProperty("--reel-h",`${b.height}px`);host.style.setProperty("--reel-speed",`${b.speed}s`);host.style.setProperty("--reel-gap",`${b.gap}px`);host.style.setProperty("--reel-item-w",`${b.itemWidth}vw`);const media=(b.media||[]).map(normalizeMedia).filter(m=>m.src);if(!media.length){host.hidden=true;return}if(b.mode==="video"){const m=media.find(x=>x.type==="video")||media[0];track.className="premium-reel-track single-video-track";track.innerHTML=m.type==="video"?`<video class="about-banner-video" src="${m.src}" muted loop autoplay playsinline></video>`:`<img class="about-banner-video" src="${m.src}" alt="">`}else{track.className="premium-reel-track";const imgs=media.filter(x=>x.type==="image");const use=imgs.length?imgs:media;const tile=m=>`<div class="premium-reel-item">${m.type==="video"?`<video src="${m.src}" muted loop autoplay playsinline></video>`:`<img src="${m.src}" alt="">`}</div>`;const html=use.map(tile).join("");track.innerHTML=html+html}}

// ===== BANNER EDITORIAL =====
function applyPremiumBanner(){
  if(!document.body.classList.contains("v5-home"))return;
  let b;try{b=JSON.parse(localStorage.getItem("caressanoBannerDemo"))}catch(e){}
  const bannerBase={enabled:true,mode:"photos",height:280,speed:82,gap:24,overlay:3,topSpace:42,itemWidth:26,radius:4,fade:10,borderWidth:1,media:[1,2,3,4,5].map(i=>({src:`images/valentin-cabral/0${i}.jpg`,type:"image"}))};b={...bannerBase,...(b||{})};
  const reel=document.getElementById("premiumReel"),track=document.getElementById("premiumReelTrack");if(!reel||!track)return;
  reel.hidden=!b.enabled;if(!b.enabled)return;reel.style.setProperty("--reel-h",`${Number(b.height)||280}px`);reel.style.setProperty("--reel-speed",`${Number(b.speed)||52}s`);reel.style.setProperty("--reel-gap",`${Number(b.gap)||20}px`);reel.style.setProperty("--reel-overlay",String((Number(b.overlay)||0)/100));reel.style.setProperty("--reel-top",`${Number(b.topSpace)}px`);reel.style.setProperty("--reel-item-w",`${Number(b.itemWidth)||26}vw`);reel.style.setProperty("--reel-radius",`${Number(b.radius)||0}px`);reel.style.setProperty("--reel-fade",`${Number(b.fade)||0}%`);reel.style.setProperty("--reel-border-w",`${Number(b.borderWidth)||0}px`);
  const media=(b.media||[]).map(normalizeMedia).filter(m=>m.src);if(!media.length){reel.hidden=true;return}
  if(b.mode==="video"){const m=media.find(x=>x.type==="video")||media[0];track.className="premium-reel-track single-video-track";track.innerHTML=m.type==="video"?`<video class="about-banner-video" src="${m.src}" muted loop autoplay playsinline></video>`:`<img class="about-banner-video" src="${m.src}" alt="">`;return}track.className="premium-reel-track";const photos=media.filter(x=>x.type==="image");const use=photos.length?photos:media;const tile=m=>`<div class="premium-reel-item">${m.type==="video"?`<video src="${m.src}" muted loop autoplay playsinline></video>`:`<img src="${m.src}" alt="" loading="lazy">`}</div>`;const html=use.map(tile).join("");track.innerHTML=html+html;
}

// ===== AJUSTES VISUALES DESDE EL PANEL LOCAL =====
function applyVisualAdminSettings(){
  let v;try{v=JSON.parse(localStorage.getItem("caressanoVisualDemo"))}catch(e){}
  if(!v)return;
  const safe=x=>String(x||"").replace(/[<>]/g,"");
  const rules=[];
  if(v.heroFilter)rules.push(`body.v5-home.v5-clean .clean-photo-slot{filter:${v.heroFilter==="mono"?"grayscale(1)":"none"}!important}`);
  if(v.heroFit==="contain")rules.push(`body.v5-home.v5-clean .clean-photo-slot{background-size:contain!important}`);
  if(v.heroFit==="cover")rules.push(`body.v5-home.v5-clean .clean-photo-slot{background-size:cover!important}`);
  if(v.heroFit==="custom")rules.push(`body.v5-home.v5-clean .clean-photo-slot{background-size:auto ${Number(v.heroScale)||100}%!important}`);
  if(v.heroPosX!=null&&v.heroPosY!=null)rules.push(`body.v5-home.v5-clean .clean-photo-slot{background-position:${Number(v.heroPosX)}% ${Number(v.heroPosY)}%!important}`);
  if(v.bodyBg)rules.push(`body{background:${safe(v.bodyBg)}!important}`);if(v.bodyText)rules.push(`body{color:${safe(v.bodyText)}!important}`);
  if(v.heroBg)rules.push(`body.v5-home.v5-clean .clean-hero{background:${safe(v.heroBg)}!important}`);
  if(v.navBg)rules.push(`.v5-nav,.models-page .header.models-header .nav,.profile-page .nav{background:${safe(v.navBg)}!important}`);
  if(v.navText)rules.push(`.v5-link,.models-page .nav,.profile-page .nav{color:${safe(v.navText)}!important}`);
  if(v.logoColor)rules.push(`.v5-logo{position:relative!important}.v5-logo img{opacity:0!important}.v5-logo:before{content:"";position:absolute;inset:7px 5px;background:${safe(v.logoColor)};-webkit-mask:url("caressano-mark.png") center/contain no-repeat;mask:url("caressano-mark.png") center/contain no-repeat}`);
  if(v.heroTitle)rules.push(`.clean-brand{color:${safe(v.heroTitle)}!important}`);if(v.heroSub)rules.push(`.clean-subtitle{color:${safe(v.heroSub)}!important}.clean-subtitle span{background:${safe(v.heroSub)}!important}`);if(v.heroValues)rules.push(`.clean-values{color:${safe(v.heroValues)}!important}`);
  if(v.representBg)rules.push(`.caressano-news{background:${safe(v.representBg)}!important}`);if(v.bannerOverlayColor)rules.push(`.premium-reel:after{background:${safe(v.bannerOverlayColor)}!important;opacity:var(--reel-overlay)!important}`);if(v.bannerBg)rules.push(`.premium-reel{background:${safe(v.bannerBg)}!important}`);if(v.bannerBorder)rules.push(`.premium-reel{border-color:${safe(v.bannerBorder)}!important;border-style:solid!important}`);if(v.representText)rules.push(`.caressano-news h2,.caressano-news .news-heading p{color:${safe(v.representText)}!important}`);if(v.representBody)rules.push(`.news-copy p,.news-copy small{color:${safe(v.representBody)}!important}`);if(v.linkColor)rules.push(`.generic-link-color{color:${safe(v.linkColor)}!important}`);if(v.applyButtonBg)rules.push(`.models-contact a.button{background:${safe(v.applyButtonBg)}!important}`);if(v.applyButtonText)rules.push(`.models-contact a.button{color:${safe(v.applyButtonText)}!important;border-color:${safe(v.applyButtonText)}!important}`);
  if(v.modelsBg)rules.push(`.compact-models,.models-page{background:${safe(v.modelsBg)}!important}`);if(v.modelsText)rules.push(`.compact-models,.models-intro,.models-intro h1{color:${safe(v.modelsText)}!important}`);if(v.cardBg)rules.push(`.compact-models .model-card{background:${safe(v.cardBg)}!important}`);if(v.cardText)rules.push(`.compact-models .model-meta,.compact-models .model-meta h3{color:${safe(v.cardText)}!important}`);
  const photoFilters={natural:"none",editorial:"saturate(.96) contrast(1.025)",muted:"saturate(.68) contrast(1.02)",mono:"grayscale(1) contrast(1.03)"};rules.push(`.compact-models .model-photo{filter:${photoFilters[v.modelImageStyle]||"none"}!important}.compact-models .model-card:hover .model-photo{filter:${photoFilters[v.modelImageStyle]||"none"}!important}`);rules.push(`.gallery-photo,.gallery-video,.profile-photo{filter:${photoFilters[v.galleryImageStyle]||"none"}!important}`);if(v.modelCardGap!=null)rules.push(`.compact-models .models-grid{gap:${Number(v.modelCardGap)}px!important}`);if(v.modelCardRadius!=null)rules.push(`.compact-models .model-card{border-radius:${Number(v.modelCardRadius)}px!important}`);if(v.modelPhotoHeight)rules.push(`.compact-models .model-photo{height:${Number(v.modelPhotoHeight)}px!important}`);if(v.modelHoverLift!=null)rules.push(`.compact-models .model-card:hover{transform:translateY(-${Number(v.modelHoverLift)}px)!important}`);
  if(v.aboutBg)rules.push(`.nosotros-page,.nosotros-main{background:${safe(v.aboutBg)}!important}`);if(v.aboutTitleColor)rules.push(`.nosotros-intro h1,.nosotros-block h2{color:${safe(v.aboutTitleColor)}!important}`);if(v.aboutText)rules.push(`.nosotros-lead,.nosotros-block p{color:${safe(v.aboutText)}!important}`);if(v.aboutNumber)rules.push(`.nosotros-block>span,.nosotros-kicker{color:${safe(v.aboutNumber)}!important}`);
  if(v.profileBg)rules.push(`.profile-page,.profile-copy,.portfolio{background:${safe(v.profileBg)}!important}`);if(v.profileText)rules.push(`.profile-page,.profile-copy h1,.profile-bio{color:${safe(v.profileText)}!important}`);
  if(v.darkBg)rules.push(`.booking,.models-contact{background:${safe(v.darkBg)}!important}`);if(v.darkText)rules.push(`.booking,.models-contact{color:${safe(v.darkText)}!important}`);if(v.drawerBg)rules.push(`.v5-drawer{background:${safe(v.drawerBg)}!important}`);if(v.drawerText)rules.push(`.v5-drawer,.v5-drawer a,.v5-drawer h2,.v5-drawer h3{color:${safe(v.drawerText)}!important}`);if(v.mutedText)rules.push(`.muted,.kicker,.profile-bio{color:${safe(v.mutedText)}!important}`);if(v.accent)rules.push(`.accent,.accent-text,em,.compact-models .model-meta small{color:${safe(v.accent)}!important}`);
  if(v.fontBrand)rules.push(`.clean-brand,.logo{font-family:${v.fontBrand}!important}`);if(v.fontHeroSub)rules.push(`.clean-subtitle{font-family:${v.fontHeroSub}!important}`);if(v.fontAccent)rules.push(`em,.models-intro h1 em,.portfolio h2 em{font-family:${v.fontAccent}!important}`);if(v.fontHeading)rules.push(`h1,h2,h3,.news-copy h3,.news-heading h2,.nosotros-block h2{font-family:${v.fontHeading}!important}`);if(v.fontBody)rules.push(`body,p,input,textarea,select{font-family:${v.fontBody}!important}`);if(v.fontNav)rules.push(`.v5-nav,.nav{font-family:${v.fontNav}!important}`);if(v.fontButtons)rules.push(`button,.button,.v5-instagram-cta{font-family:${v.fontButtons}!important}`);if(v.fontModel)rules.push(`.model-meta h3,.profile-copy h1{font-family:${v.fontModel}!important}`);
  if(v.heroTitleSize)rules.push(`.clean-lockup .clean-brand{font-size:clamp(56px,11.7vw,${Number(v.heroTitleSize)}px)!important}`);if(v.heroSubtitleSize)rules.push(`.clean-lockup .clean-subtitle{font-size:clamp(7px,.8vw,${Number(v.heroSubtitleSize)}px)!important}`);if(v.representTitleSize)rules.push(`.news-heading h2{font-size:clamp(30px,5vw,${Number(v.representTitleSize)}px)!important}`);if(v.modelsTitleSize)rules.push(`.models-intro h1{font-size:clamp(48px,8vw,${Number(v.modelsTitleSize)}px)!important}`);if(v.aboutTitleSize)rules.push(`.nosotros-intro h1{font-size:clamp(52px,10vw,${Number(v.aboutTitleSize)}px)!important}`);if(v.profileTitleSize)rules.push(`.profile-copy h1{font-size:clamp(50px,7vw,${Number(v.profileTitleSize)}px)!important}`);if(v.bodySize)rules.push(`body{font-size:${Number(v.bodySize)}px}`);if(v.navSize)rules.push(`.v5-link,.nav a{font-size:${Number(v.navSize)}px!important}`);if(v.buttonSize)rules.push(`button,.button,.v5-instagram-cta{font-size:${Number(v.buttonSize)}px!important}`);
  if(v.sectionSpacing)rules.push(`.caressano-news,.compact-models,.models-contact,.portfolio{padding-top:${Number(v.sectionSpacing)}px!important;padding-bottom:${Number(v.sectionSpacing)}px!important}`);if(v.bodyLineHeight)rules.push(`p,.v5-represent-copy,.nosotros-block p,.profile-bio{line-height:${Number(v.bodyLineHeight)/100}!important}`);if(v.headingTracking!=null)rules.push(`h1,h2,.clean-brand,.model-meta h3{letter-spacing:${Number(v.headingTracking)/100}em!important}`);if(v.navOpacity!=null)rules.push(`.v5-nav,.models-page .header.models-header .nav,.profile-page .nav{opacity:${Number(v.navOpacity)/100}!important}`);if(v.navBlur!=null)rules.push(`.v5-nav,.models-page .header.models-header .nav,.profile-page .nav{backdrop-filter:blur(${Number(v.navBlur)}px)!important;-webkit-backdrop-filter:blur(${Number(v.navBlur)}px)!important}`);if(v.mediaRadius!=null)rules.push(`.premium-reel-item,.nosotros-photo-slot,.gallery-photo,.gallery-video{border-radius:${Number(v.mediaRadius)}px!important}`);
  document.body.classList.toggle("motion-future",v.motionPreset==="future");const speed=(Number(v.motionSpeed)||100)/100;rules.push(`:root{--premium-motion:${speed};--premium-zoom:${(Number(v.imageZoom)||106)/100}}`);if(v.motionPreset==="none")rules.push(`*,*:before,*:after{animation:none!important;transition:none!important}`);if(v.motionPreset==="minimal")rules.push(`.reveal{transform:translateY(10px)!important;filter:none!important}`);if(v.motionPreset==="cinematic")rules.push(`.reveal{transform:translateY(44px) scale(.985);filter:blur(5px)}`);
  let tag=document.getElementById("caressanoVisualOverrides");if(!tag){tag=document.createElement("style");tag.id="caressanoVisualOverrides";document.head.appendChild(tag)}tag.textContent=rules.join("\n");
}

async function applyStoredHeroImage(){
  const el=document.getElementById("heroPhoto");if(!el)return;
  let src=await durableGet(HERO_IMAGE_KEY);
  if(src===undefined){try{const v=JSON.parse(localStorage.getItem("caressanoVisualDemo")||"{}");if(v.heroImage){src=v.heroImage;await durablePut(HERO_IMAGE_KEY,src);delete v.heroImage;localStorage.setItem("caressanoVisualDemo",JSON.stringify(v))}}catch(e){}}
  if(src)el.style.setProperty("background-image",`url("${String(src).replace(/"/g,"%22")}")`,"important");else el.style.removeProperty("background-image");
}

function initPage(){
  applyVisualAdminSettings(); applyStoredHeroImage(); applyContent(); applyHomeAdminContent();applyNews(); applyModelsCopy(); applyGlobalContact(); applyAboutAdminContent(); editorializeAbout(); applyAboutBanner(); applyPremiumBanner(); renderModels(); observeReveals();
  const drawer=document.getElementById("contactDrawer"), openBtn=document.getElementById("contactOpen"), closeBtn=document.getElementById("contactClose"), backdrop=document.getElementById("contactBackdrop");
  const setDrawer=(open)=>{drawer?.classList.toggle("open",open);backdrop?.classList.toggle("open",open);drawer?.setAttribute("aria-hidden",String(!open));};
  openBtn?.addEventListener("click",()=>setDrawer(true)); closeBtn?.addEventListener("click",()=>setDrawer(false)); backdrop?.addEventListener("click",()=>setDrawer(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape")setDrawer(false)});
  const menu=document.getElementById("mobileMenu"),btn=document.getElementById("menuBtn");
  if(btn)btn.onclick=()=>menu.classList.toggle("open");
  document.querySelectorAll("a[href^='#']").forEach(a=>a.addEventListener("click",()=>menu?.classList.remove("open")));
  const transition=document.getElementById("pageTransition");
  setTimeout(()=>transition?.classList.remove("active"),120);
  document.querySelectorAll('a[href$=".html"],a[href^="modelo.html"]').forEach(a=>a.addEventListener("click",e=>{
    if(a.target==="_blank")return;e.preventDefault();const href=a.getAttribute("href");transition?.classList.add("active");setTimeout(()=>location.assign(href),650);
  }));
}
function whatsappHref(phone, modelName="") {
  const digits=String(phone||"").replace(/\D/g,"");
  if(!digits) return "#";
  const text=modelName
    ? `Hola, quisiera solicitar el portfolio de ${modelName}.`
    : "Hola, quisiera hacer una consulta a Caressano Models Agency.";
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
function modelStatsMarkup(m){
  const items=[];
  if(m.height) items.push(`<span><b>ALTURA</b> ${m.height}</span>`);
  if(m.details) items.push(`<span><b>DATOS</b> ${m.details}</span>`);
  return items.length ? `<div class="profile-measures">${items.join("")}</div>` : "";
}
function initProfile(){
  const d=getData(), publicModels=d.models.filter(x=>!x.placeholder&&x.published!==false), id=new URLSearchParams(location.search).get("id")||publicModels[0]?.id, m=publicModels.find(x=>x.id===id)||publicModels[0];
  const root=document.getElementById("profile"); if(!m){root.innerHTML="<p>No hay modelos.</p>";return}
  const wa=whatsappHref(d.content?.contact?.phone,m.name);
  root.innerHTML=`
  <section class="profile-hero">
    <div class="profile-photo photo profile-main-photo ${!m.image?'placeholder-0':''}" data-main-src="${m.image||''}" ${m.image?`style="background-image:url('${m.image}');--profile-h:${Number(m.profilePhotoHeight)||720}px;--profile-fit:${m.profilePhotoFit==="cover"?"cover":"contain"};--profile-filter:${m.photoFilter==="mono"?"grayscale(1)":"none"}"`:""} title="Tocar para ampliar"></div>
    <div class="profile-copy"><p class="kicker accent-text">${m.category}</p><h1>${m.name}</h1>${modelStatsMarkup(m)}<p class="profile-bio">${m.bio}</p>
    <a class="button dark booking-whatsapp" href="${wa}" target="_blank" rel="noopener">SOLICITAR PORTFOLIO →</a></div>
  </section>
  <section class="portfolio"><div class="portfolio-grid">${(m.gallery?.length?m.gallery:[m.image,"",""]).map((raw,i)=>{const media=normalizeMedia(raw);return media.src?(media.type==="video"?`<video class="gallery-photo gallery-video portfolio-choice" data-media-type="video" data-src="${media.src}" style="--gallery-w:${Number(media.width)||100}%;--gallery-h:${Number(media.height)||520}px;--gallery-fit:${media.fit==="contain"?"contain":"cover"};--gallery-x:${Number(media.x??50)}%;--gallery-y:${Number(media.y??50)}%;--gallery-zoom:${Number(media.zoom)||100}%" src="${media.src}" muted loop autoplay playsinline controls></video>`:`<div class="photo gallery-photo portfolio-choice" data-media-type="image" data-src="${media.src}" data-filter="${media.filter||"natural"}" style="background-image:url('${media.src}');--gallery-w:${Number(media.width)||100}%;--gallery-h:${Number(media.height)||520}px;--gallery-fit:${media.fit==="contain"?"contain":"cover"};--gallery-x:${Number(media.x??50)}%;--gallery-y:${Number(media.y??50)}%;--gallery-zoom:${Number(media.zoom)||100}%;--gallery-filter:${media.filter==="mono"?"grayscale(1)":"none"}"></div>`):`<div class="photo gallery-photo placeholder-${(i+1)%4}"></div>`}).join("")}</div></section>
  <section class="booking"><p>¿Querés trabajar con <b>${m.name}</b>?</p><a class="button booking-whatsapp" href="${wa}" target="_blank" rel="noopener">CONTACTAR POR WHATSAPP →</a></section>`;
  const main=root.querySelector(".profile-main-photo");
  root.querySelectorAll(".portfolio-choice[data-media-type=image]").forEach(el=>el.addEventListener("click",()=>{const src=el.dataset.src;if(!src||!main)return;main.dataset.mainSrc=src;main.style.backgroundImage=`url('${src}')`;main.style.setProperty("--profile-filter",el.dataset.filter==="mono"?"grayscale(1)":"none");main.style.backgroundPosition=getComputedStyle(el).backgroundPosition;main.style.backgroundSize=getComputedStyle(el).backgroundSize;main.scrollIntoView({behavior:"smooth",block:"center"})}));
  if(main)main.addEventListener("click",()=>{const src=main.dataset.mainSrc;if(!src)return;const box=document.createElement("div");box.className="caressano-lightbox";box.innerHTML=`<button type="button" aria-label="Cerrar">×</button><img src="${src}" alt="${m.name}">`;box.querySelector("button").onclick=()=>box.remove();box.onclick=e=>{if(e.target===box)box.remove()};document.body.appendChild(box)});
  setTimeout(()=>document.getElementById("pageTransition")?.classList.remove("active"),120);
  document.querySelectorAll("a[href$='.html']").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();document.getElementById("pageTransition")?.classList.add("active");setTimeout(()=>location.assign(a.getAttribute("href")),650)}));
}
/* =========================================================
   CARESSANO · DATOS PÚBLICOS DESDE SUPABASE
========================================================= */

const CARESSANO_SUPABASE_URL="https://zvyvsmscrlwqrrugoven.supabase.co";
const CARESSANO_SUPABASE_KEY="sb_publishable_ZbFT9AkHu41tbszLrvFbew_EV-fEt6i";

async function loadCaressanoFromSupabase(){
  try{
    const response=await fetch(
      CARESSANO_SUPABASE_URL+
      "/rest/v1/caressano_site?id=eq.main&select=data",
      {
        headers:{
          "apikey":CARESSANO_SUPABASE_KEY
        },
        cache:"no-store"
      }
    );

    if(!response.ok){
      throw new Error("Supabase "+response.status);
    }

    const rows=await response.json();
    const remote=rows?.[0]?.data;

    if(!remote || typeof remote!=="object" || !Object.keys(remote).length){
      return false;
    }

    for(const key of CARESSANO_PERSIST_KEYS){
      if(Object.prototype.hasOwnProperty.call(remote,key)){
        localStorage.setItem(key,remote[key]);
        await durablePut(key,remote[key]);
      }else{
        localStorage.removeItem(key);
        await durableDelete(key);
      }
    }

    if(Object.prototype.hasOwnProperty.call(remote,HERO_IMAGE_KEY)){
      await durablePut(HERO_IMAGE_KEY,remote[HERO_IMAGE_KEY]);
    }else{
      await durableDelete(HERO_IMAGE_KEY);
    }

    return true;

  }catch(error){
    console.warn(
      "No se pudo cargar Supabase. Se usa la copia local:",
      error
    );
    return false;
  }
}

document.addEventListener("DOMContentLoaded",async()=>{
  /*
    Primero recuperamos el respaldo local.
    Después Supabase lo reemplaza con la versión publicada.
  */
  await durableRestore();

  await loadCaressanoFromSupabase();

  mirrorExistingSettings();

  applyVisualAdminSettings();

  if(document.getElementById("profile")){
    initProfile();
  }else{
    initPage();
  }
});
window.addEventListener("pageshow",()=>document.getElementById("pageTransition")?.classList.remove("active"));


// SINCRONIZACIÓN EN VIVO CON EL PANEL ORIGINAL
const CARESSANO_LIVE_KEYS=new Set(["caressanoDemo","caressanoAboutDemo","caressanoVisualDemo","caressanoHomeDemo","caressanoBannerDemo","caressanoNewsDemo","caressanoModelsCopyDemo"]);
let caressanoRefreshTimer;
function refreshCaressanoLive(){clearTimeout(caressanoRefreshTimer);caressanoRefreshTimer=setTimeout(()=>{try{applyVisualAdminSettings();applyStoredHeroImage();applyContent();applyHomeAdminContent();applyNews();applyModelsCopy();applyGlobalContact();applyAboutAdminContent();editorializeAbout();applyAboutBanner();applyPremiumBanner();if(document.getElementById("models"))renderModels()}catch(err){console.warn("Actualización en vivo parcial",err)}},80)}
window.addEventListener("storage",e=>{if(CARESSANO_LIVE_KEYS.has(e.key))refreshCaressanoLive()});
if("BroadcastChannel" in window){try{const ch=new BroadcastChannel("caressano-live");ch.onmessage=e=>{if(e.data?.type==="refresh")refreshCaressanoLive()}}catch(e){}}

window.addEventListener("pagehide",()=>{durableSyncAll()});
