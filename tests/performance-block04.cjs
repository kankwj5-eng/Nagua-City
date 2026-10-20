"use strict";
// Bloque 04 V4: el motor NO fabrica carrocerías, ruedas ni LOD antiguos.
// Comprueba las 16 piezas GLB reales incorporadas directamente al repositorio.
const fs=require("node:fs"),path=require("node:path"),zlib=require("node:zlib"),crypto=require("node:crypto"),assert=require("node:assert/strict");
const root=path.join(__dirname,".."),assets=path.join(root,"game/assets-v4");
const manifest=JSON.parse(fs.readFileSync(path.join(assets,"specifications.json"),"utf8"));
const ids=["01_mateo","02_ernesto","03_daniel","04_luis","05_rafael","06_valeria","07_marisol","08_xiomara","09_rosa","10_elena","hilux","landcruiser","pulsar","taypan","mototaxi-roja","canonera-abierta"];
const entries=[...manifest.characters,...manifest.vehicles];
assert.deepEqual(entries.map(x=>x.id),ids);
let compressed=0,unpacked=0;
for(const spec of entries){
 const gz=fs.readFileSync(path.join(assets,spec.id+".glb.gz"));
 const glb=zlib.gunzipSync(gz);
 assert.equal(glb.subarray(0,4).toString(),"glTF",spec.id+" is valid GLB");
 assert.equal(glb.readUInt32LE(8),glb.length,spec.id+" declares exact file length");
 assert.equal(glb.length,spec.bytes,spec.id+" expected bytes");
 assert.equal(crypto.createHash("sha256").update(glb).digest("hex"),spec.sha256,spec.id+" original SHA256");
 compressed+=gz.length;unpacked+=glb.length;
}
const maker=fs.readFileSync(path.join(root,"game/src/vehicles/0287-create-vehicle.js"),"utf8");
const templates=fs.readFileSync(path.join(root,"game/src/engine/0283-create-templates.js"),"utf8");
const wheels=fs.readFileSync(path.join(root,"game/src/vehicles/0361-apply-player-wheels13.js"),"utf8");
assert(maker.includes("originalV4.makeCar("),"Original engine must spawn GLB vehicles");
assert(wheels.includes("originalV4.animateWheels("),"Original engine must animate GLB wheels");
assert(!/meshData\(|createInstance\(|MeshBuilder/.test(maker+templates+wheels),"No obsolete geometry generation");
const report={block:4,source:"16 real GLB assets",characters:10,vehicles:6,compressedBytes:compressed,glbBytes:unpacked,oldVehicleTemplates:0,lod:0,sha256Matched:16,passed:true};
fs.mkdirSync(path.join(root,"dist"),{recursive:true});
fs.writeFileSync(path.join(root,"dist/performance-block04.json"),JSON.stringify(report,null,2));
console.log("BLOCK04_V4_ASSETS_OK "+JSON.stringify(report));
