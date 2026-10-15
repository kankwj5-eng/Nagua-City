function wheelAngles13(v,steer){
 const a=Math.abs(steer),sign=Math.sign(steer),length=v.wheelbase||2.65,track=v.width||1.7;
 if(a<1e-8)return {left:0,right:0};
 const radius=length/Math.tan(a),inner=Math.atan2(length,Math.max(.05,radius-track/2)),outer=Math.atan2(length,radius+track/2);
 return steer>0?{left:-outer,right:-inner}:{left:inner,right:outer};
}
