function updateHouses44(){
 if(time<nextHouseUpdate)return;nextHouseUpdate=time+2;
 const p=homeMode?current.root.position:driving?current.root.position:player.root.position,near=data.buildings.map((b,i)=>({b,i,d:Math.hypot(b.x-p.x,b.y-p.z)})).filter(o=>o.b.type==='casa'&&o.d<(quality==='low'?60:95)).sort((a,b)=>a.d-b.d).slice(0,quality==='low'?8:16),keep=new Set(near.map(o=>o.i));
 for(const [i,r] of houseDetails)if(!keep.has(i)){r.setEnabled(false);houseRevision44++;houseDetails.delete(i);const bytes=houseBytes44(r);houseCache44.set(i,{root:r,bytes});technical44.houseCacheBytes+=bytes;}
 for(const {b,i} of near)if(!houseDetails.has(i)){houseRevision44++;const cached=houseCache44.get(i);if(cached){houseCache44.delete(i);technical44.houseCacheBytes-=cached.bytes;cached.root.setEnabled(true);houseDetails.set(i,cached.root);technical44.houseReuses++;}else{houseDetails.set(i,buildHouseDetails(b,i));technical44.houseBuilds++;}}
 while(houseCache44.size>technical44.houseCacheCountLimit||technical44.houseCacheBytes>technical44.houseCacheLimit){const [i,c]=houseCache44.entries().next().value;houseCache44.delete(i);technical44.houseCacheBytes-=c.bytes;c.root.dispose();}
}
