const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict'),http=require('node:http');
const {webcrypto}=require('node:crypto');
const dir=path.join(__dirname,'..');
async function run(){
 const objects=new Map(),cache=new Map();let rejectUpload=false,rejectPatch=false,uploads=0,patches=0,published=null;
 const server=http.createServer(async(req,res)=>{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);const body=Buffer.concat(chunks);
  if(req.method==='POST'){
   uploads++;if(rejectUpload){res.writeHead(403);return res.end('new row violates row-level security policy')}
   const object=req.url.replace('/storage/v1/object/','');if(objects.has(object)){res.writeHead(409);return res.end('Duplicate: already exists')}
   objects.set(object,body);res.writeHead(200);return res.end('{}');
  }
  if(req.method==='HEAD'){res.writeHead(objects.has(req.url.replace('/storage/v1/object/public/',''))?200:404);return res.end()}
  if(req.method==='PATCH'){
   patches++;if(rejectPatch){res.writeHead(500);return res.end('{"code":"57014","message":"canceling statement due to statement timeout"}')}
   assert(req.url.endsWith('&select=id'));published=JSON.parse(body).data;res.writeHead(200,{'Content-Type':'application/json'});return res.end('[{"id":"main"}]');
  }
  if(req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify([{data:published}]))}
  res.writeHead(405);res.end();
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
 const url='http://127.0.0.1:'+server.address().port;
 const bytes=Buffer.alloc(7*1024*1024,71),src='data:image/jpeg;base64,'+bytes.toString('base64');
 const source={caressanoDemo:JSON.stringify({models:[{image:src,gallery:[{src,type:'image',x:23,zoom:110}],name:'PRUEBA'}]}),caressanoModelsCopyDemo:'{"title":"MODELS","color":"#aabbcc"}',caressanoHeroImagePersistent:src};
 const ctx={fetch,AbortSignal,atob,crypto:webcrypto,Uint8Array,Map,console:{error(){}}};vm.createContext(ctx);
 vm.runInContext(fs.readFileSync(path.join(dir,'media-upload.js'),'utf8'),ctx);
 const opts={url,key:'mock-key',token:'mock-token',readCache:async k=>cache.get(k),writeCache:async(k,v)=>cache.set(k,v)};
 rejectUpload=true;await assert.rejects(ctx.CaressanoMedia.prepare(source,opts),/403/);assert.equal(patches,0);
 rejectUpload=false;
 const prepared=await ctx.CaressanoMedia.prepare(source,opts);
 assert.equal(objects.size,1);assert.deepEqual([...objects.values()][0],bytes);
 assert(JSON.stringify(prepared).length<2000);assert.equal(JSON.parse(source.caressanoDemo).models[0].image,src);
 const model=JSON.parse(prepared.caressanoDemo).models[0];assert.equal(model.gallery[0].x,23);assert.equal(model.gallery[0].zoom,110);assert.equal(prepared.caressanoModelsCopyDemo,source.caressanoModelsCopyDemo);
 const count=uploads;await ctx.CaressanoMedia.prepare(source,opts);assert.equal(uploads,count);
 // Drop cache to simulate another device: conflict must reuse the existing object.
 cache.clear();await ctx.CaressanoMedia.prepare(source,opts);assert.equal(objects.size,1);
 const admin=fs.readFileSync(path.join(dir,'admin.js'),'utf8');
 const start=admin.indexOf('async function performPublishSiteState()'),end=admin.indexOf('function scheduleRemotePublish()',start);
 Object.assign(ctx,{getAdminToken:async()=>'mock-token',document:{getElementById:()=>null},flushSettings:async()=>{},collectSiteState:async()=>source,
 SUPABASE_URL:url,SUPABASE_KEY:'mock-key',REMOTE_SITE_TABLE:'caressano_site',REMOTE_SITE_ID:'main',publicationRevision:1,PENDING_KEY:'pending',durableGet:opts.readCache,durablePut:opts.writeCache,alert:()=>{}});
 vm.runInContext(admin.slice(start,end),ctx);cache.set('pending','1');
 rejectPatch=true;assert.equal(await ctx.performPublishSiteState(),false);assert.equal(cache.get('pending'),'1');
 rejectPatch=false;assert.equal(await ctx.performPublishSiteState(),true);assert.equal(cache.get('pending'),null);assert(!JSON.stringify(published).includes('data:image'));
 const read=await fetch(url+'/rest/v1/caressano_site?id=eq.main&select=data').then(r=>r.json());assert.equal(JSON.parse(read[0].data.caressanoDemo).models[0].image,model.image);
 // Pending changes must prevent remote hydration after reopening the panel.
 const syncStart=admin.indexOf('async function syncAdminWithRemote()'),syncEnd=admin.indexOf('function getData()',syncStart);
 let remoteReads=0;ctx.durableGet=async()=> 'pending';ctx.loadAll=()=>{};ctx.readRemoteSiteState=async()=>{remoteReads++;throw Error('must not read')};
 // Extract this function only, before subsequent declarations.
 const sync=admin.slice(syncStart,admin.indexOf('\nfunction ',syncStart+10));vm.runInContext(sync,ctx);await ctx.syncAdminWithRemote();assert.equal(remoteReads,0);
 console.log('PASS HTTP integration: exact 7MB photo bytes, duplicates, retry cache, compact JSON, unchanged originals/Models copy/framing, RLS failure stops publication, timeout preserves pending data, confirmed PATCH clears pending, reload reads public URLs, pending recovery prevents remote overwrite');
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
}
run().catch(error=>{console.error(error);process.exitCode=1});
