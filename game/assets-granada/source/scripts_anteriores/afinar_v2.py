import bpy,math,random,json,xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Vector
from mathutils.geometry import tessellate_polygon
B=Path(__file__).parent
# Reuse the original geometry helpers without deleting or rebuilding the scene.
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('# CATHEDRAL:')])
random.seed(221)
sc=bpy.context.scene
stats={}
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# Match the observed order when looking WEST: foreground blue, green, then white.
row=sorted([o for o in sc.objects if o.name.startswith('Casa ') and 87<o.location.x<198 and o.location.y<center(o.location.x)],key=lambda o:o.location.x)
for o,col in zip(row,['mostaza','crema','blanco','blanco','verde','azul','coral']):
 o.data.materials.clear();o.data.materials.append(palette[col]);o['ajuste_color']='Orden contrastado con F390, secuencia oeste-este corregida'
stats['fachadas_reordenadas']=len(row)
# Stronger paint colours from the supplied reference, retaining physical roughness.
cols={'Fachada azul':(.055,.34,.57),'Fachada verde':(.22,.57,.095),'Fachada fucsia':(.67,.035,.17),'Fachada cian':(.045,.44,.55),'Fachada mostaza':(.76,.39,.055),'Fachada coral':(.68,.12,.085)}
for n,c in cols.items():
 for m in bpy.data.materials:
  if m.name==n or m.name.startswith(n+'.'):
   m.diffuse_color=(*c,1)
   for nd in m.node_tree.nodes:
    if nd.type=='VALTORGB':
     nd.color_ramp.elements[0].color=(*(v*.64 for v in c),1);nd.color_ramp.elements[-1].color=(*c,1)
# Replace the simplified topiary shapes with several branching crown silhouettes.
group('07 Arboles naturales y palmeras')
leafm=[material('V2 follaje '+str(i),c,.72,.004) for i,c in enumerate([(.018,.11,.009),(.035,.22,.012),(.075,.34,.018),(.16,.43,.028),(.24,.51,.04)])]
def crown(seed):
 rng=random.Random(seed);v=[];f=[];mi=[]
 clusters=[]
 for k in range(9):
  t=k*math.tau/8+.3*seed;rr=rng.uniform(.6,1.8);clusters.append(Vector((rr*math.cos(t),rr*math.sin(t),rng.uniform(-.45,.65))))
 for j in range(24000):
  c=clusters[j%len(clusters)];a=rng.random()*math.tau;zz=rng.uniform(-1,1);rr=rng.random()**.23;q=math.sqrt(1-zz*zz)
  p=c+Vector((1.45*rr*q*math.cos(a),1.45*rr*q*math.sin(a),1.32*rr*zz));ang=rng.random()*math.tau
  u=Vector((math.cos(ang),math.sin(ang),rng.uniform(-.5,.5)))*rng.uniform(.045,.09);w=Vector((-math.sin(ang),math.cos(ang),rng.uniform(-.5,.5)))*rng.uniform(.018,.035);st=len(v)
  v.extend([tuple(p-u),tuple(p-w),tuple(p+u),tuple(p+w),tuple(p+Vector((0,0,.025)))])
  f.extend([(st,st+1,st+4),(st+1,st+2,st+4),(st+2,st+3,st+4),(st+3,st,st+4)])
  idx=rng.choices(range(5),weights=[1,3,4,3,1])[0];mi.extend([idx]*4)
 o=mesh('V2 prototipo follaje',v,f,None,True)
 for m in leafm:o.data.materials.append(m)
 for p,i in zip(o.data.polygons,mi):p.material_index=i
 o.hide_render=True;o.hide_viewport=True;return o.data
crowns=[crown(i) for i in range(6)]
oldcrowns=[o for o in sc.objects if o.name.startswith('Copa detallada')]
for i,o in enumerate(oldcrowns):
 o.data=crowns[i%6];o.rotation_euler.z=random.random()*math.tau
 if o.location.x>0:
  o.scale=(random.uniform(.95,1.12),random.uniform(.95,1.12),random.uniform(1,1.25));o.location.z=random.uniform(3.6,4.15)
 else:
  o.scale=(random.uniform(1.4,1.9),random.uniform(1.3,1.9),random.uniform(1.6,2.1));o.location.z=random.uniform(6.2,8.5)
# Park trunks reach the raised crowns instead of leaving floating foliage.
for o in sc.objects:
 if o.name.startswith('Tronco de arbol') and o.location.x<0:
  o.scale.z*=1.55
stats['copas_rehechas']=len(oldcrowns)
def newtree(x,y,h=8,rad=1.5):
 cyl('V2 tronco ramificado',(x,y,.1),(x+.12,y,h*.72),.25,bark,.10)
 for j in range(8):
  a=j*2.4;cyl('V2 rama secundaria',(x,y,h*.40),(x+math.cos(a)*rad,y+math.sin(a)*rad,h*.80),.075,bark,.02,N=16)
 o=bpy.data.objects.new('V2 arbol entorno',crowns[random.randrange(6)]);COL.objects.link(o);o.location=(x,y,h*.76);o.scale=(rad/1.6,rad/1.6,h/7.5);o.rotation_euler.z=random.random()*math.tau
 return o
# Palms are prominent in F100/F570/F640 and were missing.
def palm(x,y,h):
 for j in range(24):
  a=j/24;b=(j+1)/24;cyl('V2 tronco palmera',(x+.55*a*a,y,h*a),(x+.55*b*b,y,h*b),.24-.11*a,bark,.24-.11*b,N=24)
 for j in range(int(h*5)):
  zz=j*.2;off=.55*(zz/h)**2
  curve('V2 anillo tronco',[(x+off+(.24-.11*zz/h)*math.cos(k*math.tau/16),y+(.24-.11*zz/h)*math.sin(k*math.tau/16),zz) for k in range(17)],.012,ivory)
 for k in range(22):
  ang=k*2.4;L=random.uniform(3.6,5.4);pts=[]
  for j in range(25):
   t=j/24;pts.append(Vector((x+.55+L*t*math.cos(ang),y+L*t*math.sin(ang),h+1.1*math.sin(t*math.pi)-1.9*t*t)))
  curve('V2 raquis palmera',[tuple(p) for p in pts],.025,leafm[1]);v=[];f=[]
  for j in range(1,24):
   t=j/24;c=pts[j];side=Vector((-math.sin(ang),math.cos(ang),0));along=Vector((math.cos(ang),math.sin(ang),0));length=.9*math.sin(t*math.pi)**.7
   for ss in [-1,1]:
    end=c+side*ss*length+along*.34+Vector((0,0,-.28));mid=(c+end)/2+Vector((0,0,.08));st=len(v)
    v.extend([tuple(c-along*.018),tuple(mid-along*.045),tuple(end),tuple(mid+along*.045),tuple(c+along*.018)]);f.append(tuple(range(st,st+5)))
  mesh('V2 foliolos de palmera',v,f,leafm[k%4+1],True)
for x,y,h in [(-71,-23,15),(-76,4,16.5),(-85,57,17),(-107,62,15),(-117,20,16),(-111,-23,14.5),(3,86,15),(20,75,13.5),(66,69,12.5),(72,1,14)]:palm(x,y,h)
stats['palmeras_nuevas']=10
print('VEGETACION_REHECHA',stats,flush=True)
# Green park grounds, beds and hedges; retain mapped paths.
group('08 Parque y jardines')
root=ET.parse(B/'granada_osm.xml').getroot();nodes={n.get('id'):((float(n.get('lon'))+85.95324)*108920,(float(n.get('lat'))-11.92982)*111200) for n in root.findall('node')}
def tags(w):return{t.get('k'):t.get('v') for t in w.findall('tag')}
def points(w):return[nodes[n.get('ref')] for n in w.findall('nd') if n.get('ref') in nodes]
ways={w.get('id'):w for w in root.findall('way')};park=points(ways['27377881'])[:-1]
grass=material('V2 cesped parque',(.085,.18,.032),.9,.045,12)
mesh('V2 terreno del Parque Central',[(x,y,.006) for x,y in park],[tuple(range(len(park)))],grass)
def inside(x,y,poly):
 hit=False;j=len(poly)-1
 for i in range(len(poly)):
  xi,yi=poly[i];xj,yj=poly[j]
  if ((yi>y)!=(yj>y)) and x<(xj-xi)*(y-yi)/(yj-yi)+xi:hit=not hit
  j=i
 return hit
pathsegments=[]
for w in ways.values():
 if tags(w).get('highway') in ['footway','path','pedestrian']:
  p=points(w)
  if p and any(inside(x,y,park) for x,y in p):pathsegments.extend(zip(p,p[1:]))
def distseg(p,a,b):
 p,a,b=Vector(p),Vector(a),Vector(b);v=b-a;t=max(0,min(1,(p-a).dot(v)/max(v.length_squared,1e-8)));return(p-a-v*t).length
for j in range(len(park)):
 a=Vector(park[j]);b=Vector(park[(j+1)%len(park)]);v=b-a
 for k in range(int(v.length/2)):
  p=a+v*(k+.5)/max(1,int(v.length/2));p=(p+Vector((-88,25))*.02)/1.02
  o=bpy.data.objects.new('V2 seto parque',crowns[k%6]);COL.objects.link(o);o.location=(p.x,p.y,.65);o.scale=(.27,.25,.28)
# Additional park trees around paths and surrounding courtyards.
added=0
for x,y in [(-112,0),(-103,13),(-112,45),(-76,76),(-66,73),(-90,-30),(-104,-10),(-82,42),(-104,89)]:
 if inside(x,y,park) and all(distseg((x,y),a,b)>2 for a,b in pathsegments):newtree(x,y,random.uniform(7,11),random.uniform(2,3));added+=1
# Planted courtyards behind the street fronts, matching the green islands in aerial views.
for x in range(102,490,35):
 for side in [-1,1]:newtree(x,center(x)+side*32,random.uniform(7,10),random.uniform(2,3))
# Mapped octagonal music kiosk; open colonnade and red roof.
q=points(ways['97207319']);cx=sum(x for x,y in q)/len(q);cy=sum(y for x,y in q)/len(q)
cyl('V2 plataforma quiosco musica',(cx,cy,.1),(cx,cy,.65),5,ivory,N=8)
for k in range(8):
 a=k*math.tau/8;cyl('V2 columna quiosco',(cx+4.1*math.cos(a),cy+4.1*math.sin(a),.65),(cx+4.1*math.cos(a),cy+4.1*math.sin(a),4),.14,ivory)
cyl('V2 tejado rojo quiosco',(cx,cy,4),(cx,cy,5.9),5.6,red,.2,N=8)
# Fountain as a provisional park detail: position and form remain approximate.
water=material('V2 agua fuente',(.045,.23,.32),.1,.008)
cyl('V2 pileta fuente',(-90,0,.08),(-90,0,.45),3.0,ivory,N=64);cyl('V2 superficie agua',(-90,0,.45),(-90,0,.48),2.6,water,N=64)
cyl('V2 pedestal fuente',(-90,0,.5),(-90,0,2.1),.18,ivory);cyl('V2 taza fuente',(-90,0,1.8),(-90,0,2.0),1.25,ivory,.85,N=64)
stats['arboles_adicionales']=added+len(range(102,490,35))*2
print('PARQUE_AFINADO',flush=True)
# Replace the two oversized white placeholders by actual mapped surrounding buildings.
for o in list(sc.objects):
 if o.name.startswith(('Edificio vecino observado','Techo edificio vecino','Hastial edificio vecino')):bpy.data.objects.remove(o,do_unlink=True)
group('09 Casas y manzanas circundantes')
roofmat=material('V2 teja contexto',(.35,.085,.035),.86,.03,25)
ns=roofmat.node_tree.nodes;pr=ns.get('Principled BSDF');brick=ns.new('ShaderNodeTexBrick');brick.inputs['Color1'].default_value=(.25,.054,.022,1);brick.inputs['Color2'].default_value=(.47,.15,.065,1);brick.inputs['Mortar'].default_value=(.12,.045,.02,1);brick.inputs['Scale'].default_value=8;brick.inputs['Mortar Size'].default_value=.012
coord=ns.new('ShaderNodeTexCoord');roofmat.node_tree.links.new(coord.outputs['Generated'],brick.inputs['Vector']);roofmat.node_tree.links.new(brick.outputs['Color'],pr.inputs['Base Color'])
# Existing detailed houses occupy these bounds; context must not overlap them.
protected=[]
for o in sc.objects:
 if o.name.startswith('Casa '):protected.append((o.location.x-o.dimensions.x/2-.5,o.location.y-o.dimensions.y/2-.5,o.location.x+o.dimensions.x/2+.5,o.location.y+o.dimensions.y/2+.5))
def roofrect(x0,y0,x1,y1,h):
 # Hipped roof: planar slopes are correct architectural surfaces, with tiled shading.
 w=x1-x0;d=y1-y0;rise=min(3.4,min(w,d)*.30);z=h+.1
 if w>d:ridge=[(x0+d/2,(y0+y1)/2,z+rise),(x1-d/2,(y0+y1)/2,z+rise)]
 else:ridge=[((x0+x1)/2,y0+w/2,z+rise),((x0+x1)/2,y1-w/2,z+rise)]
 v=[(x0-.15,y0-.15,z),(x1+.15,y0-.15,z),(x1+.15,y1+.15,z),(x0-.15,y1+.15,z)]+ridge
 f=[(0,1,5,4),(1,2,5),(2,3,4,5),(3,0,4)] if w>d else [(0,1,4),(1,2,5,4),(2,3,5),(3,0,4,5)]
 return mesh('V2 cubierta teja a cuatro aguas',v,f,roofmat)
count=0;courtyards=0
for ident,w in ways.items():
 t=tags(w);p=points(w)
 if not t.get('building') or len(p)<4 or ident=='27428575' or t.get('man_made')=='tower':continue
 if p[0]==p[-1]:p=p[:-1]
 x0=min(x for x,y in p);x1=max(x for x,y in p);y0=min(y for x,y in p);y1=max(y for x,y in p);cx=(x0+x1)/2;cy=(y0+y1)/2
 if not(-220<cx<550 and -210<cy<230) or inside(cx,cy,park):continue
 if (-38<cx<58 and -30<cy<30):continue
 if any(max(x0,a)<min(x1,c) and max(y0,b)<min(y1,d) for a,b,c,d in protected):continue
 if x1-x0<2 or y1-y0<2:continue
 h=8.3 if ident=='97207323' else (7 if t.get('tourism')=='hotel' else random.uniform(4.2,5.6))
 col=palette[random.choice(['blanco','crema','melocoton','mostaza','coral','cian'])]
 n=len(p);v=[(x,y,z) for z in [.06,h] for x,y in p];f=[(j,(j+1)%n,(j+1)%n+n,j+n) for j in range(n)]
 ob=mesh('V2 '+t.get('name','Casa OSM '+ident),v,f,col);ob['fuente_huella']='OpenStreetMap way '+ident;ob['detalle']='Fachadas y alturas de contexto aproximadas; no levantadas'
 if x1-x0>22 and y1-y0>24:
  # Four roof wings preserve the typical open courtyard shown in the aerial footage.
  wing=min(6,(x1-x0)/4,(y1-y0)/4)
  for a,b,c,d in [(x0,y0,x1,y0+wing),(x0,y1-wing,x1,y1),(x0,y0+wing,x0+wing,y1-wing),(x1-wing,y0+wing,x1,y1-wing)]:roofrect(a,b,c,d,h)
  mesh('V2 suelo patio',[(x0+wing,y0+wing,.07),(x1-wing,y0+wing,.07),(x1-wing,y1-wing,.07),(x0+wing,y1-wing,.07)],[(0,1,2,3)],walk)
  courtyards+=1
 else:roofrect(x0,y0,x1,y1,h)
 # Windows and doors on the visible west and north elevations.
 for j in range(max(1,min(9,int((y1-y0)/3.5)))):
  yy=y0+(j+.5)*(y1-y0)/max(1,min(9,int((y1-y0)/3.5)))
  box('V2 vano casa contexto',(x0-.022,yy,h*.48),(.04,1.05,2.4),wood)
  for dy in [-.61,.61]:box('V2 marco casa contexto',(x0-.05,yy+dy,h*.48),(.08,.09,2.6),ivory)
 for j in range(max(1,min(12,int((x1-x0)/3.6)))):
  xx=x0+(j+.5)*(x1-x0)/max(1,min(12,int((x1-x0)/3.6)))
  box('V2 vano norte contexto',(xx,y1+.02,h*.5),(1.05,.04,2.3),wood)
  box('V2 dintel contexto',(xx,y1+.06,h*.5+1.25),(1.3,.12,.11),ivory)
 # Episcopal Palace: white arcaded frontage from the aerial reference.
 if ident=='97207323':
  ob.data.materials.clear();ob.data.materials.append(ivory)
  for yy in range(round(y0)+2,round(y1)-1,4):
   for zz in [0,4.2]:
    box('V2 sombra arcada Palacio',(x0-.08,yy,zz+1.7),(.05,2.7,3.1),black)
    cyl('V2 columna galeria Palacio',(x0-.5,yy-1.6,zz+.3),(x0-.5,yy-1.6,zz+3.8),.15,ivory)
  box('V2 balcon Palacio',(x0-.65,(y0+y1)/2,4.1),(1.4,y1-y0,.2),ivory)
 count+=1
stats['edificios_contexto']=count;stats['patios_abiertos']=courtyards
print('CONTEXTO_COMPLETADO',stats,flush=True)
# Additional facade detail on the original street frontage.
group('10 Detalles de uso y desgaste')
for o in [o for o in sc.objects if o.name.startswith('Casa ') and o.location.x<320]:
 x=o.location.x;side=1 if o.location.y>center(x) else -1;y=center(x)+side*8.8
 if int(x)%3==0:
  box('V2 rotulo comercio soporte',(x,y-side*.12,3.6),(1.1,.13,.48),wood)
  for dx in [-.42,.42]:cyl('V2 soporte rotulo',(x+dx,y,3.85),(x+dx,y-side*.55,3.85),.025,black,N=12)
 # Thresholds and drainage grilles ground the facade in the wet street.
 box('V2 umbral piedra',(x,y-side*.32,.17),(1.5,.55,.12),base)
for x in range(92,315,15):
 y=center(x)-6.6
 for j in range(9):box('V2 rejilla desague',(x+j*.055,y,.065),(.022,.38,.025),black,.003)
# Weathered roofs: varied darker clay and mossy patches, preserving real curved tiles.
for m in bpy.data.materials:
 if m.name.startswith('Teja envejecida'):
  for nd in m.node_tree.nodes:
   if nd.type=='TEX_NOISE':nd.inputs['Scale'].default_value=18;nd.inputs['Detail'].default_value=5
# Camera framing and daylight closer to the source shot; background now has real context.
cam=bpy.data.objects['Comparacion F390 - regreso por Calzada'];cam.location=(177,center(177),10.4);cam.rotation_euler=(Vector((0,31,-20))-cam.location).to_track_quat('-Z','Y').to_euler()
sc.view_settings.exposure=.55;sc.cycles.samples=64;sc.cycles.use_denoising=True
sc['afinacion_v2']=json.dumps(stats);sc['estado']='Afinacion de vegetacion, parque, colores y entorno. Todavia requiere ajuste de fachadas y medidas, sin afirmar identidad fotografica.'
# Prevent empty texture references after transfer.
assert all(i.packed_file for i in bpy.data.images if i.source=='FILE')
sc.camera=cam;sc.render.resolution_x=1000;sc.render.resolution_y=1400;sc.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
json.dump(stats,open(B/'afinacion_v2.json','w'),indent=2)
for cn,fn in [('Comparacion F390 - regreso por Calzada','Comparacion_Calzada.png'),('Comparacion F570 - fachada y parque','Comparacion_Catedral.png'),('Comparacion F000 - vista aerea','Entorno_Aereo.png')]:
 sc.camera=bpy.data.objects[cn];sc.render.filepath=str(B/fn);bpy.ops.render.render(write_still=True)
print('AFINACION_V2_FINALIZADA',stats,flush=True)
