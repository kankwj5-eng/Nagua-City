function humanWalk(person,speed,dt){
 if(!person?.v4)return;
 originalV4.setClip(person,speed>2.5?'Run':speed>.08?'Walk':'Idle');
}
