function installArchitecture34(){
 const a=assetMats,wall=pbr('Estuco de vivienda nueva34','#ddd3b7',.97),block=pbr('Hormigón aparente34','#bdb9ae',.98),brick=pbr('Ladrillo del portal34','#e2c9ac',.96),floor=pbr('Losa de portal34','#d6ccb5',.95),zinc=pbr('Zinc de vivienda34','#babbb4',.8,.6),glass=pbr('Vidrio retranqueado34','#203739',.3,.1);
 material34(wall,'estuco_ia',2.6,'#eee4c9');material34(block,'concrete_wall_007',2.5);material34(brick,'brick_wall_001',2.2);material34(floor,'concrete_floor',2.5);material34(zinc,'corrugated_iron',1.65);
 const terrain=pbr('Terreno residencial extendido34','#cfbea2',.99);material34(terrain,'brown_mud_dry',4,'#cfbea2');const land=B.MeshBuilder.CreateGround('Terreno bajo viviendas34',{width:168,height:62},scene);land.position.set(-346,.001,-63);land.material=terrain;land.receiveShadows=true;land.isPickable=false;projectUV34(land,4);const landRoot=new B.TransformNode('Suelo residencial conectado34',scene);land.parent=landRoot;registerDetail31(landRoot,-346,-63,200);
 const passage=pbr('Pasaje residencial de tierra34','#b3a287',1);material34(passage,'brown_mud_dry',3,'#b3a287');const lane=makeDetailGroup('Pasaje hacia viviendas34',({box})=>{box('Acceso norte sur34',-391,.022,-22,5,.025,118,passage);box('Pasaje frente a casas34',-350,.022,-61,86,.025,4.5,passage);});registerDetail31(lane,-360,-30,180);
 const positions=[[-353,-19],[-329,-19],[-305,-19],[-376,-49],[-352,-49],[-328,-49],[-304,-49],[-397,-25],[-397,-53]];
 for(const [x,z] of positions){if(stage34.architecture.length>=6)break;const w=9,d=8,h=3.05,thick=.24,front=z-d/2,y=groundAt(x,z);if(data.boxes.some(b=>x+w/2+1>b[0]&&x-w/2-1<b[2]&&z+d/2+2>b[1]&&z-d/2-2<b[3]))continue;const k=stage34.architecture.length,tint=['#ded4b9','#abbea9','#d2b1a0','#b8c6c4','#dfcea3','#afb5c6'][k];const paint=pbr('Fachada variante34 '+k,tint,.97);material34(paint,k%2?'painted_plaster_wall':'estuco_ia',2.6,tint);
 const root=makeDetailGroup('Casa con muros de 24 cm34 '+k,({box,cylinder})=>{
 box('Losa maciza34',x,y+.08,z,w+.4,.16,d+.6,floor);box('Muro posterior34',x,y+h/2,z+d/2,w,h,thick,paint);for(const side of [-1,1])box('Muro lateral34',x+side*w/2,y+h/2,z,thick,h,d,paint);
 // The facade is assembled around openings, including real returns/reveals.
 const openings=[{x:x-2.75,w:1.4,bottom:.95,top:2.22},{x:x,w:1.13,bottom:0,top:2.28},{x:x+2.75,w:1.4,bottom:.95,top:2.22}];let edge=x-w/2;
 for(const o of openings){const left=o.x-o.w/2,right=o.x+o.w/2;if(left>edge)box('Paño de pared34',(edge+left)/2,y+h/2,front,left-edge,h,thick,paint);if(o.bottom>0)box('Antepecho34',o.x,y+o.bottom/2,front,o.w,o.bottom,thick,paint);box('Dintel macizo34',o.x,y+(h+o.top)/2,front,o.w,h-o.top,thick,paint);for(const s of [-1,1])box('Jamba con retorno34',o.x+s*(o.w/2+.055),y+(o.top+o.bottom)/2,front-.035,.11,o.top-o.bottom,.32,block);if(o.bottom){box('Ventana dentro del vano34',o.x,y+(o.bottom+o.top)/2,front+.09,o.w-.08,o.top-o.bottom-.08,.04,glass);box('Alféizar de cemento34',o.x,y+o.bottom-.025,front-.08,o.w+.18,.10,.42,block);for(let n=-2;n<=2;n++)box('Reja exterior34',o.x+n*.23,y+(o.bottom+o.top)/2,front-.20,.026,o.top-o.bottom+.1,.026,a.steel);}else box('Puerta retranqueada34',o.x,y+1.10,front+.085,o.w-.07,2.2,.07,a.toolWood);edge=right;}
 if(edge<x+w/2)box('Último paño34',(edge+x+w/2)/2,y+h/2,front,x+w/2-edge,h,thick,paint);
 box('Losa del corredor34',x,y+.10,front-1.15,w+.3,.18,2.2,floor);for(const side of [-1,1]){box('Pilar grueso de portal34',x+side*3.7,y+1.5,front-1.6,.30,3,.30,k%2?brick:block);box('Pedestal de pilar34',x+side*3.7,y+.3,front-1.6,.44,.6,.44,block);}
 box('Viga de portal34',x,y+2.95,front-1.6,w+.3,.26,.32,block);box('Fascia de borde34',x,y+3.18,front-1.94,w+.7,.22,.14,block);
 if(k%2){for(const side of [-1,1]){const roof=box('Techo de zinc a dos aguas34',x+side*w*.25,y+h+.35,z,w*.55,.08,d+4,zinc);roof.rotation.z=-side*.15;}box('Cumbrera de zinc34',x,y+h+.72,z,.20,.08,d+4,zinc);}else{box('Cubierta de losa34',x,y+h+.09,z-1.0,w+.7,.19,d+3.1,block);for(const side of [-1,1])box('Pretil lateral34',x+side*(w/2+.15),y+h+.30,z,.17,.38,d+2.8,paint);box('Pretil frontal34',x,y+h+.30,front-1.92,w+.6,.38,.17,paint);}
 box('Escalón de acceso34',x,y+.035,front-2.4,2.4,.09,.45,floor);box('Zócalo de frente34',x,y+.15,front-.025,w,.3,.29,block);box('Bajante de lluvia34',x+w/2-.1,y+1.5,front-.27,.07,3,.07,a.steel);
 });registerDetail31(root,x,z,125);stage34.architecture.push(root);addWorldBox(x,z,w,d);data.buildings.push({x,y:z,w,d,h,type:'Vivienda34 · diseño original'});stage34.architectureMeshes+=root.getChildMeshes().length;
 }
 const pavers=pbr('Adoquín de corredor34','#cac0aa',.95);pavers.albedoTexture=pavers33();const green=stage34.families.aerial_grass_rock,dirt=stage34.families.brown_mud_dry;
 for(let i=0;i<8;i++){const x=-388+(i%4)*25,z=-75+Math.floor(i/4)*15;if(blocked(x,z,1,null,true))continue;const mat=pbr('Suelo de solar34 '+i,'#fff',1);material34(mat,i%3?'brown_mud_dry':'aerial_grass_rock',3.5);const m=B.MeshBuilder.CreateGround('Suelo con textura34 '+i,{width:9,height:7},scene);m.position.set(x,groundAt(x,z)+.018,z);m.material=mat;m.receiveShadows=true;m.isPickable=false;const root=new B.TransformNode('Solar texturado34 '+i,scene);m.parent=root;projectUV34(m,3.5);registerDetail31(root,x,z,85);}

 // La ampliación de oficinas/hotel sucede después de la construcción de las casitas.
 installModernBlocks52();
}

// Etapa 52: primeras tres tipologías contemporáneas a partir del segundo video.
// Parcelas auditadas en sector litoral sureste, expansión oriental y zona norte.
// Sin desplazar una vivienda sin malla y colisión individual atribuibles.
// La selección es determinista y verifica tanto las casas como TODOS los sólidos.
function installModernBlocks52(){
 if(stage34.modern52)return;
 const modern={sites:[],blocked:0,reasons:{},styles:['hotel-teja','oficina-vidrio','mixto-blanco'],replacedHomes:0,originalBuildings:data.buildings.length};
 stage34.modern52=modern;
 const cross=[-185,-111,-37,37,111,185];
 const roads=cross.flatMap(c=>[{axis:'x',center:c,width:11},{axis:'z',center:c,width:11}]);
 const protectedSites=[{x:72,z:308,radius:42},{x:79,z:403,radius:34},
  {x:-15,z:-284,radius:29},{x:-74,z:-284,radius:33},{x:-148,z:-285,radius:32},
  {x:57,z:-285,radius:31},{x:37,z:-37,radius:36}];
 const types=[
  {type:'hotel-teja',label:'Hotel urbano de teja terracota52',seedX:147,seedZ:-249,w:11,d:9,floors:7},
  {type:'oficina-vidrio',label:'Edificio de oficinas azul52',seedX:280,seedZ:67,w:11,d:9,floors:8},
  {type:'mixto-blanco',label:'Edificio blanco comercial52',seedX:-6,seedZ:300,w:11,d:9,floors:6}
 ];
 const stucco=pbr('Estuco marfil moderno52','#dfd8c6',.93),white=pbr('Hormigón blanco moderno52','#e0e3dc',.94),
  roof=pbr('Teja terracota de hotel52','#b96a4c',.88),blue=pbr('Vidrio azul urbano52','#23485c',.27,.14),
  shade=pbr('Marcos grafito moderno52','#3b4a4e',.78),terrace=assetMats.monument;
 const concrete=surfaceTextures31.concrete_wall_003;
 if(concrete?.diff){stucco.albedoTexture=concrete.diff;white.albedoTexture=concrete.diff;}
 blue.environmentIntensity=.50;
 const candidateOffsets=[[0,0]];
 for(let ring=6;ring<=42;ring+=6)for(let k=-ring;k<=ring;k+=6){
  candidateOffsets.push([k,-ring],[k,ring],[-ring,k],[ring,k]);
 }
 const seen=new Set();
 for(const spec of types){
  let lot=null;
  for(const [dx,dz] of candidateOffsets){
   const x=spec.seedX+dx,z=spec.seedZ+dz,key=x+','+z;
   if(seen.has(spec.type+key))continue;seen.add(spec.type+key);
   const edge=1.4;
   if(!inWorld(x-spec.w/2-edge,z-spec.d/2-edge)||!inWorld(x+spec.w/2+edge,z+spec.d/2+edge))continue;
   const result=planUrbanParcel51({x,z,w:spec.w,d:spec.d,buffer:edge},
    data.buildings,data.boxes,roads,protectedSites);
   if(!result.approved){modern.blocked++;modern.reasons[result.reason]=(modern.reasons[result.reason]||0)+1;continue;}
   // Esta primera versión usa solares libres; los derribos quedarán habilitados
   // solo cuando mallas de zonas, techos, detalles y colisiones tengan dueño.
   if(result.replacements.length)continue;
   lot={x,z,assessment:result};break;
  }
  if(!lot)continue;
  const {x,z}=lot,h=spec.floors*3.1,base=groundAt(x,z),
    faceRoad=cross.reduce((p,r)=>Math.abs(r-z)<Math.abs(p-z)?r:p,cross[0]),
    front=faceRoad>z?1:-1,d=spec.d,w=spec.w;
  const root=makeDetailGroup(spec.label,({box})=>{
   box('Basamento con textura52',x,base+.25,z,w+.30,.5,d+.30,terrace);
   const mass=spec.type==='hotel-teja'?stucco:white;
   box('Núcleo de edificio moderno52',x,base+h/2+.5,z,w,h,d,mass);
   const frontZ=z+front*(d/2+.045);
   // Vistas hacia la avenida: vidrio real de fachada con marcos y
   // antepechos/rellanos a escala de pisos; no pegatinas de ventanas.
   const perFloor=spec.type==='mixto-blanco'?4:5;
   const step=w/(perFloor+1);
   for(let floor=1;floor<=spec.floors;floor++){
    const iy=base+.5+(floor-.5)*3.1;
    box('Cornisa lineal por piso52',x,base+.5+floor*3.1,frontZ+front*.08,w+.36,.17,.24,
      spec.type==='oficina-vidrio'?shade:terrace);
    for(let col=1;col<=perFloor;col++){
     const px=x-w/2+col*step;
     box('Ventana urbana con cristal52',px,iy+.16,frontZ+front*.09,Math.min(1.65,step-.35),1.70,.10,blue);
     box('Dintel de ventana urbana52',px,iy+1.09,frontZ+front*.16,Math.min(1.8,step-.23),.12,.18,mass);
     if(spec.type!=='oficina-vidrio'&&col%2===0)
      box('Barandal de balcón moderno52',px,iy-.76,frontZ+front*.52,Math.min(1.8,step-.30),.09,.12,shade);
    }
    // Ventanas laterales; la cara no se repite como una fachada completamente plana.
    for(const side of [-1,1])for(const row of [-1,1]){
     box('Ventanal lateral urbano52',x+side*(w/2+.06),iy+.10,z+row*d*.24,.10,1.58,1.40,blue);
    }
   }
   box('Pórtico peatonal retranqueado52',x,base+1.68,frontZ+front*.13,4.1,2.7,.16,shade);
   box('Entrada cristal de edificio52',x,base+1.61,frontZ+front*.26,2.8,2.6,.07,blue);
   box('Alero de entrada moderno52',x,base+3.27,frontZ+front*.85,5.1,.19,1.75,mass);
   box('Acera de portal moderno52',x,base+.045,frontZ+front*1.21,w*.73,.09,1.7,terrace);
   if(spec.type==='hotel-teja'){
    for(const side of [-1,1]){
     const t=box('Tejado inclinado terracota52',x+side*w*.25,base+h+1.30,z,w*.54,.19,d+1.65,roof);
     t.rotation.z=-side*.19;
    }
    box('Cumbrera terracota hotel52',x,base+h+2.12,z,.30,.16,d+1.7,roof);
    for(const side of [-1,1])box('Pilastra hotel de teja52',x+side*(w/2-.9),base+h*.52,z+front*(d/2+.17),.46,h-.4,.32,stucco);
   }else{
    box('Azotea técnica52',x,base+h+.57,z,w+.4,.24,d+.3,white);
    box('Caseta de mantenimiento52',x+w*.25,base+h+1.27,z-d*.20,3.3,1.4,2.6,mass);
    for(const side of [-1,1]){
     box('Moldura vertical de fachada52',x+side*(w/2-.45),base+h*.50+.5,frontZ+front*.20,.36,h,.30,shade);
    }
    if(spec.type==='oficina-vidrio'){
     // Banda de cristal vertical para una identidad distinta de la torre blanca.
     box('Vestíbulo acristalado52',x,base+2,z+d*.07,w-1.5,3.4,d*.75,blue);
    }
   }
  });
  registerDetail31(root,x,z,quality==='low'?125:180);
  addWorldBox(x,z,w,d);
  data.buildings.push({x,y:z,w,d,h,type:'Edificio moderno52 · '+spec.type});
  data.places.push([spec.label,x,z+front*(d/2+2.5)]);
  modern.sites.push({type:spec.type,x,z,w,d,h,front,drawMeshes:root.getChildMeshes().length});
 }
 modern.count=modern.sites.length;
}

// Resolution control is deterministic feedback, not a neural network.
