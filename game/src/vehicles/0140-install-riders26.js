// Rider LOD uses the same temporal stability as vehicle LOD.
// Thresholds are paired (hysteresis), so camera vibration cannot switch the
// rider's full rig and distant mesh on alternating frames.
function installRiders26(){
 for(const v of traffic23.cars){
  if(!v.bike||v.bicycle)continue;
  const p=createPerson(400+v.id);p.trafficRider26=true;p.root.scaling.setAll(.98);
  humanRide(p,v);for(const prop of p.streetProps)prop.setEnabled(false);
  polish26.riders.push({v,p});
 }
 scene.onBeforeRenderObservable.add(()=>{
  const hero=driving?current.root.position:player.root.position;
  for(const {v,p} of polish26.riders){
   const dx=v.root.position.x-hero.x,dz=v.root.position.z-hero.z,d=dx*dx+dz*dz;
   const visible=v.traffic&&(p.riderVisible49===undefined?d<130*130:d<(p.riderVisible49?138:122)**2);
   if(visible!==p.riderVisible49){p.root.setEnabled(visible);p.riderVisible49=visible;}
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
