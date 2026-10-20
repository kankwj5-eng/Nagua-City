"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const ROOT=path.resolve(__dirname,".."),data=path.join(ROOT,"dist","v4-null");
const entries=JSON.parse(fs.readFileSync(path.join(data,"fixture.json"),"utf8"));
const sandbox={
 module:{exports:{}},exports:{},require,console,Buffer,setTimeout,clearTimeout,
 setInterval,clearInterval,performance:{now:()=>Date.now()},
 window:{addEventListener(){},removeEventListener(){},devicePixelRatio:1},
 document:{addEventListener(){},removeEventListener(){}},navigator:{userAgent:"CI"}
};
sandbox.exports=sandbox.module.exports;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(data,"asset-babylon.js"),"utf8"),sandbox,{timeout:25000});
const B=sandbox.module.exports;
assert(B.NullEngine&&B.Mesh&&B.Scene&&B.VertexData,"Falta el motor Babylon original");
const env={
 document:{getElementById(id){return typeof entries[id]==="string"?{textContent:entries[id]}:null;}},
 Blob,Response,DecompressionStream,TextDecoder,Int8Array,Uint8Array,Float32Array,Uint32Array,
 DataView,Map,Math,Number,matchMedia:()=>({matches:true}),atob,console,B
};
vm.createContext(env);
vm.runInContext(fs.readFileSync(path.join(ROOT,"game/v4/official-city.js"),"utf8")+";this.City=OfficialCityV4;",env);
const engine=new B.NullEngine(),scene=new B.Scene(engine);
scene.useRightHandedSystem=true;
scene.activeCamera=new B.FreeCamera("camera",new B.Vector3(-37,4,115),scene);
(async()=>{
 const city=new env.City(B,scene);
 // No images necessary in CPU-only NullEngine; original geometry and materials are real.
 city.image=()=>null;
 assert.equal(city.world.zones.length,81);
 assert.equal(city.ext.zones.length,38);
 await city.loadTile({kind:"world",i:71,z:city.world.zones[71]});
 await city.loadTile({kind:"extensions",i:5,z:city.ext.zones[5]});
 const meshes=scene.meshes.filter(m=>m.name!=="Base del terreno original");
 assert.equal(meshes.length,23);
 const vertices=meshes.reduce((sum,m)=>sum+m.getTotalVertices(),0);
 assert.equal(vertices,48950);
 scene.render();
 assert.equal(city.tiles.size,2);
 console.log("NAGUA_ORIGINAL_V4_NULLENGINE_OK",JSON.stringify({meshes:meshes.length,vertices,zones:city.tiles.size,engine:B.Engine.Version}));
 scene.dispose();engine.dispose();
})().catch(e=>{console.error(e);process.exitCode=1;});
