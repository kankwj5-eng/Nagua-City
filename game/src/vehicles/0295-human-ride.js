/* Posicionamiento de pilotos V4, sin mallas ni rig ficticios.
 * Los 10 GLB carecen de un clip de montar/conducir: en vez de 'Crouch'
 * usamos Idle congelado y dos articulaciones por brazo y pierna.
 * Los objetivos siguen asientos/manubrios reales, en ejes del motor (-Z).
 */
const rideProfilesV4=Object.freeze({
 pulsar:{seat:[0,.84,.39],hand:[.27,1.04,-.48],foot:[.20,.38,-.07]},
 taypan:{seat:[0,.79,.35],hand:[.26,1.03,-.39],foot:[.20,.36,-.06]},
 'mototaxi-roja':{seat:[0,.79,.35],hand:[.28,1.03,-.24],foot:[.23,.28,-.05]},
 'canonera-abierta':{seat:[0,1.00,.77],hand:[.28,1.11,.23],foot:[.23,.32,.23]}
});
function rideJointsV4(person){
 if(person.rideJointsV4)return person.rideJointsV4;
 const nodes=person.root.getDescendants();
 const lookup=name=>nodes.find(n=>(n.name===name||n.name.endsWith('_'+name))&&
   typeof n.getAbsolutePosition==='function')||null;
 const legs=['L','R'].map(side=>({
  hip:lookup('upperleg01.'+side),
  knee:lookup('lowerleg01.'+side),
  ankle:lookup('foot.'+side)
 }));
 const arms=['L','R'].map(side=>({
  hip:lookup('upperarm01.'+side),
  knee:lookup('lowerarm01.'+side),
  ankle:lookup('wrist.'+side)
 }));
 person.rideJointsV4={legs,arms};
 return person.rideJointsV4;
}
function rideAimV4(bone,oldVector,wantedVector){
 if(!bone?.parent||oldVector.lengthSquared()<1e-8||wantedVector.lengthSquared()<1e-8)return;
 const q=new B.Quaternion(),pq=new B.Quaternion(),scale=V(1,1,1),loc=V(0,0,0);
 bone.computeWorldMatrix(true);
 bone.getWorldMatrix().decompose(scale,q,loc);
 const delta=B.Quaternion.FromUnitVectorsToRef(oldVector.normalize(),wantedVector.normalize(),new B.Quaternion());
 bone.parent.computeWorldMatrix(true);
 bone.parent.getWorldMatrix().decompose(scale,pq,loc);
 bone.rotationQuaternion=pq.conjugate().multiply(delta.multiply(q)).normalize();
 bone.computeWorldMatrix(true);
}
function rideTwoBoneV4(chain,target,bend){
 const aNode=chain.hip,bNode=chain.knee,cNode=chain.ankle;
 if(!aNode||!bNode||!cNode)return false;
 const point=n=>{n.computeWorldMatrix(true);return n.getAbsolutePosition().clone();};
 let a=point(aNode),b=point(bNode),c=point(cNode);
 const l1=B.Vector3.Distance(a,b),l2=B.Vector3.Distance(b,c);
 if(l1<.02||l2<.02)return false;
 let direction=target.subtract(a),distance=direction.length();
 if(distance<.001)return false;
 direction.normalize();
 const reach=Math.min(Math.max(distance,Math.abs(l1-l2)+.003),l1+l2-.003);
 const along=(l1*l1-l2*l2+reach*reach)/(2*reach);
 const height=Math.sqrt(Math.max(0,l1*l1-along*along));
 const perpendicular=bend.subtract(direction.scale(B.Vector3.Dot(bend,direction)));
 if(perpendicular.lengthSquared()<1e-6)perpendicular.copyFrom(V(0,1,0));
 perpendicular.normalize();
 const joint=a.add(direction.scale(along)).add(perpendicular.scale(height));
 rideAimV4(aNode,b.subtract(a),joint.subtract(a));
 b=point(bNode);c=point(cNode);
 rideAimV4(bNode,c.subtract(b),target.subtract(b));
 return true;
}
function rideFreezeIdleV4(person){
 const idle=person.v4?.groups.get('Idle');
 if(!idle)return false;
 if(person.v4.playing)person.v4.playing.stop();
 idle.start(false,1,idle.from,idle.to);
 idle.goToFrame(idle.from);
 idle.pause();
 person.v4.playing=idle;person.v4.active='Riding';person.mode='Riding';
 return true;
}
function humanRide(person,vehicle){
 if(!person||!vehicle||!person.v4)return false;
 const profile=rideProfilesV4[vehicle.name];
 if(!profile)return false;
 person.root.parent=vehicle.root;
 person.root.position.set(0,0,0);person.root.rotation.set(0,0,0);
 person.visual.position.y=0;
 person.root.setEnabled(true);
 rideFreezeIdleV4(person);
 const joints=rideJointsV4(person);
 const hipL=joints.legs[0].hip,hipR=joints.legs[1].hip;
 if(!hipL||!hipR)return false;
 vehicle.root.computeWorldMatrix(true);
 person.root.computeWorldMatrix(true);
 // Alinear las caderas, no los pies, con el punto del asiento real.
 const inverse=vehicle.root.getWorldMatrix().clone().invert();
 const hipLocal=point=>{
  point.computeWorldMatrix(true);
  return B.Vector3.TransformCoordinates(point.getAbsolutePosition(),inverse);
 };
 const l=hipLocal(hipL),r=hipLocal(hipR);
 person.root.position.set(profile.seat[0]-(l.x+r.x)*.5,
  profile.seat[1]-(l.y+r.y)*.5,
  profile.seat[2]-(l.z+r.z)*.5);
 person.root.computeWorldMatrix(true);
 const worldLocal=(x,y,z)=>B.Vector3.TransformCoordinates(V(x,y,z),vehicle.root.getWorldMatrix());
 let posedLegs=0,posedArms=0;
 for(let i=0;i<2;i++){
  const side=i===0?-1:1;
  const [fx,fy,fz]=profile.foot,[hx,hy,hz]=profile.hand;
  const foot=worldLocal(side*fx,fy,fz),hand=worldLocal(side*hx,hy,hz);
  if(rideTwoBoneV4(joints.legs[i],foot,worldLocal(side*.17,.57,profile.seat[2]-.37).subtract(foot)))posedLegs++;
  if(rideTwoBoneV4(joints.arms[i],hand,worldLocal(side*.48,hy-.22,(hz+profile.seat[2])*.5).subtract(hand)))posedArms++;
 }
 person.ridePoseV4={vehicle:vehicle.name,seat:profile.seat.slice(),posedLegs,posedArms};
 return posedLegs===2&&posedArms===2;
}
