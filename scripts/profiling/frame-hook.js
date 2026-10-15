window.__cost={};
function timed09(name,fn){return function(...args){const start=performance.now();try{return fn.apply(this,args);}finally{const c=window.__cost[name]||(window.__cost[name]={calls:0,ms:0});c.calls++;c.ms+=performance.now()-start;}};}
for(const name of ['tick','tickCity','updatePeople25','updateFleet','follow','walkPose','humanWalk','human43','sampleHuman','plantFeet43','riderPose','updateShadowList','updateHouseDetails','sound','updateUI','telemetryFrame39','groundAt','blocked']){
 eval(name+'=timed09(name,'+name+')');
}
scene.render=timed09('scene.render',scene.render);
const rawLoop09=engine.runRenderLoop.bind(engine);
engine.runRenderLoop=fn=>{window.__frame09=fn;rawLoop09(fn);};
window.__bench09={setDt(){last=performance.now()-1000/60;},get B(){return B;}};
