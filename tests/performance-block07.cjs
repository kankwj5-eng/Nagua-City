const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),script=require('./html-script.cjs'),zlib=require('node:zlib');
const root=path.resolve(__dirname,'..'),source=process.argv[2]||path.join(root,'Managua_Del_taller_al_lago(1).html');
(async()=>{const app=await script(source,'appSource'),moduleB={exports:{}};new Function('module','exports',zlib.gunzipSync(Buffer.from(await script(source,'asset-babylon'),'base64')).toString())(moduleB,moduleB.exports);const B=moduleB.exports,engine=new B.NullEngine(),scene=new B.Scene(engine),V=(x=0,y=0,z=0)=>new B.Vector3(x,y,z),mat=new B.StandardMaterial('body',scene);
 const build=new Function('B','scene',app.slice(app.indexOf('function makeDetailGroup('),app.indexOf('function buildHouseDetails('))+';return makeDetailGroup;')(B,scene),fix=new Function(fs.readFileSync(path.join(root,'performance/moving-details.js'),'utf8')+';return movingDetails07;')();
 function vehicle(name){const root=new B.TransformNode(name,scene),body=new B.TransformNode('body',scene);body.parent=root;const detail=build(name+' detail',({box})=>box('panel',.8,.9,.3,1,.4,.2,mat));detail.parent=body;return {root,body,mesh:detail.getChildMeshes()[0]};}
 const old=vehicle('old'),next=vehicle('new'),stationary=build('stationary',({box})=>box('wall',10,1,10,2,2,.3,mat));const stats=fix([next]);assert.equal(stats.unfrozenVehicleMeshes,1);assert(stationary.getChildMeshes()[0].isWorldMatrixFrozen);assert(old.mesh.isWorldMatrixFrozen);
 let oldMismatch=0;const trace=[];
 for(const [x,z,yaw] of [[0,0,0],[2,0,0],[4,1,.2],[8,3,.6],[12,8,1],[4,-4,-.5]]){
  scene.incrementRenderId();for(const v of [old,next]){v.root.position.set(x,0,z);v.root.rotation.y=yaw;v.root.computeWorldMatrix(true);v.body.computeWorldMatrix(true);v.mesh.computeWorldMatrix();}
  const local=V(.8,.9,.3),expected=B.Vector3.TransformCoordinates(local,next.body.getWorldMatrix()),actual=next.mesh.getBoundingInfo().boundingBox.centerWorld;
  assert(B.Vector3.Distance(expected,actual)<1e-6);if(B.Vector3.Distance(expected,old.mesh.getBoundingInfo().boundingBox.centerWorld)>1e-6)oldMismatch++;trace.push({x,z,yaw,error:B.Vector3.Distance(expected,actual)});
 }
 assert(oldMismatch>0);const report={block:7,engine:B.Engine.Version,oldDetachedSamples:oldMismatch,correctedSamples:trace.length,...stats,stationaryMatricesPreserved:true,trace,passed:true};fs.writeFileSync(path.join(root,'dist/performance-block07.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));engine.dispose();})().catch(e=>{console.error(e);process.exitCode=1});
