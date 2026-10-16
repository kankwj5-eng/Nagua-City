// Keep each mesh tier stable until a real visibility or LOD transition.
// Re-enabling entire motorcycle hierarchies every render frame caused repeated
// dirty flags and could expose legacy meshes at the exact swap boundary.
function updateFleet(dt){
 const p=homeMode&&!homeGarage?V(-18,0,94):homeMode?current.root.position:driving?current.root.position:player.root.position;
 for(const v of fleet){
  const distance=B.Vector3.DistanceSquared(v.root.position,p);
  const visible=visibleVehicle28(v,distance)&&!(homeMode&&v.garage&&(!homeGarage||v!==current));
  if(v.visibleRender49!==visible){v.root.setEnabled(visible);v.visibleRender49=visible;}
  placeContact(v.contact,v.root.position,v.heading,visible);
  if(!v.low)continue;
  const threshold=quality==='high'?60:quality==='low'?30:45,margin=4;
  const detailed=v===current||(v.detailLOD49===undefined?distance<threshold*threshold:v.detailLOD49?distance<(threshold+margin)**2:distance<(threshold-margin)**2);
  if(v.detailLOD49!==detailed||v.lodRootVisible49!==visible){
   // The distant mesh stays OFF while its root is culled. Both levels can
   // never render together. Nearby and currently driven bikes remain detailed.
   v.low.setEnabled(visible&&!detailed);
   for(const part of Object.values(v.parts))part.setEnabled(detailed);
  }
  v.detailLOD49=detailed;v.lodRootVisible49=visible;
 }
}

// Ackermann geometry follows the existing wheel pivots. Steering input >0 means right.
