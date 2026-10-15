function placeContact(shadow,p,heading,enabled){shadow.setEnabled(enabled);if(enabled){shadow.position.set(p.x,groundAt(p.x,p.z)+.009,p.z);shadow.rotation.y=heading;}}
