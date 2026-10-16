function installDistrict31(){const a=assetMats,leaf=pbr('Guineo nervadura31','#749c39',.89),bark=pbr('Vainas de guineo31','#8c9956',.96),fruit=pbr('Racimo de guineos31','#799938',.9),grass=pbr('Zacate verde seco31','#707941',.98);leaf.albedoTexture=tile31('Nervadura de guineo31','#6c923b','leaf');leaf.backFaceCulling=false;grass.backFaceCulling=false;bark.albedoTexture=fabric('Vainas fibrosas31','#9da266','wood');
 for(let i=0;i<18;i++){const x=-392+(i%6)*21,z=i<6?4:i<12?96:62;banana31(x,z,2.3+(i%4)*.23,i,leaf,bark,fruit);}
 for(let i=0;i<48;i++){const x=-399+(i%12)*11,z=[-1,6,94,101][Math.floor(i/12)]+Math.sin(i)*1.4;if(!blocked(x,z,.2,null,true))grassPatch31(x,z,i,grass);}
 const soil=pbr('Tierra compactada31','#a8875c',.99);soil.albedoTexture=tile31('Tierra con huellas31','#a78b62','soil');soil.albedoTexture.uScale=2;soil.albedoTexture.vScale=12;const yard=pbr('Suelo terroso de patios31','#b29970',.99);yard.albedoTexture=tile31('Grano de suelo de patios31','#b29970','stone');yard.albedoTexture.uScale=yard.albedoTexture.vScale=22;const ground=B.MeshBuilder.CreateGround('Solar con tierra31',{width:137,height:136,subdivisions:1},scene);ground.position.set(-334,.023,36);ground.material=yard;ground.isPickable=false;const yardRoot=new B.TransformNode('Terreno de patios31',scene);ground.parent=yardRoot;registerDetail31(yardRoot,-334,36,170);const sideRoad=makeDetailGroup('Calles de tierra de patios31',({box})=>{for(const x of [-391,-284])box('Calle secundaria de tierra31',x,.077,66,5,.015,47,soil);box('Pasaje de tierra31',-337,.073,97,112,.015,4,soil);});registerDetail31(sideRoad,-337,69,150);
 const zinc=pbr('Zinc envejecido31','#8f9791',.72,.30);zinc.albedoTexture=surfaceTile29('Nervios zinc31','roof');const wall=pbr('Bloque de patio31','#a49c89',.97);wall.albedoTexture=tile31('Mortero poroso31','#ada38b','soil');for(let i=0;i<6;i++){const x=-382+i*17,z=91,root=makeDetailGroup('Patio de barrio31 '+i,({box,tube,cylinder})=>{box('Murete de patio31',x,.66,z,11,1.3,.15,wall);for(let n=0;n<12;n++){const m=box('Reja de patio31',x-5.3+n*.91,1.43,z,.018,.68,.035,a.steel);}
 const roof=box('Tejadillo del patio31',x+3,2.36,z-1.7,3.9,.08,2.9,zinc);roof.rotation.x=.13;cylinder('Barril de agua31',x+3.5,.55,z-2.3,.36,1.1,a.blue);box('Banca exterior31',x-2,.44,z-.6,2.1,.10,.42,a.toolWood);tube('Tendedero31',[V(x-4,2.3,z-1.5),V(x+1,2.3,z-1.5)],.008,a.toolWood);for(let n=0;n<3;n++)box('Ropa tendida31',x-3.3+n*1.3,1.91,z-1.5,.53,.70,.013,[a.blue,a.red,a.white][n]);});registerDetail31(root,x,z,115);addWorldBox(x,z,11,.15);}
 // Alumbrado y tendido de barrio inspirado en infraestructura nicaragüense:
 // postes de madera, crucetas, tres cables flojos, aisladores y un transformador.
 // Dos conjuntos fusionados por material, sin luces dinámicas ni texturas nuevas.
 for(const [corridorX,shoePair] of [[-383.8,true],[-291.2,false]]){
  const sites=[44,65,86].filter(z=>!blocked(corridorX,z,.45,null,true))
   .map(z=>({x:corridorX,z,y:groundAt(corridorX,z)}));
  if(!sites.length)continue;
  const root=makeDetailGroup('Tendido de barrio31 '+corridorX,({box,cylinder,tube})=>{
   for(const [index,p] of sites.entries()){
    cylinder('Poste de madera barrio31',p.x,p.y+3.7,p.z,.135,7.4,a.toolWood);
    box('Cruceta de poste31',p.x,p.y+6.87,p.z,1.65,.12,.12,a.steel);
    for(const side of [-1,0,1])cylinder('Aislador de porcelana31',p.x+side*.55,p.y+7.02,p.z,.073,.22,a.white);
    tube('Brazo de alumbrado31',[V(p.x,p.y+6.20,p.z),V(p.x+.85,p.y+6.28,p.z)],.042,a.steel);
    box('Luminaria protegida31',p.x+.89,p.y+6.17,p.z,.31,.14,.25,a.lamp);
    if(index===1&&shoePair){
     cylinder('Transformador residencial31',p.x-.42,p.y+5.10,p.z,.31,.84,a.roofMetal);
     box('Soporte transformador31',p.x-.42,p.y+5.65,p.z,.82,.10,.45,a.steel);
     box('Fusible de transformador31',p.x+.25,p.y+5.43,p.z,.15,.34,.14,a.white);
    }
   }
   // Los cables se despliegan solo si ambos postes se pudieron colocar.
   for(let i=0;i<sites.length-1;i++){
    const a0=sites[i],b0=sites[i+1];
    for(const lane of [-1,0,1]){
     const x=a0.x+lane*.55,h0=a0.y+7.07,h1=b0.y+7.07;
     tube('Cable aéreo con curva31',[V(x,h0,a0.z),V(x,h0*.75+h1*.25-.24,a0.z+(b0.z-a0.z)*.25),V(x,(h0+h1)*.5-.32,(a0.z+b0.z)*.5),V(x,h0*.25+h1*.75-.24,a0.z+(b0.z-a0.z)*.75),V(x,h1,b0.z)],.009,a.steel);
    }
   }
   if(shoePair&&sites.length>=2){
    const p=sites[0],q=sites[1],z=(p.z+q.z)*.5,y=(p.y+q.y)*.5+6.62;
    for(const side of [-1,1]){
     const sx=p.x+side*.13;
     box('Zapato atado al cable31',sx,y-.26,z+side*.08,.20,.13,.34,a.rubber);
     box('Suela colgante31',sx,y-.34,z+side*.08,.21,.035,.35,a.toolWood);
     tube('Cordón anudado31',[V(sx,y+.23,z),V(sx,y-.12,z+side*.05)],.008,a.white);
    }
    tube('Cordón sobre tendido31',[V(p.x-.13,y+.23,z),V(p.x,y+.39,z),V(p.x+.13,y+.23,z)],.006,a.white);
   }
  });
  registerDetail31(root,corridorX,65,105);
  for(const p of sites)addWorldBox(p.x,p.z,.34,.34);
 }
 // Fictitious hostile sector is gameplay design, not a claim about real residents.
 city.territories.find(t=>t.id==='oeste').r=25;city.territories.find(t=>t.id==='oeste').name='Sector del Taller · banda ficticia';
}
