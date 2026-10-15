function installRoad33(){
 const asphalt=pbr('Asfalto reparado33','#444748',.97),paving=pbr('Adoquín de accesos33','#a3967f',.96),soil=pbr('Borde de tierra33','#968065',1);
 asphalt.albedoTexture=tile31('Grano asfalto33','#525555','stone');paving.albedoTexture=pavers33();soil.albedoTexture=tile31('Arena compactada33','#99866a','soil');
 for(let i=0;i<18;i++){const x=[-185,-111,-37,37,111,185][i%6]+(i%2?3:-3),z=-164+Math.floor(i/6)*145;
 const root=makeDetailGroup('Reparaciones del pavimento33 '+i,({box})=>{box('Parche de asfalto33',x,.028,z,2.4+(i%3)*.35,.013,4.3,asphalt);});registerDetail31(root,x,z,92);stage33.roadPatches++;}
 for(let i=0;i<12;i++){const x=-361+(i%4)*23,z=-8+Math.floor(i/4)*49;
 const root=makeDetailGroup('Acceso de barrio33 '+i,({box,cylinder})=>{box('Acceso adoquinado33',x,.039,z,2.2,.04,3.3,paving);box('Tierra junto al acceso33',x+1.3,.027,z,.3,.02,3.3,soil);for(const k of [-1,1]){cylinder('Bolardo de acceso33',x+k*1.25,.38,z-1.5,.055,.7,assetMats.steel);}});registerDetail31(root,x,z,85);stage33.details++;}
 // Reuse existing leaf textures/materials and streamed vegetation geometry.
 for(let i=0;i<12;i++){const x=-397+(i%4)*29,z=-13+Math.floor(i/4)*52;if(!blocked(x,z,.4,null,false))grassPatch31(x,z,130+i,pbrSharedGrass31());}
}
