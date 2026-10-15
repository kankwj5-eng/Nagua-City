function stepFleet13(dt){
 manageTraffic28(dt);updateTrafficSignals23(dt);
 for(const v of fleet){if(v===current&&driving||v.retired28||v.garage&&v!==current)continue;if(v.traffic&&dt>0)stepTraffic29(v,dt);const ground10=groundAt(v.root.position.x,v.root.position.z);if(!Object.is(v.root.position.y,ground10))v.root.position.y=ground10;}
}

