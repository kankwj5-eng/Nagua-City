// Block 03: use narrower storage only when every Number is exactly representable.
// Never quantize: mixed or higher-precision tracks retain Float64 storage.
function packKeys45(values,kind,pool){
 const stride=kind==='rotation'?4:3,length=values.length;
 let constant=length>0;
 for(let frame=1;constant&&frame<length;frame++)for(let axis=0;axis<stride;axis++)if(!Object.is(values[frame][axis],values[0][axis])){constant=false;break;}
 let exact32=true;
 for(let frame=0;exact32&&frame<length;frame++)for(let axis=0;axis<stride;axis++){
  const value=values[frame][axis];if(!Number.isFinite(value)||!Object.is(value,Math.fround(value))){exact32=false;break;}
 }
 const Storage=exact32?Float32Array:Float64Array;let data;
 if(constant){
  // Use the same Float64 bit key as block 01, regardless of chosen storage.
  const first=new Float64Array(stride);for(let axis=0;axis<stride;axis++)first[axis]=values[0][axis];
  const key=kind+'|'+Array.from(new Uint32Array(first.buffer)).join(',');
  data=pool?.get(key)||(exact32?new Float32Array(first):first);if(pool&&!pool.has(key))pool.set(key,data);
 }else{
  data=new Storage(length*stride);
  for(let frame=0;frame<length;frame++)for(let axis=0;axis<stride;axis++)data[frame*stride+axis]=values[frame][axis];
 }
 return {length,stride,packed45:data,constant45:constant};
}
