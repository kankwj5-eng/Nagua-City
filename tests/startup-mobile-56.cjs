"use strict";
// Exact bootstrap logic from modular source, exercised without a renderer.
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"game/src/core/0464-trystatement.js"),"utf8");
const begin=source.indexOf("await createTemplates();"),end=source.indexOf("await prepareAnimations38();",begin);
assert(begin>=0&&end>begin,"Expected unchanged production bootstrap section");
const section=source.slice(begin,end);
const AsyncFunction=Object.getPrototypeOf(async function(){}).constructor;
async function run(coarse){
 const phases=[],calls=[],technical44={},geometry={tag:"shared"};
 const args={
  matchMedia:()=>({matches:coarse}),
  technical44,
  boot45:{phase:(name,pct)=>phases.push({name,pct})},
  templates:{sedan:{root:{getChildMeshes:()=>[{geometry}]}}},
  B:{},
  loadYield25:async()=>{},
  createTemplates:async()=>calls.push("templates"),
  batchVehicleBodies11:async()=>{calls.push("batch");return {batches:20};},
  shareStaticGeometry05:async()=>{calls.push("share");return {shared:3};},
  installFleet:async()=>calls.push("fleet"),
  prepareHumans:async()=>calls.push("humans")
 };
 await new AsyncFunction(...Object.keys(args),section)(...Object.values(args));
 assert.deepEqual(calls,coarse?["templates","fleet","humans"]:["templates","batch","share","fleet","humans"]);
 assert.deepEqual(phases.map(p=>p.pct),coarse?[57,63,65]:[57,59,61,63,65]);
 assert(phases.some(p=>p.name==="Preparando personajes y caminatas…"),"No more misleading 24/24 after templates");
 assert(coarse?technical44.vehicleBatching11.skipped===true:technical44.vehicleBatching11.batches===20);
 assert(coarse?technical44.geometrySharing05.skipped===true:technical44.geometrySharing05.shared===3);
 return {coarse,phases:phases.map(x=>x.name),calls};
}
(async()=>{
 const mobile=await run(true),desktop=await run(false);
 const boot=fs.readFileSync(path.join(root,"game/src/engine/0463-boot45.js"),"utf8");
 assert(!boot.includes("Podés volver a abrir el archivo."),"Never label slow phases as errors");
 assert(boot.includes("no es un error confirmado"),"Slow-phase diagnostics must remain honest");
 assert(boot.includes("function fail(error)"),"Real errors still show retry");
 console.log("STARTUP_MOBILE_56_OK "+JSON.stringify({mobile,desktop}));
})().catch(e=>{console.error(e);process.exitCode=1;});
