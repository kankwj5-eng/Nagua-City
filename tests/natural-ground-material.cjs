"use strict";
/* Comprobar el material real sin abrir Chromium ni generar texturas nuevas.
 * El script usa la misma función PBR extraída del juego publicado. */
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/characters/0392-surface42.js"),"utf8");
class PBRMaterial { constructor(name){this.name=name;this.metadata={protected:true};} }
const sets={};
for(const name of ["aerial_grass_rock","brown_mud_dry","asphalt_02","bark_brown_02"])
 sets[name]={diff:{id:name+":albedo"},normal:{id:name+":normal"},arm:{id:name+":ARM"}};
const stage42={textures:sets,materials:0};
const B={PBRMaterial,Color3:{FromHexString(value){return value;},White(){return "white";}}};
const ctx={stage42,B};
vm.createContext(ctx);vm.runInContext(source,ctx);
function check(name,scale){
 const material=new PBRMaterial(name);
 ctx.surface42(material,name,scale,"#ffffff");
 const maps=sets[name];
 assert.equal(material.albedoTexture,maps.diff,"Debe compartir la textura ya cargada");
 assert.equal(material.bumpTexture,maps.normal,"Debe compartir normal map sin alocaciones");
 assert.equal(material.metallicTexture,maps.arm,"Debe conservar mapa ARM para AO/roughness");
 assert.equal(material.useRoughnessFromMetallicTextureGreen,true);
 assert.equal(material.useAmbientOcclusionFromMetallicTextureRed,true);
 assert.equal(material.metadata.worldScale,scale);
 assert.equal(material.metadata.protected,true);
 return material;
}
for(const name of ["aerial_grass_rock","brown_mud_dry"]){
 const m=check(name,2.75);
 assert.equal(m.metallic,0,name+" debe ser dieléctrico");
 assert.equal(m.useMetallnessFromMetallicTextureBlue,false,"No interpretar canal azul como metal");
 assert(m.roughness>=.95,"Tierra o hierba demasiado brillantes");
 assert(m.environmentIntensity<=.30,"Reflectancia de entorno excesiva");
}
for(const name of ["asphalt_02","bark_brown_02"]){
 const m=check(name,3.2);
 assert.equal(m.metallic,1,"No cambiar comportamiento heredado de otros materiales");
 assert.equal(m.useMetallnessFromMetallicTextureBlue,true);
 assert.equal(m.environmentIntensity,.48);
}
assert.equal(stage42.materials,4);
const empty=new PBRMaterial("sin textura");
ctx.surface42(empty,"familia-no-disponible",2);
assert.equal(stage42.materials,4,"Ausencia de mapas debe ser operación inocua");
console.log("NATURAL_GROUND_MATERIAL_OK "+JSON.stringify({families:4,natural:["aerial_grass_rock","brown_mud_dry"],sharedAssets:true,originalRoadProperties:true,extraTextures:0}));
