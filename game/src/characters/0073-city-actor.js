// NPC de los diez GLB actuales: conservar su ropa, textura y esqueleto original.
function cityActor(role,x,z,index,zone=null){
 const person=createPerson(index,false,role==='police');
 person.root.position.set(x,groundAt(x,z),z);
 person.role=role;person.hp=role==='gang'?80:100;
 person.home=V(x,person.root.position.y,z);
 person.cooldown=0;person.alert=0;person.downUntil=0;
 person.zone=zone;person.fleeUntil=0;person.streetProps=[];
 person.cityWeapon=null;
 city.actors.push(person);
 return person;
}
