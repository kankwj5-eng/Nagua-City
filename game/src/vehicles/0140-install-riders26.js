// Conductores 3D V4: se crea un único NPC por moto/caponera del tráfico.
// Se instancian modelos GLB existentes; nunca geometría o rig antiguo.
function installRiders26(){
 const pool=fleet.filter(v=>!v.garage&&(v.bike||v.caponera));
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
   const visible=!!v.traffic&&v!==current&&d<115*115&&v.root.isEnabled();
   if(visible!==p.riderVisible49){
    p.root.setEnabled(visible);
    p.riderVisible49=visible;
   }
  }
 });
}
