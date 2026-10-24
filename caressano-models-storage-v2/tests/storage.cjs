const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
async function test(name){
 const source=fs.readFileSync(require('path').join(__dirname,'..',name),'utf8');
 const start=source.indexOf('// Settings use memory'),end=source.indexOf('function caressanoDB()',start);
 const saved=new Map();let fail=false;
 const db={close(){},transaction(){const tx={objectStore(){return {put(v,k){setImmediate(()=>{if(fail){tx.error=new Error('disk full');tx.onerror()}else{saved.set(k,v);tx.oncomplete()}})}}}};return tx}};
 const ctx={console:{error(){}},localStorage:{getItem:k=>k==='legacy'?'old':null,setItem(){throw new Error('QuotaExceededError')}},caressanoDB:async()=>db};vm.createContext(ctx);vm.runInContext(source.slice(start,end)+';globalThis.api={siteStorage,flushSettings,settingsCache}',ctx);
 const {siteStorage,flushSettings}=ctx.api;
 const photo='data:image/png;base64,'+'A'.repeat(7*1024*1024);
 siteStorage.setItem('caressanoDemo',JSON.stringify({models:[{image:photo,gallery:[photo]}]}));await flushSettings();
 assert.equal(JSON.parse(saved.get('caressanoDemo')).models[0].image,photo);
 assert.equal(siteStorage.getItem('legacy'),'old');
 siteStorage.removeItem('legacy');await flushSettings();assert.equal(saved.get('legacy'),null);
 siteStorage.setItem('ordered','one');siteStorage.setItem('ordered','two');await flushSettings();assert.equal(saved.get('ordered'),'two');
 fail=true;siteStorage.setItem('failure','kept');await assert.rejects(flushSettings());assert.equal(siteStorage.getItem('failure'),'kept');
 assert(!source.includes('localStorage.setItem('));
 console.log(name+': PASS quota, 14 MB payload, exact photo bytes, legacy fallback, tombstone, write ordering, disk failure');
}
(async()=>{await test('admin.js');await test('app.js')})().catch(e=>{console.error(e);process.exitCode=1});

