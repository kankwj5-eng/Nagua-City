"use strict";
// Regresión real del 63 %: en Android el runtime asíncrono podía terminar
// antes de que el parser HTML incorporara los nodos V4 al final del documento.
const assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const code=fs.readFileSync(path.join(__dirname,"../game/src/vehicles/0286a-original-v4-runtime.js"),"utf8");
const registered=new Map();
let reads=0;
const dom={
 readyState:"loading",
 addEventListener(type,fn,opts){assert.equal(type,"DOMContentLoaded");assert.equal(opts.once,true);registered.set(type,fn);},
 getElementById(){reads++;return null;}
};
const sandbox={document:dom};
vm.createContext(sandbox);
vm.runInContext(code+"\nthis.adapter=originalV4;",sandbox);
(async()=>{
 const loading=sandbox.adapter.prepare("cars");
 await Promise.resolve();
 assert.equal(reads,0,"No buscar modelos mientras HTML siga analizándose");
 assert(registered.has("DOMContentLoaded"),"No se esperó DOMContentLoaded");
 dom.readyState="interactive";
 registered.get("DOMContentLoaded")();
 await assert.rejects(loading,/Faltan los 16 modelos V4/);
 assert.equal(reads,1,"Después de completar HTML, comprobar manifiesto");
 const alreadyLoaded=sandbox.adapter.prepare("cars");
 await assert.rejects(alreadyLoaded,/Faltan los 16 modelos V4/);
 assert.equal(reads,2,"DOM ya listo no debe esperar otro evento");
 console.log("V4_DOM_READY_OK",JSON.stringify({notReadBeforeDOMContentLoaded:true,readsAfter:2}));
})().catch(error=>{console.error(error);process.exitCode=1;});
