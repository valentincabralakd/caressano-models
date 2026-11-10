/* Device-specific framing is metadata: original files are never resampled. */
globalThis.CaressanoFraming=(()=>{
 const ratios={portrait:3/4,landscape:4/3,square:1,wide:16/9};
 const clamp=(n,a,b,d)=>Number.isFinite(Number(n))?Math.min(b,Math.max(a,Number(n))):d;
 function normalize(raw={}){return {fit:raw.fit==='contain'?'contain':'cover',x:clamp(raw.x,0,100,50),y:clamp(raw.y,0,100,50),zoom:clamp(raw.zoom,100,220,100),aspect:ratios[raw.aspect]?raw.aspect:'original',background:/^#[a-f\d]{6}$/i.test(raw.background||'')?raw.background:'#171717'}}
 function resolve(frames,width){if(!frames)return null;const key=width<=700?'mobile':width<=1000?'tablet':'desktop';const value=frames[key]||frames.desktop;return value?normalize(value):null}
 function geometry(nw,nh,w,h,raw){const s=normalize(raw),scale=(s.fit==='contain'?Math.min(w/nw,h/nh):Math.max(w/nw,h/nh))*s.zoom/100;return {width:nw*scale,height:nh*scale}}
 const cache=new Map(),active=new Map();let pending=0,original=new WeakMap();
 const props=["aspect-ratio","height","min-height","background-color","background-position","background-size","object-fit","object-position","transform","transform-origin"];
 function restore(el){const values=original.get(el);if(values)for(const [k,v,priority] of values){if(v)el.style.setProperty(k,v,priority);else el.style.removeProperty(k)}}
 function remember(el){if(!original.has(el))original.set(el,props.map(k=>[k,el.style.getPropertyValue(k),el.style.getPropertyPriority(k)]))}
 function paint(el,src,frames,box=el){if(!el||!src)return;remember(el);remember(box);restore(el);if(box!==el)restore(box);const f=resolve(frames,innerWidth);if(!f)return;
  const set=(node,k,v)=>node.style.setProperty(k,v,'important');
  if(ratios[f.aspect]){set(box,'aspect-ratio',String(ratios[f.aspect]));set(box,'height','auto');set(box,'min-height','0')}
  set(box,'background-color',f.background);set(el,'background-position',f.x+'% '+f.y+'%');
  if(el.tagName==='IMG'){set(el,'object-fit',f.fit);set(el,'object-position',f.x+'% '+f.y+'%');set(el,'transform','scale('+f.zoom/100+')');set(el,'transform-origin',f.x+'% '+f.y+'%');return}
  let img=cache.get(src);if(!img){img=new Image();cache.set(src,img);img.onload=()=>schedule();img.src=src}
  if(img.naturalWidth){const rect=box.getBoundingClientRect(),g=geometry(img.naturalWidth,img.naturalHeight,rect.width,rect.height,f);set(el,'background-size',g.width+'px '+g.height+'px')}
 }
 function read(key){try{return JSON.parse(siteStorage.getItem(key)||'{}')||{}}catch{return {}}}
 function apply(){if(typeof getData!=='function')return;const data=getData(),about=read('caressanoAboutDemo'),banner=read('caressanoBannerDemo'),visual=read('caressanoVisualDemo');active.forEach((v,e)=>{restore(e);restore(v.box)});active.clear();original=new WeakMap();
  const add=(el,src,frames,box)=>{if(el&&frames){active.set(el,{src,frames,box:box||el});paint(el,src,frames,box||el)}};
  document.querySelectorAll('.model-card[data-model-id]').forEach(card=>{const m=data.models.find(x=>x.id===card.dataset.modelId);if(m)add(card.querySelector('.model-photo'),m.image,m.cardFraming)});
  const profile=document.getElementById('profile'),m=data.models.find(x=>x.id===profile?.dataset.modelId);if(m){add(profile.querySelector('.profile-main-photo'),m.image,m.profileFraming);profile.querySelectorAll('.gallery-photo').forEach((el,i)=>{const item=normalizeMedia((m.gallery?.length?m.gallery:[m.image])[i]);if(item.type!=='video')add(el,item.src,item.framing)})}
  document.querySelectorAll('.nosotros-photo-slot').forEach((box,i)=>{const item=about.photos?.[i];if(item)add(box.querySelector('i')||box,item.src||item.media?.src,item.framing,box)});
  document.querySelectorAll('.premium-reel-item').forEach(box=>{const img=box.querySelector('img');if(!img)return;const item=(banner.media||[]).map(normalizeMedia).find(x=>x.src===img.getAttribute('src'));if(item)add(img,item.src,item.framing,box)});
  const news=document.getElementById('newsFeatureMedia');if(news){const src=getComputedStyle(news).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];add(news,src,visual.newsFraming)}
  const hero=document.querySelector('.clean-photo-slot');if(hero){const src=getComputedStyle(hero).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1];add(hero,src,visual.heroFraming)}
 }
 function schedule(){if(!pending)pending=requestAnimationFrame(()=>{pending=0;active.forEach((v,e)=>paint(e,v.src,v.frames,v.box))})}
 window.addEventListener('resize',schedule);function showSelected(el,src,frames){const selected={};for(const key of ['desktop','tablet','mobile'])if(frames?.[key])selected[key]={...frames[key],aspect:'original'};if(!Object.keys(selected).length)selected.desktop={fit:'contain',x:50,y:50,zoom:100};active.set(el,{src,frames:selected,box:el});paint(el,src,selected)}
 return{normalize,resolve,geometry,apply,showSelected};
})();
