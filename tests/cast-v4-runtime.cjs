"use strict";
const assert=require("node:assert/strict");
const v4=require("../game/characters-v4/cast-runtime.js");
const createCast=()=>({totalModelos:10,modelosLOD1Importados:0,personajes:v4.IDS.map((id,i)=>({
 id,protagonista:i===0,archivo:id+".glb",huesos:i===0?79:52,
 animaciones:[...v4.REQUIRED,...Array.from({length:(i===0?37:12)-v4.REQUIRED.length},(_,k)=>"Extra"+k)]
}))});
class Node{constructor(name){this.name=name;this.children=[];this.parent=null;}getChildMeshes(){return this.children.flatMap(c=>c.getChildMeshes?.()||[]);}getDescendants(){return this.children.slice();}dispose(){}}
const dummyGLB=(()=>{const a=new Uint8Array(20);a.set([103,108,84,70],0);new DataView(a.buffer).setUint32(8,20,true);return a;})();
let containers=0,starts=0,stops=0;
const mock={
 TransformNode:Node,
 SceneLoader:{async LoadAssetContainerAsync(){containers++;const names=createCast().personajes[containers-1].animaciones;
 const groups=()=>names.map(name=>({name,from:0,to:24,isPlaying:false,start(){this.isPlaying=true;starts++;},stop(){this.isPlaying=false;stops++;},dispose(){}}));
 return {animationGroups:groups(),instantiateModelsToScene(){
 const mesh={name:"skinned",isPickable:true,receiveShadows:false};
 const root=new Node("test");root.getChildMeshes=()=>[mesh];root.getDescendants=()=>[];
 return {rootNodes:[root],animationGroups:groups()};
 },dispose(){}};
 }}
};
(async()=>{
 const cast=createCast();v4.validateCast(cast);
 assert.equal(v4.IDS.length,10);assert(!v4.IDS.some(id=>id.includes("LOD")));
 assert.throws(()=>v4.validateCast({...cast,totalModelos:20}));
 assert.throws(()=>v4.validateCast({...cast,modelosLOD1Importados:10}));
 assert.throws(()=>v4.validateCast({...cast,personajes:cast.personajes.slice(1)}));
 const library=await v4.loadCast(mock,{},cast,async()=>dummyGLB);
 assert.equal(containers,10);assert.equal(library.inspect().modelos,10);
 const mateo=library.spawn("01_mateo",0);const npc=library.spawn("02_ernesto",1);
 assert.equal(library.inspect().instancias,2);
 mateo.walk(3.2);npc.walk(.7);
 assert.equal(mateo.active,"Run");assert.equal(npc.active,"Walk");
 assert.throws(()=>library.spawn("11_extra",11));
 library.release();assert.equal(library.inspect().modelos,0);
 assert.equal(library.inspect().instancias,0);assert(starts>=4&&stops>=4);
 console.log("NAGUA_CAST_V4_RUNTIME_OK",JSON.stringify({models:containers,instances:2,lod1:0}));
})().catch(e=>{console.error(e);process.exitCode=1;});
