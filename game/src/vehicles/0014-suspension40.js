function suspension40(v){
 if(v.bike||!v.parts.body)return;
 const body=v.parts.body;if(!v.bodyRest40)v.bodyRest40=body.rotation.clone();
 body.rotation.x=v.bodyRest40.x+(state.chassisPitch||0);body.rotation.z=v.bodyRest40.z+state.lean;
}
