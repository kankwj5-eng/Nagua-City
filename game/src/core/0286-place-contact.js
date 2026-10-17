function placeContact(shadow,p,heading,enabled,upper=false){shadow.setEnabled(enabled);if(enabled){shadow.position.set(p.x,roadSurface50(p.x,p.z,upper)+.009,p.z);shadow.rotation.y=heading;}}
