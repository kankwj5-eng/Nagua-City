import bpy,math,random,json
from mathutils import Vector,Matrix
from pathlib import Path
B=Path(__file__).parent
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('# CATHEDRAL:')])
sc=bpy.context.scene;random.seed(331);stats={}
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
# Cathedral: physical relief, paired pilasters, enriched cornices and side openings.
group('12 V3 Catedral afinada');old=set(bpy.data.objects)
for o in list(sc.objects):
 if o.name.startswith(('Pilastra alta','Capitel pilastra','Ventana lateral')):bpy.data.objects.remove(o,do_unlink=True)
for u in [-10.7,-7.6,-3,3,7.6,10.7]:
 for dx in [-.20,.20]:
  box('V3 pilastra pareada',(u+dx,-.20,13.2),(.17,.27,9.75),ivory,.015)
  for z in [8.4,18.05]:box('V3 capitel pilastra',(u+dx,-.28,z),(.31,.40,.19),ivory,.012)
# Stepped front cornices and tooth ornaments produce shadows visible in the original.
for z,w,dep in [(18.35,28.2,.56),(18.58,28.7,.72),(18.83,29.0,.90)]:box('V3 cornisa escalonada frontal',(0,-.24,z),(w,dep,.13),ivory,.016)
for u in [i*.43-13.55 for i in range(64)]:box('V3 denticulo fronton',(u,-.57,18.25),(.16,.22,.17),ivory,.012)
for u in [-15.5,15.5]:
 for z,hh in [(3.8,5.7),(12.0,6.3),(20.6,7.0)]:
  # Rectangular white panel borders around existing circular and arched openings.
  for dx in [-2.48,2.48]:box('V3 marco vertical torre',(u+dx,-.68,z),(.11,.17,hh),ivory,.012)
  for zz in [z-hh/2,z+hh/2]:box('V3 marco horizontal torre',(u,-.68,zz),(5.05,.17,.11),ivory,.012)
 for z in [7.5,16.2,24.55,25.15]:
  box('V3 gola torre',(u,2.5,z),(6.98,6.83,.13),ivory,.02)
 for j in range(15):
  box('V3 denticulo lateral torre',(u+3.3,-.3+j*.42,24.8),(.25,.15,.20),ivory,.01)
 # Bell opening on the tower side, visible in the street approach.
 for sign in [-1,1]:
  before=set(bpy.data.objects);arch('V3 vano lateral campanario',0,0,18,2.5,5.3,black,ivory,True)
  R=Matrix.Translation((u+sign*3.17,2.5,0))@Matrix.Rotation(sign*math.pi/2,4,'Z')
  bpy.context.view_layer.update()
  for ob in set(bpy.data.objects)-before:ob.matrix_world=R@ob.matrix_world
# Column bases, capital rings and small volutes on the portico.
for u in [-12,-9,-5,-1.8,1.8,5,9,12]:
 for z,r in [(1.05,.31),(1.20,.27),(6.36,.27),(6.52,.32)]:cyl('V3 anillo columna',(u,-2.25,z),(u,-2.25,z+.08),r,ivory,N=48)
 for side in [-1,1]:
  curve('V3 voluta capitel',[(u+side*(.16+.08*t/24)*math.cos(t*math.tau/24),-2.52,6.48+(.10-.065*t/24)*math.sin(t*math.tau/24)) for t in range(25)],.028,ivory)
# Arch frames and finer window muntins.
for u in [-11.7,0,11.7]:
 for z in [10.2,11.2,12.2,13.2,14.2,15.1]:cyl('V3 division vidriera',(u-.78,-.245,z),(u+.78,-.245,z),.024,ivory,N=12)
# Side elevation: replace flat dark rectangles by two levels of framed arches.
sidewindows=0
for sign in [-1,1]:
 for yy in range(7,68,8):
  for lower,height in [(3.3,4.7),(9.4,5.1)]:
   before=set(bpy.data.objects);arch('V3 ventana lateral moldurada',0,0,lower,1.7,height,glass,ivory,True)
   R=Matrix.Translation((sign*18.32,yy+3.4,0))@Matrix.Rotation(sign*math.pi/2,4,'Z')
   bpy.context.view_layer.update()
   for ob in set(bpy.data.objects)-before:ob.matrix_world=R@ob.matrix_world
   sidewindows+=1
 for yy in [19,51]:
  before=set(bpy.data.objects);arch('V3 puerta lateral catedral',0,0,.5,2.5,4.6,wood,ivory)
  R=Matrix.Translation((sign*18.34,yy,0))@Matrix.Rotation(sign*math.pi/2,4,'Z');bpy.context.view_layer.update()
  for ob in set(bpy.data.objects)-before:ob.matrix_world=R@ob.matrix_world
# Richer drum cornices and exterior ribs, all actual geometry.
for z,r in [(24.8,5.85),(25.1,5.7),(30.35,5.75),(30.65,5.85)]:cyl('V3 cornisa tambor mayor',(0,54,z),(0,54,z+.12),r,ivory,N=96)
# Cathedral helper geometry is local until this single placement transformation.
bpy.context.view_layer.update();T=Matrix.Translation((-37.2,1.5,0))@Matrix.Rotation(-math.pi/2,4,'Z')
newcat=list(set(bpy.data.objects)-old)
for o in newcat:o.matrix_world=T@o.matrix_world
stats['detalles_catedral_nuevos']=len(newcat);stats['ventanas_laterales_molduradas']=sidewindows
# Enlarge the previously undersized tower oculi and their mouldings around their own centres.
for o in sc.objects:
 if o.name.startswith('Oculo circular') and o.type=='MESH':
  zs=[v.co.z for v in o.data.vertices]
  if sum(zs)/len(zs)<18:
   c=sum((v.co for v in o.data.vertices),Vector())/len(o.data.vertices)
   for v in o.data.vertices:v.co=c+(v.co-c)*1.24
 if o.name.startswith('Marco oculo') and o.type=='CURVE':
  ps=o.data.splines[0].points;c=sum((Vector(p.co[:3]) for p in ps),Vector())/len(ps)
  if c.z<18:
   for p in ps:
    v=c+(Vector(p.co[:3])-c)*1.24;p.co=(*v,1)
# Warmer ochre, red dome pigment and fine plaster relief, without glossy plastic walls.
for m in bpy.data.materials:
 if m.name.startswith('Ocre catedral'):
  p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Roughness'].default_value=.76
  for n in m.node_tree.nodes:
   if n.type=='VALTORGB':n.color_ramp.elements[0].color=(.60,.22,.025,1);n.color_ramp.elements[1].color=(.95,.48,.065,1)
 if m.name.startswith('Cupulas rojo bermellon'):
  for n in m.node_tree.nodes:
   if n.type=='VALTORGB':n.color_ramp.elements[0].color=(.33,.018,.01,1);n.color_ramp.elements[1].color=(.67,.055,.025,1)
print('CATEDRAL_V3',stats,flush=True)
# Dark wet stone: preserve the reference texture but neutralise the mauve tint.
for m in bpy.data.materials:
 if m.name.startswith('Piedra mojada'):
  ns=m.node_tree.nodes;links=m.node_tree.links;p=ns.get('Principled BSDF');source=next(n for n in ns if n.type=='TEX_IMAGE');bw=ns.new('ShaderNodeRGBToBW');mix=ns.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=1;mix.inputs[2].default_value=(.22,.27,.34,1);links.new(source.outputs['Color'],bw.inputs[0]);links.new(bw.outputs[0],mix.inputs[1]);links.new(mix.outputs[0],p.inputs['Base Color']);p.inputs['Roughness'].default_value=.22;p.inputs['Coat Weight'].default_value=.16
 if m.name.startswith('Losas humedas gris azulado'):
  for n in m.node_tree.nodes:
   if n.type=='VALTORGB':n.color_ramp.elements[0].color=(.025,.032,.042,1);n.color_ramp.elements[1].color=(.065,.076,.092,1)
# Reduce exaggerated joints in the large initial pavement slab mesh.
o=bpy.data.objects.get('Losas individuales humedas')
if o:
 for f in o.data.polygons:
  c=sum((o.data.vertices[i].co for i in f.vertices),Vector())/len(f.vertices)
  for i in f.vertices:
   v=o.data.vertices[i].co;v.x=c.x+(v.x-c.x)*1.014;v.y=c.y+(v.y-c.y)*1.014
# New, readable black lanterns are placed midway between tree crowns.
for o in list(sc.objects):
 if o.name.startswith(('Base farol','Poste farol','Brazo farol','Vidrio farol','Marco farol','Tapa farol','Tabla asiento','Tabla respaldo','Pata banca','Mesa restaurante','Pata mesa','Asiento silla','Respaldo silla')):bpy.data.objects.remove(o,do_unlink=True)
group('13 V3 Faroles negros y mobiliario')
metal=material('V3 hierro negro forjado',(.006,.008,.010),.32,.004)
lantern=material('V3 cristal farol',(.55,.64,.68),.22,0)
woodseat=material('V3 madera asientos',(.30,.105,.027),.47,.013,11)
def lamp(x,y):
 cyl('V3 base farol',(x,y,.1),(x,y,.35),.21,metal);cyl('V3 pedestal farol',(x,y,.3),(x,y,.7),.12,metal,.085)
 cyl('V3 poste negro',(x,y,.6),(x,y,4.65),.063,metal,.045)
 for side in [-1,1]:
  curve('V3 brazo forjado',[(x,y,3.95),(x+side*.12,y,4.22),(x+side*.48,y,4.5),(x+side*.62,y,4.43)],.035,metal)
  curve('V3 voluta farol',[(x+side*(.24+.15*math.cos(t*math.pi/24)),y,4.05+.13*math.sin(t*math.pi/24)) for t in range(37)],.025,metal)
 for dx in [-.62,0,.62]:
  z=4.65 if dx==0 else 4.45
  cyl('V3 cristal linterna',(x+dx,y,z),(x+dx,y,z+.45),.11,lantern,.19,N=6)
  for k in range(6):
   a=k*math.tau/6;cyl('V3 marco linterna',(x+dx+.11*math.cos(a),y+.11*math.sin(a),z),(x+dx+.19*math.cos(a),y+.19*math.sin(a),z+.45),.017,metal,N=10)
  cyl('V3 sombrerete negro',(x+dx,y,z+.45),(x+dx,y,z+.66),.25,metal,.04,N=6)
  sphere('V3 remate linterna',(x+dx,y,z+.69),(.045,.045,.06),metal)
 cyl('V3 remate poste',(x,y,5.3),(x,y,5.42),.025,metal)
def bench(x,y):
 for j in range(6):box('V3 liston asiento',(x,y-.35+j*.13,.49),(1.85,.10,.065),woodseat,.012)
 for j in range(4):box('V3 liston respaldo',(x,y+.36,.69+j*.14),(1.85,.065,.10),woodseat,.012)
 for dx in [-.72,.72]:
  for dy in [-.28,.28]:cyl('V3 pata banca',(x+dx,y+dy,.08),(x+dx,y+dy,.49),.032,metal,N=16)
  curve('V3 brazo banca',[(x+dx,y-.33,.5),(x+dx,y-.4,.73),(x+dx,y+.2,.79),(x+dx,y+.35,.66)],.035,metal)
  cyl('V3 soporte respaldo',(x+dx,y+.35,.35),(x+dx,y+.35,1.18),.028,metal,N=16)
def chair(x,y,ang):
 old=set(bpy.data.objects)
 for j in range(4):box('V3 liston silla',(0,-.18+j*.12,.46),(.45,.09,.05),woodseat,.01)
 for j in range(3):box('V3 respaldo silla',(0,.21,.69+j*.12),(.45,.045,.075),woodseat,.01)
 for dx in [-.19,.19]:
  for dy in [-.18,.18]:cyl('V3 pata silla',(dx*1.15,dy*1.15,.05),(dx,dy,.46),.018,metal,N=12)
  cyl('V3 montante silla',(dx,.2,.36),(dx,.24,1.0),.018,metal,N=12)
 bpy.context.view_layer.update();R=Matrix.Translation((x,y,0))@Matrix.Rotation(ang,4,'Z')
 for o in set(bpy.data.objects)-old:o.matrix_world=R@o.matrix_world
lampcount=benchcount=chaircount=0
for i,x in enumerate(range(99,470,10)):
 if any(abs(x-v)<8 for v in [198,209,309,383]):continue
 for side in [-1,1]:
  y=center(x)+side*2.65;lamp(x,y);lampcount+=1
  if i%2==0:bench(x+1,center(x)+side*4.9);benchcount+=1
  if i%3==0:
   yy=center(x)+side*7.0
   for j in range(6):box('V3 table de cafe',(x,yy-.42+j*.16,.77),(1.15,.13,.065),woodseat,.013)
   for dx in [-.43,.43]:
    for dy in [-.34,.34]:cyl('V3 pied table',(x+dx,yy+dy,.08),(x+dx,yy+dy,.75),.025,metal,N=12)
   for dx,dy,ang in [(-.90,0,-math.pi/2),(.9,0,math.pi/2),(0,-.82,0),(0,.82,math.pi)]:chair(x+dx,yy+dy,ang);chaircount+=1
# Raise street crowns slightly so trunks, black posts and seats remain readable.
for o in sc.objects:
 if o.name.startswith('Copa detallada') and o.location.x>0:o.location.z+=.35
stats.update({'faroles_negros':lampcount,'bancas_completas':benchcount,'sillas_con_patas':chaircount})
print('MOBILIARIO_V3',stats,flush=True)
# Fuller palm crowns: interleave a second set of leaflets around each existing frond.
group('14 V3 Palmeras y fondo')
centers=[(-71,-23),(-76,4),(-85,57),(-107,62),(-117,20),(-111,-23),(3,86),(20,75),(66,69),(72,1)]
for o in [o for o in sc.objects if o.name.startswith('V2 foliolos de palmera')]:
 c=sum((v.co for v in o.data.vertices),Vector())/len(o.data.vertices);x,y=min(centers,key=lambda q:(c.x-q[0])**2+(c.y-q[1])**2)
 d=o.copy();d.data=o.data.copy();COL.objects.link(d);d.name='V3 foliolos intercalados';R=Matrix.Translation((x,y,0))@Matrix.Rotation(math.radians(3.2),4,'Z')@Matrix.Translation((-x,-y,0))
 for v in d.data.vertices:v.co=R@v.co
# Distant residential fabric, explicitly contextual rather than individually surveyed.
roofmat=bpy.data.materials['V2 teja contexto'];extra=0
terrain=bpy.data.objects.get('Terreno')
if terrain:terrain.dimensions=(2300,1800,.5)
for j in range(7):
 for i in range(19):
  x=-245+i*43+random.uniform(-2,2);y=325+j*40;w=random.uniform(27,37);d=random.uniform(24,31);h=random.uniform(4,6)
  for ox,oy,wx,dy in [(0,-d/2+3,w,6),(0,d/2-3,w,6),(-w/2+3,0,6,d-12),(w/2-3,0,6,d-12)]:
   px,py=x+ox,y+oy;col=palette[random.choice(['blanco','crema','mostaza','coral','melocoton'])];o=box('V3 fondo residencial aproximado',(px,py,h/2),(wx,dy,h),col,.015);o['fuente']='Contexto lejano aproximado, no fachada verificada';rise=min(wx,dy)*.28
   mesh('V3 tejado fondo',[(px-wx/2,py-dy/2,h),(px+wx/2,py-dy/2,h),(px+wx/2,py+dy/2,h),(px-wx/2,py+dy/2,h),(px,py,h+rise)],[(0,1,4),(1,2,4),(2,3,4),(3,0,4)],roofmat)
  extra+=1
stats['patios_de_fondo_aproximados']=extra
# Blue camera sky and slightly blue ambient reflection; retain clouds.
ns=sc.world.node_tree.nodes
for n in ns:
 if n.type=='VALTORGB':n.color_ramp.elements[0].color=(.08,.19,.40,1);n.color_ramp.elements[1].color=(.52,.68,.88,1)
 if n.type=='BACKGROUND':
  if n.name=='Background':n.inputs['Color'].default_value=(.42,.55,.72,1);n.inputs['Strength'].default_value=.72
  else:n.inputs['Strength'].default_value=1.15
# New close-up proves furniture is full geometry rather than a distant symbol.
bpy.ops.object.camera_add(location=(125,center(125)-.7,1.7));cam=bpy.context.object;cam.name='V3 detalle de faroles y asientos';cam.rotation_euler=(Vector((119,center(119)-4.8,2.25))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=27;cam.data.clip_end=3000
sc.camera=bpy.data.objects['Comparacion F390 - regreso por Calzada'];sc.view_settings.exposure=.55;sc.cycles.samples=64;sc.cycles.use_denoising=True
sc['afinacion_v3']=json.dumps(stats);sc['estado']='V3: catedral, faroles visibles, asientos, palmeras, calle oscura y cielo azul. Persisten medidas y contexto aproximados.'
assert all(i.packed_file for i in bpy.data.images if i.source=='FILE')
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True);json.dump(stats,open(B/'afinacion_v3.json','w'),indent=2)
for cn,fn in [('Comparacion F390 - regreso por Calzada','Comparacion_Calzada.png'),('Comparacion F570 - fachada y parque','Comparacion_Catedral.png'),('V3 detalle de faroles y asientos','Detalle_Mobiliario.png'),('Comparacion F000 - vista aerea','Entorno_Aereo.png')]:
 sc.camera=bpy.data.objects[cn];sc.render.filepath=str(B/fn);bpy.ops.render.render(write_still=True)
print('V3_TERMINADO',stats,flush=True)
