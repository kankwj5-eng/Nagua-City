async function zoneBuffer44(z,extra){
 const key=(extra?'e:':'w:')+z.id,cached=zoneCache44.get(key);
 if(cached){zoneCache44.delete(key);zoneCache44.set(key,cached);technical44.zoneCacheHits++;return cached;}
 if(zoneReads44.has(key))return zoneReads44.get(key);
 const job=(async()=>{technical44.zoneInflations++;startup48.zoneReads.push(key);const packed=z.asset48?await embeddedRemote48(z.asset48,true):bytes(z.data);const buffer=await inflate(packed);if(buffer.byteLength<=technical44.zoneCacheLimit){while(technical44.zoneCacheBytes+buffer.byteLength>technical44.zoneCacheLimit&&zoneCache44.size){const [id,old]=zoneCache44.entries().next().value;zoneCache44.delete(id);technical44.zoneCacheBytes-=old.byteLength;technical44.zoneEvictions++;}zoneCache44.set(key,buffer);technical44.zoneCacheBytes+=buffer.byteLength;}return buffer;})();zoneReads44.set(key,job);
 try{return await job;}finally{zoneReads44.delete(key);}
}
