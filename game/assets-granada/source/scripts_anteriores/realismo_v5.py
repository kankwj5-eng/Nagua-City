import bpy,math,random,json,xml.etree.ElementTree as ET
from pathlib import Path
from mathutils import Vector,Matrix
B=Path(__file__).parent;s=bpy.context.scene;random.seed(5501)
src=(B/'construir.py').read_text()
exec(src[src.index('COL=None'):src.index('ivory=material')])
exec(src[src.index('def arch('):src.index('# CATHEDRAL:')])
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
def existing(prefix):
 ms=[m for m in bpy.data.materials if m.name.startswith(prefix) and m.users]
 return next((m for m in ms if m.get('textura_v4')),ms[0])
ivory=existing('Cal blanca');yellow=existing('Ocre catedral');base=existing('Zocalo azul');glass=existing('Cristal oscuro');wood=existing('Madera oscura');curb=existing('Bordillo amarillo')
stats={'fuente':'1000335491.mp4, recorte aportado; planta existente OSM','limites':'Patios y superficies de contexto aproximados. No levantamiento fotogrametrico.'}
def mineral(name,c0,c1,roughness=(.65,.88),scale=6):
 m=bpy.data.materials.new(name);n,l,p,pos=shader(m)
 l.new(ramp(n,l,noise(n,l,pos,scale),c0,c1),p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,19),*roughness)
 co=bump(n,l,p,noise(n,l,pos,31),.0018,.35);bump(n,l,p,noise(n,l,pos,140,2),.0009,.48,co)
 m['textura_v4']='mineral_v5';return m
urban=mineral('V5 base urbana neutra - terreno no documentado',(.135,.128,.114),(.20,.19,.17),(.85,.97),4)
asphalt=mineral('V5 asfalto agregado fino',(.024,.025,.026),(.052,.052,.051),(.73,.93),8)
stone=mineral('V5 piedra gris del recorte',(.060,.058,.055),(.105,.102,.098),(.51,.78),2.4)
walk=mineral('V5 acera mineral terrosa',(.17,.105,.070),(.27,.19,.13),(.72,.90),6)
patio=mineral('V5 patios pavimentados neutros',(.18,.16,.135),(.28,.25,.21),(.82,.96),8)
# The olive background was an undifferentiated terrain material, not mapped vegetation.
terrain=bpy.data.objects['Terreno'];terrain.data.materials.clear();terrain.data.materials.append(urban)
terrain['correccion_v5']='Base urbana neutra; cesped solo en superficies de parque ya delimitadas'
group('15 V5 Suelos urbanos calles y aceras')
# Replace old overlapping map strips, retaining the detailed pedestrian paving and kerbs.
oldcol=bpy.data.collections.get('02 Planta real y calles');removed=0
for o in list(oldcol.objects):
 if o.type=='MESH' and len(o.data.vertices)==4 and len(o.data.polygons)==1:
  bpy.data.objects.remove(o,do_unlink=True);removed+=1
r=ET.parse(B/'granada_osm.xml').getroot();nodes={x.get('id'):Vector(((float(x.get('lon'))+85.95324)*108920,(float(x.get('lat'))-11.92982)*111200)) for x in r.findall('node')}
def tags(w):return {x.get('k'):x.get('v') for x in w.findall('tag')}
def strip(name,a,b,lo,hi,z,mat):
 t=(b-a).normalized();n=Vector((-t.y,t.x));v=[(a.x+n.x*lo,a.y+n.y*lo,z),(b.x+n.x*lo,b.y+n.y*lo,z),(b.x+n.x*hi,b.y+n.y*hi,z),(a.x+n.x*hi,a.y+n.y*hi,z)]
 return mesh(name,v,[(0,1,2,3)],mat)
# All original map alignments are retained; clipping is segment-wise rather than discarding whole streets.
def clip(a,b):
 d=b-a;t0=0;t1=1
 for p,q in [(-d.x,a.x+335),(d.x,665-a.x),(-d.y,a.y+265),(d.y,310-a.y)]:
  if abs(p)<1e-9:
   if q<0:return None
  elif p<0:t0=max(t0,q/p)
  else:t1=min(t1,q/p)
 if t0>t1:return None
 return a+d*t0,a+d*t1
roads=[];junctions={};segments=0
for w in r.findall('way'):
 t=tags(w);kind=t.get('highway')
 if kind not in ['residential','tertiary','secondary','living_street','pedestrian','footway','service','unclassified']:continue
 ps=[nodes[x.get('ref')] for x in w.findall('nd') if x.get('ref') in nodes]
 half=6.8 if t.get('name')=='Calle La Calzada' else 2.5 if kind=='pedestrian' else 1.05 if kind=='footway' else 3.5 if kind in ['residential','living_street','service'] else 4.1
 for a,b in zip(ps,ps[1:]):
  q=clip(a,b)
  if q is None:continue
  a,b=q
  if (b-a).length<.1:continue
  roads.append((a,b,half,kind,t.get('name','Paso cartografiado')))
  for pt in [a,b]:
   k=(round(pt.x,1),round(pt.y,1));junctions[k]=junctions.get(k,0)+1
for a,b,half,kind,name in roads:
 surf=stone if kind in ['pedestrian','footway'] else asphalt
 strip('V5 '+name,a,b,-half,half,.022,surf);segments+=1
 if kind=='footway' or name=='Calle La Calzada':continue
 t=(b-a).normalized();L=(b-a).length
 trimA=min(half+1.4,L*.42) if junctions.get((round(a.x,1),round(a.y,1)),0)>1 else .15
 trimB=min(half+1.4,L*.42) if junctions.get((round(b.x,1),round(b.y,1)),0)>1 else .15
 aa=a+t*trimA;bb=b-t*trimB
 if (bb-aa).dot(t)<.4:continue
 for side in [-1,1]:
  lo,hi=sorted((side*half,side*(half+1.6)));strip('V5 acera junto a '+name,aa,bb,lo,hi,.075,walk)
  lo,hi=sorted((side*(half-.01),side*(half+.14)));strip('V5 borde de acera',aa,bb,lo,hi,.095,curb if kind=='pedestrian' else patio)
stats['tramos_cartografiados_con_suelo']=segments
# Connect cathedral to paved urban surroundings instead of an olive lawn.
mesh('V5 atrio y andenes catedral',[(-44,-23.5,.030),(40,-23.5,.030),(40,28.8,.030),(-44,28.8,.030)],[(0,1,2,3)],stone)
# Explicit hard-surface yards beneath context properties; no guessed green lawns.
count=0
for o in list(s.objects):
 if not o.name.startswith(('Casa ','V2 frente urbano de contexto','V3 fondo residencial aproximado')):continue
 if o.type!='MESH':continue
 ps=[o.matrix_world@Vector(v) for v in o.bound_box];x0=min(p.x for p in ps);x1=max(p.x for p in ps);y0=min(p.y for p in ps);y1=max(p.y for p in ps)
 if x1-x0>100 or y1-y0>100:continue
 mesh('V5 suelo de parcela contextual',[(x0-.5,y0-.5,.012),(x1+.5,y0-.5,.012),(x1+.5,y1+.5,.012),(x0-.5,y1+.5,.012)],[(0,1,2,3)],patio);count+=1
stats['parcelas_con_base_mineral']=count
# Roads between the previously approximate distant courtyard rows; remain explicitly contextual.
for j in range(8):
 a=Vector((-267,305+j*40));b=Vector((555,305+j*40));strip('V5 calle de fondo aproximada',a,b,-3.4,3.4,.022,asphalt)
for i in range(20):
 a=Vector((-266.5+i*43,302));b=Vector((-266.5+i*43,590));strip('V5 calle de fondo aproximada',a,b,-3.4,3.4,.023,asphalt)
# Rebuild the pedestrian panels: discreet narrow joints, warmer weathered mineral colour.
o=bpy.data.objects['Losas individuales humedas'];old=o.data;v=[];f=[];mi=[]
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
for i in range(200):
 x=i*2.4
 for j in range(8):
  x0=x+.002;x1=x+2.398;y0=center(x)-6.8+j*1.7+.002;y1=y0+1.696;cx=(x0+x1)/2;cy=(y0+y1)/2;z=.043+random.uniform(-.0003,.0003);st=len(v);cut=.003
  ring=[(x0+cut,y0),(x1-cut,y0),(x1,y0+cut),(x1,y1-cut),(x1-cut,y1),(x0+cut,y1),(x0,y1-cut),(x0,y0+cut)]
  for level in [0,1]:
   for xx,yy in ring:v.append((xx+(.001 if xx<cx else -.001) if level else xx,yy+(.001 if yy<cy else -.001) if level else yy,z if level else z-.0015))
  v.append((cx,cy,z))
  for k in range(8):
   n=(k+1)%8;f.extend([(st+8+k,st+8+n,st+16),(st+k,st+n,st+8+n,st+8+k)]);mi.extend([0,0])
new=bpy.data.meshes.new('V5 paneles minerales con junta fina');new.from_pydata(v,[],f);new.update();new.materials.append(stone);o.data=new
stats['paneles_pavimento']=1600
# Reduce the roof's checkerboard contrast while retaining all individual curved tiles.
for m in bpy.data.materials:
 if m.users and m.name.startswith('Teja envejecida'):
  try:idx=int(m.name.split('Teja envejecida ')[1][:2])
  except:idx=5
  factor=.87+.028*idx;c=tint((.29,.076,.032),factor);n,l,p,pos=shader(m)
  l.new(ramp(n,l,noise(n,l,pos,3.4),tint(c,.84),tint(c,1.05)),p.inputs['Base Color']);rough(n,l,p,noise(n,l,pos,35),.80,.94)
  co=bump(n,l,p,noise(n,l,pos,47),.0008,.35);bump(n,l,p,noise(n,l,pos,190,2),.0004,.4,co);m['textura_v4']='ceramica'
# Pigment closer to the warm ochre visible in the supplied crop.
for m in bpy.data.materials:
 if m.users and m.name.startswith('Ocre catedral'):
  for n in m.node_tree.nodes:
   if n.type=='VALTORGB':n.color_ramp.elements[0].color=(.60,.235,.024,1);n.color_ramp.elements[-1].color=(.82,.34,.042,1)
# Rear elevation is prominent in the return shot: replace the plain bars with framed architecture.
group('16 V5 Alzado visto en el recorte');before=set(bpy.data.objects)
for o in list(s.objects):
 if o.name.startswith(('Pilastra fachada oriental','Cornisa fachada oriental','Ventana fachada oriental')):bpy.data.objects.remove(o,do_unlink=True)
for u in [-11.5,-8.8,-3.0,3.0,8.8,11.5]:
 box('V5 pilastra alzado oriental',(u,72.21,12.2),(.32,.32,21.2),ivory,.018)
 for zz in [1.7,10.8,22.8]:box('V5 capitel oriental',(u,72.3,zz),(.58,.44,.19),ivory,.018)
for z,w in [(1.0,24.3),(10.7,24.6),(11.0,24.8),(22.7,24.6),(23.0,24.9)]:box('V5 cornisa posterior',(0,72.24,z),(w,.54,.19),ivory,.02)
for u in [-6,0,6]:
 arch('V5 ventana oriental ojival',u,72.39,13.0,2.3 if u else 2.8,6.1,glass,ivory,True)
 cyl('V5 parteluz oriental',(u,72.49,13.1),(u,72.49,18.1),.035,ivory,N=16)
 for z in [14.4,15.7,17.0]:cyl('V5 travesano oriental',(u-1.02,72.49,z),(u+1.02,72.49,z),.029,ivory,N=16)
for u in [-15.25,15.25]:
 for z in [1,8,15.7]:box('V5 moldura ala posterior',(u,72.12,z),(6.0,.36,.18),ivory,.016)
 arch('V5 vano ala posterior',u,72.28,8.8,1.6,4.8,glass,ivory)
for u in [-6,0,6]:arch('V5 vano bajo posterior',u,72.4,2.1,2.0,6.3,wood,ivory)
crest=[(-12,23.1),(-9,23.2),(-7,23.6),(-5.5,24.4),(-4,25.1),(-2,25.4),(0,25.5),(2,25.4),(4,25.1),(5.5,24.4),(7,23.6),(9,23.2),(12,23.1)]
ob=mesh('V5 remate curvo oriental',[(u,72.28,z) for u,z in [(-12,22.7),(12,22.7)]+list(reversed(crest))],[tuple(range(len(crest)+2))],yellow)
mod=ob.modifiers.new('Espesor de parapeto','SOLIDIFY');mod.thickness=.22
curve('V5 cornisa curva oriental',[(u,72.48,z) for u,z in crest],.095,ivory)
for u in [-8,8]:
 ps=[(u+.37*math.cos(k*math.tau/48),72.49,21.1+.37*math.sin(k*math.tau/48)) for k in range(48)]
 mesh('V5 oculo posterior',ps,[tuple(range(48))],glass);curve('V5 marco oculo posterior',ps+[ps[0]],.065,ivory)
bpy.context.view_layer.update();T=Matrix.Translation((-37.2,1.5,0))@Matrix.Rotation(-math.pi/2,4,'Z')
added=list(set(bpy.data.objects)-before)
for ob in added:ob.matrix_world=T@ob.matrix_world
stats['detalles_alzado_recorte']=len(added)
s['realismo_v5']=json.dumps(stats,ensure_ascii=False);json.dump(stats,open(B/'realismo_v5.json','w'),indent=2,ensure_ascii=False)
s.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];s.cycles.samples=48;s.cycles.use_denoising=True;s.render.resolution_x=1000;s.render.resolution_y=1400;s.render.resolution_percentage=100
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
# Preview the same wide angle that exposed the green foundation.
bpy.ops.object.camera_add(location=(254,-80,105));cam=bpy.context.object;cam.rotation_euler=(Vector((75,32,4))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=40;cam.data.clip_end=3000;s.camera=cam
s.render.resolution_x=1152;s.render.resolution_y=720;s.cycles.samples=24;s.render.filepath=str(B/'Previa_Correccion_Verde.png');bpy.ops.render.render(write_still=True)
print('REALISMO_V5_LISTO',stats,flush=True)
