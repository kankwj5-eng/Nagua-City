function readSnapshot13(v,s){s.p.copyFrom(v.root.position);s.r.copyFrom(v.root.rotation);for(const part of s.parts)part.r.copyFrom(part.node.rotation);}
