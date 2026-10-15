"use strict";
/** Regression de integración: la versión publicada usa de verdad los módulos. */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {execFileSync} = require("node:child_process");
const crypto = require("node:crypto");
const readHTMLScript = require("./html-script.cjs");
const ROOT = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(ROOT,"game/manifest.json"),"utf8"));
const game = path.resolve(process.argv[2] || path.join(ROOT,"dist/Managua.html"));

(async () => {
 assert.equal(manifest.schemaVersion,1);
 assert.equal(manifest.format,"ordered-lexical-fragments");
 assert.ok(manifest.segments.length>100,"Los módulos fuente están incompletos.");
 assert.ok(manifest.inlineStyles.length>0,"Deben conservarse los estilos.");
 const files=new Set();
 const chunks=[];
 for(const item of manifest.segments){
   assert.ok(item.path.startsWith("game/src/") && item.path.endsWith(".js"),"Ruta inválida "+item.path);
   assert.ok(!files.has(item.path),"Módulo duplicado "+item.path);
   files.add(item.path);
   const file=path.resolve(ROOT,item.path);
   assert.ok(file.startsWith(path.join(ROOT,"game/src")+path.sep),"Ruta fuera de la fuente");
   chunks.push(fs.readFileSync(file,"utf8"));
 }
 for(const style of manifest.inlineStyles){
   assert.ok(style.path.startsWith("game/styles/"),"Estilo fuera de game/styles");
   assert.ok(fs.existsSync(path.join(ROOT,style.path)),"Falta "+style.path);
 }
 const assembled=chunks.join("");
 const fromHTML=await readHTMLScript(game,"appSource");
 assert.equal(fromHTML,assembled,"La build publicada no refleja exactamente los módulos editables.");
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),"nagua-modules-"));
 try{
   const scratch=path.join(folder,"app.js");
   fs.writeFileSync(scratch,assembled);
   execFileSync(process.execPath,["--check",scratch],{stdio:"pipe"});
 }finally{fs.rmSync(folder,{recursive:true,force:true});}
 const digest=crypto.createHash("sha256").update(assembled).digest("hex");
 console.log(JSON.stringify({status:"OK",moduleFiles:files.size,cssFiles:manifest.inlineStyles.length,appSourceSha256:digest,baselineUnmodified:digest===manifest.baselineAppSha256}));
})().catch(e=>{console.error(e);process.exitCode=1});
