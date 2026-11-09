const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../admin.js'),'utf8');
const fn=source.slice(source.indexOf('function moveGalleryPhoto('),source.indexOf('function bindModelActions('));
const blue={src:'blue-original.jpg',fit:'contain',zoom:137,x:28,aspect:'portrait'},red={src:'red-original.jpg',height:740,filter:'mono'},video={src:'film.mp4',type:'video'};
let saved=[],collects=0;const context={data:{models:[{image:'cover.jpg',gallery:[blue,red,video]},{gallery:['other.jpg']}]},collectModelFields(){collects++},saveData(d){saved.push(JSON.stringify(d))},renderModels(){},reopenEditor(){},setTimeout(fn){fn()},flash(){},document:{querySelector(){return null}}};vm.createContext(context);vm.runInContext(fn,context);
assert.equal(context.moveGalleryPhoto({},0,0,-1),false);assert.equal(saved.length,0);
assert.equal(context.moveGalleryPhoto({},0,1,-1),true);assert.equal(context.data.models[0].gallery[0],red);assert.equal(context.data.models[0].gallery[1],blue);assert.deepEqual(JSON.parse(saved[0]).models[0].gallery,[red,blue,video]);
context.moveGalleryPhoto({},0,1,1);assert.deepEqual(context.data.models[0].gallery,[red,video,blue]);assert.equal(blue.zoom,137);assert.equal(blue.fit,'contain');assert.equal(context.data.models[0].image,'cover.jpg');assert.deepEqual(context.data.models[1].gallery,['other.jpg']);
assert.equal(context.moveGalleryPhoto({},0,2,1),false);assert.equal(context.moveGalleryPhoto({},0,2,0),false);assert.equal(collects,2);
context.moveGalleryPhoto({},0,2,-1);context.moveGalleryPhoto({},0,1,-1);assert.deepEqual(context.data.models[0].gallery,[blue,red,video]);
console.log('PASS portfolio ordering: before/after, boundaries, exact photo and video objects, framing, cover and other models unchanged, saved order, unsaved model fields collected');

