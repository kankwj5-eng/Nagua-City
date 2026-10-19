// Flota definitiva: solo seis modelos GLB nuevos sobre las calles originales.
async function installFleet(){
 await originalV4.prepare('cars');
 const specs=originalV4.spec().vehicles;
 const classes=['hilux','landcruiser','pulsar','taypan','mototaxi-roja','canonera-abierta'];
 const names=new Set(specs.map(x=>x.id));
 if(classes.some(id=>!names.has(id))||names.size!==6)throw Error('Flota nueva incompleta');
 for(const m of specs){
  const motor=m.type==='moto',caponera=m.type==='caponera';
  descriptions[m.id]=[m.name||m.id,'Vehículo original de Nicaragua V4',motor?'Motocicleta':caponera?'Caponera':'Camioneta'];
  VEHICLE_PROFILES[m.id]={label:m.name||m.id,variant:descriptions[m.id][2],source:null,
   runningMassKg:motor?160:caponera?440:2300,hp:motor?19:caponera?12:140,
   torqueNm:motor?15:caponera?12:400,peakRpm:motor?8000:4200,
   maxSpeed:motor?27:caponera?14:33,brake:8.5,grip:.85};
 }
 let number=0;
 const roads=[-111,-37,37,111],rows=[-148,-74,0,74,148,222];
 for(let j=0;j<rows.length;j++)for(let i=0;i<roads.length;i++){
  const x=roads[i]+(j%2?2.8:-2.8),z=rows[j],id=classes[(i+j*3)%6];
  if(!inWorld(x,z)||blocked(x,z,.75,null,false))continue;
  const v=createVehicle(id,x,z,j%2?Math.PI:0,number++);
  v.traffic=true;v.trafficSpeed=0;
  v.route={axis:'z',lane:x,min:-182,max:184,target:j%2?1:-1};
 }
 const positions=[[-34,111],[-29.5,111],[-25,111],[-20,111],[-34,122],[-28,122]];
 for(let i=0;i<classes.length;i++){
  const [x,z]=positions[i],v=createVehicle(classes[i],x,z,0,number++);
  v.garage=true;v.traffic=false;
 }
 current=fleet.find(v=>v.garage&&v.name==='hilux');
}
