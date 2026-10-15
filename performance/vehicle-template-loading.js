// Block 04: retain every vehicle part; yield by elapsed work, not per part.
async function createTemplates(){
 let slice04=performance.now();
 expandVehicleVariants();
 for(const [name,spec] of Object.entries(vehicleAssets.models)){
  const body=new B.TransformNode('template_'+name,scene),parts={};
  for(const s of spec.groups){
   // A single mesh is indivisible. Yield between meshes after ~8 ms of work.
   if(performance.now()-slice04>=8){await loadYield25();slice04=performance.now();}
   if(!parts[s.part]){
    const part=new B.TransformNode(name+'_'+s.part,scene);
    part.parent=body;parts[s.part]=part;
   }
   const pos=typed(s.p,Float32Array);
   const mesh=meshData(name+'_'+s.part+'_'+s.material,pos,decodeNormals(typed(s.n,Int8Array)),typed(s.uv,Float32Array),typed(s.i,Uint32Array),null,assetMats[s.material],parts[s.part]);
   mesh.setEnabled(false);
  }
  body.setEnabled(false);templates[name]={root:body,parts,meta:spec.meta};
  const low=vehicleAssets.lod?.[name];
  if(low){
   const mt=assetMats.distance||(assetMats.distance=pbr('Distance vehicle',[1,1,1],.68,.22)),indices=new Uint32Array(low.count);
   for(let k=0;k<indices.length;k++)indices[k]=k;
   const lm=meshData('lod_'+name,typed(low.p,Float32Array),decodeNormals(typed(low.n,Int8Array)),null,indices,typed(low.c,Float32Array),mt,null);
   lm.setEnabled(false);lowTemplates[name]=lm;
   delete low.p;delete low.n;delete low.c;
  }
  simulation25.load.models++;
  simulation25.load.encodedCharactersReleased=(simulation25.load.encodedCharactersReleased||0)+spec.groups.reduce((n,g)=>n+(g.p?.length||0)+(g.n?.length||0)+(g.uv?.length||0)+(g.i?.length||0),0);
  spec.groups=[];
  status('Preparando vehículos '+simulation25.load.models+'/'+Object.keys(vehicleAssets.models).length+'…',50+simulation25.load.models*.25);
  // Preserve the progress paint at every model boundary, then start a fresh slice.
  await loadYield25();slice04=performance.now();
 }
}
