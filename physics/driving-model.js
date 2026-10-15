// SI planar handling model. Vehicle specs remain game approximations; not a calibrated simulator.
var Driving={
 clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
 advance(s,i,v,dt){
 if(!Number.isFinite(dt)||dt<=0)return s;
 const c=this.clamp,p=v.profile||{},requested=c(i.throttle||0,-1,1),brake=c(i.brake||0,0,1),speed=Math.abs(s.speed),mass=(p.runningMassKg||v.meta?.mass||1400)+(v.bike?78:75);
 s.throttle=(s.throttle||0)+(requested-(s.throttle||0))*(1-Math.exp(-dt*(brake?16:requested?6:9)));let t=Math.abs(s.throttle)<.01?0:s.throttle;
 // Stop before changing direction; holding reverse starts it after a short neutral pause.
 s.directionHold=Math.max(0,(s.directionHold||0)-dt);if(t*s.speed<-.02)s.directionHold=.35;if(s.directionHold>0&&Math.abs(s.speed)<.12)t=0;if(brake)t*=1-brake;
 const hp=p.hp|| (v.bike?12:100),torque=p.torqueNm||(v.bike?12:180),peak=p.peakRpm||(v.bike?8000:4200),idle=v.bicycle?0:v.bike?1250:850,ratios=p.gearRatios||(v.bike?[2.8,1.82,1.35,1.1,.94]:[3.8,2.05,1.44,1,.82,.64]),final=p.finalDrive||(v.bike?9.24:3.75),radius=v.radius||.32;
 s.shiftTimer41=Math.max(0,(s.shiftTimer41||0)-dt);let gear=c(s.gear||1,1,ratios.length),oldGear41=gear;const wheelRPM=speed/(2*Math.PI*radius)*60;
 if(s.shiftTimer41===0&&wheelRPM*ratios[gear-1]*final>peak*.98&&gear<ratios.length)gear++;
 else if(s.shiftTimer41===0&&gear>1&&wheelRPM*ratios[gear-1]*final<peak*.37)gear--;if(gear!==oldGear41)s.shiftTimer41=.42;
 const rpm=c(wheelRPM*ratios[gear-1]*final,idle,peak*1.14),curve=c(1-.32*((rpm-(p.torqueRpm||peak*.72))/(peak*.64))**2,.35,1);
 const wheelForce=torque*curve*ratios[gear-1]*final*.84/radius,powerForce=hp*745.7*.84/Math.max(speed,3),traction=mass*9.81*(v.bike?.65:.58);
 const reverseAssist=v.bike&&t<0&&s.speed<=0;
 const opposing=t*s.speed<-.02;let drive=opposing?-Math.sign(s.speed)*mass*7*Math.abs(t):Math.sign(t)*Math.min(wheelForce,powerForce,traction)*Math.abs(t);
 if(reverseAssist)drive=-mass*1.5*Math.abs(t);
 const drag=.5*1.225*(v.bike?.46:v.bus?4: .80)*s.speed*speed,rolling=mass*9.81*(v.bicycle?.006:.015)*Math.sign(s.speed);
 const engineBrake=v.bicycle?0:(1-Math.abs(t))*Math.sign(s.speed)*mass*(v.bike?.30:.22);let acceleration=(drive-drag-rolling-engineBrake)/mass;if(brake)acceleration-=Math.sign(s.speed)*(p.brake||8.5)*brake;
 if(s.shiftTimer41>.27&&t*s.speed>=0)acceleration-=drive/mass*.35;
 const rawSteer=c(i.steer||0,-1,1),steerInput=v.bike&&!v.bicycle?(Math.abs(rawSteer)<.035?0:Math.sign(rawSteer)*Math.pow(Math.abs(rawSteer),1.22)):rawSteer;
 const angle=.58/(1+Math.abs(s.speed)*(v.bike?.13:.10)),rate=v.bike?c(10-mass*.010,5.8,8.5):c(8.4/(1+mass/4500),2.8,7);
 s.steer+=(steerInput*angle-s.steer)*(1-Math.exp(-dt*rate));
 // Share a finite tyre-force budget. Reserve lateral grip for the ongoing turn,
 // rather than setting available yaw to zero in a single frame under braking.
 const grip=9.81*(p.grip||.85),ongoingLateral=Math.abs(s.speed*(s.yawRate||0));
 // Lateral force relaxes over time under braking; reserve it before admitting
 // longitudinal force so a held brake cannot erase a turn instantaneously.
 const reservedLateral=Math.min(grip,ongoingLateral)*Math.exp(-dt*(brake||opposing?3:1));
 const longitudinalCapacity=Math.sqrt(Math.max(0,grip*grip-reservedLateral*reservedLateral));
 acceleration=c(acceleration,-longitudinalCapacity,longitudinalCapacity);
 const before=s.speed;s.speed=c(s.speed+acceleration*dt,-(v.bike?1.2:v.bus?3:4.5),v.maxSpeed||p.maxSpeed||30);
 if((brake||!t||opposing)&&before*s.speed<0)s.speed=0;if(Math.abs(s.speed)<.04&&!t&&Math.abs(before)/dt<=longitudinalCapacity)s.speed=0;
 const stunt=!!i.stunt&&v.bike&&!v.bicycle&&s.speed>5&&s.speed<18&&t>.3&&!brake&&Math.abs(i.steer||0)<.55;
 const wheelie=stunt?c(.24+hp/mass*1.1,.26,.43):0;s.wheelie=(s.wheelie||0)+(wheelie-(s.wheelie||0))*(1-Math.exp(-dt*(stunt?3.8:6)));
 const yaw=-s.speed/(v.wheelbase||2.65)*Math.tan(s.steer)*(1-(s.wheelie||0)*.45),longitudinal=Math.min(grip,Math.abs((s.speed-before)/dt)),available=Math.sqrt(Math.max(0,grip*grip-longitudinal*longitudinal)),lateralLimit=Math.min(available,v.bike?9.81*Math.tan(.57):grip),limit=lateralLimit/Math.max(Math.abs(s.speed),.5);const desiredYaw=c(yaw,-limit,limit);const yawResponse=v.bike?6:c(7.4/(1+mass/2600+(v.wheelbase||2.65)*.12),1.65,5);s.yawRate=(s.yawRate||0)+(desiredYaw-(s.yawRate||0))*(1-Math.exp(-dt*yawResponse));s.yawRate=c(s.yawRate,-limit,limit);s.heading+=s.yawRate*dt;
 const lateral=-s.speed*s.yawRate,lean=v.bike?c(Math.atan(lateral/9.81),-.57,.57):c(lateral/9.81*.09,-.055,.055);const leanTarget=v.bike?c(lean,-.49,.49)*c(Math.abs(s.speed)/2.5,0,1):lean;s.lean+=(leanTarget-s.lean)*(1-Math.exp(-dt*(v.bike?rate:9)));
 s.acceleration=(s.speed-before)/dt;
 if(!v.bike){
  const gripResponse=c(9.5/(1+mass/6500),3.5,9),sideTarget=c(s.speed*s.yawRate/gripResponse,-Math.abs(s.speed)*.24,Math.abs(s.speed)*.24);
  s.sideSpeed40=(s.sideSpeed40||0)+(sideTarget-(s.sideSpeed40||0))*(1-Math.exp(-dt*gripResponse));
  const targetPitch=c(s.acceleration*(v.bus?.0035:.005),-.038,.030),spring=Physics40.spring(s.chassisPitch||0,s.pitchVelocity||0,targetPitch,v.bus?6:9,.86,dt);
  s.chassisPitch=spring[0];s.pitchVelocity=spring[1];
 }else{s.sideSpeed40=(s.sideSpeed40||0)*Math.exp(-dt*12);}
 s.x+=(-Math.sin(s.heading)*s.speed+Math.cos(s.heading)*(s.sideSpeed40||0))*dt;
 s.z+=(-Math.cos(s.heading)*s.speed-Math.sin(s.heading)*(s.sideSpeed40||0))*dt;s.gear=Math.abs(s.speed)<.4?0:gear;s.rpm=reverseAssist?idle:rpm;
 if(v.bike&&!v.bicycle){const targetPitch=c((s.acceleration||0)*.0023,-.024,.028),spring=Physics40.spring(s.motoPitch46||0,s.motoPitchVelocity46||0,targetPitch,11,.94,dt);s.motoPitch46=spring[0];s.motoPitchVelocity46=spring[1];}
 s.gripAcceleration13=grip;s.lateralBudget13=lateralLimit;return s;
 }
};

