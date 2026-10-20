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
 // Pool fijo de 18 autos/motos/caponeras: tres de cada tipo. Al cambiar
 // de barrio se REUTILIZAN las mismas instancias, sin crear modelos nuevos.
 let number=0;
 const centers=[-111,-37,37,111],levels=[-148,-74,0,74,148,222];
 for(let i=0;i<18;i++){
  const id=classes[i%classes.length],axis=i%3===0?'x':'z';
  const center=centers[(Math.floor(i/2)+i)%centers.length];
  const lane=center+(i%2?2.8:-2.8),along=levels[(i*5)%levels.length];
  const x=axis==='x'?along:lane,z=axis==='z'?along:lane;
  const v=createVehicle(id,x,z,0,number++);
  v.traffic=true;v.streamV4=true;v.retired28=false;v.trafficSpeed=0;
  v.route={axis,lane,min:-210,max:230,target:i%2?1:-1};
  if(!inWorld(x,z)||blocked(x,z,v.width*.52,v,true)){
   v.root.position.set(1800+i*7,0,1800);
   v.streamV4NeedsPlace=true;
  }
 }
 const positions=[[-34,111],[-29.5,111],[-25,111],[-20,111],[-34,122],[-28,122]];
 for(let i=0;i<classes.length;i++){
  const [x,z]=positions[i],v=createVehicle(classes[i],x,z,0,number++);
  v.garage=true;v.traffic=false;
 }
 current=fleet.find(v=>v.garage&&v.name==='hilux');
}
