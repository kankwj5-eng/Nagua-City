function vehicleFinish42(){
 // Fine rubber normal shared by every tyre, restrained clearcoat, reflective dielectric glass.
 const rubber=detailNormal41('Microrelieve de neumáticos42',128,'cloth');rubber.uScale=14;rubber.vScale=6;
 for(const m of scene.materials){
  if(m.name==='rubber'||/Polímero de piezas|Empuñadura|Polímero texturado/.test(m.name)){m.bumpTexture=rubber;m.bumpTexture.level=.15;m.metallic=0;m.roughness=.87;}
  if(/Cristal oscuro|Óptica sellada|glass/.test(m.name)&&m instanceof B.PBRMaterial){m.roughness=.12;m.metallic=0;m.environmentIntensity=.9;m.clearCoat.isEnabled=true;m.clearCoat.intensity=.8;m.clearCoat.roughness=.08;}
  if(m.clearCoat?.isEnabled&&!/glass|Cristal|Óptica/i.test(m.name)){m.roughness=.28;m.clearCoat.intensity=.72;m.clearCoat.roughness=.13;m.enableSpecularAntiAliasing=true;}
 }
 const all=[player,...pedestrians,...city.actors];for(const p of all)for(const mesh of p.nearMeshes)if(mesh.material instanceof B.PBRMaterial&&/Piel|protagonista/i.test(mesh.material.name)){mesh.material.roughness=.64;mesh.material.environmentIntensity=.58;}
 // A new, original outfit palette for Mateo, compatible with the existing body rig.
 for(const m of player.nearMeshes){if(!m.part28)continue;const old=m.material,mat=pbr('Ropa de Mateo42 '+m.part28,m.part28==='shirt'?'#334d69':'#9c8d72',.86,0);mat.albedoTexture=old.albedoTexture;mat.bumpTexture=old.bumpTexture;m.material=mat;m.alwaysSelectAsActiveMesh=true;}
}
