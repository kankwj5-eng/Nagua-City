function catalog48(name){const text=embedded48('catalog48-'+name);startup48.catalogBytes+=text.length;const raw=JSON.parse(text);raw.images=raw.images.map((image,i)=>name==='world'?embedded48(image.asset48):{...image,data:embedded48(image.asset48)});delete INTEGRATED[name];document.getElementById('asset-'+name)?.remove();return raw;}

