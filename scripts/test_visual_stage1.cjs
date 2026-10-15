"use strict";
/* Browser QA for hero rig / weapon grip / motorcycle, and a material inventory.
 * Injected only into a temporary copy of the compiled HTML, not the shipped PWA.
 */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {chromium}=require("playwright");
const root=path.resolve(__dirname,"..");
const original=path.join(root,"dist/Managua.html"),copy=path.join(root,"dist/stage1-visual-test.html");
const open=Buffer.from('<script id="appSource" type="text/plain">');
const b=fs.readFileSync(original),start=b.indexOf(open)+open.length,end=b.indexOf("</script>",start);
assert(start>=open.length&&end>start);
let app=b.subarray(start,end).toString("utf8");
const marker="engine.runRenderLoop(()=>{";
assert.equal(app.split(marker).length,2,"Render loop anchor moved");
const inject=`
window.__naguaVisualQA={
 snapshot(){
   const meshes=[...player.nearMeshes,...player.lodMeshes].filter(m=>!m.isDisposed()&&m.getTotalVertices()>0);
   const nodes=player.root.getDescendants();
   const rotations=nodes.filter(n=>/upperarm_|lowerarm_|hand_|pelvis$|spine_/i.test(n.name)&&n.rotationQuaternion)
     .map(n=>({name:n.name,q:[n.rotationQuaternion.x,n.rotationQuaternion.y,n.rotationQuaternion.z,n.rotationQuaternion.w]}));
   const materialList=scene.materials.filter(m=>/(grass|zacate|grama|pasto|césped|lawn|garden|jard|soil|tierra|terreno|lodo|solar|hierba|arena|suelo)/i.test(m.name))
     .map(m=>({name:m.name,albedo:!!m.albedoTexture,normal:!!m.bumpTexture,
       family:m.metadata?.surface42||m.metadata?.surface34||null,scale:m.metadata?.worldScale??null,
       roughness:m.roughness,instances:scene.meshes.filter(x=>x.material===m).length}));
   return {ready,playing,driving,scaling:player.root.scaling.asArray(),hero:!!player.hero,
     nearMeshes:meshes.length,vertices:meshes.reduce((s,m)=>s+m.getTotalVertices(),0),
     equipped,weaponVisible:player.equipment?.isEnabled()||false,
     helmet:player.helmet.isEnabled(),rotations,materials:materialList,
     textures:scene.textures.length,sceneMeshes:scene.meshes.length};
 },
 arm(){
   // The inventory may not own a rifle on a new save. This isolated visual
   // test creates one as a fixture, without unlocking anything in the game.
   const handNode=player.root.getDescendants().find(n=>/hand_r$/.test(n.name));
   if(!handNode)throw Error("Falta hueso hand_r en el rig real");
   player.equipment?.dispose();
   equipped='rifle';
   player.equipment=equipmentModel('rifle',handNode);
   if(!player.equipment)throw Error("No se pudo crear el modelo real de rifle");
   player.equipment.rotation.set(Math.PI/2,0,Math.PI);
   for(let i=0;i<7;i++)human43(player,0,1/60);
   player.equipment.computeWorldMatrix(true);
   const hand=player.equipment.parent;
   hand.computeWorldMatrix(true);
   const offset=B.Vector3.Distance(player.equipment.getAbsolutePosition(),hand.getAbsolutePosition());
   return {offset,equipped,weapon:player.equipment.name,hand:hand.name};
 },
 ride(){
   const bike=fleet.find(x=>x.bike&&x.name==='pulsar');
   if(!bike)throw Error("No existe la Pulsar");
   resetPose(player);
   humanRide(player,bike);
   return {helmet:player.helmet.isEnabled(),parent:player.root.parent?.name,hip:player.visual.position.y};
 }
};
`;
app=app.replace(marker,inject+"\n"+marker);
fs.writeFileSync(copy,Buffer.concat([b.subarray(0,start),Buffer.from(app),b.subarray(end)]));
(async()=>{
 const browser=await chromium.launch({headless:true,args:["--no-sandbox","--use-angle=swiftshader","--enable-unsafe-swiftshader","--disable-dev-shm-usage"]});
 try{
  const page=await browser.newPage({viewport:{width:960,height:540},isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("file://"+copy,{timeout:240000,waitUntil:"load"});
  await page.waitForFunction(()=>window.Nicaragua?.ready||window.Nicaragua?.boot45?.failed,null,{timeout:240000,polling:1000});
  const status=await page.evaluate(()=>({ready:Nicaragua.ready,boot:Nicaragua.boot45}));
  assert(status.ready,JSON.stringify(status));
  await page.evaluate(()=>Nicaragua.engine.stopRenderLoop());
  if(!await page.evaluate(()=>Nicaragua.playing)){
    await page.evaluate(()=>document.getElementById("start").click());
  }
  const idle=await page.evaluate(()=>__naguaVisualQA.snapshot());
  assert(idle.hero);
  assert(idle.nearMeshes>0);
  assert(idle.vertices>1000);
  assert(idle.scaling.every(v=>Math.abs(v-1)<.00001),"Preservar escala de rig del personaje");
  assert(idle.rotations.length>5);
  assert(idle.rotations.every(r=>r.q.every(Number.isFinite)),"Huesos con rotaciones finitas");
  console.log("STAGE1_MATERIALS "+JSON.stringify(idle.materials));
  const hand=await page.evaluate(()=>__naguaVisualQA.arm());
  assert.equal(hand.equipped,"rifle");
  assert(hand.offset<.90,"Arma exageradamente separada de la mano "+hand.offset);
  const aiming=await page.evaluate(()=>__naguaVisualQA.snapshot());
  assert(aiming.rotations.every(r=>r.q.every(Number.isFinite)));
  const bike=await page.evaluate(()=>__naguaVisualQA.ride());
  assert(bike.helmet,"Casco activo durante conducción");
  assert(bike.parent,"Personaje unido al vehículo");
  assert.deepEqual(errors,[],"Errores JavaScript en el juego real");
  await page.screenshot({path:path.join(root,"dist/stage1-moto.png")});
  const report={passed:true,scope:"Chromium/SwiftShader; no certifica FPS Android",idle:{...idle,rotations:idle.rotations.length,materials:idle.materials},aiming:{...aiming,rotations:aiming.rotations.length,materials:undefined},weapon:hand,bike,errors};
  fs.writeFileSync(path.join(root,"dist/stage1-visual.json"),JSON.stringify(report,null,2));
  console.log("STAGE1_VISUAL "+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{fs.rmSync(copy,{force:true});});
