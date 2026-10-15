// Test-only access, injected into a temporary HTML. Never included in the game.
const loop13=engine.runRenderLoop.bind(engine);
engine.runRenderLoop=fn=>{window.__handlingFrame13=fn;loop13(fn);};
window.__handling13={
 prepare(name){
  restoreVehiclePoses13(fleet,driving?current:null);
  if(driving)changeDrive(true);
  if(driving)throw Error('Cannot exit previous vehicle');
  renderRestore=renderPrevious=null;frameClock.reset();
  const v=fleet.find(v=>v.garage&&v.name===name);if(!v)throw Error('Missing model '+name);
  for(const other of fleet){other.motion13=null;other.traffic=false;other.retired28=other!==v;if(other!==v)other.root.position.set(2000+other.id*10,0,2000);}
  v.root.position.set(-37,groundAt(-37,90),90);v.root.rotation.set(0,0,0);v.heading=0;v.spin=0;v.condition32=100;
  homeMode=false;playing=true;nearest=v;changeDrive(true);if(!driving||current!==v)throw Error('Entry failed');
  clearInput();camera._track=camera._offset=null;last=performance.now();
 },
 input(throttle,steer,brake){clearInput();stick.y=throttle;stick.x=steer;buttons.brake=brake?1:0;},
 simulate(steps){
  const moving=driving?current.root:player.root;
  if(renderRestore&&renderRestore.node===moving){moving.position.copyFrom(renderRestore.p);moving.rotation.copyFrom(renderRestore.r);}renderRestore=null;
  restoreVehiclePoses13(fleet,driving?current:null);
  for(let i=0;i<steps;i++){beginVehiclePoses13(fleet,driving?current:null);renderPrevious={node:moving,p:moving.position.clone(),r:moving.rotation.clone()};tick(1/60);stepFleet13(1/60);endVehiclePoses13(fleet,driving?current:null);}
 },
 frame(dt=1/120){last=performance.now()-dt*1000;engine.beginFrame();window.__handlingFrame13();engine.endFrame();},
 pause(value){pause(value);},
 snapshot(){const v=current;return {name:v.name,driving,playing,state:{...state},root:v.root.position.asArray(),rotation:v.root.rotation.asArray(),parts:Object.fromEntries(Object.entries(v.parts).map(([k,p])=>[k,p.rotation.asArray()])),spin:v.spin,condition:v.condition32,contacts:stage40.contacts,playerParent:player.root.parent?.name??null,meshes:scene.meshes.length};}
};
