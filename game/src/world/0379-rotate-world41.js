function rotateWorld41(node,from,to){
 if(from.lengthSquared()<1e-8||to.lengthSquared()<1e-8)return;
 const scale=V(),position=V(),q=new B.Quaternion(),parentQ=new B.Quaternion();
 node.computeWorldMatrix(true);node.getWorldMatrix().decompose(scale,q,position);
 node.parent.computeWorldMatrix(true);node.parent.getWorldMatrix().decompose(scale,parentQ,position);
 const delta=B.Quaternion.FromUnitVectorsToRef(from.normalize(),to.normalize(),new B.Quaternion());
 node.rotationQuaternion=parentQ.conjugate().multiply(delta.multiply(q)).normalize();node.computeWorldMatrix(true);
}
