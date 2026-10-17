function installRoad33(){
 const asphalt=pbr('Asfalto reparado33','#444748',.97),paving=pbr('Adoquín de accesos33','#a3967f',.96),soil=pbr('Borde de tierra33','#968065',1);
 asphalt.albedoTexture=tile31('Grano asfalto33','#525555','stone');paving.albedoTexture=pavers33();soil.albedoTexture=tile31('Arena compactada33','#99866a','soil');
 for(let i=0;i<18;i++){const x=[-185,-111,-37,37,111,185][i%6]+(i%2?3:-3),z=-164+Math.floor(i/6)*145;
 const root=makeDetailGroup('Reparaciones del pavimento33 '+i,({box})=>{box('Parche de asfalto33',x,.028,z,2.4+(i%3)*.35,.013,4.3,asphalt);});registerDetail31(root,x,z,92);stage33.roadPatches++;}
 for(let i=0;i<12;i++){const x=-361+(i%4)*23,z=-8+Math.floor(i/4)*49;
 const root=makeDetailGroup('Acceso de barrio33 '+i,({box,cylinder})=>{box('Acceso adoquinado33',x,.039,z,2.2,.04,3.3,paving);box('Tierra junto al acceso33',x+1.3,.027,z,.3,.02,3.3,soil);for(const k of [-1,1]){cylinder('Bolardo de acceso33',x+k*1.25,.38,z-1.5,.055,.7,assetMats.steel);}});registerDetail31(root,x,z,85);stage33.details++;}
 // Reuse existing leaf textures/materials and streamed vegetation geometry.
 for(let i=0;i<12;i++){const x=-397+(i%4)*29,z=-13+Math.floor(i/4)*52;if(!blocked(x,z,.4,null,false))grassPatch31(x,z,130+i,pbrSharedGrass31());}
 installOverpass50();
}


// Paso a desnivel urbano: dos niveles de circulación, malla ligera fusionada.
function installOverpass50(){
 if(overpass50.installed)return;
 const {x,z,halfLength,halfWidth}=overpass50;
 const asphalt=pbr('Asfalto superior puente50','#434747',.99);
 const texture=surfaceTextures31.asphalt_03;
 if(texture?.diff){asphalt.albedoTexture=texture.diff;asphalt.bumpTexture=texture.nor_gl;asphalt.invertNormalMapY=true;if(asphalt.bumpTexture)asphalt.bumpTexture.level=.18;}
 const concrete=pbr('Hormigón viaducto50','#9d9d94',.96);
 const marking=assetMats.white,metal=assetMats.steel;
 const pillars=[];
 overpass50.installed=true;
 const root=makeDetailGroup('Paso a desnivel de Managua · dos alturas50',({box})=>{
  const divisions=44,section=halfLength*2/divisions;
  for(let i=0;i<divisions;i++){
   const z0=z-halfLength+i*section,z1=z0+section,mid=(z0+z1)*.5;
   const h0=roadSurface50(x,z0,true),h1=roadSurface50(x,z1,true);
   const hm=(h0+h1)*.5,angle=-Math.atan2(h1-h0,section);
   const pavement=box('Tablero vehicular50',x,hm-.055,mid,halfWidth*2,.18,section+.035,asphalt);
   pavement.rotation.x=angle;
   // Cara inferior continua de hormigón (unida al tablero), solo en tramo alto.
   // El cruce de abajo mantiene gálibo y los colisionadores 2D no se modifican.
   if(overpassRise50(mid)>1.2){
    const underside=box('Intradós de hormigón del viaducto53',x,hm-.265,mid,halfWidth*2+.18,.24,section+.035,concrete);
    underside.rotation.x=angle;
   }
   // Líneas continuas sobre la propia rampa, sin texturas repetidas ni
   // colisión en falso con la circulación inferior.
   for(const side of [-1,1]){
    const edge=box('Línea blanca de borde51',x+side*(halfWidth-.42),hm+.045,mid,.105,.013,section+.016,marking);
    edge.rotation.x=angle;
   }
   // Pantallas ligeras fuera del espacio de rodaje. No se añaden colisiones
   // bidimensionales en los bordes para no bloquear la calle que cruza abajo.
   if(overpassRise50(mid)>.75)for(const side of [-1,1]){
    const wall=box('Pretil lateral50',x+side*(halfWidth+.21),hm+.38,mid,.27,.72,section+.025,concrete);
    wall.rotation.x=angle;
   }
   if(i%3===0){
    const stripe=box('Línea discontinua central50',x,hm+.049,mid,.12,.015,section*.52,marking);
    stripe.rotation.x=angle;
   }
  }
  // Dos pares de columnas de hormigón lejos de la calzada transversal z=-37.
  for(const dz of [-25,25])for(const side of [-1,1]){
   const px=x+side*6.10,pz=z+dz;
   if(blocked(px,pz,.52,null,false))continue;
   const base=groundAt(px,pz),top=roadSurface50(x,pz,true)-.18;
   if(top-base<3.2)continue;
   box('Pilar del viaducto50',px,base+(top-base)*.5,pz,.78,top-base,.82,concrete);
   box('Cabezal de apoyo50',px,top-.12,pz,1.2,.33,2.4,concrete);
   pillars.push([px,pz]);
  }
  // Pequeños captafaros fijados a la cara exterior de las barreras, sin luces.
  for(const dz of [-48,-24,0,24,48])for(const side of [-1,1]){
   box('Captafaros pasivos del pretil53',
    x+side*(halfWidth+.39),roadSurface50(x,z+dz,true)+.53,z+dz,.065,.17,.34,marking);
  }
  // Paso peatonal transversal sobre la calle INFERIOR. Pintura a ras de asfalto,
  // sin bolardos, falsos muros ni nada que cierre el carril existente.
  for(const offset of [-16,16])for(let stripe=-5;stripe<=5;stripe++){
   const px=x+offset,pz=z+stripe*.77;
   box('Cebra de paso inferior53',px,groundAt(px,pz)+.033,pz,.98,.012,.49,marking);
  }
  for(const dz of [-19,19]){
   const pz=z+dz,top=roadSurface50(x,pz,true)-.29;
   box('Viga transversal de puente50',x,top,pz,halfWidth*2+.5,.42,.48,concrete);
  }
 });
 registerDetail31(root,x,z,150);
 // Solo los apoyos macizos entran en la cuadrícula de colisiones 2D.
 for(const [px,pz] of pillars)addWorldBox(px,pz,.78,.82);
 data.places.push(['Paso a desnivel · avenida central (diseño inspirado)',x+8,z-7]);
 overpass50.pillars=pillars.length;
 beautifyOverpass51();
}

// Primer acabado de jardinería junto al viaducto, inspirado en el video aéreo.
// Son aceras/isletas fuera del cruce; no altera la rotonda original ni sus casas.
function beautifyOverpass51(){
 if(overpass50.landscape51!==undefined)return;
 const {x,z}=overpass50;
 const candidates=[[-12.4,-23],[12.4,-23],[-12.4,23],[12.4,23],
                   [-13.2,-48],[13.2,-48],[-13.2,48],[13.2,48]];
 const patches=[];
 const streetCenters=[-185,-111,-37,37,111,185];
 for(const [dx,dz] of candidates){
  const px=x+dx,pz=z+dz,w=3.1,d=4.0,padding=.65;
  if(!inWorld(px-w/2-padding,pz-d/2-padding)||!inWorld(px+w/2+padding,pz+d/2+padding))continue;
  if(streetCenters.some(c=>Math.abs(px-c)<8.0||Math.abs(pz-c)<8.0))continue;
  const area=[px-w/2-padding,pz-d/2-padding,px+w/2+padding,pz+d/2+padding];
  const overlap=(b)=>area[0]<b[2]&&area[2]>b[0]&&area[1]<b[3]&&area[3]>b[1];
  if(data.boxes.some(overlap))continue;
  if(data.buildings.some(b=>b.w>0&&b.d>0&&overlap([b.x-b.w/2,b.y-b.d/2,b.x+b.w/2,b.y+b.d/2])))continue;
  if(blocked(px,pz,.55,null,false))continue;
  patches.push({x:px,z:pz,w,d,y:groundAt(px,pz)});
 }
 if(patches.length){
  const soil=assetMats.houseBase,curb=assetMats.monument,green=pbrSharedGrass31();
  const root=makeDetailGroup('Isletas verdes despejadas del paso a desnivel51',({box})=>{
   for(const p of patches){
    box('Base de bordillo en isleta51',p.x,p.y+.055,p.z,p.w+.24,.11,p.d+.24,curb);
    box('Tierra de jardinera51',p.x,p.y+.122,p.z,p.w,.035,p.d,soil);
    box('Cubierta de zacate de isleta51',p.x,p.y+.145,p.z,p.w-.23,.014,p.d-.28,green);
   }
  });
  registerDetail31(root,x,z,155);
  // Isletas reales, fuera de las calzadas, impiden plantas superpuestas futuras.
  for(const p of patches)addWorldBox(p.x,p.z,p.w+.24,p.d+.24);
 }
 overpass50.landscape51=patches.length;
}
