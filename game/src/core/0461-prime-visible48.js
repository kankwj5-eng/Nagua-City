async function primeVisible48(){
 const textures=new Map(),center=current?.root.position||spawn;
 for(const mesh of scene.meshes){if(!mesh.isEnabled()||!mesh.material||!mesh.getTotalVertices())continue;mesh.computeWorldMatrix(false);const sphere=mesh.getBoundingInfo().boundingSphere;const distance=Math.hypot(sphere.centerWorld.x-center.x,sphere.centerWorld.z-center.z)-sphere.radiusWorld;
  if(distance>65)continue;
  for(const texture of mesh.material.getActiveTextures())
   if(texture.delayLoadState===4&&texture.startupReady48)textures.set(texture,Math.min(distance,textures.get(texture)??Infinity));}
 // Las texturas fuera del campo inicial siguen en la carga diferida de Babylon.
 const queue=[...textures.entries()].sort((a,b)=>a[1]-b[1]).slice(0,12).map(entry=>entry[0]);
 startup48.primedTextures=queue.length;
 startup48.deferredTextures=Math.max(0,textures.size-queue.length);
 startup48.textureBudgetMs=2400;
 const done=Promise.all(queue.map(texture=>{
  try{texture.delayLoad();return texture.startupReady48.catch(()=>{});}
  catch(error){startup48.textureErrors.push(String(error));return Promise.resolve();}
 }));
 let timeout;
 try{await Promise.race([done,new Promise(resolve=>{timeout=setTimeout(resolve,2400);})]);}
 finally{clearTimeout(timeout);}
}
