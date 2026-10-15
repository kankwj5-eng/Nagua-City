function hero46(){
 const p=player; // Preserve skeleton/bind-pose scale; do not warp the hero root.
 const weave=fabric('Algodón holgado Mateo46','#dbd0b9'),denim=fabric('Sarga de short Mateo46','#343c3e');weave.uScale=weave.vScale=8;denim.uScale=denim.vScale=7;
 const shirt=pbr('Camiseta amplia de Mateo46','#e4d8be',.91),short=pbr('Short flojo de Mateo46','#555e5d',.92);shirt.backFaceCulling=short.backFaceCulling=false;shirt.twoSidedLighting=short.twoSidedLighting=true;shirt.albedoTexture=weave;short.albedoTexture=denim;shirt.bumpTexture=short.bumpTexture=detailNormal41('Fibra de ropa Mateo46',128,'cloth');shirt.bumpTexture.level=.14;
 const skins=new Map();for(const m of [...p.nearMeshes,...p.lodMeshes]){
  if(/Calzado de trabajo|Suela anatómica/.test(m.material?.name||'')){m.dispose(false,false);continue;}
  if(!m.getTotalVertices())continue;
  if(m.part28||/Camiseta_MPFB|Short_MPFB/.test(m.material?.name||''))m.material=m.part28==='shirt'||/Camiseta/.test(m.material.name)?shirt:short;
  else if(/Piel/.test(m.material?.name||'')){if(!skins.has(m.material.uniqueId)){const original=m.material,mat=pbr('Piel morena Mateo46 '+original.name,'#c39a75',.76);mat.albedoTexture=original.albedoTexture;mat.bumpTexture=original.bumpTexture;mat.invertNormalMapX=original.invertNormalMapX;mat.invertNormalMapY=original.invertNormalMapY;mat.backFaceCulling=false;mat.twoSidedLighting=true;mat.alpha=1;mat.transparencyMode=B.PBRMaterial.PBRMATERIAL_OPAQUE;skins.set(m.material.uniqueId,mat);}m.material=skins.get(m.material.uniqueId);}
  else if(/Cabello corto/.test(m.material?.name||'')){const mat=m.material.clone('Cabello negro Mateo46');mat.albedoColor=B.Color3.FromHexString('#28221b');m.material=mat;}
  // Body proportions come from the original weighted MPFB mesh and its rig.
  // Never reshape skinned positions in mesh-local Y: the joint bind matrix may
  // rotate/scale the vertices, producing torn shoulders, distorted hips and
  // displaced hands. Keep only reversible material changes above.
 }
 p.nearMeshes=p.nearMeshes.filter(m=>!m.isDisposed());p.lodMeshes=p.lodMeshes.filter(m=>!m.isDisposed());
 const skin=pbr('Pies y dedos de Mateo46','#9b7050',.84),rubber=pbr('Hule de chinelas Mateo46','#18232a',.96),strap=pbr('Tiras de chinelas Mateo46','#263a47',.83);for(const mat of [skin,rubber,strap]){mat.backFaceCulling=false;mat.twoSidedLighting=true;}skin.bumpTexture=detailNormal41('Piel de pies46',128,'skin');skin.bumpTexture.level=.06;skin.albedoColor=B.Color3.FromHexString('#845636').toLinearSpace();rubber.albedoColor=B.Color3.FromHexString('#18232a').toLinearSpace();strap.albedoColor=B.Color3.FromHexString('#263a47').toLinearSpace();rubber.bumpTexture=normalGrain25('Suela de chinelas46','rubber');rubber.bumpTexture.level=.12;
 const items=[];for(const side of [-1,1]){const x=side*.13;
  items.push(shape46('CreateSphere',{diameter:1,segments:18},skin,V(x,.080,.065),V(.108,.092,.255)));
  for(let toe=0;toe<5;toe++)items.push(shape46('CreateSphere',{diameter:1,segments:12},skin,V(x+side*(.037-toe*.017),.062,.181-toe*.008),V(.021-toe*.0015,.035,.047-toe*.003)));
  items.push(shape46('CreateSphere',{diameter:1,segments:20},rubber,V(x,.021,.066),V(.127,.035,.292)));
  const tube=B.MeshBuilder.CreateTube('Tira en V de chinela46',{path:[V(x-.05,.101,.03),V(x-.016,.136,.131),V(x+.05,.101,.027)],radius:.012,tessellation:8},scene);tube.material=strap;items.push(tube);
 }
 const feet=skinPart46(p,merge46('Chinelas46',items),'CitizenNear_Chinelas46',(v,i)=>v[i*3]>0?'foot_l':'foot_r');p.nearMeshes.push(...feet);
 for(const m of feet){const copy=m.clone(m.name.replace('CitizenNear','CitizenLOD'),m.parent);copy.skeleton=m.skeleton;copy.setEnabled(false);p.lodMeshes.push(copy);}
 // Preserve the new outfit when wardrobe/save actions revisit the protagonist.
 const dress=dressClothes28;dressClothes28=function(person){if(person===p){const palette=['#e4d8be','#947b60','#77826d','#90665e','#738897','#a39d85','#e8e0ce','#676d70'];shirt.albedoColor=B.Color3.FromHexString(palette[(city.state.outfit||0)%palette.length]);return;}dress(person);};
 // Do not edit individual quaternion components after animation sampling.
 // Such edits change rotation axes unpredictably and corrupt locomotion.
 p.strides43={...p.strides43,Walk:1.09};
 art46.hero=true;
}
