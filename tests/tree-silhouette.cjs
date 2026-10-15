"use strict";
/** No new source meshes or draw calls; test deterministic visual variation. */
const assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const source=fs.readFileSync(path.join(__dirname,"../game/src/core/0401-vegetation42.js"),"utf8");
const ctx={};vm.createContext(ctx);vm.runInContext(source,ctx);
const variant=ctx.treeSilhouette42;
assert.equal(typeof variant,"function");
assert(source.includes("root.scaling.set(silhouette[0],silhouette[1],silhouette[2])"),"Tree transform must use actual silhouette");
assert(source.includes("const sources=[treeSource42(0,bark,leaf),treeSource42(1,bark,leaf)]"),"Keep two shared meshes; no new geometry sources");
assert(source.includes("for(const p of positions)"),"Keep existing tree placements");
const results=[];
for(let i=0;i<20;i++){
 const v=variant(i,1.2),again=variant(i,1.2);
 assert.deepEqual(Array.from(v),Array.from(again),"Same seed must return same tree shape");
 assert.equal(v.length,3);
 for(const value of v)assert(value>=1.2*.90&&value<=1.2*1.13,"Tree silhouette stretched too far");
 results.push(v.map(n=>n.toFixed(3)).join(","));
}
assert.equal(new Set(results).size,5,"Need five visual shapes for existing two tree prototypes");
assert.deepEqual(Array.from(variant(0,.7)),[.7,.7,.7]);
assert.deepEqual(Array.from(variant(5,.7)),[.7,.7,.7]);
const treeCount="const positions=stage38.trees.map";
assert(source.includes(treeCount),"Tree population and original positions remain unchanged");
console.log("TREE_SILHOUETTES_OK "+JSON.stringify({variants:5,sharedBaseSources:2,newTrees:0,newMeshes:0,placementPreserved:true}));
