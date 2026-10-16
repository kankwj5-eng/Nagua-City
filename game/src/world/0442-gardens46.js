// Composición de jardineras y copas tropicales sobre posiciones ya existentes.
// La selección no genera plantas, materiales, objetos o consultas adicionales.
function gardenSpecies46(o,index,palmAvailable){
 const seed=(Math.abs(Math.round(o.x*7))+Math.abs(Math.round(o.z*3))+index*11)%19;
 if(o.zone==='avenida'){
  // Las copas siguen dominando las avenidas. Algunas esquinas usan
  // jardineras ornamentales para romper la repetición de árboles.
  if(seed===3)return 2;
  if(seed===9)return 3;
  if(palmAvailable&&index%11===0)return 4;
 }
 return o.type;
}

function gardens46(){
 const bark=pbr('Corteza de jardines46','#84765d',.95);surface42(bark,'bark_brown_02',1.4,'#a6a08c');const leaf=pbr('Hoja fotográfica jardines46','#d0ddb6',.78);leaf.albedoTexture=art46.leafTexture;leaf.backFaceCulling=false;leaf.twoSidedLighting=true;leaf.transparencyMode=B.PBRMaterial.PBRMATERIAL_ALPHATEST;leaf.alphaCutOff=.35;leaf.subSurface.isTranslucencyEnabled=true;leaf.subSurface.translucencyIntensity=.16;leaf.subSurface.tintColor=B.Color3.FromHexString('#a6bd7c');new LeafWind36(leaf).strength=.22;const pot=pbr('Terracota de macetas46','#986e4d',.94);pot.bumpTexture=stage42.textures.concrete_pavement.normal;pot.bumpTexture.level=.18;
 const prototypes=[];for(let type=0;type<4;type++){const root=new B.TransformNode('Fuente jardín46 '+type,scene),parts=[];
  if(type<2){const h=type?4.5:5.8;parts.push(shape46('CreateCylinder',{diameterTop:.10,diameterBottom:.24,height:h*.65,tessellation:12},bark,V(0,h*.325,0)));const positions=[],uv=[],indices=[];
   for(let branch=0;branch<13;branch++){const angle=branch*2.399,r=.5+(branch%4)*.31,center=V(Math.cos(angle)*r,h*.59+(branch%4)*.32,Math.sin(angle)*r);const twig=B.MeshBuilder.CreateTube('Rama de jardín46',{path:[V(0,h*.36,0),B.Vector3.Lerp(V(0,h*.44,0),center,.55),center],radius:.023,tessellation:6},scene);twig.material=bark;parts.push(twig);
    for(let k=0;k<33;k++){const a=k*2.399+branch,rad=.25+(k%6)*.12,base=center.add(V(Math.cos(a)*rad,(k%7-3)*.10,Math.sin(a)*rad)),axis=V(Math.cos(a)*.25,.07,Math.sin(a)*.25),side=V(-Math.sin(a)*.06,.01,Math.cos(a)*.06),mid=base.add(axis.scale(.5)).add(V(0,.025,0)),tip=base.add(axis),verts=[base,mid.add(side),tip,mid.subtract(side)],o=positions.length/3;for(const v of verts)positions.push(...v.asArray());uv.push(.5,0,0,.5,.5,1,1,.5);indices.push(o,o+1,o+2,o,o+2,o+3);}
   }const norm=[];B.VertexData.ComputeNormals(positions,indices,norm);parts.push(meshData('Hojas individuales jardín46',positions,norm,uv,indices,null,leaf,null));}
  else{parts.push(shape46('CreateCylinder',{diameterTop:.49,diameterBottom:.36,height:.45,tessellation:20},pot,V(0,.225,0)));for(let i=0;i<(type===2?9:5);i++){const a=i*2.399,base=V(0,.46,0),length=type===2?.78:1.65,tip=V(Math.cos(a)*.62,.45+length,Math.sin(a)*.62),middle=B.Vector3.Lerp(base,tip,.57).add(V(Math.cos(a)*.24,.12,Math.sin(a)*.24)),width=type===2?.15:.22;const positions=[...base.asArray(),...middle.add(V(-Math.sin(a)*width,0,Math.cos(a)*width)).asArray(),...tip.asArray(),...middle.subtract(V(-Math.sin(a)*width,0,Math.cos(a)*width)).asArray()],indices=[0,1,2,0,2,3],norm=[];B.VertexData.ComputeNormals(positions,indices,norm);const m=meshData('Hoja de maceta46',positions,norm,[.5,0,0,.5,.5,1,1,.5],indices,null,leaf,null);parts.push(m);}}
  merge46('Vegetación de jardín46 '+type,parts,root);root.setEnabled(false);prototypes.push(root);
 }
 const palmSource=stage42.sources.find(r=>r.name==='Fuente palma42');if(palmSource)prototypes.push(palmSource);
 art46.plantTypes=['árbol de sombra','árbol de patio','maceta tropical','guineo de portal','palmera de avenida'];
 const positions=[];for(const road of [-185,-111,-37,37,111,185])for(let z=-160;z<=232;z+=44)for(const side of [-1,1]){const x=road+side*10.8;if(inWorld(x,z)&&!blocked(x,z,.45,null,true))positions.push({x,z,zone:'avenida',type:Math.abs(Math.round(z/44+road))%2});}
 for(const [i,b] of data.buildings.entries())if(i%2===0&&b.type==='casa'){const x=b.x+b.w*.5+.72,z=b.y-b.d*.22;if(inWorld(x,z)&&!blocked(x,z,.18,null,true))positions.push({x,z,zone:'patio',type:i%4===0?3:2});}
 const placements=positions.slice(0,245).map((o,i)=>({...o,id:i,type:gardenSpecies46(o,i,!!palmSource)}));
 // Register collision once, even for gardens whose render instances are not needed yet.
 for(const o of placements)addWorldBox(o.x,o.z,o.type===2||o.type===3?.38:.28,o.type===2||o.type===3?.38:.28);
 const residents=spatialResidents06(placements,o=>{
  const i=o.id,source=prototypes[o.type],root=new B.TransformNode('Jardín46 '+i,scene);
  for(const m of source.getChildMeshes()){const v=m.createInstance('Planta46 '+i);v.parent=root;v.isPickable=false;v.receiveShadows=true;}
  root.position.set(o.x,groundAt(o.x,o.z),o.z);root.rotation.y=i*2.399;root.scaling.setAll(.78+(i%5)*.065);root.setEnabled(false);art46.gardenRoots.push(root);return root;
 },root=>{const i=art46.gardenRoots.indexOf(root);if(i>=0)art46.gardenRoots.splice(i,1);root.dispose(false,false);},(root,on)=>root.setEnabled(on));
 art46.vegetation=placements.length;art46.gardenStreaming06=residents.stats;
 const position=()=>homeMode&&!homeGarage?V(-18,0,94):homeMode?current.root.position:driving?current.root.position:player.root.position;
 const range=()=>quality==='high'?125:quality==='low'?65:100;
 let last=-1,previous=position().clone(),lastRange=range(),lastEnabled=stage42.settings.vegetation;
 residents.plan(previous,lastRange,lastEnabled,true);
 scene.onBeforeRenderObservable.add(()=>{
  const p=position(),r=range(),enabled=stage42.settings.vegetation;
  if(time-last>=.7||B.Vector3.DistanceSquared(previous,p)>30*30||r!==lastRange||enabled!==lastEnabled){
   residents.plan(p,r,enabled);last=time;previous.copyFrom(p);lastRange=r;lastEnabled=enabled;
  }
  residents.warm();
 });
}

// GPU vertices already use float32. Keep their CPU mirrors in the same representation.
