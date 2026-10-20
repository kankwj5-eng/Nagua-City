// Conductores 3D V4: se crea un único NPC por moto/caponera del tráfico.
// Se instancian modelos GLB existentes; nunca geometría o rig antiguo.
function installRiders26(){
 const pool=(typeof fleet!=='undefined'?fleet:traffic23.cars).filter(v=>!v.garage&&(v.bike||v.caponera));
 for(const v of pool){
  const p=createPerson(400+v.id);
  p.trafficRider26=true;
  p.root.scaling.setAll(.98);
  humanRide(p,v);
  for(const prop of p.streetProps||[])prop.setEnabled(false);
  v.trafficRider26=p;
  polish26.riders.push({v,p});
 }
 scene.onBeforeRenderObservable.add(()=>{
  const hero=driving?current.root.position:player.root.position;
  for(const {v,p} of polish26.riders){
   const dx=v.root.position.x-hero.x,dz=v.root.position.z-hero.z,d=dx*dx+dz*dz;
   // Histéresis: evita activar/desactivar las mallas a cada vibración.
   const active=!!v.traffic&&!(driving&&v===current)&&(v.root.isEnabled?.()??true);
   const visible=active&&(p.riderVisible49===undefined?d<130*130:d<(p.riderVisible49?138:122)**2);
   if(visible!==p.riderVisible49){
    p.root.setEnabled(visible);
    p.riderVisible49=visible;
   }
   if(!visible)continue;
   const near=p.riderNear49===undefined?d<48*48:d<(p.riderNear49?53:43)**2;
   if(near!==p.riderNear49){
    for(const m of p.nearMeshes)m.setEnabled(near);
    for(const m of p.lodMeshes)m.setEnabled(!near);
    p.riderNear49=near;
   }
  }
 });
}
