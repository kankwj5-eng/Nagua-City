"use strict";
const {parse}=require("acorn");
const script=require("../tests/html-script.cjs");
(async()=>{
 const source=await script("dist/Managua.html","appSource");
 console.log("appSource characters:",source.length,"bytes:",Buffer.byteLength(source));
 console.log("first:",JSON.stringify(source.slice(0,320)));
 console.log("last:",JSON.stringify(source.slice(-230)));
 let ast;try{ast=parse(source,{ecmaVersion:"latest",sourceType:"script",allowReturnOutsideFunction:true})}catch(e){console.log("SCRIPT parse failed:",e.message);ast=parse(source,{ecmaVersion:"latest",sourceType:"module",allowReturnOutsideFunction:true})}
 console.log("Top-level nodes:",ast.body.length);
 const last=ast.body.at(-1);
 console.log("wrapper",last.type,last.expression?.type,last.expression?.callee?.type,JSON.stringify(source.slice(last.start,last.start+220)));
 const body=last.expression?.callee?.body?.body;
 console.log("INNER COUNT",body?.length||0);
 if(body) {
 const groups={};for(let i=0;i<body.length;i++){const n=body[i];groups[n.type]=(groups[n.type]||0)+1;}
 console.log("INNER TYPES",JSON.stringify(groups));
 for(let i=0;i<Math.min(150,body.length);i++){
 const n=body[i];
 const name=n.type==="FunctionDeclaration"?n.id?.name:n.type==="VariableDeclaration"?n.declarations.map(x=>x.id.name||x.id.type).join(","):n.type;
 console.log("INNER",i,n.type,n.start,n.end,JSON.stringify(name).slice(0,140));
 }
 }
 for(let i=0;i<Math.min(90,ast.body.length);i++){
  const n=ast.body[i];const names=n.type==="FunctionDeclaration"?n.id?.name:n.type==="VariableDeclaration"?n.declarations.map(x=>x.id.name||x.id.type).join(","):n.type;
  console.log(i,n.type,n.start,n.end,JSON.stringify(names).slice(0,180));
 }
})().catch(e=>{console.error(e);process.exitCode=1});
