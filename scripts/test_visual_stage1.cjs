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
 modern52(){
   const state=stage34.modern52||{sites:[],count:0,blocked:0,replacedHomes:0};
   const m=scene.meshes.filter(o=>/^(Hotel urbano de teja terracota52|Edificio de oficinas azul52|Edificio blanco comercial52) /.test(o.name));
   return {count:state.count||0,sites:state.sites||[],blocked:state.blocked||0,
    originalBuildings:state.originalBuildings||0,reasons:state.reasons||{},buildingsNow:data.buildings.length,
    replacedHomes:state.replacedHomes||0,meshGroups:m.length,vertices:m.reduce((s,o)=>s+o.getTotalVertices(),0)};
 },
 overpass(){
   const meshes=scene.meshes.filter(m=>m.name.startsWith("Paso a desnivel de Managua · dos alturas50"));
   const carHigh={traffic:true,route:{axis:"z"}},carLow={traffic:true,route:{axis:"x"}};
   const upper=overpassLayer50(carHigh,37,-37,0),lower=overpassLayer50(carLow,37,-37,Math.PI/2);
   return {installed:overpass50.installed,meshGroups:meshes.length,
    vertices:meshes.reduce((n,m)=>n+m.getTotalVertices(),0),
    upper,lower,highY:roadSurface50(37,-37,upper),lowY:roadSurface50(37,-37,lower),
    pillars:overpass50.pillars,landscape:overpass50.landscape51};
 },
 scanCathedral(){
  const all=[];
  for(let z=343;z<=488;z+=5)for(let x=57;x<=86;x+=3){
   if(x-13<=43||!inWorld(x-14,z-15)||!inWorld(x+21,z+21))continue;
   const overlaps=data.boxes.reduce((n,b)=>n+(x+21>b[0]-1&&x-14<b[2]+1&&z+21>b[1]-1&&z-15<b[3]+1),0);
   all.push({x,z,overlaps});
  }
  return {colliders:data.boxes.length,free:all.filter(a=>!a.overlaps).length,
   closest:all.sort((a,b)=>a.overlaps-b.overlaps||Math.hypot(a.x-79,a.z-385)-Math.hypot(b.x-79,b.z-385)).slice(0,12)};
 },
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
   // Follow the exact entry path (enables the avatar and helmet) instead
   // of calling humanRide on a possibly disabled avatar from the start screen.
   // A garage showcase vehicle starts disabled until selected by normal UI.
   // Make this isolated test fixture resident, as a street motorcycle would be.
   bike.root.setEnabled(true);
   nearest=bike;playing=true;driving=false;changeDrive(true);
   return {helmet:player.helmet.isEnabled(),parent:player.root.parent?.name,
     hip:player.visual.position.y,driving,rootEnabled:player.root.isEnabled(),
     helmetMeshes:(player.helmet46||[]).map(m=>({name:m.name,enabled:m.isEnabled(),ownEnabled:m._isEnabled,
       parent:m.parent?.name,parentEnabled:m.parent?.isEnabled(),parentOwnEnabled:m.parent?._isEnabled,
       ancestors:(()=>{const parts=[];for(let n=m.parent,k=0;n&&k<8;n=n.parent,k++)parts.push({name:n.name,enabled:n.isEnabled(),own:n._isEnabled});return parts;})()}))};
 },
 rideRepeat(){
   const fingers=player.rideNodes24.filter(n=>/(?:index|middle|ring|pinky)_0[123]_[lr]$/.test(n.name));
   const capture=()=>fingers.map(n=>({
     name:n.name,q:n.rotationQuaternion?[n.rotationQuaternion.x,n.rotationQuaternion.y,n.rotationQuaternion.z,n.rotationQuaternion.w]:null
   }));
   const first=capture();
   humanRide(player,current);
   const second=capture();
   humanRide(player,current);
   const third=capture();
   return {count:fingers.length,first,second,third};
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
  // Confirmar dentro del navegador real, no solamente en un mock, que el solar
  // fue encontrado y las 63 cúpulas se ensamblaron como geometría visible.
  const cathedral=await page.evaluate(()=>{
    const meshes=Nicaragua.scene.meshes.filter(m=>m.name.startsWith("Catedral Metropolitana de Managua · modelo artístico21"));
    return {installed:!!Nicaragua.landmarkDetails.cathedral,
      meshGroups:meshes.length,vertices:meshes.reduce((s,m)=>s+m.getTotalVertices(),0)};
  });
  if(!cathedral.installed)console.log("CATEDRAL_SOLARES_REALES "+JSON.stringify(await page.evaluate(()=>__naguaVisualQA.scanCathedral())));
  assert(cathedral.installed,"No se encontró un solar libre para la Nueva Catedral en el juego real");
  const overpass=await page.evaluate(()=>__naguaVisualQA.overpass());
  assert(overpass.installed&&overpass.meshGroups>=1&&overpass.vertices>1000,
   "Falta geometría real del paso a desnivel: "+JSON.stringify(overpass));
  assert(overpass.upper&&!overpass.lower&&overpass.highY-overpass.lowY>5,
   "El tráfico superior e inferior no está separado: "+JSON.stringify(overpass));
  console.log("OVERPASS_BROWSER "+JSON.stringify(overpass));
  const modern=await page.evaluate(()=>__naguaVisualQA.modern52());
  assert(modern.replacedHomes===0&&modern.buildingsNow===modern.originalBuildings+modern.count,
    "Cambió un inmueble existente o el catálogo perdió sincronía: "+JSON.stringify(modern));
  assert(modern.count>=1&&modern.meshGroups>=modern.count&&modern.vertices>500,
    "La ciudad real no incorporó ningún edificio moderno válido: "+JSON.stringify(modern));
  console.log("MODERN_BUILDINGS_BROWSER "+JSON.stringify(modern));
  assert(cathedral.meshGroups>=3&&cathedral.vertices>5000,
    "Catedral sin geometría fusionada o sin sus 63 cúpulas: "+JSON.stringify(cathedral));
  console.log("CATEDRAL_BROWSER "+JSON.stringify(cathedral));
  assert(idle.nearMeshes>0);
  assert(idle.vertices>1000);
  assert(idle.scaling.every(v=>Math.abs(v-1)<.00001),"Preservar escala de rig del personaje");
  const names=['zacate','tierra','Jardín de barrio','Jardín de rotonda'];
  for(const name of names){
    const mat=idle.materials.find(m=>m.name===name);
    assert(mat,'Falta material real: '+name);
    assert(mat.albedo&&mat.normal&&mat.scale>0&&mat.family,
      'PBR sin normal o UV métrica: '+JSON.stringify(mat));
  }
  assert(idle.rotations.length>5);
  assert(idle.rotations.every(r=>r.q.every(Number.isFinite)),"Huesos con rotaciones finitas");
  console.log("STAGE1_MATERIALS "+JSON.stringify(idle.materials));
  const hand=await page.evaluate(()=>__naguaVisualQA.arm());
  assert.equal(hand.equipped,"rifle");
  assert(hand.offset<.90,"Arma exageradamente separada de la mano "+hand.offset);
  const aiming=await page.evaluate(()=>__naguaVisualQA.snapshot());
  assert(aiming.rotations.every(r=>r.q.every(Number.isFinite)));
  const bike=await page.evaluate(()=>__naguaVisualQA.ride());
  console.log("STAGE1_RIDE "+JSON.stringify(bike));
  assert(bike.helmet,"Casco activo durante conducción");
  assert(bike.parent,"Personaje unido al vehículo");
  const grip=await page.evaluate(()=>__naguaVisualQA.rideRepeat());
  assert(grip.count>=6,"No se encontraron dedos del piloto en el esqueleto real");
  const angleDelta=(a,b)=>{
   assert(a&&b&&a.every(Number.isFinite)&&b.every(Number.isFinite));
   const norm=q=>Math.hypot(...q),dot=Math.abs(a.reduce((sum,v,i)=>sum+v*b[i],0)/(norm(a)*norm(b)));
   return 2*Math.acos(Math.max(-1,Math.min(1,dot)));
  };
  let maxDelta=0;
  for(let i=0;i<grip.count;i++)maxDelta=Math.max(maxDelta,angleDelta(grip.second[i].q,grip.third[i].q));
  console.log("STAGE1_RIDER_REPEAT "+JSON.stringify({fingers:grip.count,maxRepeatedPoseRadians:maxDelta}));
  assert(maxDelta<.001,"Los dedos cambian de forma al volver a subir a la moto: "+maxDelta);
  assert.deepEqual(errors,[],"Errores JavaScript en el juego real");
  await page.screenshot({path:path.join(root,"dist/stage1-moto.png")});
  const report={passed:true,cathedral,overpass,modern,scope:"Chromium/SwiftShader; no certifica FPS Android",idle:{...idle,rotations:idle.rotations.length,materials:idle.materials},aiming:{...aiming,rotations:aiming.rotations.length,materials:undefined},weapon:hand,bike,errors};
  fs.writeFileSync(path.join(root,"dist/stage1-visual.json"),JSON.stringify(report,null,2));
  console.log("STAGE1_VISUAL "+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>{fs.rmSync(copy,{force:true});});
