/* Nagua City v4: cuatro vehículos nuevos, con las animaciones GLB originales.
 * Las físicas y la posición se controlan fuera del adaptador.
 * El frente -X del modelo se alinea con -Z mediante una rotación local.
 */
(function(scope){
 "use strict";
 const FILES=Object.freeze({hilux:"Hilux-grafito.glb",landcruiser:"Land-Cruiser-roja.glb",pulsar:"Pulsar-NS200.glb",taypan:"Serpento-Taypan-150.glb"});
 const TAU=2*Math.PI;
 function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
 function validate(manifest){
  if(!manifest||manifest.vehicleModels!==4||manifest.oldVehicleModels!==0||
   !Array.isArray(manifest.vehicles)||manifest.vehicles.length!==4)throw Error("Deben ser exactamente cuatro vehículos nuevos");
  for(const [i,id] of Object.keys(FILES).entries()){
   const v=manifest.vehicles[i];
   if(!v||v.id!==id||v.file!==FILES[id]||!(v.radius>0)||
      !Array.isArray(v.wheels)||!Array.isArray(v.steering)||!Array.isArray(v.animations)||
      !["Direccion_Izquierda","Direccion_Derecha",...v.wheels.map(w=>"Rodar_"+w)].every(x=>v.animations.includes(x)))
    throw Error("Modelos, ruedas o animaciones incompatibles: "+id);
  }
  return true;
 }
 function seek(group,phase){
  if(!group)throw Error("Falta clip requerido");
  if(!group._naguaV4Ready){group.start(false,1,group.from,group.to);group.pause();group._naguaV4Ready=true;}
  group.goToFrame(group.from+(group.to-group.from)*clamp(phase,0,1));
 }
 async function load(B,scene,manifest,loadBytes){
  validate(manifest);
  const prefabs=new Map(),instances=new Set();let released=false;
  try{for(const spec of manifest.vehicles){
   const bytes=await loadBytes(spec.file);
   if(!(bytes instanceof Uint8Array)||bytes.length<20||String.fromCharCode(...bytes.subarray(0,4))!=="glTF"||
     new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength).getUint32(8,true)!==bytes.length)
    throw Error("Archivo GLB inválido: "+spec.file);
   const container=await B.SceneLoader.LoadAssetContainerAsync("",bytes,scene,null,".glb");
   container.animationGroups.forEach(g=>g.stop());
   const names=new Set(container.animationGroups.map(g=>g.name));
   if(!spec.animations.every(n=>names.has(n))){container.dispose();throw Error("Clips ausentes en "+spec.file);}
   prefabs.set(spec.id,{spec,container});
  }}catch(error){for(const p of prefabs.values())p.container.dispose();throw error;}
  function create(id,index){
   if(released)throw Error("Flota liberada");
   const item=prefabs.get(id);if(!item)throw Error("Modelo no autorizado: "+id);
   const {spec,container}=item,clone=container.instantiateModelsToScene(n=>"v4_"+index+"_"+n,false,{doNotInstantiate:true});
   const root=new B.TransformNode("vehicle_v4_"+index,scene),visual=new B.TransformNode("vehicle_visual_v4_"+index,scene);
   visual.parent=root;visual.rotation.y=-Math.PI/2;
   for(const n of clone.rootNodes)n.parent=visual;
   const animations=new Map(clone.animationGroups.map(g=>[g.name,g]));
   if(!spec.animations.every(n=>animations.has(n))){root.dispose();throw Error("Clips de la instancia incompletos: "+id);}
   const wheels=spec.wheels.map(w=>animations.get("Rodar_"+w));
   let distance=0;
   const vehicle={id,index,root,visual,animations,spec,steering:0,rollRadians:0,
    update(speedMps,steer,dt){
     if(released)throw Error("Flota liberada");
     if(![speedMps,steer,dt].every(Number.isFinite)||dt<0)throw Error("Movimiento inválido");
     const angle=clamp(steer,-1,1);
     // Los clips de dirección van centro -> giro máximo -> centro.
     // Su mitad (0..0.5) conserva el giro constante del manubrio y las ruedas.
     seek(animations.get(angle>=0?"Direccion_Izquierda":"Direccion_Derecha"),Math.abs(angle)*.5);
     this.steering=angle;distance+=speedMps*dt;this.rollRadians=distance/spec.radius%TAU;
     const phase=(this.rollRadians/TAU+1)%1;
     for(const wheel of wheels)seek(wheel,phase);
     return this;
    },
    action(name){
     if(!/^Mover_(Puerta_|Compuerta_)/.test(name))throw Error("Acción no permitida");
     const g=animations.get(name);if(!g)throw Error("Parte no disponible");
     g.start(false,1,g.from,g.to);return g;
    },
    dispose(){for(const g of clone.animationGroups){g.stop();g.dispose();}root.dispose(false,false);instances.delete(vehicle);}
   };
   instances.add(vehicle);vehicle.update(0,0,0);return vehicle;
  }
  return Object.freeze({create,ids:Object.keys(FILES),
   inspect(){return {modelos:prefabs.size,instancias:instances.size,lod1:0,anteriores:0};},
   dispose(){if(released)return;released=true;for(const v of [...instances])v.dispose();for(const p of prefabs.values())p.container.dispose();prefabs.clear();}
  });
 }
 const api=Object.freeze({FILES,validate,seek,load});
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(scope)scope.NaguaVehiclesV4=api;
})(typeof window!=="undefined"?window:null);
