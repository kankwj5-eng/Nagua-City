/* Integración sobre el motor original de Nagua City.
 * No crea otra escena, luz, material urbano, cámara ni suelo.
 * Solo activa los modelos V4 cuando la build ORIGINAL incorpora el manifiesto.
 */
const originalV4=(()=>{
 "use strict";
 const CAST=["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
 "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena"];
 const FLEET=["hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta"];
 const SIZES={
  hilux:[1.77,5.28,3.08,2150,35],landcruiser:[1.79,5.18,3.18,2650,33],
  pulsar:[.76,2.02,1.37,160,31],taypan:[.76,2,1.33,135,25],
  "mototaxi-roja":[1.42,2.45,1.83,440,15],"canonera-abierta":[1.42,2.52,1.83,460,15]
 };
 let metadata=null,people=new Map(),cars=new Map(),loadedPeople=false,loadedCars=false;
 const exists=()=>!!document.getElementById("v4-original-specifications");
 function requireModels(){if(!exists())throw Error("Faltan los 16 modelos V4 en la compilación: generar HTML con scripts/build_full_original_v4.py");}
 function spec(){
  if(!exists())return null;
  if(!metadata){
   metadata=JSON.parse(document.getElementById("v4-original-specifications").textContent);
   if(metadata.characters?.length!==10||metadata.vehicles?.length!==6||
     metadata.characters.some((v,i)=>v.id!==CAST[i])||
     metadata.vehicles.some((v,i)=>v.id!==FLEET[i]))
    throw Error("La integración necesita exactamente 10 personas y 6 vehículos nuevos");
  }
  return metadata;
 }
 // Android puede ejecutar el arranque asíncrono antes de que el analizador
 // termine de recibir el HTML. Los modelos V4 se insertan después del motor:
 // nunca tratar un nodo aún no analizado como un archivo perdido.
 async function waitForDocumentV4(){
  if(document.readyState==="loading")
   await new Promise(resolve=>document.addEventListener("DOMContentLoaded",resolve,{once:true}));
 }
 async function bytesFor(id){
  const tag=document.getElementById("v4-original-"+id);
  if(!tag)throw Error("Falta modelo V4 después de cargar el documento: "+id);
  let value;
  if(tag.dataset.src){
   // La PWA entrega cada GLB comprimido por separado. El HTML portátil
   // permanece con los mismos modelos integrados y usa la ruta siguiente.
   if(tag.dataset.format!=="glb-gzip")throw Error("Formato V4 desconocido: "+id);
   const url=new URL(tag.dataset.src,document.baseURI);
   if(url.origin!==location.origin)throw Error("Origen V4 no permitido: "+id);
   let response;
   try{response=await fetch(url.href,{cache:"force-cache"});}
   catch(error){throw Error("No se pudo descargar modelo V4 "+id+": "+(error?.message||error));}
   if(!response.ok)throw Error("No se pudo descargar modelo V4 "+id+" (HTTP "+response.status+")");
   const gzip=await response.arrayBuffer();
   const raw=await new Response(new Blob([gzip]).stream().pipeThrough(new DecompressionStream("gzip"))).arrayBuffer();
   value=new Uint8Array(raw);
  }else{
   value=new Uint8Array(await inflate(bytes(tag.textContent)));
  }
  if(value.length<20||String.fromCharCode(...value.subarray(0,4))!=="glTF"||
    new DataView(value.buffer,value.byteOffset,value.byteLength).getUint32(8,true)!==value.length)
   throw Error("Archivo 3D no válido: "+id);
  tag.remove();
  return value;
 }
 async function prepare(kind){
  await waitForDocumentV4();
  requireModels();
  const targets=kind==="people"?people:cars,items=kind==="people"?spec().characters:spec().vehicles;
  const done=kind==="people"?loadedPeople:loadedCars;
  if(done)return true;
  try{
   for(const v of items){
    const data=await bytesFor(v.id);
    const container=await B.SceneLoader.LoadAssetContainerAsync("",data,scene,null,".glb");
    const names=new Set(container.animationGroups.map(g=>g.name));
    const required=kind==="people"?["Idle","Walk","Run","Punch_L","Punch_R"]:["Direccion_Izquierda","Direccion_Derecha",...v.wheels.map(w=>"Rodar_"+w)];
    if(required.some(n=>!names.has(n))){container.dispose();throw Error("Animaciones V4 incompletas: "+v.id);}
    for(const g of container.animationGroups)g.stop();
    targets.set(v.id,{container,info:v});
    await loadYield25();
   }
   if(kind==="people")loadedPeople=true;else loadedCars=true;
   return true;
  }catch(error){
   for(const p of targets.values())p.container.dispose();
   targets.clear();
   throw error;
  }
 }
 function instantiate(container,index){
  const saved=container.rootNodes.map(n=>[n,n.parent]);
  let instance;
  try{
   for(const [n] of saved)n.parent=null;
   instance=container.instantiateModelsToScene(n=>"originalV4_"+index+"_"+n,false,{doNotInstantiate:true});
  }finally{for(const [n,parent] of saved)n.parent=parent;}
  const groups=new Map(instance.animationGroups.map(g=>{
   const name=g.name.replace(/^originalV4_\d+_/,"");
   g.stop();return [name,g];
  }));
  return {instance,groups};
 }
 function setClip(p,name,repeat=true,speed=1){
  if(!p?.v4)return false;
  const group=p.v4.groups.get(name);if(!group)return false;
  if(p.v4.active===name)return true;
  if(p.v4.playing)p.v4.playing.stop();
  p.v4.active=name;p.v4.playing=group;p.mode=name;
  group.start(repeat,speed,group.from,group.to,false);
  return true;
 }
 function seekClip(p,name,phase){
  if(!p?.v4)return false;
  const g=p.v4.groups.get(name);if(!g)return false;
  if(!g._v4Ready){g.start(false,1,g.from,g.to);g.pause();g._v4Ready=true;}
  g.goToFrame(g.from+(g.to-g.from)*Math.max(0,Math.min(1,phase)));return true;
 }
 function makePerson(index,hero=false){
  const id=hero?CAST[0]:CAST[1+((Math.max(1,index)-1)%9)];
  const pack=people.get(id);if(!pack)throw Error("Personajes V4 sin preparar");
  const {instance,groups}=instantiate(pack.container,index);
  const root=new B.TransformNode("persona_v4_"+index,scene),visual=new B.TransformNode("personaje_original_v4",scene);
  visual.parent=root;
  // Los GLB humanos V4 miran en dirección contraria al avance (-Z) del
  // controlador. Rotar solo el visual mantiene intactas cámaras y colisiones.
  visual.rotation.y=Math.PI;
  for(const node of instance.rootNodes)node.parent=visual;
  const nearMeshes=root.getChildMeshes();
  for(const mesh of nearMeshes){mesh.isPickable=false;mesh.receiveShadows=true;}
  const helmet={setEnabled(){},isEnabled(){return false;}};
  const p={index,hero,human:true,bodyType:hero?0:1,root,visual,hips:visual,helmet,
    nearMeshes,lodMeshes:[],streetProps:[],clips:{},bindTracks:[],phase:0,blend:0,speed:0,wait:0,
    direction:1,mode:"Idle",transition:0,animClock:0,hp:100,far:false,
    v4:{id,groups,instance,active:null,playing:null}};
  for(const [name,g] of groups)p.clips[name]={from:g.from,to:g.to,duration:(g.to-g.from)/30||1,tracks:[]};
  p.contact=contactShadow("Sombra persona V4 "+index,.65,.55);
  setClip(p,"Idle");
  return p;
 }
 function makeCar(requested,x,z,heading=0,id=0){
  const name=requested;
  if(!FLEET.includes(name))throw Error('Modelo antiguo no permitido: '+name);
  const pack=cars.get(name);if(!pack)throw Error("Vehículo V4 no autorizado o sin preparar: "+requested);
  const {instance,groups}=instantiate(pack.container,id+1000),info=pack.info;
  const root=new B.TransformNode("vehiculo_v4_"+name+"_"+id,scene);
  const visual=new B.TransformNode("carroceria_v4",scene);visual.parent=root;
  visual.rotation.y=-Math.PI/2;
  for(const node of instance.rootNodes)node.parent=visual;
  for(const mesh of root.getChildMeshes()){mesh.isPickable=false;mesh.receiveShadows=true;}
  root.position.set(x,groundAt(x,z),z);root.rotation.y=heading;
  const [width,length,wheelbase,mass,maxSpeed]=SIZES[name],bike=info.type==="moto";
  const steering=new B.TransformNode("steering_v4_"+id,scene);
  steering.parent=root;
  const meta={radius:info.radius,width,length,wheelbase,mass,seat:[0,1,0],
    steeringPivot:[0,1,0],hands:[.4,1,0]};
  const v={name,id,root,visual,heading,meta,radius:info.radius,wheelbase,width,length,
    maxSpeed,bike,caponera:info.type==="caponera",bus:false,bicycle:false,parts:{steering,body:visual},traffic:false,garage:false,
    spin:0,phase:0,distance:0,profile:{runningMassKg:mass},
    v4:{id:name,info,groups,instance,roll:0,lastPosition:root.position.clone(),lastDirection:null}};
  v.contact=contactShadow("Sombra vehículo V4 "+id,width*1.12,length*.85);
  fleet.push(v);return v;
 }
 function animateWheels(v,speed,steer,dt){
  if(!v?.v4)return false;
  const q=v.v4,delta=Math.max(0,Math.min(.10,dt||0)),actual=Number.isFinite(speed)?speed:0;
  q.roll+=actual*delta/v.radius;
  const phase=((q.roll/(Math.PI*2))%1+1)%1;
  for(const wheel of q.info.wheels)seekClip(v,"Rodar_"+wheel,phase);
  const side=steer>=0?"Direccion_Derecha":"Direccion_Izquierda";
  if(q.lastDirection&&q.lastDirection!==side)seekClip(v,q.lastDirection,0);
  q.lastDirection=side;
  seekClip(v,side,Math.min(.5,Math.abs(steer||0)*.5));
  return true;
 }
 function restorePerson(p){
  if(!p?.v4)return false;
  p.root.parent=null;p.root.rotation.set(0,0,0);
  p.visual.position.y=0;p.visual.rotation.x=p.visual.rotation.z=0;
  p.v4.active=null;setClip(p,"Idle");
  return true;
 }
 return Object.freeze({exists,spec,prepare,makePerson,makeCar,setClip,seekClip,animateWheels,restorePerson,
  inspect(){return {enabled:exists(),people:people.size,vehicles:cars.size,legacyLoaded:0,
   originalWorldPreserved:true};}});
})();
