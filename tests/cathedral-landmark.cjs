"use strict";
// Prueba la geometría sin WebGL ni descarga del paquete gráfico principal.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const src=fs.readFileSync(path.join(__dirname,"../game/src/world/0063-install-landmarks21.js"),"utf8");
const start=src.indexOf(" // Nueva Catedral de Managua:");
const end=src.indexOf("  stage21Landmarks.cathedral=true;\n }",start);
assert(start>0&&end>start,"La Nueva Catedral debe seguir conectada al instalador de monumentos");
const block=src.slice(start,end+"  stage21Landmarks.cathedral=true;\n }".length);
function build(boxes=[]){
 const groups=[],worldBoxes=[],data={boxes:[...boxes],places:[]},flags={tower:true,sandino:true,cathedral:false};
 const ctx={data,stage21Landmarks:flags,assetMats:{monument:{name:"monument"},toolWood:{name:"wood"},steel:{name:"steel"}},
  cityLandmarks:[],surfaceTextures31:{concrete_wall_003:{diff:"texture",nor_gl:"normal"}},
  scene:{},inWorld:(x,z)=>x>-20&&x<108&&z>266&&z<515,
  groundAt:()=>.2,pbr:(name)=>({name}),
  B:{MeshBuilder:{
   CreateSphere:(name)=>({name,scaling:{y:1},position:{set(...args){this.coords=args;}}}),
   CreateCylinder:(name)=>({name,rotation:{y:0},position:{set(...args){this.coords=args;}}})
  }},
  makeDetailGroup(name,fn){const elements=[];fn({
   box:(...v)=>elements.push({kind:"box",name:v[0],x:v[1],y:v[2],z:v[3],material:v[v.length-1]}),
   cylinder:(...v)=>elements.push({kind:"cylinder",name:v[0],material:v[v.length-1]}),
   tube:(...v)=>elements.push({kind:"tube",name:v[0],material:v[v.length-1]}),
   add:(mesh,material)=>elements.push({kind:"mesh",name:mesh.name,x:mesh.position.coords[0],y:mesh.position.coords[1],z:mesh.position.coords[2],material})
  });const root={name,elements};groups.push(root);return root;},
  addWorldBox:(...args)=>worldBoxes.push(args)
 };
 vm.createContext(ctx);vm.runInContext(block,ctx);
 return {groups,worldBoxes,data,flags,landmarks:ctx.cityLandmarks};
}
const first=build();
assert.equal(first.groups.length,1,"Crear un solo monumento fusionable");
assert.equal(first.landmarks.length,1,"Registrar la catedral en el conjunto visible");
assert(first.flags.cathedral,"Marcar nueva etapa del mapa");
const meshes=first.groups[0].elements,domes=meshes.filter(m=>m.name.startsWith("Cúpula 21 "));
assert.equal(domes.length,63,"La Catedral tiene exactamente 63 cúpulas, 7x9");
assert.equal(new Set(domes.map(m=>m.x)).size,7);
assert.equal(new Set(domes.map(m=>m.z)).size,9);
assert(meshes.some(m=>m.name==="Campanario triangular21"),"Incluir campanario triangular");
assert(meshes.some(m=>m.name==="Puerta principal de madera21"),"El portal no debe desaparecer");
assert(!meshes.some(m=>m.name==="Marco profundo de portal21"),"Prohibido tapar la puerta con un muro sólido");
assert.equal(first.worldBoxes.length,2,"Solo registrar colisión de nave y campanario");
const [cx,cz]=first.data.places[0].slice(1);
assert.equal(first.data.places[0][0],"Catedral Metropolitana de Managua · Nueva Catedral");
assert.equal(cx,79);assert.equal(cz,403);
assert(cx>72&&cz>308,"Emplazar al sureste del monumento de Tiscapa, no sobre el centro histórico");
assert(first.worldBoxes.every(([x,z,w,d])=>x-w/2>37+5),"No bloquear la avenida de acceso");
assert(new Set(meshes.map(m=>m.material?.name)).size<=7,"Agrupar por materiales existentes o compartidos");
const alternate=build([[65,375,86,400]]);
assert.equal(alternate.data.places[0][1],78,"Escoger ubicación alternativa si el solar primario está ocupado");
assert.equal(alternate.data.places[0][2],449);
const packed=build([[50,360,110,520]]);
assert.equal(packed.groups.length,0,"No superponer el monumento sobre solares ocupados");
assert.equal(packed.worldBoxes.length,0);
assert.equal(packed.flags.cathedral,false);
assert(!/new B\.(?:PointLight|SpotLight)|new B\.DynamicTexture/.test(block),"Sin luces dinámicas o atlas extras");
console.log("CATEDRAL_METROPOLITANA_OK "+JSON.stringify({domes:domes.length,groups:1,materials:new Set(meshes.map(m=>m.material?.name)).size,colliders:2,candidates:3+300}));
