function assetImage48(id){const el=document.getElementById(id);if(!el)throw Error('Falta imagen '+id);return el.dataset.src||embedded48(id);}
function catalog48(name){const text=embedded48('catalog48-'+name);startup48.catalogBytes+=text.length;const raw=JSON.parse(text);raw.images=raw.images.map((image,i)=>name==='world'?assetImage48(image.asset48):{...image,data:assetImage48(image.asset48)});delete INTEGRATED[name];document.getElementById('asset-'+name)?.remove();return raw;}

