async function primeVisible48(){
 const textures=new Set(),center=current?.root.position||spawn;
 for(const mesh of scene.meshes){if(!mesh.isEnabled()||!mesh.material||!mesh.getTotalVertices())continue;mesh.computeWorldMatrix(false);const sphere=mesh.getBoundingInfo().boundingSphere;if(Math.hypot(sphere.centerWorld.x-center.x,sphere.centerWorld.z-center.z)-sphere.radiusWorld>85)continue;for(const texture of mesh.material.getActiveTextures())if(texture.delayLoadState===4&&texture.startupReady48)textures.add(texture);}
 startup48.primedTextures=textures.size;const queue=[...textures];
 for(let i=0;i<queue.length;i+=3){await Promise.all(queue.slice(i,i+3).map(async texture=>{texture.delayLoad();let timer;try{await Promise.race([texture.startupReady48,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('Tiempo agotado al preparar una textura inicial')),20000);})]);}finally{clearTimeout(timer);}}));await loadYield25();}
}
