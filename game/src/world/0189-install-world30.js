function installWorld30(){
 // Conservar mapa, tiendas y facciones de la ciudad original.
 const hardware=expansion29.shops.find(s=>s.type==='tools');
 if(hardware){hardware.name='Ferretería El Camino';hardware.goods=hardware.goods.filter(i=>i.type!=='weapon'||i.weapon==='shovel');}
 stage30.markers=[];installMap30();
 const newModels=['mototaxi-roja','canonera-abierta'];
 for(let i=0;i<newModels.length;i++){
  const car=createVehicle(newModels[i],-344+i*8,46,Math.PI/2,1200+i);
  car.traffic=false;
  if(!parkSparse28(car,i+120)){car.retired28=true;car.root.position.set(2600+i*10,0,2600);}
  stage30.capColors.push(newModels[i]);
 }
 for(const t of city.territories){
  t.name=t.id==='oeste'?'Los del Taller · banda ficticia':'Los del Pasaje · banda ficticia';
  t.gangName30=t.name;
  stage30.gangs.push({name:t.name,x:t.x,z:t.z,r:t.r});
 }
 for(const [i,a] of city.actors.filter(a=>a.role==='gang').entries()){
  a.rounds25=i%3===0?5:8;a.group30=a.zone.name;
 }
 stage30.policeMeshes=0;
}
