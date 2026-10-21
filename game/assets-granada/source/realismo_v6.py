"""Aplicar UNA VEZ sobre Granada V5. Modifica el modelo real, sin retoques de imagen."""
import bpy,math,random,json,bmesh
from pathlib import Path
from mathutils import Vector
B=Path(__file__).parent;s=bpy.context.scene;random.seed(61021)
src=(B/'construir.py').read_text();exec(src[src.index('COL=None'):src.index('ivory=material')])
src=(B/'texturas_v4.py').read_text();exec(src[:src.index('# Rebuild only')])
stats={};group('19 V6 Relieve y vegetacion')
def center(x):
 ps=[(0,34.75),(59,34.7),(85,34.35),(198,30.33),(209,30.33),(309,28),(383,25),(466,24)]
 for (a,b),(c,d) in zip(ps,ps[1:]):
  if a<=x<=c:return b+(d-b)*(x-a)/(c-a)
 return 34.75 if x<0 else 24
w=s.world;w.use_nodes=True;n=w.node_tree.nodes;n.clear();l=w.node_tree.links
sky=n.new('ShaderNodeTexSky');sky.sky_type='NISHITA';sky.sun_disc=False;sky.sun_elevation=math.radians(48);sky.sun_rotation=math.radians(135);sky.air_density=1.0;sky.dust_density=.8;sky.ozone_density=1
bg=n.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.28;out=n.new('ShaderNodeOutputWorld');l.new(sky.outputs[0],bg.inputs[0]);l.new(bg.outputs[0],out.inputs[0])
for o in s.objects:
 if o.type=='LIGHT':
  if o.data.type=='SUN':o.rotation_euler=Vector((.60,-.60,-1.1)).to_track_quat('-Z','Y').to_euler();o.data.energy=2.0;o.data.angle=math.radians(5)
  else:o.hide_render=True
s.view_settings.view_transform='AgX';s.view_settings.look='AgX - Medium High Contrast';s.view_settings.exposure=-.15
weathered=0
for m in list(bpy.data.materials):
 if not m.users or not m.use_nodes or not m.name.startswith(('Fachada ','Cal blanca','Ocre catedral','Zocalo azul','Bordillo amarillo')):continue
 n=m.node_tree.nodes;l=m.node_tree.links;p=next((a for a in n if a.type=='BSDF_PRINCIPLED'),None)
 if not p or not p.inputs['Base Color'].is_linked:continue
 original=p.inputs['Base Color'].links[0].from_socket;pos=n.new('ShaderNodeNewGeometry').outputs['Position']
 sep=n.new('ShaderNodeSeparateXYZ');l.new(pos,sep.inputs[0]);height=n.new('ShaderNodeMapRange');height.clamp=True;height.inputs['From Min'].default_value=.12;height.inputs['From Max'].default_value=1.3;height.inputs['To Min'].default_value=.48;height.inputs['To Max'].default_value=0;l.new(sep.outputs['Z'],height.inputs[0])
 streak=noise(n,l,scaled(n,l,pos,(2,2,.22)),5,4);mask=n.new('ShaderNodeMath');mask.operation='MULTIPLY';l.new(height.outputs[0],mask.inputs[0]);l.new(streak,mask.inputs[1])
 mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';l.new(mask.outputs[0],mix.inputs[0]);l.new(original,mix.inputs[1]);mix.inputs[2].default_value=(.30,.27,.21,1);l.new(mix.outputs[0],p.inputs['Base Color'])
 co=bump(n,l,p,noise(n,l,pos,26),.0015,.42,p.inputs['Normal'].links[0].from_socket if p.inputs['Normal'].is_linked else None);bump(n,l,p,noise(n,l,pos,220,2),.00045,.4,co);p.inputs['Coat Weight'].default_value=0;m['realismo_v6']='Poros y desgaste localizado junto al suelo';weathered+=1
stats['materiales_revoque_con_desgaste']=weathered
m=bpy.data.materials['V5 piedra gris del recorte'];n,l,p,pos=shader(m)
basecol=ramp(n,l,noise(n,l,pos,1.9),(.055,.052,.048),(.085,.081,.075),.18,.85)
grain=noise(n,l,pos,140,3);graincol=ramp(n,l,grain,(.16,.15,.14),(1.10,1.08,1.04),.26,.75)
mix=n.new('ShaderNodeMixRGB');mix.blend_type='MULTIPLY';mix.inputs[0].default_value=.62;l.new(basecol,mix.inputs[1]);l.new(graincol,mix.inputs[2])
wet=ramp(n,l,noise(n,l,scaled(n,l,pos,(1,.55,1)),.55),(.04,.04,.04),(.6,.6,.6),.35,.73);dark=n.new('ShaderNodeMixRGB');dark.blend_type='MULTIPLY';l.new(wet,dark.inputs[0]);l.new(mix.outputs[0],dark.inputs[1]);dark.inputs[2].default_value=(.75,.78,.80,1);l.new(dark.outputs[0],p.inputs['Base Color']);rough(n,l,p,noise(n,l,scaled(n,l,pos,(1,.55,1)),.55),.42,.81)
co=bump(n,l,p,noise(n,l,pos,33),.0020,.37);bump(n,l,p,grain,.0032,.65,co);p.inputs['Specular IOR Level'].default_value=.32;m['realismo_v6']='Grano mineral reforzado, humedad discontinua y sin barniz'
def bounds(o):
 ps=[o.matrix_world@Vector(v) for v in o.bound_box];return [min(v[i] for v in ps) for i in range(3)],[max(v[i] for v in ps) for i in range(3)]
def recess(wall,planes,normal,depth):
 v=[];f=[];done=[];normal=Vector(normal)
 for surf in planes:
  if not surf.data.polygons:continue
  ring=[surf.matrix_world@surf.data.vertices[j].co for j in surf.data.polygons[0].vertices];clean=[]
  for q in ring:
   if not clean or (q-clean[-1]).length>1e-5:clean.append(q)
  if len(clean)>2 and (clean[0]-clean[-1]).length<1e-5:clean.pop()
  if len(clean)<3:continue
  count=len(clean);st=len(v)
  for dist in [.6,-depth]:v.extend([tuple(q+normal*dist) for q in clean])
  f.extend([tuple(st+j for j in range(count-1,-1,-1)),tuple(st+count+j for j in range(count))])
  for j in range(count):k=(j+1)%count;f.append((st+j,st+k,st+count+k,st+count+j))
  done.append(surf)
 if not done:return 0
 cut=mesh('V6 cortador temporal',v,f);bm=bmesh.new();bm.from_mesh(cut.data);bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(cut.data);bm.free()
 bpy.context.view_layer.objects.active=wall;mod=wall.modifiers.new('V6 profundidad real de vanos','BOOLEAN');mod.operation='DIFFERENCE';mod.solver='EXACT';mod.object=cut;bpy.ops.object.modifier_apply(modifier=mod.name);bpy.data.objects.remove(cut,do_unlink=True)
 for surf in done:surf.location-=normal*(depth-.015);surf['realismo_v6']='Abertura con profundidad fisica'
 return len(done)
bpy.context.view_layer.update();planes=[o for o in s.objects if o.type=='MESH' and o.name.startswith('Vano casa ')]
houses=[o for o in s.objects if o.name.startswith('Casa ') and o.type=='MESH' and 0<o.location.x<500 and o.dimensions.x<40];opened=0
for i,wall in enumerate(houses):
 x=wall.location.x;side=1 if wall.location.y>center(x) else -1;front=center(x)+side*9;chosen=[]
 for o in planes:
  lo,hi=bounds(o);cx=(lo[0]+hi[0])/2;cy=(lo[1]+hi[1])/2
  if abs(cx-x)<wall.dimensions.x/2-.1 and abs(cy-front)<.25:chosen.append(o)
 if chosen:
  opened+=recess(wall,chosen,(0,-side,0),.36)
  for ob in s.objects:
   if ob.name.startswith('Cuarteron madera') and abs(ob.location.x-x)<wall.dimensions.x/2-.1 and abs(ob.location.y-front)<.3:ob.location.y+=side*.36
 if i%5==0:print('V6_CASAS',i+1,'/',len(houses),'vanos',opened,flush=True)
stats['aberturas_casas_rehundidas']=opened;cat=0
for wall in [o for o in s.objects if o.name.startswith('Nave lateral')]:
 lo,hi=bounds(wall);sign=1 if (lo[1]+hi[1])/2>1.5 else -1;front=hi[1] if sign>0 else lo[1];chosen=[]
 for ob in s.objects:
  if ob.type!='MESH' or not ob.name.startswith(('V3 ventana lateral moldurada','V3 puerta lateral catedral')):continue
  a,b=bounds(ob)
  if abs((a[1]+b[1])/2-front)<.6 and lo[0]<(a[0]+b[0])/2<hi[0]:chosen.append(ob)
 cat+=recess(wall,chosen,(0,sign,0),.62)
stats['aberturas_catedral_rehundidas']=cat;frontcount=0
for wallname,prefix in [('Fachada cuerpo alto','Ventana ojival / nicho'),('Fachada cuerpo bajo','Puerta portico')]:
 wall=bpy.data.objects.get(wallname)
 if wall:frontcount+=recess(wall,[o for o in s.objects if o.type=='MESH' and o.name.startswith(prefix)],(-1,0,0),.70)
for wall in [o for o in s.objects if o.name.startswith('Campanario prism')]:
 lo,hi=bounds(wall);chosen=[]
 for o in s.objects:
  if o.type!='MESH' or not o.name.startswith(('Oculo circular','Nicho torre','Vano campana')):continue
  a,b=bounds(o)
  if lo[1]<(a[1]+b[1])/2<hi[1] and b[2]<25 and abs(a[0]-lo[0])<.3:chosen.append(o)
 frontcount+=recess(wall,chosen,(-1,0,0),1.05)
for o in s.objects:
 if o.name.startswith(('Campana soporte','Campana bronce')):o.location.x+=.8
stats['aberturas_frente_catedral_rehundidas']=frontcount;print('V6_CATEDRAL',cat,frontcount,flush=True)
leafm=[]
for i,c in enumerate([(.035,.074,.009),(.065,.13,.014),(.115,.21,.025),(.18,.29,.045),(.25,.36,.07)]):
 m=bpy.data.materials.new('V6 hoja natural '+str(i));n,l,p,pos=shader(m);l.new(ramp(n,l,noise(n,l,pos,70,2),tint(c,.78),tint(c,1.18)),p.inputs['Base Color']);p.inputs['Roughness'].default_value=.64;p.inputs['Specular IOR Level'].default_value=.22
 tr=n.new('ShaderNodeBsdfTranslucent');tr.inputs[0].default_value=(*tint(c,1.6),1);mix=n.new('ShaderNodeMixShader');mix.inputs[0].default_value=.22;l.new(p.outputs[0],mix.inputs[1]);l.new(tr.outputs[0],mix.inputs[2]);out=next(a for a in n if a.type=='OUTPUT_MATERIAL');l.new(mix.outputs[0],out.inputs['Surface']);leafm.append(m)
bark=next(m for m in bpy.data.materials if m.name.startswith('Tronco') and m.users)
def crown(seed):
 rng=random.Random(seed+6000);v=[];f=[];ids=[];clusters=[]
 for k in range(13):
  a=k*2.4;rr=rng.uniform(.35,2.15);clusters.append(Vector((math.cos(a)*rr,math.sin(a)*rr,rng.uniform(-.15,.5))))
 for j in range(17000):
  cl=clusters[j%13];a=rng.random()*math.tau;zz=rng.uniform(-1,1);rr=rng.random()**.35;q=math.sqrt(1-zz*zz);p=cl+Vector((1.15*rr*q*math.cos(a),1.05*rr*q*math.sin(a),.80*rr*zz));angle=rng.random()*math.tau
  u=Vector((math.cos(angle),math.sin(angle),rng.uniform(-.8,.8)))*rng.uniform(.055,.105);w=Vector((-math.sin(angle),math.cos(angle),rng.uniform(-.7,.7)))*rng.uniform(.018,.034);st=len(v)
  v.extend([tuple(p-u),tuple(p-w),tuple(p+u),tuple(p+w),tuple(p+Vector((0,0,.012)))]);f.extend([(st,st+1,st+4),(st+1,st+2,st+4),(st+2,st+3,st+4),(st+3,st,st+4)]);idx=rng.choices(range(5),[1,3,5,3,1])[0];ids.extend([idx]*4)
 ob=mesh('V6 prototipo copa oculta',v,f)
 for m in leafm:ob.data.materials.append(m)
 for q,i in zip(ob.data.polygons,ids):q.material_index=i
 ob.hide_render=True;ob.hide_viewport=True;return ob.data
crowns=[crown(i) for i in range(8)];trees=[o for o in s.objects if o.name.startswith(('Copa detallada','V2 arbol entorno'))]
for i,o in enumerate(trees):
 o.data=crowns[i%8];o.rotation_euler.z=random.uniform(0,math.tau)
 if o.location.x>85 and o.name.startswith('Copa detallada'):
  o.location.z=random.uniform(3.65,4.05);o.scale=(random.uniform(.93,1.12),random.uniform(.86,1.06),random.uniform(.94,1.24));x,y,z=o.location
  for j in range(6):
   a=j*2.4+i;tip=Vector((x+math.cos(a)*random.uniform(1.7,2.3),y+math.sin(a)*random.uniform(1.4,2.0),z+random.uniform(-.1,.4)));start=Vector((x+.05,y,2.6));mid=(start+tip)/2+Vector((0,0,.15));cyl('V6 rama copa del paseo',start,mid,.055,bark,.032,N=12);cyl('V6 ramilla copa del paseo',mid,tip,.032,bark,.009,N=10)
 else:o.scale.x*=random.uniform(.88,1.05);o.scale.y*=random.uniform(.83,1.03);o.scale.z*=1.7
stats['copas_naturales_sustituidas']=len(trees);stats['variantes_copas']=8
metal=bpy.data.materials.new('V6 fundicion oscura');n,l,p,pos=shader(metal);l.new(ramp(n,l,noise(n,l,pos,90),(.018,.016,.013),(.055,.048,.035)),p.inputs['Base Color']);p.inputs['Metallic'].default_value=.65;p.inputs['Roughness'].default_value=.74;bump(n,l,p,noise(n,l,pos,160),.0006,.4)
for x in [111,157,242,287,348,425]:
 y=center(x)+1.2;box('V6 tapa registro enrasada',(x,y,.041),(.60,.48,.008),metal,.008)
 for j in range(8):box('V6 relieve tapa registro',(x-.25+j*.07,y,.046),(.008,.41,.003),metal,.001)
curb=next(m for m in bpy.data.materials if m.name.startswith('Bordillo amarillo') and m.users);planters=[o for o in s.objects if o.name.startswith('Alcorque amarillo')]
for ob in planters:
 x,y,z=ob.location;ob.hide_render=True;ob.hide_viewport=True
 for dx,dy,wx,wy in [(-.55,0,.10,1.2),(.55,0,.10,1.2),(0,-.55,1,.10),(0,.55,1,.10)]:box('V6 borde hueco alcorque',(x+dx,y+dy,.18),(wx,wy,.28),curb,.012)
for ob in s.objects:
 if ob.name.startswith('Tierra alcorque'):ob.location.z=.23
stats['alcorques_huecos']=len(planters)
def clip(poly,fn):
 out=[]
 for a,b in zip(poly,poly[1:]+poly[:1]):
  da,db=fn(a),fn(b);ina=da>=-1e-7;inb=db>=-1e-7
  if ina:out.append(a)
  if ina!=inb:out.append(a+(b-a)*(da/(da-db)))
 return out
removed=0;trimmed=0
for o in list(s.objects):
 if o.type!='MESH' or o.hide_render or not o.name.startswith(('V5 acera junto a ','V5 borde de acera')):continue
 ps=[o.matrix_world@v.co for v in o.data.vertices]
 if not ps or max(p.x for p in ps)<0 or min(p.x for p in ps)>480:continue
 if all(p.y-center(p.x)>6.85 for p in ps) or all(p.y-center(p.x)<-6.85 for p in ps):continue
 pieces=[]
 for face in o.data.polygons:
  poly=[o.matrix_world@o.data.vertices[j].co for j in face.vertices];pieces.extend([clip(poly,lambda p:-p.x),clip(poly,lambda p:p.x-480)]);core=clip(clip(poly,lambda p:p.x),lambda p:480-p.x)
  if core:pieces.extend([clip(core,lambda p:p.y-center(p.x)-6.85),clip(core,lambda p:center(p.x)-p.y-6.85)])
 pieces=[p for p in pieces if len(p)>=3]
 if not pieces:o.hide_render=True;o.hide_viewport=True;removed+=1;continue
 verts=[];faces=[];inv=o.matrix_world.inverted()
 for poly in pieces:
  st=len(verts);verts.extend([tuple(inv@p) for p in poly]);faces.append(tuple(range(st,st+len(poly))))
 d=bpy.data.meshes.new('V6 acera recortada junto al paseo');d.from_pydata(verts,[],faces);d.update()
 for m in o.data.materials:d.materials.append(m)
 o.data=d;trimmed+=1
stats['fragmentos_acera_internos_retirados']=removed;stats['aceras_recortadas_al_paseo']=trimmed
s.cycles.use_denoising=True;s.cycles.samples=64;s.cycles.max_bounces=8;s.cycles.diffuse_bounces=4;s.cycles.transparent_max_bounces=8
s['realismo_v6']=json.dumps(stats);s['estado']='V6: profundidad fisica en vanos, vegetacion irregular, materiales y luz diurna. Persisten diferencias con el video y contexto aproximado.'
views=[('Recorrido_01_Paseo.png','Caminando por el paseo',(140,center(140),1.7),(220,center(220),2.1),27),('Recorrido_02_Hacia_Catedral.png','Regreso hacia la catedral',(99,center(99),1.7),(-20,22,4.8),25),('Recorrido_03_Bancas_y_Faroles.png','Junto a las bancas y los faroles',(125,center(125)-.7,1.7),(119,center(119)-3.6,2.8),24),('Recorrido_04_Frente_Catedral.png','Frente a la catedral',(-65,-5,1.7),(-37,1.5,13),19),('Recorrido_05_Costado_Catedral.png','Por el costado de la catedral',(28,31.5,1.7),(-12,17,8.5),23),('Recorrido_06_Desde_Parque.png','Desde el extremo del parque',(-65,-36,1.7),(-37,1.5,12.5),22)]
for fn,label,pos,target,lens in views:
 bpy.ops.object.camera_add(location=pos);cam=bpy.context.object;cam.name=Path(fn).stem;cam.rotation_euler=(Vector(target)-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.lens=lens;cam.data.clip_start=.08;cam.data.clip_end=3000
s.camera=bpy.data.objects['Recorrido_01_Paseo'];s.render.resolution_x=1440;s.render.resolution_y=900;s.render.resolution_percentage=100
assert stats['aberturas_casas_rehundidas']==132 and stats['aberturas_catedral_rehundidas']==36 and stats['aberturas_frente_catedral_rehundidas']==18
assert stats['copas_naturales_sustituidas']==131 and stats['alcorques_huecos']==99
assert all(i.packed_file for i in bpy.data.images if i.source=='FILE')
json.dump(stats,open(B/'realismo_v6.json','w'),indent=2,ensure_ascii=False)
json.dump([dict(archivo=fn,vista=label,altura_m=pos[2],posicion=pos,objetivo=target,focal_mm=lens,version_modelo=6) for fn,label,pos,target,lens in views],open(B/'camaras_primera_persona.json','w'),indent=2,ensure_ascii=False)
bpy.ops.wm.save_as_mainfile(filepath=str(B/'Granada_Video.blend'),compress=True)
print('V6_MODELO_GUARDADO_Y_VALIDADO',stats,flush=True)
