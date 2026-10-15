function shadowList42(){
 if(!shadow)return;const p=homeMode?(current?.root.position||spawn):driving?current.root.position:player.root.position,list=[],detail=[];
 const distance=quality==='low'?34:quality==='high'?64:48;
 for(const m of scene.meshes){
  if(!m.isEnabled()||!m.isVisible||m.visibility<.4||m.isDisposed()||!m.getTotalVertices()||m.getTotalVertices()>170000)continue;
  if(/contact|shadow|Fuente|fuente|sky|Xolotlan|Espuma|Partícula|Disparo|trace|flash|distant_|CitizenLOD|Suelo|Terreno|Zacate|Trayectoria|Grama/i.test(m.name))continue;
  const b=m.getBoundingInfo().boundingSphere,c=b.centerWorld;if(!Number.isFinite(c.x+c.y+c.z)||Math.hypot(c.x-p.x,c.z-p.z)>distance+Math.min(b.radiusWorld,28))continue;
  list.push(m);if(/42|Sapling|Guineo|Casa con muros|Portal con|Vivienda|Detalles de vivienda/i.test(m.name))detail.push(m);
 }
 shadow.getShadowMap().renderList=list;shadow.getShadowMap().refreshRate=1;stage42.shadowCasters=list.length;stage42.detailCasters=detail.length;
}
