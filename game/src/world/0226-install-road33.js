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
 const wallFinish=surfaceTextures31.concrete_wall_003;
 if(wallFinish?.diff){concrete.albedoTexture=wallFinish.diff;concrete.bumpTexture=wallFinish.nor_gl;}
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
   // La losa inferior continua se apoya contra el asfalto y deja visibles las
   // nervaduras espaciadas. Sin crear colisión 2D: deben pasar carros por debajo.
   if(overpassRise50(mid)>1.2){
    const soffit=box('Intradós continuo de hormigón54',x,hm-.225,mid,
     halfWidth*2+.18,.16,section+.035,concrete);
    soffit.rotation.x=angle;
   }
   // Líneas continuas sobre la propia rampa, sin texturas repetidas ni
   // colisión en falso con la circulación inferior.
   for(const side of [-1,1]){
    const edge=box('Línea blanca de borde51',x+side*(halfWidth-.42),hm+.045,mid,.105,.013,section+.016,marking);
    edge.rotation.x=angle;
   }
   // Pantallas ligeras fuera del espacio de rodaje. No se añaden colisiones
   // bidimensionales en los bordes para no bloquear la calle que cruza abajo.
   if(overpassRise50(mid)>.75&&Math.abs(mid-z)>overpass50.pedWidth57+1.4)for(const side of [-1,1]){
    const wall=box('Pretil lateral50',x+side*(halfWidth+.21),hm+.38,mid,.27,.72,section+.025,concrete);
    wall.rotation.x=angle;
   }
   if(i%3===0){
    const stripe=box('Línea discontinua central50',x,hm+.049,mid,.12,.015,section*.52,marking);
    stripe.rotation.x=angle;
   }
   // Juntas y drenajes visibles, discretos y a ras de asfalto.
   // Evitar apoyos nuevos sobre la vía que cruza por debajo.
   if(i>3&&i<divisions-3&&i%7===0){
    const seam=box('Junta transversal del tablero53',x,hm+.041,mid,halfWidth*2-.5,.017,.075,metal);
    seam.rotation.x=angle;
   }
   if(overpassRise50(mid)>3&&i%7===0){
    const rib=box('Nervadura de hormigón bajo tablero53',x,hm-.28,mid,halfWidth*2+.22,.24,.28,concrete);
    rib.rotation.x=angle;
   }
   if(overpassRise50(mid)>.75&&Math.abs(mid-z)>overpass50.pedWidth57+1.4&&i%5===0){
    for(const side of [-1,1]){
     const reflector=box('Reflector pasivo sobre pretil53',x+side*(halfWidth+.39),hm+.53,mid,.045,.18,1.1,marking);
     reflector.rotation.x=angle;
    }
   }
  }
  // Acercamientos con señales direccionales y conexión visual hasta la vía
  // existente. Las marcas están al nivel real del asfalto en cada transición,
  // sin colisionadores ni pavimento duplicado sobre las casas del barrio.
  for(const direction of [-1,1])for(const distance of [57,72]){
   const pz=z+direction*distance;
   for(const lane of [-1,1]){
    const px=x+lane*2.20,grade=roadSurface50(px,pz,true);
    const forward=lane===-1?1:-1;
    const stem=box('Flecha de aproximación del viaducto55',px,grade+.047,pz,
     .12,.012,1.08,marking);
    for(const side of [-1,1]){
     const head=box('Punta de flecha vial55',px+side*.27,grade+.048,
      pz+forward*.61,.10,.012,.72,marking);
     head.rotation.y=side*forward*.65;
    }
   }
  }
  // Línea de carril a ras de pavimento en ambos empalmes con la calle base;
  // estos remates no añaden una segunda calzada ni hacen saltar vehículos.
  for(const direction of [-1,1])for(const distance of [67.5,71,74.5]){
   const pz=z+direction*distance,grade=groundAt(x,pz);
   for(const side of [-1,1])box('Continuidad de arcén en acceso55',
    x+side*(halfWidth-.42),grade+.041,pz,.105,.014,2.9,marking);
   box('Separación central discontinua en acceso55',x,grade+.042,pz,
    .12,.014,1.65,marking);
  }
  // Rejillas de drenaje fuera de la franja de rodaje y por dentro del pretil.
  // La altura acompaña a la rampa y no bloquea el tránsito inferior.
  for(const distance of [-30,-18,18,30])for(const side of [-1,1]){
   const pz=z+distance,px=x+side*(halfWidth-.48),grade=roadSurface50(px,pz,true);
   const gutter=box('Rejilla de drenaje en tablero55',px,grade+.042,pz,
    .21,.014,.52,metal);
   gutter.rotation.x=-(roadSurface50(px,pz+.26,true)-roadSurface50(px,pz-.26,true))/.52;
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
  // Dos cruces pintados sobre la avenida este-oeste, antes y después del
  // nudo bajo el puente. Ninguno agrega muro ni obstáculo al tránsito.
  for(const offset of [-16,16])for(let stripe=-5;stripe<=5;stripe++){
   const px=x+offset,pz=z+stripe*.77;
   box('Paso peatonal del nivel inferior54',px,groundAt(px,pz)+.033,pz,
    .98,.012,.49,marking);
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
 installPedestrianCross57();
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
    // Dos grupos de plantas compactas por jardinera. La copa queda baja para
    // respetar visibilidad, calzada, pasos de peatones y postes existentes.
    for(const side of [-1,1]){
     const bx=p.x+side*.76,bz=p.z+side*.63;
     box('Tronco compacto de arbusto55',bx,p.y+.39,bz,.13,.46,.13,soil);
     box('Follaje tropical bajo de isleta55',bx,p.y+.69,bz,.75,.57,.80,green);
     box('Franja de hojas tropicales55',bx,p.y+.93,bz,.40,.13,.50,green);
    }
   }
  });
  registerDetail31(root,x,z,155);
  // Isletas reales, fuera de las calzadas, impiden plantas superpuestas futuras.
  for(const p of patches)addWorldBox(p.x,p.z,p.w+.24,p.d+.24);
 }
 overpass50.landscape51=patches.length;
}


// Fase 57: pasarela este-oeste en cruz con el puente norte-sur existente.
// No se modifica la textura ni la geometría de las calles comunes.
function installPedestrianCross57(){
 if(overpass50.cross57)return;
 const {x,z,pedHalf57,pedWidth57,halfWidth}=overpass50;
 overpass50.cross57=true;
 const paving=pbr('Pavimento peatonal mineral del puente57','#b5aaa0',.94);
 const shared=surfaceTextures31.concrete_wall_003;
 if(shared?.diff){paving.albedoTexture=shared.diff;paving.bumpTexture=shared.nor_gl;}
 const stone=assetMats.monument,steel=assetMats.steel,white=assetMats.white,green=pbrSharedGrass31();
 const root=makeDetailGroup('Pasarela elevada este-oeste en cruz57',({box})=>{
  const sections=40,length=pedHalf57*2/sections;
  for(let i=0;i<sections;i++){
   const ax=x-pedHalf57+i*length,bx=ax+length,mid=(ax+bx)/2;
   if(Math.abs(mid-x)<halfWidth+.5)continue;
   const y0=groundAt(ax,z)+pedRise57(ax),y1=groundAt(bx,z)+pedRise57(bx);
   const y=(y0+y1)/2,grade=Math.atan2(y1-y0,length);
   const slab=box('Losa peatonal texturada este-oeste57',mid,y-.10,z,length+.025,.20,pedWidth57*2,paving);
   slab.rotation.z=grade;
   if(pedRise57(mid)>.75)for(const side of [-1,1]){
    const rail=box('Pretil exterior pasarela57',mid,y+.38,z+side*(pedWidth57+.18),length+.025,.74,.22,stone);
    rail.rotation.z=grade;
    const guide=box('Banda guía peatonal57',mid,y+.024,z+side*(pedWidth57-.35),length+.02,.018,.10,white);
    guide.rotation.z=grade;
   }
   if(i%6===0&&pedRise57(mid)>1)for(const side of [-1,1]){
    const r=box('Reflector pasivo de pasarela57',mid,y+.54,z+side*(pedWidth57+.31),.36,.10,.035,white);
    r.rotation.z=grade;
   }
  }
  for(let i=-5;i<=5;i++)
   box('Cebra del cruce peatonal elevado57',x+i*.72,roadSurface50(x,z,true)+.052,z,
    .44,.015,pedWidth57*2-.35,white);
  // Faroles pasivos: sin luces dinámicas ni coste adicional de sombras.
  for(const dx of [-41,-22,22,41])for(const side of [-1,1]){
   const px=x+dx,grade=groundAt(px,z)+pedRise57(px),pz=z+side*(pedWidth57+.52);
   box('Poste de pasarela57',px,grade+1.12,pz,.09,2.24,.09,steel);
   box('Luminaria pasiva de pasarela57',px,grade+2.24,pz,.65,.12,.24,white);
  }
 });
 registerDetail31(root,x,z,145);
 const squares=[];
 for(const sx of [-1,1])for(const sz of [-1,1]){
  const px=x+sx*14.2,pz=z+sz*13.5,w=7.8,d=7.6,pad=.6;
  const area=[px-w/2-pad,pz-d/2-pad,px+w/2+pad,pz+d/2+pad];
  const overlap=b=>area[0]<b[2]&&area[2]>b[0]&&area[1]<b[3]&&area[3]>b[1];
  if(!inWorld(area[0],area[1])||!inWorld(area[2],area[3]))continue;
  if(data.boxes.some(overlap)||data.buildings.some(b=>b.w>0&&b.d>0&&overlap([b.x-b.w/2,b.y-b.d/2,b.x+b.w/2,b.y+b.d/2])))continue;
  if(blocked(px,pz,2,null,false))continue;
  squares.push({x:px,z:pz,w,d,y:groundAt(px,pz)});
 }
 if(squares.length){
  const plaza=makeDetailGroup('Plazoletas urbanas bajo el cruce57',({box})=>{
   for(const p of squares){
    box('Solado mineral de plazoleta57',p.x,p.y+.035,p.z,p.w,.05,p.d,paving);
    for(const side of [-1,1]){
     box('Borde de jardín urbano57',p.x+side*2.8,p.y+.16,p.z,.65,.29,5.2,stone);
     box('Macetero tropical bajo57',p.x+side*2.8,p.y+.34,p.z,.51,.15,4.8,green);
    }
    box('Banco de plazoleta57',p.x,p.y+.43,p.z+1.5,2.0,.16,.55,stone);
    box('Respaldo de banco57',p.x,p.y+.74,p.z+1.74,2.0,.55,.12,steel);
    box('Árbol urbano bajo57',p.x+1.3,p.y+1.25,p.z-1.6,.22,2.4,.22,stone);
    box('Copa tropical de plazoleta57',p.x+1.3,p.y+2.60,p.z-1.6,1.55,.65,1.55,green);
   }
  });
  registerDetail31(plaza,x,z,145);
 }
 overpass50.plazas57=squares.length;
}
