function installMaterials34(){
 for(const m of scene.materials.slice()){
 const name=m.name;
 if(name==='asfalto'){material34(m,'asphalt_03',3.2);m.albedoColor=new B.Color3(.70,.82,1);}
 else if(name==='Asfalto reparado33')material34(m,'asphalt_02',3.6);
 else if(name==='acera'||/Paseo del lago|Losa|Loseta de paseo|Paseo del puerto|Pavimento costero|Acceso/.test(name)&&m.albedoTexture)material34(m,'concrete_floor',2.8);
 else if(/^pared\d$|Estuco barrio|Pared residencial|Fachada \d|Local |Estuco pintado/.test(name)){const tint=m.albedoColor.clone();material34(m,'painted_plaster_wall',3.0);m.albedoColor=B.Color3.Lerp(tint,B.Color3.White(),.28);}
 else if(/Estuco envejecido|Bloque de patio/.test(name))material34(m,'estuco_ia',2.4);
 else if(/Tierra compactada|Suelo terroso|Borde de tierra/.test(name))material34(m,'brown_mud_dry',3.2);
 else if(name==='Lámina de techo'||name==='Zinc envejecido31')material34(m,'corrugated_iron',1.65);
 }
 // Updated streamed meshes inherit world scale through meshData; merged nearby houses get world UVs after creation.
 for(const m of scene.meshes.slice())finishMeshUV34(m);
 const house=buildHouseDetails;buildHouseDetails=function(b,i){const root=house(b,i);addFacade34(root,b,i);for(const m of root.getChildMeshes())finishMeshUV34(m);return root;};
 for(const [i,r] of houseDetails){r.dispose();houseDetails.delete(i);}nextHouseUpdate=0;
 const merge=mergeDetail23;mergeDetail23=function(root){merge(root);for(const m of root.getChildMeshes())finishMeshUV34(m);};
 const settingsBefore=settings;settings=function(){settingsBefore();for(const m of scene.materials){if(!m.metadata?.surface34)continue;m.bumpTexture=quality==='low'?null:stage34.families[m.metadata.surface34]?.normal||null;}};
 const beforeLight=lightSettings;lightSettings=function(){beforeLight();const image=scene.imageProcessingConfiguration;image.contrast=1.11;image.exposure=$('lighting').value==='dia'?1.03:1.07;if(B.ColorCurves){const curves=new B.ColorCurves();curves.globalSaturation=-4;curves.highlightsSaturation=-8;curves.highlightsHue=37;curves.highlightsDensity=6;curves.shadowsHue=213;curves.shadowsDensity=5;image.colorCurves=curves;image.colorCurvesEnabled=true;}};lightSettings();
 const shadowBefore=updateShadowList;updateShadowList=function(){shadowBefore();if(quality==='low'||!shadow?.getShadowMap())return;const pos=driving?current.root.position:player.root.position,candidates=[...houseDetails.values(),...stage34.architecture,...district31.roots].filter(r=>r.isEnabled()).map(root=>({root,d:B.Vector3.Distance(root.getChildMeshes()[0]?.getBoundingInfo().boundingSphere.centerWorld||V(1000,0,1000),pos)})).filter(o=>o.d<42).sort((a,b)=>a.d-b.d).slice(0,10);const list=shadow.getShadowMap().renderList;let added=0;for(const {root} of candidates)for(const m of root.getChildMeshes())if(m.isEnabled()&&m.getTotalVertices()<30000&&!list.includes(m)&&added<18){list.push(m);added++;}stage34.shadowDetails=added;};
 const credits=document.createElement('p');credits.className='credit';credits.textContent='Texturas V34: Powered by Poly Haven · recursos CC0. Estuco adicional generado con IA. Mapas de relieve y rugosidad compartidos; iluminación graduada en el motor.';$('settings').querySelector('.sheet').append(credits);
}
