"""Strict, reviewable handling patch applied after the performance blocks."""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def apply(app):
 def replace(old,new):
  nonlocal app
  if app.count(old)!=1:raise ValueError('Cambió la integración de conducción: '+old[:100])
  app=app.replace(old,new,1)
 def helper(name):return (ROOT/'physics'/name).read_text()
 a=app.index('var Driving={');b=app.index("'use strict';",a)
 app=app[:a]+helper('driving-model.js')+'\n'+helper('vehicle-contact.js')+'\n'+app[b:]
 a=app.index('function vehicleContact40(');b=app.index('function resolveVehicle40(',a)
 app=app[:a]+helper('world-vehicle-contact.js')+'\n'+app[b:]
 replace('body.rotation.z=v.bodyRest40.z-state.lean','body.rotation.z=v.bodyRest40.z+state.lean')
 a=app.index(' const advance=Driving.advance;Driving.advance=function',app.index('async function install46'))
 b=app.index(' const resetInertia=resetInertia30;',a);app=app[:a]+app[b:]
 a=app.index('v.spin+=state.speed*dt/v.radius;');b=app.index('if(Math.abs(state.speed)>1.5',a)
 app=app[:a]+'applyPlayerWheels13(v,state,dt);'+app[b:]
 # All traffic paths roll in the same direction as the player. Turning wheels
 # use the updated spin, including when a safety gate rejects the movement.
 if app.count('v.spin+=delta/v.radius;')!=2:raise ValueError('Cambió el avance del tráfico')
 app=app.replace('v.spin+=delta/v.radius;','v.spin-=delta/v.radius;')
 replace("if(v.bike)v.parts.steering.rotation.y=steer;for(const [key,p] of Object.entries(v.parts))if(key.startsWith('wheel'))", "v.spin-=v.trafficSpeed*dt/v.radius;if(v.bike||v.name.startsWith('caponera'))v.parts.steering.rotation.y=steer;const angles13=wheelAngles13(v,-steer);for(const [key,p] of Object.entries(v.parts))if(key.startsWith('wheel'))")
 replace("if(key.includes('front')&&!v.bike)p.rotation.y=steer;}v.spin+=v.trafficSpeed*dt/v.radius;", "if(key.includes('front')&&!v.bike&&!v.name.startsWith('caponera'))p.rotation.y=key.endsWith('_L')?angles13.left:angles13.right;}")
 replace("v.reason='safety-yield';", "for(const [key,p] of Object.entries(v.parts))if(key.startsWith('wheel'))p.rotation.x=spin;v.reason='safety-yield';")
 replace('function resetInertia30(){resetBody40(current);','function resetInertia30(){if(current)current.motion13=null;resetBody40(current);')
 replace('function changeDrive(force=false){','function changeDrive(force=false){restoreVehiclePoses13(fleet,driving?current:null);')
 # updateFleet becomes presentation/LOD only. Signals, ground placement and NPC
 # motion advance at the same 60 Hz as the player's dynamics, including catchup.
 replace('function updateFleet(dt){manageTraffic28(dt);updateTrafficSignals23(dt);','function updateFleet(dt){')
 replace("if(v===current&&driving||v.retired28||v.garage&&v!==current)continue;if(v.traffic&&dt>0)stepTraffic29(v,dt);const ground10=groundAt(v.root.position.x,v.root.position.z);if(!Object.is(v.root.position.y,ground10))v.root.position.y=ground10;",'')
 replace('function tick(dt){',helper('vehicle-presentation.js')+'\nfunction tick(dt){')
 replace("tick=diagnostics09.wrap('simulation',tick);","stepFleet13=diagnostics09.wrap('trafficSimulation',stepFleet13);tick=diagnostics09.wrap('simulation',tick);")
 replace('renderRestore=null;\nconst clockResult=frameClock.advance(dt,step=>{renderPrevious=', 'renderRestore=null;restoreVehiclePoses13(fleet,driving?current:null);\nconst clockResult=frameClock.advance(dt,step=>{beginVehiclePoses13(fleet,driving?current:null);renderPrevious=')
 replace('tick(step);});accumulator=clockResult.alpha/60;', 'tick(step);stepFleet13((playing||homeMode)?step:0);endVehiclePoses13(fleet,driving?current:null);});accumulator=clockResult.alpha/60;')
 replace('updateFleet((playing||homeMode)?Math.min(dt,.10):0);','updateFleet(0);')
 replace('if(driving&&current.bike)riderPose();else if(!driving)walkPose(player,frameMoveSpeed,dt);}', 'if(!driving)walkPose(player,frameMoveSpeed,dt);}\npresentVehiclePoses13(fleet,driving?current:null,(playing||homeMode)?clockResult.alpha:1,placeContact);if(playing&&driving&&current.bike)riderPose();')
 return app
