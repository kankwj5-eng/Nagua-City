"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict"),vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const items=vm.runInNewContext(read("game/src/engine/0313-item-definitions.js")+"\nitemDefinitions;");
assert.deepEqual(Object.keys(items).sort(),["hands","shovel"]);
assert.equal(items.hands.action,"GOLPEAR");
const goods=vm.runInNewContext(read("game/src/data/0069-city-goods.js")+"\ncityGoods;");
assert(!goods.arms,"Armería removed from active businesses");
assert.deepEqual(Array.from(goods.tools,x=>x.weapon),["shovel"]);
const commerce=vm.runInNewContext(read("game/src/state/0170-commerce29.js")+"\nCommerce29;");
for(const weapon of ["pistol","rifle","bat"]){
 const state={cash:5000,purchases:0,owned:{}};
 assert.equal(commerce.purchase(state,{price:100,type:"weapon",weapon}),false,weapon+" purchase disabled");
 assert.equal(state.cash,5000,"Illegal equipment must not charge");
}
const state={cash:500,purchases:0,owned:{}};
assert.equal(commerce.purchase(state,{price:160,type:"weapon",weapon:"shovel"}),true);
assert.equal(state.cash,340);
for(const file of ["game/src/engine/0218-install-weapons31.js","game/src/engine/0208-install-gun-stores31.js"]){
 const source=read(file),name=file.includes("gun-stores")?"installGunStores31":"installWeapons31";
 const fn=vm.runInNewContext(source+"\n"+name+";");
 assert.equal(typeof fn,"function");
 assert.equal(fn(),undefined,"Disabled system must not allocate meshes or add listeners");
}
const life=read("game/src/world/0077-install-city-life.js");
assert(!/Armería|['"]arms['"]/.test(life),"Old gun shop should not remain in the barrio");
assert(life.includes("Ferretería del Barrio"));
const world30=read("game/src/world/0189-install-world30.js");
assert(!world30.includes("cityGoods.arms"),"Remove legacy ammunition purchases during world setup");
assert(!world30.includes("weapon:\'pistol\'"),"No pistol sold at tools shop");
assert(world30.includes("stage30.markers=[]"),"No firearms displays for stage 30");
assert(read("game/src/core/0464-trystatement.js").includes("installWeapons31();"),"Compatibility stub remains callable");
assert(read("game/src/engine/0179-update-combat29.js").includes("c.aim=false"));
assert(read("game/src/interface/0323-refresh-equipment-ui.js").includes("button.hidden=!allowed"));
const fights=read("game/src/engine/0264-install-combat38.js");
assert(fights.includes("Combat29.strike"),"Preserve stamina and fist combat");
assert(fights.includes("sampleHuman(p,clip,progress,1)"),"Preserve punch animations");
console.log("MELEE_ONLY_NO_FIREARMS_OK "+JSON.stringify({equipment:Object.keys(items),firearms:0,shop:"Ferretería del Barrio",punchAnimation:true}));
