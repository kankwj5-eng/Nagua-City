/* Nagua City — elenco v4. Únicamente diez modelos, sin LOD adicionales.
 * Motor de carga e instanciación independiente del elenco anterior.
 * Esta biblioteca se integra al arranque solo al activar el corte completo.
 */
(function(scope){
 "use strict";
 const IDS=Object.freeze(["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael",
  "06_valeria","07_marisol","08_xiomara","09_rosa","10_elena"]);
 const REQUIRED=Object.freeze(["Idle","Walk","Run","Talk","Punch_L","Punch_R","Guard","HitReaction","Recover"]);
 const PATH="./assets/characters-v4/";
 function validateCast(cast){
  if(!cast||cast.totalModelos!==10||cast.modelosLOD1Importados!==0||!Array.isArray(cast.personajes)||cast.personajes.length!==10)
   throw Error("El elenco debe incluir exactamente diez modelos principales sin LOD1");
  for(let i=0;i<IDS.length;i++){
   const p=cast.personajes[i];
   if(p.id!==IDS[i]||p.protagonista!==(i===0)||p.archivo!==IDS[i]+".glb")
    throw Error("Identidad o archivo inválido: "+IDS[i]);
   if(p.huesos!==(i===0?79:52)||p.animaciones.length!==(i===0?37:12))
    throw Error("Esqueleto o animaciones inesperadas: "+IDS[i]);
   if(!REQUIRED.every(n=>p.animaciones.includes(n)))throw Error("Faltan clips: "+IDS[i]);
  }
  return true;
 }
 async function loadCast(B,scene,cast,loadBytes){
  validateCast(cast);
  const prefabs=new Map(),live=new Set();
  let disposed=false;
  for(const item of cast.personajes){
   if(disposed)throw Error("El elenco ya fue liberado");
   const data=await loadBytes(item.archivo);
   if(!(data instanceof Uint8Array)||data.length<20||
     String.fromCharCode(...data.subarray(0,4))!=="glTF"||
     new DataView(data.buffer,data.byteOffset,data.byteLength).getUint32(8,true)!==data.length)
    throw Error("GLB inválido: "+item.archivo);
   const container=await B.SceneLoader.LoadAssetContainerAsync("",data,scene,null,".glb");
   const clips=new Set(container.animationGroups.map(g=>g.name));
   if(!item.animaciones.every(name=>clips.has(name))){
    container.dispose();
    throw Error("Las animaciones del modelo no coinciden: "+item.archivo);
   }
   container.animationGroups.forEach(g=>g.stop());
   prefabs.set(item.id,container);
  }
  function spawn(id,instanceId){
   if(disposed)throw Error("El elenco fue liberado");
   const container=prefabs.get(id);
   if(!container)throw Error("Personaje fuera del elenco: "+id);
   const entry=container.instantiateModelsToScene(n=>"nagua4_"+instanceId+"_"+n,false,{doNotInstantiate:true});
   const root=new B.TransformNode("character_v4_"+instanceId,scene);
   const visual=new B.TransformNode("character_visual_v4_"+instanceId,scene);
   visual.parent=root;
   for(const n of entry.rootNodes)n.parent=visual;
   const groups=new Map(entry.animationGroups.map(g=>[g.name,g]));
   if(!REQUIRED.every(n=>groups.has(n))){
    root.dispose(false,false);
    throw Error("Clips por instancia ausentes: "+id);
   }
   const meshes=root.getChildMeshes(),nodes=new Map(root.getDescendants().map(n=>[n.name.replace(/^nagua4_\d+_/,""),n]));
   const joints={
    head:nodes.get("head"),
    hand_l:nodes.get("wrist.L"),hand_r:nodes.get("wrist.R"),
    foot_l:nodes.get("foot.L"),foot_r:nodes.get("foot.R"),
    upperarm_l:nodes.get("upperarm01.L"),upperarm_r:nodes.get("upperarm01.R"),
    lowerarm_l:nodes.get("lowerarm01.L"),lowerarm_r:nodes.get("lowerarm01.R")
   };
   let current=null;
   for(const m of meshes){m.isPickable=false;m.receiveShadows=true;}
   const person={
    id,name:id.slice(3),root,visual,meshes,groups,joints,active:null,
    play(name,repeat=true,speed=1){
     const action=groups.get(name);
     if(!action)throw Error("Acción inexistente en "+id+": "+name);
     if(current===action&&action.isPlaying)return;
     if(current)current.stop();
     current=action;person.active=name;
     action.start(repeat,speed,action.from,action.to,false);
    },
    walk(speed){
     this.play(speed>2.5?"Run":speed>.08?"Walk":"Idle",true,
       Math.min(1.6,Math.max(.75,speed>2.5?speed/3.3:Math.max(speed,1))));
    },
    dispose(){if(current)current.stop();entry.animationGroups.forEach(g=>g.dispose());root.dispose(false,false);live.delete(person);}
   };
   live.add(person);person.play("Idle");return person;
  }
  return Object.freeze({
   ids:IDS,paths:IDS.map(id=>PATH+id+".glb"),spawn,
   release(){if(disposed)return;for(const p of [...live])p.dispose();for(const p of prefabs.values())p.dispose();prefabs.clear();disposed=true;},
   inspect(){return {modelos:prefabs.size,instancias:live.size,legacyContainers:0,lod1:0};}
  });
 }
 const api=Object.freeze({IDS,REQUIRED,validateCast,loadCast});
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(scope)scope.NaguaCastV4=api;
})(typeof window!=="undefined"?window:null);
