"use strict";
/**
 * Extracción de código fuente de Nagua City. SOLO para la migración inicial.
 * Los fragmentos permanecen en el orden original para no alterar hoisting,
 * inicialización, scopes, assets o comportamiento.
 *
 * Requiere acorn@8.15.0. No ejecuta ninguna línea del juego.
 */
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const {parse} = require("acorn");
const extractScript = require("../tests/html-script.cjs");
const ROOT = path.resolve(__dirname, "..");
const GAME = path.join(ROOT, "game");
const HTML = path.resolve(process.argv[2] || path.join(ROOT, "dist/Managua.html"));
const digest = input => crypto.createHash("sha256").update(input).digest("hex");
const kebab = value => String(value || "segment")
  .replace(/([a-z\d])([A-Z])/g, "$1-$2")
  .replace(/[^A-Za-z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase().slice(0, 64);
const matches = (name,regex) => regex.test(name);

function category(name, type, size) {
  if(size > 50000 || matches(name,/^(mpfb|gripModels|descriptions|VEHICLE_PROFILES|cityGoods)/i)) return "data";
  if(matches(name,/^(technical|diagnostic|profile|performance|telemetry|stage39|instrument|inspect|debug|report)/i)) return "diagnostics";
  if(matches(name,/(audio|sound|music|volume|horn|radio|speaker)/i)) return "audio";
  if(matches(name,/(vehicle|driv|wheel|fleet|traffic|bike|rider|ride|engineSound|suspension|gear|tire|brake|garage|parking|steer|fuel|bus|caponera|motor|carBody|spin)/i)) return "vehicles";
  if(matches(name,/(human|person|people|pedestrian|walk|wardrobe|outfit|skin|arm|leg|face|hero|player|actor|pose|feet|head|hair|skeleton|animation|clip|npc|police)/i)) return "characters";
  if(matches(name,/(zone|city|world|street|road|house|garden|environment|neighborhood|terrain|ground|surface|lake|landmark|market|waterfront|tree|district|collision|fence|river|building|path|footprint|sandino|stream|resident)/i)) return "world";
  if(matches(name,/(render|texture|mesh|material|light|shadow|sun|geometry|visual|color|quality|detail|draw|lod|shader|sky|batch|camera|fog|pbr|normal|fabric|asset)/i)) return "rendering";
  if(matches(name,/(home|menu|button|toast|status|hud|setting|panel|control|touch|joystick|pointer|tap|keyboard|keyboard|inventory|input|ui|screen|title|layout|modal|pause)/i)) return "interface";
  if(matches(name,/(boot|startup|load|install|init|create|prepare|clock|frame|tick|update|step|system|engine|scene|game|runtime)/i)) return "engine";
  return type === "VariableDeclaration" ? "state" : "core";
}

function nameOf(node, source) {
  if(node.type==="FunctionDeclaration" || node.type==="ClassDeclaration") return node.id?.name || "anonymous";
  if(node.type==="VariableDeclaration") {
    const parts=node.declarations.map(d=>d.id.name || d.id.type);
    return parts.length===1?parts[0]:(parts[0] || "state") + "-and-" + (parts.length-1) + "-others";
  }
  if(node.type==="ExpressionStatement" && node.expression.type==="AssignmentExpression") {
    const left=node.expression.left;
    return left.name || left.property?.name || "assignment";
  }
  return node.type.toLowerCase();
}

(async () => {
  if(fs.existsSync(path.join(GAME, "manifest.json"))) {
    throw new Error("game/manifest.json ya existe. No se puede regenerar sin revisar los cambios.");
  }
  const html=fs.readFileSync(HTML);
  if(html.subarray(0,100).toString().startsWith("version https://git-lfs")) throw new Error("Puntero Git LFS: descarga el archivo real.");
  const source=await extractScript(HTML, "appSource");
  const ast=parse(source, {ecmaVersion:"latest",sourceType:"script",allowReturnOutsideFunction:true});
  const call=ast.body.at(-1);
  const body=call?.expression?.callee?.body?.body;
  if(call?.type !== "ExpressionStatement" || !Array.isArray(body) || body.length < 100) {
    throw new Error("No se reconoció la envoltura del juego. Revisar la versión antes de extraer.");
  }
  // Los fragmentos no son ES modules independientes: son secciones fuente de
  // un único IIFE, reconstruidas byte a byte para preservar el scope original.
  const manifest={
    schemaVersion:1,
    format:"ordered-lexical-fragments",
    engine:"Babylon.js",
    title:"Nagua City",
    source:"script#appSource dentro de la build optimizada",
    baselineAppSha256:digest(Buffer.from(source, "utf8")),
    baselineAppBytes:Buffer.byteLength(source, "utf8"),
    astTopLevel:ast.body.length,
    astRuntimeStatements:body.length,
    segments:[],
    inlineStyles:[]
  };
  const makeSection=(a,b,label,type,special) => {
    if(b<=a) return;
    const chunk=source.slice(a,b);
    const number=String(manifest.segments.length).padStart(4,"0");
    const group=special || category(label,type,Buffer.byteLength(chunk));
    const relative=path.posix.join("game/src",group,number+"-"+kebab(label)+".js");
    const absolute=path.join(ROOT,...relative.split("/"));
    fs.mkdirSync(path.dirname(absolute),{recursive:true});
    fs.writeFileSync(absolute,chunk,"utf8");
    manifest.segments.push({path:relative,group,symbol:label,type,utf8Bytes:Buffer.byteLength(chunk,"utf8"),sha256:digest(chunk)});
  };
  makeSection(0,ast.body[0].start,"header","Header","bootstrap");
  for(let i=0;i<ast.body.length-1;i++) {
    const current=ast.body[i];
    const next=ast.body[i+1];
    makeSection(current.start,next.start,nameOf(current,source),current.type);
  }
  makeSection(call.start,body[0].start,"open-runtime","Open","bootstrap");
  for(let i=0;i<body.length;i++) {
    const current=body[i];
    const next=body[i+1];
    makeSection(current.start,next?next.start:current.end,nameOf(current,source),current.type);
  }
  makeSection(body.at(-1).end,source.length,"close-runtime","Close","bootstrap");
  const joined=manifest.segments.map(s=>fs.readFileSync(path.join(ROOT,s.path),"utf8")).join("");
  if(joined!==source) throw new Error("Los módulos no reconstruyen exactamente el appSource; se aborta.");
  if(digest(joined)!==manifest.baselineAppSha256) throw new Error("SHA-256 divergente.");

  // Estilos del HTML optimizado, preservando el arte y los recursos LFS.
  let searchAt=0;
  const open=Buffer.from("<style");
  const close=Buffer.from("</style>");
  for(;;) {
    const at=html.indexOf(open,searchAt);
    if(at<0) break;
    const taghead=html.subarray(at,Math.min(html.length,at+384)).toString("utf8");
    const match=/^<style\b[^>]*>/i.exec(taghead);
    if(!match){searchAt=at+open.length;continue;}
    const start=at+Buffer.byteLength(match[0]);
    const end=html.indexOf(close,start);
    if(end<0) throw new Error("Style sin cierre");
    const css=html.subarray(start,end);
    const index=manifest.inlineStyles.length;
    const relative="game/styles/"+String(index+1).padStart(2,"0")+"-base.css";
    const file=path.join(ROOT,relative);
    fs.mkdirSync(path.dirname(file),{recursive:true});
    fs.writeFileSync(file,css);
    manifest.inlineStyles.push({path:relative,openTag:match[0],sha256:digest(css),utf8Bytes:css.length});
    searchAt=end+close.length;
  }
  fs.mkdirSync(GAME,{recursive:true});
  fs.writeFileSync(path.join(GAME,"manifest.json"), JSON.stringify(manifest,null,2)+"\n");
  const groups={};
  for(const s of manifest.segments) groups[s.group]=(groups[s.group]||0)+1;
  console.log(JSON.stringify({result:"modular-source-generated",sourceBytes:manifest.baselineAppBytes,segments:manifest.segments.length,functions:body.filter(n=>n.type==="FunctionDeclaration").length,styleBlocks:manifest.inlineStyles.length,groups,baselineAppSha256:manifest.baselineAppSha256},null,2));
})().catch(err=>{console.error(err);process.exitCode=1});
