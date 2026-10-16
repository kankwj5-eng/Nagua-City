"use strict";
/* Materiales reales: suelo de barrio y aceras no se modifican mutuamente. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const source42=fs.readFileSync(path.join(root,"game/src/characters/0392-surface42.js"),"utf8");
const surfaceFinish=fs.readFileSync(path.join(root,"game/src/characters/0393-finish-surfaces42.js"),"utf8");
class PBRMaterial {
 constructor(name){this.name=name;this.metadata={};this.roughness=.8;}
}
const families={};
for(const name of ["aerial_grass_rock","brown_mud_dry","asphalt_02","bark_brown_02","concrete_pavement"]){
 families[name]={diff:{name:name+":diff"},normal:{name:name+":normal"},arm:{name:name+":arm"}};
}
const names=[
 "Tierra compactada31","Pasaje residencial de tierra35",
 "Suelo terroso de patios31","Suelo de solar33",
 "Terreno residencial extendido35","tierra","asfalto","Pared residencial"
];
const mats=names.map(n=>new PBRMaterial(n)),byName=Object.fromEntries(mats.map(m=>[m.name,m]));
const scene={materials:mats,meshes:[]};
const B={PBRMaterial,Color3:{FromHexString(s){return s;},White(){return "#ffffff";}}};
const ctx={scene,B,stage42:{textures:families,materials:0},stage34:{families},quality:"high",
 settings(){this.settingsCalled=(this.settingsCalled||0)+1;},material34(){throw Error("No existing low-res fallbacks should be used");},
 projectUV34(){throw Error("No mesh to reproject in this fixture");}};
vm.createContext(ctx);
vm.runInContext(source42+"\n"+surfaceFinish+"\nfinishSurfaces42();",ctx);
const check=(name,scale,zone,tint)=>{
 const m=byName[name],p=families.brown_mud_dry;
 assert.equal(m.metadata.surface42,"brown_mud_dry",name+" should use high-resolution dirt");
 assert.equal(m.metadata.worldScale,scale,name+" UV scale");
 assert.equal(m.metadata.barrioSoilZone42,zone,name+" biome metadata");
 assert.equal(m.albedoColor,tint,name+" warm earth tint");
 assert.equal(m.metadata.naturalGroundStage1,true,name+" quality control");
 assert.equal(m.albedoTexture,p.diff,"Reuses scanned albedo");
 assert.equal(m.bumpTexture,p.normal,"Reuses existing normal map");
 assert.equal(m.metallicTexture,p.arm,"Reuses existing ARM roughness and AO");
 assert.equal(m.metallic,0,"Dry soil is dielectric");
 assert.equal(m.useMetallnessFromMetallicTextureBlue,false);
 assert(m.roughness>=.97,"No plastic sheen");
};
check("Tierra compactada31",2.7,"camino","#c7af8d");
check("Pasaje residencial de tierra35",2.7,"camino","#c7af8d");
check("Suelo terroso de patios31",3.1,"patio","#bca78a");
check("Suelo de solar33",3.1,"patio","#bca78a");
check("Terreno residencial extendido35",3.1,"patio","#bca78a");
assert.equal(byName.tierra.metadata.surface42,"brown_mud_dry");
assert.equal(byName.asfalto.metadata.surface42,"asphalt_02");
assert.equal(byName["Pared residencial"].metadata.surface42,undefined);
ctx.quality="low";ctx.settings();
for(const name of names.slice(0,6))assert.equal(byName[name].bumpTexture,null,name+" low-quality normal map off");
ctx.quality="high";ctx.settings();
for(const name of names.slice(0,6))assert.equal(byName[name].bumpTexture,families.brown_mud_dry.normal,name+" restored map");
assert.equal(byName.asfalto.albedoTexture,families.asphalt_02.diff,"Road remains unchanged");
assert.equal(ctx.stage42.materials,7,"No additional material objects");
console.log("BARRIO_SOIL_PBR_OK "+JSON.stringify({patios:3,roads:2,legacyNaturalGround:1,qualitySwitch:true,sharedTextures:true,extraTextures:0,extraMaterials:0}));
