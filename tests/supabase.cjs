const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const dir=require('path').join(__dirname,'..')+require('path').sep;
async function run(){
 const source=fs.readFileSync(dir+'app.js','utf8');
 const fn=source.slice(source.indexOf('async function loadCaressanoFromSupabase()'),source.indexOf('document.addEventListener("DOMContentLoaded",async()=>{'));
 const memory=new Map(),disk=new Map();let response,request;
 const ctx={console:{warn(){}},AbortSignal,CARESSANO_SUPABASE_URL:'https://test.invalid',CARESSANO_SUPABASE_KEY:'test',CARESSANO_PERSIST_KEYS:['caressanoDemo','caressanoModelsCopyDemo'],HERO_IMAGE_KEY:'hero',
 fetch:async(url,options)=>{request=options;if(response instanceof Error)throw response;return response},
 siteStorage:{setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},durablePut:async(k,v)=>disk.set(k,v),durableDelete:async k=>disk.delete(k)};
 vm.createContext(ctx);vm.runInContext(fn,ctx);
 const remote={caressanoDemo:JSON.stringify({models:[{image:'data:image/png;base64,'+'B'.repeat(7*1024*1024)}]}),caressanoModelsCopyDemo:'{"title":"MODELS","color":"#aabbcc"}',hero:'full-original-hero'};
 response={ok:true,json:async()=>[{data:remote}]};assert.equal(await ctx.loadCaressanoFromSupabase(),true);assert.equal(memory.get('caressanoDemo'),remote.caressanoDemo);assert.equal(disk.get('hero'),remote.hero);assert.equal(request.cache,'no-store');assert(request.signal);
 response=new Error('offline');assert.equal(await ctx.loadCaressanoFromSupabase(),false);assert.equal(memory.get('caressanoDemo'),remote.caressanoDemo);
 response={ok:true,json:async()=>[]};assert.equal(await ctx.loadCaressanoFromSupabase(),false);
 const admin=fs.readFileSync(dir+'admin.js','utf8');const a=admin.indexOf('async function performPublishSiteState()'),b=admin.indexOf('function scheduleRemotePublish()',a);
 let result=[],sent;
 const panel={getAdminToken:async()=>'mock-token',document:{getElementById:()=>null},flushSettings:async()=>{},collectSiteState:async()=>remote,SUPABASE_URL:'https://test.invalid',SUPABASE_KEY:'test',REMOTE_SITE_TABLE:'caressano_site',REMOTE_SITE_ID:'main',console:{error(){}},alert(){},fetch:async(url,options)=>{sent=options;return{ok:true,json:async()=>result}}};
 vm.createContext(panel);vm.runInContext(admin.slice(a,b),panel);
 assert.equal(await panel.performPublishSiteState(),false);result=[{id:'main'}];assert.equal(await panel.performPublishSiteState(),true);assert.equal(JSON.parse(sent.body).data.caressanoDemo,remote.caressanoDemo);assert.equal(sent.headers.Prefer,'return=representation');
 console.log('PASS mocked Supabase: large remote state, hero, Models copy, no-store, abort signal, offline, empty row, zero-row PATCH rejected, successful PATCH preserves photos');
}
run().catch(e=>{console.error(e);process.exitCode=1});

