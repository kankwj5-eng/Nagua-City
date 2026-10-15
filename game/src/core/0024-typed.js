function typed(s,T){const b=bytes(s);return new T(b.buffer,b.byteOffset,b.byteLength/T.BYTES_PER_ELEMENT);}
