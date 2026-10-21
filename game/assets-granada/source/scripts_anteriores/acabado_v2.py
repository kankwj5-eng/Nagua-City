import bpy,math,random,json,xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('# CATHEDRAL:')])
random.seed(804);sc=bpy.context.scene
stats=json.loads(sc['afinacion_v2'])
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
row=sorted([o for o in sc.objects if o.name.startswith('Casa ') and 87<o.location.x<198 and o.location.y<center(o.location.x)],key=lambda o:o.location.x)
for o,col in zip(row,['crema','blanco','blanco','verde','azul','coral','mostaza']):
 o.data.materials.clear();o.data.materials.append(palette[col])
# Neutral grey palm trunks with the pale painted bases seen in the reference.
pm=material('V2 corteza palmera gris',(.27,.29,.24),.88,.04)
for o in sc.objects:
 if o.name.startswith(('V2 tronco palmera','V2 anillo tronco')):
  o.data.materials.clear();o.data.materials.append(pm)
group('11 Frentes urbanos complementarios')
for x,y,h in [(-71,-23,15),(-76,4,16.5),(-85,57,17),(-107,62,15),(-117,20,16),(-111,-23,14.5),(3,86,15),(20,75,13.5),(66,69,12.5),(72,1,14)]:cyl('V2 base pintada palmera',(x,y,.06),(x,y,1.9),.245,ivory)
root=ET.parse(B/'granada_osm.xml').getroot();nodes={n.get('id'):((float(n.get('lon'))+85.95324)*108920,(float(n.get('lat'))-11.92982)*111200) for n in root.findall('node')}
def tags(w):return{t.get('k'):t.get('v') for t in w.findall('tag')}
def points(w):return[nodes[n.get('ref')] for n in w.findall('nd') if n.get('ref') in nodes]
# Block protection comes from mapped buildings and the detailed first street.
protected=[(-42,-34,61,32),(-127,-45,-49,96),(-59,30,-20,98)]
for w in root.findall('way'):
 if tags(w).get('building'):
  p=points(w)
  if p:protected.append((min(x for x,y in p)-.3,min(y for x,y in p)-.3,max(x for x,y in p)+.3,max(y for x,y in p)+.3))
for o in sc.objects:
 if o.name.startswith('Casa '):protected.append((o.location.x-o.dimensions.x/2-.3,o.location.y-o.dimensions.y/2-.3,o.location.x+o.dimensions.x/2+.3,o.location.y+o.dimensions.y/2+.3))
roofmat=bpy.data.materials['V2 teja contexto']
def roofrect(a,b,c,d,h):
 w=c-a;dep=d-b;rise=min(w,dep)*.27;z=h+.06
 if w>=dep:r=[(a+dep*.35,(b+d)/2,z+rise),(c-dep*.35,(b+d)/2,z+rise)];f=[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)]
 else:r=[((a+c)/2,b+w*.35,z+rise),((a+c)/2,d-w*.35,z+rise)];f=[(0,1,4),(1,2,5,4),(2,3,5),(3,0,4,5)]
 return mesh('V2 cubierta frente urbano',[(a-.12,b-.12,z),(c+.12,b-.12,z),(c+.12,d+.12,z),(a-.12,d+.12,z)]+r,f,roofmat)
def overlaps(q,p):return max(q[0],p[0])<min(q[2],p[2]) and max(q[1],p[1])<min(q[3],p[3])
added=0
for w in root.findall('way'):
 t=tags(w)
 if t.get('highway') not in ['residential','tertiary','secondary','living_street'] or t.get('name')=='Calle La Calzada':continue
 ps=points(w)
 for aa,bb in zip(ps,ps[1:]):
  aa,bb=Vector(aa),Vector(bb);v=bb-aa;length=v.length
  if length<22:continue
  tangent=v.normalized();normal=Vector((-tangent.y,tangent.x));horizontal=abs(tangent.x)>abs(tangent.y)
  for side in [-1,1]:
   dist=7
   while dist<length-7 and added<420:
    width=random.uniform(8,12);depth=random.uniform(11,17);dist+=width/2;p=aa+tangent*dist+normal*side*(5.2+depth/2)
    wx,dy=(width,depth) if horizontal else (depth,width)
    q=(p.x-wx/2,p.y-dy/2,p.x+wx/2,p.y+dy/2)
    dist+=width/2+.18
    if not(-330<p.x<600 and -260<p.y<300):continue
    if any(overlaps(q,r) for r in protected):continue
    protected.append(q);h=random.uniform(4.1,5.4);col=palette[random.choice(['blanco','crema','melocoton','coral','mostaza','azul','cian'])]
    o=box('V2 frente urbano de contexto',(p.x,p.y,h/2), (wx-.05,dy-.05,h),col,.018);o['fidelidad']='Relleno contextual aproximado siguiendo la calle cartografiada; fachada no medida'
    roofrect(*q,h)
    for j in [-1,0,1]:
     pos=p+tangent*(j*width*.28)-normal*side*depth*.501
     if horizontal:
      box('V2 puerta frente urbano',(pos.x,pos.y,1.7),(1.1,.045,2.9),wood)
      box('V2 dintel frente urbano',(pos.x,pos.y,3.2),(1.35,.13,.15),ivory)
     else:
      box('V2 puerta frente urbano',(pos.x,pos.y,1.7),(.045,1.1,2.9),wood)
      box('V2 dintel frente urbano',(pos.x,pos.y,3.2),(.13,1.35,.15),ivory)
    added+=1
stats['frentes_complementarios_aproximados']=added
# A cloudy camera background, separated from physical ambient illumination.
n=sc.world.node_tree.nodes;links=sc.world.node_tree.links;old=n.get('Background');out=next(x for x in n if x.type=='OUTPUT_WORLD')
for l in list(links):
 if l.to_node==out:links.remove(l)
cam_bg=n.new('ShaderNodeBackground');cam_bg.inputs['Strength'].default_value=2.2
coords=n.new('ShaderNodeTexCoord');noise=n.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2.8;noise.inputs['Detail'].default_value=3.2
ramp=n.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.25;ramp.color_ramp.elements[0].color=(.33,.50,.69,1);ramp.color_ramp.elements[1].position=.62;ramp.color_ramp.elements[1].color=(.85,.91,.95,1)
links.new(coords.outputs['Normal'],noise.inputs['Vector']);links.new(noise.outputs['Fac'],ramp.inputs[0]);links.new(ramp.outputs[0],cam_bg.inputs['Color'])
light=n.new('ShaderNodeLightPath');mix=n.new('ShaderNodeMixShader');links.new(light.outputs['Is Camera Ray'],mix.inputs[0]);links.new(old.outputs[0],mix.inputs[1]);links.new(cam_bg.outputs[0],mix.inputs[2]);links.new(mix.outputs[0],out.inputs['Surface'])
# Separate adjacent planar paths by a tiny amount to remove self-intersection artifacts.
idx=0
for o in sc.objects:
 if o.type=='MESH' and len(o.data.vertices)==4 and all(.005<v.co.z<.095 for v in o.data.vertices):
  o.location.z+=(idx%700)*.00004;idx+=1
sc['afinacion_v2']=json.dumps(stats);json.dump(stats,open(B/'afinacion_v2.json','w'),indent=2)
sc.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];sc.cycles.samples=64
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
print('ACABADO_CONTEXTUAL',stats,flush=True)
for cn,fn in [('Comparacion F390 - regreso por Calzada','Comparacion_Calzada.png'),('Comparacion F570 - fachada y parque','Comparacion_Catedral.png'),('Comparacion F000 - vista aerea','Entorno_Aereo.png')]:
 sc.camera=bpy.data.objects[cn];sc.render.filepath=str(B/fn);bpy.ops.render.render(write_still=True)
print('ACABADO_FINALIZADO',flush=True)
