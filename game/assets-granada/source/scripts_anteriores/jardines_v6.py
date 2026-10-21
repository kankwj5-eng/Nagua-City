import bpy,math,random,json,xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene;random.seed(62021)
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')]);group('20 V6 Vegetacion de cerca')
protos=[o.data for o in s.objects if o.name.startswith('V6 prototipo copa oculta')]
shrubs=[o for o in s.objects if o.name.startswith('Arbusto macetera')]
for i,o in enumerate(shrubs):o.data=protos[i%len(protos)];o.scale=(random.uniform(.135,.155),random.uniform(.135,.155),random.uniform(.22,.26));o.rotation_euler.z=random.random()*math.tau
for i,o in enumerate([o for o in s.objects if o.name.startswith('V2 seto parque')]):o.data=protos[i%len(protos)];o.rotation_euler.z=random.random()*math.tau
root=ET.parse(B/'granada_osm.xml').getroot();nodes={n.get('id'):((float(n.get('lon'))+85.95324)*108920,(float(n.get('lat'))-11.92982)*111200) for n in root.findall('node')};ways={w.get('id'):w for w in root.findall('way')}
def points(w):return[nodes[n.get('ref')] for n in w.findall('nd') if n.get('ref') in nodes]
park=points(ways['27377881'])[:-1]
def inside(x,y):
 hit=False;j=len(park)-1
 for i in range(len(park)):
  xi,yi=park[i];xj,yj=park[j]
  if ((yi>y)!=(yj>y)) and x<(xj-xi)*(y-yi)/(yj-yi)+xi:hit=not hit
  j=i
 return hit
segments=[]
for w in ways.values():
 tags={t.get('k'):t.get('v') for t in w.findall('tag')}
 if tags.get('highway') in ['footway','path','pedestrian']:
  ps=points(w)
  if any(inside(x,y) for x,y in ps):segments.extend([(Vector(a),Vector(b)) for a,b in zip(ps,ps[1:])])
def distance(x,y,a,b):
 p=Vector((x,y));v=b-a;t=max(0,min(1,(p-a).dot(v)/max(v.length_squared,1e-8)));return(p-a-v*t).length
mats=[material('V6 hierba '+str(i),c,.93,.0) for i,c in enumerate([(.034,.062,.009),(.055,.105,.015),(.083,.155,.024),(.115,.19,.032),(.16,.155,.055)])]
verts=[];faces=[];ids=[];tufts=0
xmin=min(p[0] for p in park);xmax=max(p[0] for p in park);ymin=min(p[1] for p in park);ymax=max(p[1] for p in park)
for j in range(220000):
 x=random.uniform(xmin,xmax);y=random.uniform(ymin,ymax)
 if min((x+65)**2+(y+36)**2,(x+81)**2+(y-10)**2)>18**2 or not inside(x,y):continue
 if any(distance(x,y,a,b)<1.45 for a,b in segments):continue
 tufts+=1
 for k in range(6):
  ang=random.random()*math.tau;h=random.uniform(.025,.075);width=random.uniform(.002,.004);dx=random.uniform(-.045,.045);dy=random.uniform(-.045,.045);cx=x+dx;cy=y+dy;u=Vector((math.cos(ang),math.sin(ang),0));side=Vector((-u.y,u.x,0))*width;base=Vector((cx,cy,.012));mid=base+u*h*.20+Vector((0,0,h*.6));tip=base+u*h*.50+Vector((0,0,h));st=len(verts)
  verts.extend([tuple(base-side),tuple(base+side),tuple(mid+side*.65),tuple(tip),tuple(mid-side*.65)]);faces.extend([(st,st+1,st+2),(st,st+2,st+4),(st+4,st+2,st+3)]);idx=random.choices(range(5),[2,4,5,3,1])[0];ids.extend([idx]*3)
o=mesh('V6 hierba corta en primer plano del parque',verts,faces)
for m in mats:o.data.materials.append(m)
for p,i in zip(o.data.polygons,ids):p.material_index=i
meta=json.loads(s['realismo_v6']);meta['plantas_maceteras_con_hojas']=len(shrubs);meta['matas_hierba_primer_plano']=tufts;meta['hojas_hierba']=tufts*6;s['realismo_v6']=json.dumps(meta)
json.dump(meta,open(B/'realismo_v6.json','w'),indent=2,ensure_ascii=False)
assert tufts>1000 and len(shrubs)>20
s.camera=bpy.data.objects['Recorrido_01_Paseo'];bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
print('V6_JARDINES_GUARDADOS',meta,flush=True)
