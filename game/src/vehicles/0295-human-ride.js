function humanRide(person,vehicle){
 if(!person||!vehicle)return;
 person.root.parent=vehicle.root;
 person.root.position.set(0,.1,0);
 person.root.rotation.set(0,0,0);
 person.visual.position.y=0;
 originalV4.setClip(person,'Crouch');
}
