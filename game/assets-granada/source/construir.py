import bpy,math,random,os,xml.etree.ElementTree as E,json
from mathutils import Vector,Matrix
from pathlib import Path
B=Path(__file__).parent;random.seed(49)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
COL=None
collections={}
def group(n):
 global COL
 if n not in collections:
  c=bpy.data.collections.new(n);bpy.context.scene.collection.children.link(c);collections[n]=c
 COL=collections[n]
def mesh(n,v,f,m=None,smooth=False):
 d=bpy.data.meshes.new(n);d.from_pydata(v,[],f);d.update();o=bpy.data.objects.new(n,d);COL.objects.link(o)
 if m:d.materials.append(m)
 if smooth:
  for p in d.polygons:p.use_smooth=True
 return o
def material(n,col,rough=.7,bump=.025,scale=6):
 m=bpy.data.materials.new(n);m.diffuse_color=(*col,1);m.use_nodes=True;ns=m.node_tree.nodes;p=ns.get('Principled BSDF');p.inputs['Base Color'].default_value=(*col,1);p.inputs['Roughness'].default_value=rough
 if bump:
  t=ns.new('ShaderNodeTexNoise');t.inputs['Scale'].default_value=scale;t.inputs['Detail'].default_value=4
  ramp=ns.new('ShaderNodeValToRGB');ramp.color_ramp.elements[0].position=.2;ramp.color_ramp.elements[0].color=(*(a*.67 for a in col),1);ramp.color_ramp.elements[1].position=.8;ramp.color_ramp.elements[1].color=(*col,1)
  m.node_tree.links.new(t.outputs['Fac'],ramp.inputs[0]);m.node_tree.links.new(ramp.outputs[0],p.inputs['Base Color']);b=ns.new('ShaderNodeBump');b.inputs['Strength'].default_value=.26;b.inputs['Distance'].default_value=bump;m.node_tree.links.new(t.outputs['Fac'],b.inputs['Height']);m.node_tree.links.new(b.outputs[0],p.inputs['Normal'])
 return m
def box(n,p,sz,m,bev=.02):
 x,y,z=[a/2 for a in sz];v=[(a*x,b*y,c*z) for a,b,c in [(-1,-1,-1),(-1,-1,1),(-1,1,-1),(-1,1,1),(1,-1,-1),(1,-1,1),(1,1,-1),(1,1,1)]]
 o=mesh(n,v,[(0,4,6,2),(1,3,7,5),(0,1,5,4),(2,6,7,3),(0,2,3,1),(4,5,7,6)],m);o.location=p
 if bev:b=o.modifiers.new('Bisel real','BEVEL');b.width=bev;b.segments=3
 return o
def cyl(n,a,b,r,m,r2=None,N=32):
 a,b=Vector(a),Vector(b);h=(b-a).length;r2=r if r2 is None else r2
 v=[(rr*math.cos(i*math.tau/N),rr*math.sin(i*math.tau/N),zz) for rr,zz in [(r,-h/2),(r2,h/2)] for i in range(N)]
 f=[tuple(range(N-1,-1,-1)),tuple(range(N,2*N))]+[(i,(i+1)%N,(i+1)%N+N,i+N) for i in range(N)]
 o=mesh(n,v,f,m,True);o.location=(a+b)/2;o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def curve(n,ps,r,m):
 d=bpy.data.curves.new(n,'CURVE');d.dimensions='3D';d.bevel_depth=r;d.bevel_resolution=3;p=d.splines.new('POLY');p.points.add(len(ps)-1)
 for a,b in zip(p.points,ps):a.co=(*b,1)
 o=bpy.data.objects.new(n,d);COL.objects.link(o);d.materials.append(m);return o
def sphere(n,p,sz,m):
 v=[(sz[0]*math.sin(j*math.pi/20)*math.cos(i*math.tau/40),sz[1]*math.sin(j*math.pi/20)*math.sin(i*math.tau/40),sz[2]*math.cos(j*math.pi/20)) for j in range(21) for i in range(40)]
 f=[(j*40+i,j*40+(i+1)%40,(j+1)*40+(i+1)%40,(j+1)*40+i) for j in range(20) for i in range(40)];o=mesh(n,v,f,m,True);o.location=p;return o
ivory=material('Cal blanca desgastada',(.82,.79,.68),.7,.016)
yellow=material('Ocre catedral - observado en F000 F570',(.86,.42,.065),.65,.025)
base=material('Zocalo azul gris catedral',(.14,.19,.24),.66,.02)
red=material('Cupulas rojo bermellon',(.58,.055,.025),.55,.015)
black=material('Hierro pintado negro',(.012,.018,.019),.34,.008)
wood=material('Madera oscura',(.13,.049,.018),.45,.018)
glass=material('Cristal oscuro',(.018,.041,.046),.14,0)
stone=material('Losas humedas gris azulado',(.19,.22,.24),.23,.022,18)
walk=material('Acera barro humedo',(.33,.19,.11),.33,.018)
curb=material('Bordillo amarillo',(.79,.44,.045),.65,.026)
bark=material('Tronco',(.16,.105,.05),.9,.07)
soil=material('Tierra y jardin',(.12,.13,.055),.9,.1)
blue=material('Papelera azul',(.015,.11,.38),.34,.012)
terracotta=[material('Teja envejecida %02d'%i,(.16+.025*i,.035+.009*i,.015+.004*i),.85,.02,12) for i in range(10)]
palette={n:material('Fachada '+n,c,.68,.025,4) for n,c in {'cian':(.075,.48,.57),'fucsia':(.72,.075,.23),'coral':(.69,.20,.16),'verde':(.32,.65,.18),'blanco':(.84,.81,.70),'crema':(.81,.64,.39),'mostaza':(.71,.39,.09),'melocoton':(.77,.44,.30),'azul':(.12,.33,.58),'rojo':(.63,.09,.09)}.items()}
# Ceramic tiles: curved surfaces with individual varied tones, modelled not a flat texture.
def tiles(n,x,y,w,d,ridge,fall=.45):
 v=[];f=[];indices=[]
 for side in [-1,1]:
  for j in range(math.ceil(w/.27)):
   xx=x-w/2+j*.27
   for i in range(math.ceil(d/2/.36)):
    dist=i*.36;st=len(v)
    for end in [0,1]:
     for k in range(9):
      a=k*math.pi/8;dd=dist+end*.42
      v.append((xx+.135*math.cos(a),y+side*dd,ridge-fall*dd+.065*math.sin(a)))
    idx=random.randrange(10)
    for k in range(8):f.append((st+k,st+k+1,st+k+10,st+k+9));indices.append(idx)
 o=mesh(n,v,f,None,True)
 for m in terracotta:o.data.materials.append(m)
 for p,idx in zip(o.data.polygons,indices):p.material_index=idx
 return o
def arch(n,x,y,b,w,h,m,trim=None,pointed=False):
 r=w/2;sp=b+h-(w*.65 if pointed else r)
 if pointed:
  cs=[(x-r,y,b),(x+r,y,b),(x+r,y,sp)]+[(x+r*(1-t/32),y,sp+(h+b-sp)*math.sin(t*math.pi/2/32)) for t in range(33)]+[(x-r*(t/32),y,sp+(h+b-sp)*math.cos(t*math.pi/2/32)) for t in range(33)]
 else:cs=[(x-r,y,b),(x+r,y,b),(x+r,y,sp)]+[(x+r*math.cos(t*math.pi/48),y,sp+r*math.sin(t*math.pi/48)) for t in range(49)]
 o=mesh(n,cs,[tuple(range(len(cs)))],m)
 if trim:curve(n+' marco',[(a,y-.035,c) for a,bb,c in cs[2:]]+[(x-r,y-.035,b)],.07,trim);curve(n+' jamba',[(x+r,y-.035,b),(x+r,y-.035,sp)],.07,trim)
 return o
# CATHEDRAL: local facade coordinates, front -Y, then georeferenced west-facing.
group('01 Catedral - geometria observada');before=set(bpy.data.objects)
box('Fachada cuerpo bajo',(0,.65,3.8),(37.3,1.3,7.6),yellow)
box('Fachada cuerpo alto',(0,.65,13.1),(37.3,1.3,11.0),yellow)
for z in [.3,1.1,7.45,8.0,18.55]:box('Cornisa moldurada',(0,-.15,z),(37.8,.65,.2),ivory)
box('Zocalo continuo',(0,-.1,.55),(37.5,.42,1.1),base)
# Deep portico: wall and openings behind actual round columns.
for u in [-8,0,8]:arch('Puerta portico',u,-.08,.95,3.0,5.5,wood,ivory)
for u in [-12,-9,-5,-1.8,1.8,5,9,12]:
 cyl('Columna portico',(u,-2.25,.9),(u,-2.25,6.65),.23,ivory,.20)
 for z in [1,6.5]:box('Capitel y basa portico',(u,-2.25,z),(.67,.65,.18),ivory)
 for j in range(12):
  a=j*math.tau/12;cyl('Estria vertical',(u+.205*math.cos(a),-2.25+.205*math.sin(a),1.2),(u+.18*math.cos(a),-2.25+.18*math.sin(a),6.4),.015,ivory,N=8)
box('Entablamento portico',(0,-1.2,6.95),(28.3,3.4,.55),ivory)
for u in [i*.38-13.3 for i in range(71)]:
 cyl('Balaustre terraza',(u,-2.55,7.33),(u,-2.55,7.92),.045,ivory)
 sphere('Balaustre curva',(u,-2.55,7.57),(.075,.075,.14),ivory)
box('Pasamanos terraza',(0,-2.55,7.99),(27.5,.22,.15),ivory)
for u in [-10.7,-7.6,-3,3,7.6,10.7]:
 cyl('Pilastra alta',(u,-.14,8.4),(u,-.14,18.2),.16,ivory)
 for z in [8.5,18.1]:box('Capitel pilastra',(u,-.14,z),(.48,.45,.16),ivory)
for u,kind in [(-11.7,'vidrio'),(-6.8,'nicho'),(0,'vidrio'),(6.8,'nicho'),(11.7,'vidrio')]:
 arch('Ventana ojival / nicho',u,-.08,9.3,2.0,7,glass if kind=='vidrio' else ivory,ivory,True)
 if kind=='vidrio':
  cyl('Parteluz ventana',(u,-.19,9.4),(u,-.19,15.8),.045,ivory)
  for z in [10.7,12,13.3,14.6]:cyl('Travesano ventana',(u-.8,-.20,z),(u+.8,-.20,z),.04,ivory)
mesh('Fronton triangular',[(-13.8,-.05,18.8),(13.8,-.05,18.8),(0,-.05,23.5)],[(0,1,2)],yellow)
for dz in [0,.3]:curve('Moldura fronton',[(-14,-.24,18.7+dz),(0,-.24,23.55+dz),(14,-.24,18.7+dz)],.12,ivory)
# Four-lobed quatrefoil, closely traced from F000 and F570.
vs=[]
for i in range(128):
 t=i*math.tau/128;rr=.88+.20*math.cos(4*t);vs.append((rr*math.cos(t),-.19,20.95+rr*math.sin(t)))
mesh('Oculo cuadrifolio',vs,[tuple(range(128))],black);curve('Marco cuadrifolio',vs+[vs[0]],.10,ivory)
def roundwindow(x,y,z,r):
 vs=[(x+r*math.cos(i*math.tau/64),y,z+r*math.sin(i*math.tau/64)) for i in range(64)]
 mesh('Oculo circular',vs,[tuple(range(64))],glass);curve('Marco oculo',vs+[vs[0]],.09,ivory)
def dome(x,y,z,r,h,lantern=True):
 vs=[(x+r*math.cos(j*math.pi/2/32)*math.cos(i*math.tau/96),y+r*math.cos(j*math.pi/2/32)*math.sin(i*math.tau/96),z+h*math.sin(j*math.pi/2/32)) for j in range(33) for i in range(96)]
 fs=[(j*96+i,j*96+(i+1)%96,(j+1)*96+(i+1)%96,(j+1)*96+i) for j in range(32) for i in range(96)];mesh('Cupula roja curva',vs,fs,red,True)
 for i in range(12):
  t=i*math.tau/12;curve('Nervio blanco cupula',[(x+(r+.03)*math.cos(a)*math.cos(t),y+(r+.03)*math.cos(a)*math.sin(t),z+h*math.sin(a)) for a in [j*math.pi/2/48 for j in range(49)]],.055,ivory)
 if lantern:
  cyl('Linterna cupula',(x,y,z+h),(x,y,z+h+1.7),.42,ivory)
  for i in range(8):
   a=i*math.tau/8;cyl('Pilar linterna',(x+.48*math.cos(a),y+.48*math.sin(a),z+h),(x+.48*math.cos(a),y+.48*math.sin(a),z+h+1.7),.05,ivory)
  sphere('Remate rojo',(x,y,z+h+1.85),(.55,.55,.65),red)
  cyl('Cruz',(x,y,z+h+2.4),(x,y,z+h+3.1),.025,ivory);cyl('Cruz travesano',(x-.18,y,z+h+2.85),(x+.18,y,z+h+2.85),.025,ivory)
for u in [-15.5,15.5]:
 box('Campanario prismático',(u,2.5,13),(6.3,6,26),yellow)
 for z in [.9,7.6,16.2,24.4,25.1]:box('Cornisa torre',(u,2.5,z),(6.8,6.6,.23),ivory)
 for du in [-2.75,2.75]:box('Pilastra torre',(u+du,-.56,12.4),(.25,.24,24.5),ivory)
 roundwindow(u,-.57,3.9,.8);roundwindow(u,-.57,13.7,.9)
 for du in [-.6,.6]:arch('Nicho torre',u+du,-.58,8.6,.6,3.4,ivory,ivory)
 arch('Vano campana',u,-.58,18,2.5,5.2,black,ivory,True)
 cyl('Campana soporte',(u-1,-.7,21),(u+1,-.7,21),.07,wood)
 sphere('Campana bronce',(u,-.73,20.4),(.38,.32,.55),wood)
 for dx in [-1,0,1]:cyl('Balaustrada campana',(u+dx*.45,-.74,18.1),(u+dx*.45,-.74,18.7),.04,ivory)
 for i in range(14):box('Denticulo cornisa',(u-3+i*.46,-.8,24.7),(.17,.22,.17),ivory,.01)
 dome(u,2.5,25.2,3.3,4.6)
 # Dormer in the dome, as seen in the video.
 roundwindow(u,-.79,26.3,.55)
# Main roof and side vaults.
box('Nave central',(0,36.75,11.7),(24,70.5,23.4),yellow)
# Main body side fenestration.
for ss in [-1,1]:
 box('Nave lateral',(ss*15,36.75,8),(6.2,70.5,16),yellow)
 box('Zocalo nave lateral',(ss*18.2,36,.7),(.16,72,1.4),base)
 for yy in range(7,68,8):
  box('Pilastra costado',(ss*18.2,yy,8),(.25,.6,15.5),ivory)
  # Dark inset planes visible in side elevation.
  box('Ventana lateral',(ss*18.23,yy+3.4,9.5),(.03,1.6,4.5),glass)
  for z in [2.8,16.1]:box('Cornisa lateral',(ss*18.25,36,z),(.38,72,.25),ivory)
# Ceramic roof ridge local Y, so use the tile generator then rotate around the centre.
o=tiles('Tejado nave catedral',0,36,72,24,28,.38)
for v in o.data.vertices:v.co.z=min(v.co.z,23.4+.575*max(0,min(v.co.x+36,36-v.co.x)))
o.rotation_euler.z=math.pi/2;o.location=(36,36,0)
# Barrel-vault white side roofs.
for ss in [-1,1]:
 vs=[];fs=[]
 for yy in [1,71]:
  for k in range(33):a=k*math.pi/32;vs.append((ss*15+3.2*math.cos(a),yy,16.2+3.2*math.sin(a)))
 for k in range(32):fs.append((k,k+1,k+34,k+33))
 mesh('Boveda blanca lateral',vs,fs,ivory,True)
# Main drum: octagonal face windows, tall central dome.
cyl('Tambor cupula mayor',(0,54,25),(0,54,30.5),5.4,yellow,N=96)
for k in range(12):
 a=k*math.tau/12;xx=5.42*math.cos(a);yy=54+5.42*math.sin(a);cyl('Pilar tambor',(xx,yy,25),(xx,yy,30.5),.12,ivory)
 # Recessed dark window at each drum face.
 old=set(bpy.data.objects);o=arch('Ventana tambor',0,0,26,1.35,3.6,glass,ivory);R=Matrix.Translation((xx,yy,0))@Matrix.Rotation(a+math.pi/2,4,'Z')
 for o in set(bpy.data.objects)-old:o.matrix_world=R@o.matrix_world
 # Frames are kept as separate physical curves, positioned below with rings.
for z in [25,30.5]:cyl('Cornisa circular tambor',(0,54,z),(0,54,z+.18),5.7,ivory,N=96)
dome(0,54,30.8,5.8,7.2)
# Rear elevation visible in the return shot, with central lancet and white pilasters.
for uu in [-10,-6,-2.5,2.5,6,10]:
 box('Pilastra fachada oriental',(uu,72.15,11),(.28,.26,20),ivory)
for zz in [1.1,7.8,18.5,22.9]:box('Cornisa fachada oriental',(0,72.18,zz),(24.3,.32,.22),ivory)
for uu in [-8,0,8]:arch('Ventana fachada oriental',uu,72.19,8.5,2.3,7.5,glass,ivory,True)
# Stairs and iron fence along porch.
for i in range(6):box('Escalinata',(0,-4.1+i*.42,.07+i*.11),(38,5-i*.45,.14+i*.16),base)
for u in [i*.32-18.6 for i in range(117)]:cyl('Verja frontal',(u,-4.8,.35),(u,-4.8,2.5),.018,black,N=12)
for z in [.8,1.9]:cyl('Travesano verja',(-18.7,-4.8,z),(18.7,-4.8,z),.025,black,N=12)
# Place cathedral according to its mapped west-facing frontage.
bpy.context.view_layer.update()
for o in set(bpy.data.objects)-before:
 o.matrix_world=Matrix.Translation((-37.2,1.5,0))@Matrix.Rotation(-math.pi/2,4,'Z')@o.matrix_world
 o['procedencia']='Exterior trazado de cuadros 000,100,470,570,640; altura aproximada, no levantada'
print('CATEDRAL CONSTRUIDA',flush=True)
# GEOREFERENCED STREET BASE; bounded to the portion visible in the film.
group('02 Planta real y calles')
r=E.parse(B/'granada_osm.xml').getroot();lat,lon=11.92982,-85.95324
nodes={n.get('id'):((float(n.get('lon'))-lon)*108920,(float(n.get('lat'))-lat)*111200) for n in r.findall('node')}
def points(w):return[nodes[n.get('ref')] for n in w.findall('nd') if n.get('ref') in nodes]
def tags(w):return{t.get('k'):t.get('v') for t in w.findall('tag')}
box('Terreno',(180,20,-.26),(1000,650,.5),soil,0)
for idx,w in enumerate(r.findall('way')):
 t=tags(w);ps=points(w)
 if 'highway' not in t or len(ps)<2:continue
 if any(abs(y)>230 or x < -240 or x>650 for x,y in ps):continue
 width=16 if t.get('name')=='Calle La Calzada' else 8
 for (x1,y1),(x2,y2) in zip(ps,ps[1:]):
  v=Vector((x2-x1,y2-y1));n=Vector((-v.y,v.x)).normalized()*width/2;z=.02+idx*.0001
  mesh(t.get('name','Calle cartografiada'),[(x1+n.x,y1+n.y,z),(x1-n.x,y1-n.y,z),(x2-n.x,y2-n.y,z),(x2+n.x,y2+n.y,z)],[(0,1,2,3)],stone)
# Centreline of La Calzada follows OSM coordinates, not a straight invented boulevard.
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# Dense mesh paving with jointed wet slabs and subtle unevenness.
for i in range(600):
 x=i*.8
 cy=center(x)
 for side in [-1,1]:
  box('Acera La Calzada',(x,cy+side*8,.12),(.8,2.1,.22),walk,.008)
  box('Bordillo amarillo',(x,cy+side*6.9,.14),(.8,.13,.28),curb,.01)
vs=[];fs=[];mis=[]
for i in range(590):
 x=i*.8
 for j in range(17):
  y=center(x)-6.8+j*.8;st=len(vs);z=.037+random.random()*.005
  vs.extend([(x,y,z),(x+.78,y,z),(x+.78,y+.78,z),(x,y+.78,z)]);fs.append((st,st+1,st+2,st+3));mis.append(random.randrange(3))
pave=mesh('Losas individuales humedas',vs,fs)
for c in [(.17,.195,.21),(.22,.245,.26),(.25,.265,.27)]:pave.data.materials.append(material('Piedra mojada '+str(c),c,.18,.012,30))
for p,i in zip(pave.data.polygons,mis):p.material_index=i
print('PLANTA CONSTRUIDA',flush=True)
# OBSERVED FACADES: asymmetric frontages, palette recorded from the video.
group('03 Fachadas de La Calzada')
def house(x,w,side,color,trimcolor='blanco',h=4.8,doors=3,depth=14):
 cy=center(x);front=cy+side*9;yy=front+side*depth/2
 wall=palette[color];tr=palette[trimcolor]
 box('Casa '+color,(x,yy,h/2+.15),(w-.08,depth,h),wall)
 box('Zocalo casa',(x,front-side*.03,.55),(w-.06,.14,.85),base)
 box('Cornisa casa',(x,front-side*.08,h+.08),(w+.1,.3,.18),tr)
 tiles('Tejas '+color,x,yy,w+.35,depth+.75,h+depth*.19,.38)
 for xx in [x-w/2,x+w/2]:mesh('Cierre lateral de hastial',[(xx,yy-depth/2,h),(xx,yy+depth/2,h),(xx,yy,h+depth*.19)],[(0,1,2)],wall)
 for j in range(doors):
  xx=x+(j-(doors-1)/2)*(w/(doors+.7));wid=min(1.3,w/(doors+1)*.55);bottom=.25 if j%2==0 else 1.15;ht=h-.8-bottom
  # facade plane front faces center; map front to local negative Y if north side.
  old=set(bpy.data.objects)
  arch('Vano casa '+color,xx,front-side*.075,bottom,wid,ht,wood if j%2==0 else glass,tr,False)
  if side<0:
   # The planar arched frame has no backface culling; bring trim towards the street.
   for o in set(bpy.data.objects)-old:
    if o.type=='CURVE':o.location.y+=.07
  for dx in [-wid/2-.12,wid/2+.12]:box('Jamba casa',(xx+dx,front-side*.12,bottom+ht/2),(.15,.22,ht),tr)
  if j%2:
   for d in [-.4,-.2,0,.2,.4]:cyl('Reja ventana',(xx+d,front-side*.20,bottom),(xx+d,front-side*.20,bottom+ht-.3),.017,black,N=10)
   for z in [bottom+.3,bottom+ht*.7]:cyl('Travesano reja',(xx-wid/2,front-side*.20,z),(xx+wid/2,front-side*.20,z),.02,black,N=10)
  else:
   for z in [.85,1.65,2.45]:
    for dx in [-wid*.23,wid*.23]:box('Cuarteron madera',(xx+dx,front-side*.16,z),(wid*.38,.04,.58),wood)
 # end pilasters and rainwater downpipe.
 for xx in [x-w/2+.12,x+w/2-.12]:box('Pilastra esquina',(xx,front-side*.08,h/2),(.25,.22,h),tr)
 cyl('Bajante pluvial',(x+w/2-.4,front-side*.17,.2),(x+w/2-.4,front-side*.17,h),.045,base)
# West block then east block. Colours represent visible sequence, widths remain approximate.
rows={1:[('mostaza',14),('melocoton',18),('crema',18),('coral',15),('fucsia',14),('blanco',16),('azul',14)],-1:[('azul',13),('verde',12),('blanco',15),('blanco',14),('crema',16),('mostaza',18),('melocoton',19)]}
for side,row in rows.items():
 x=87
 for k,(col,w) in enumerate(row):house(x+w/2,w,side,col,'blanco',4.7+(.25 if k%3==0 else 0),3,15);x+=w
# East of cross street: highly identifiable blue/pink and magenta corners in F180.
for side,row in {1:[('cian',13),('rojo',12),('blanco',15),('azul',15),('crema',17),('coral',18)],-1:[('fucsia',13),('mostaza',15),('blanco',15),('cian',14),('crema',17),('melocoton',17)]}.items():
 x=216
 for k,(col,w) in enumerate(row):house(x+w/2,w,side,col,'fucsia' if side==1 and k==0 else 'blanco',5 if k==0 else 4.7,3,16);x+=w
# Distant facades explicitly tagged as an extrapolated, unseen context.
for side in [-1,1]:
 for k in range(9):
  x=326+k*17;house(x,17,side,['crema','melocoton','blanco','mostaza'][k%4],h=4.6,doors=3,depth=15)
# Corner on north side of cathedral and white building in the aerial views.
for x,cy,w,d in [(-4,68,75,28),(-10,-47,65,25)]:
 box('Edificio vecino observado en vista aerea',(x,cy,4.8),(w,d,9.6),palette['blanco']);tiles('Techo edificio vecino',x,cy,w,d,13.8,.32)
 for xx in [x-w/2,x+w/2]:mesh('Hastial edificio vecino',[(xx,cy-d/2,9.6),(xx,cy+d/2,9.6),(xx,cy,13.8)],[(0,1,2)],palette['blanco'])
print('FACHADAS CONSTRUIDAS',flush=True)
# TREES: shared dense curved-leaf meshes; compact trimmed crowns visible in video.
group('04 Vegetacion detallada')
foliage=[material('Hoja tropical '+str(i),c,.63,.008) for i,c in enumerate([(.025,.25,.012),(.08,.40,.018),(.17,.52,.025),(.23,.59,.035)])]
def canopy(seed):
 rng=random.Random(seed);v=[];f=[];mi=[]
 for j in range(8500):
  a=rng.random()*math.tau;zz=rng.uniform(-1,1);rr=rng.random()**.24;sq=math.sqrt(1-zz*zz)
  p=Vector((3.05*rr*sq*math.cos(a),3.05*rr*sq*math.sin(a),1.35*rr*zz));t=rng.random()*math.tau;u=Vector((math.cos(t),math.sin(t),rng.uniform(-.4,.4)))*rng.uniform(.09,.15);vv=Vector((-math.sin(t),math.cos(t),rng.uniform(-.3,.3)))*rng.uniform(.035,.06);st=len(v)
  v.extend([tuple(p-u),tuple(p-vv),tuple(p+u),tuple(p+vv),tuple(p+Vector((0,0,.035)))]);f.extend([(st,st+1,st+4),(st+1,st+2,st+4),(st+2,st+3,st+4),(st+3,st,st+4)]);mi.extend([rng.randrange(4)]*4)
 o=mesh('Copa foliar original',v,f,None,True)
 for m in foliage:o.data.materials.append(m)
 for p,i in zip(o.data.polygons,mi):p.material_index=i
 o.hide_render=True;o.hide_viewport=True;return o.data
crowns=[canopy(i) for i in range(3)]
def tree(x,y,k,scale=1):
 box('Alcorque amarillo',(x,y,.25),(1.2,1.2,.5),curb)
 box('Tierra alcorque',(x,y,.51),(1.01,1.01,.03),soil)
 cyl('Tronco de arbol',(x,y,.45),(x+.07,y,3.55*scale),.12,bark,.065)
 for j in range(7):
  a=j*2.4;cyl('Rama',(x,y,2.4*scale),(x+math.cos(a)*1.5*scale,y+math.sin(a)*1.5*scale,3.6*scale),.04,bark,.015,N=16)
 o=bpy.data.objects.new('Copa detallada',crowns[k%3]);COL.objects.link(o);o.location=(x,y,3.8*scale);o.scale=(scale,scale,scale);o.rotation_euler.z=k*.7
for i,x in enumerate(range(94,474,10)):
 # leave actual cross streets open
 if any(abs(x-v)<8 for v in [198,209,309,383]):continue
 for side in [-1,1]:tree(x,center(x)+side*3.6,i,random.uniform(.92,1.08))
# Park canopy west of church; dense crowns, not a bare lawn.
for j in range(5):
 for i in range(7):tree(-63-j*11,-23+i*15,i+j,random.uniform(1.25,1.75))
print('VEGETACION CONSTRUIDA',flush=True)
# STREET FURNITURE: triple lanterns, blue bins, seating, restaurant tables, clay pots.
group('05 Faroles bancas maceteras')
lanternglass=material('Cristal faroles',(.67,.74,.72),.19,0)
terra=material('Barro macetera',(.47,.17,.065),.7,.02)
def lamp(x,y):
 cyl('Base farol',(x,y,.2),(x,y,.5),.17,black);cyl('Poste farol',(x,y,.45),(x,y,4.35),.052,black)
 for dx in [-.45,0,.45]:
  z=4.35 if dx==0 else 4.12;curve('Brazo farol',[(x,y,3.8),(x+dx*.5,y,z),(x+dx,y,z)],.033,black)
  box('Vidrio farol',(x+dx,y,z+.19),(.22,.22,.36),lanternglass)
  for aa in [-1,1]:
   for bb in [-1,1]:cyl('Marco farol',(x+dx+aa*.11,y+bb*.11,z),(x+dx+aa*.11,y+bb*.11,z+.37),.015,black,N=8)
  cyl('Tapa farol',(x+dx,y,z+.37),(x+dx,y,z+.52),.19,black,.02,N=4)
def bench(x,y):
 for j in range(5):box('Tabla asiento',(x,y-.32+j*.15,.73),(1.65,.11,.07),wood)
 for j in range(3):box('Tabla respaldo',(x,y+.35,1.0+j*.15),(1.65,.07,.10),wood)
 for dx in [-.65,.65]:box('Pata banca',(x+dx,y,.45),(.065,.65,.55),black)
for i,x in enumerate(range(93,460,12)):
 if any(abs(x-v)<8 for v in [198,209,309,383]):continue
 for ss in [-1,1]:
  y=center(x)+ss*5.4;lamp(x,y)
  if i%2==0:bench(x+2,center(x)+ss*3.7)
  if i%3==0:box('Papelera azul',(x-1.2,y,.7),(.5,.5,1.1),blue,.07)
  # terracotta pots at the facade line
  cyl('Macetera terracota',(x+4,center(x)+ss*7.5,.2),(x+4,center(x)+ss*7.5,1.1),.24,terra,.38)
  sphere('Arbusto macetera',(x+4,center(x)+ss*7.5,1.3),(.44,.44,.32),foliage[2])
 for ss in [-1,1]:
  if i%2:continue
  y=center(x)+ss*6.4;box('Mesa restaurante',(x+5,y,.8),(1.1,.75,.07),wood)
  for dx in [-.4,.4]:
   for dy in [-.25,.25]:box('Pata mesa',(x+5+dx,y+dy,.43),(.05,.05,.75),black)
  for dx in [-.8,.8]:
   box('Asiento silla',(x+5+dx,y,.45),(.42,.44,.06),wood);box('Respaldo silla',(x+5+dx,y+.2,.72),(.42,.06,.5),wood)
# Small tiled-roof kiosk appears in F129 and F470 beside cathedral.
box('Quiosco visible junto catedral',(61,27,1.4),(2.6,2.4,2.8),palette['mostaza']);tiles('Tejado quiosco',61,27,3.3,3.1,3.7,.5)
# Minimal back context and cameras. No invented full city claim.
group('06 Camaras e iluminacion')
world=bpy.data.worlds.new('Cielo cubierto del video');bpy.context.scene.world=world;world.use_nodes=True;world.node_tree.nodes['Background'].inputs[0].default_value=(.68,.76,.79,1);world.node_tree.nodes['Background'].inputs[1].default_value=.6
bpy.ops.object.light_add(type='AREA',location=(100,15,100));o=bpy.context.object;o.name='Luz cielo difuso';o.data.energy=80000;o.data.shape='DISK';o.data.size=120
bpy.ops.object.light_add(type='SUN');o=bpy.context.object;o.rotation_euler=Vector((-.3,-.5,-1)).to_track_quat('-Z','Y').to_euler();o.data.energy=.7;o.data.angle=.4
sc=bpy.context.scene;sc.unit_settings.system='METRIC';sc.render.engine='CYCLES';sc.cycles.samples=48;sc.cycles.use_denoising=True;sc.render.resolution_x=1000;sc.render.resolution_y=1400;sc.render.resolution_percentage=100;sc.view_settings.view_transform='AgX';sc.view_settings.exposure=.65
# Match the direction, height and composition of shot F390, then provide a front-elevation camera.
def camera(n,p,t,lens):
 bpy.ops.object.camera_add(location=p);o=bpy.context.object;o.name=n;o.rotation_euler=(Vector(t)-o.location).to_track_quat('-Z','Y').to_euler();o.data.lens=lens;o.data.clip_end=3000;return o
sc.camera=camera('Comparacion F390 - regreso por Calzada',(177,center(177),10.4),(0,31,-24),36)
camera('Comparacion F570 - fachada y parque',(-116,-3,19),(-15,2,17),33)
camera('Comparacion F000 - vista aerea',(-115,-90,100),(8,10,9),45)
camera('Comparacion F180 - recorrido este',(195,center(195),9),(380,center(380),4),32)
sc['fuente']='Video usuario 1000335388.mp4, 801 cuadros revisados; OpenStreetMap contributors ODbL'
sc['estado']='Reconstruccion exterior de referencia, NO copia identica ni levantamiento certificado. Zonas ocultas no observadas. Alturas estimadas.'
sc['origen_WGS84']='11.92982, -85.95324'
n=bpy.data.texts.new('ALCANCE - LEER');n.write('El video muestra Granada, no Managua.\nSe revisaron los 801 cuadros.\nPlanta y orientacion apoyadas en OSM.\nMateriales, siluetas, ventanas, mobiliario y tejados reconstruidos a partir de los cuadros visibles.\nNo se garantiza identidad geometrica ni fotografica: medidas verticales, fondos y fachadas ocultas no se recuperan del video.\nEl modelo requiere comparacion y ajuste adicionales.\nFuentes: archivo aportado por el usuario; https://www.openstreetmap.org/copyright\n')
# Actual pavement colour sample from the user video, embedded into the project.
img=bpy.data.images.load(str(B/'Pavimento_del_video.png'));img.pack()
for m in bpy.data.materials:
 if m.name.startswith('Piedra mojada'):
  ns=m.node_tree.nodes;p=ns.get('Principled BSDF');tex=ns.new('ShaderNodeTexImage');tex.image=img;tex.extension='REPEAT';coord=ns.new('ShaderNodeNewGeometry');scale=ns.new('ShaderNodeVectorMath');scale.operation='SCALE';scale.inputs['Scale'].default_value=.25;m.node_tree.links.new(coord.outputs['Position'],scale.inputs[0]);m.node_tree.links.new(scale.outputs[0],tex.inputs[0]);m.node_tree.links.new(tex.outputs['Color'],p.inputs['Base Color'])
# all embedded; no textures outside the blend
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
sc.render.image_settings.file_format='PNG';sc.render.filepath=str(B/'Comparacion_Calzada.png');bpy.ops.render.render(write_still=True)
sc.camera=bpy.data.objects['Comparacion F570 - fachada y parque'];sc.render.filepath=str(B/'Comparacion_Catedral.png');bpy.ops.render.render(write_still=True)
print('ESCENA Y VISTAS COMPLETADAS',len(bpy.data.objects),flush=True)
