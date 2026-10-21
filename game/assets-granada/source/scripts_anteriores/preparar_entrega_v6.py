from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageFont
from io import BytesIO
from zipfile import ZipFile,ZIP_DEFLATED
import json
B=Path(__file__).parent;views=json.loads((B/'camaras_primera_persona.json').read_text());stats=json.loads((B/'realismo_v6.json').read_text())
assert len(views)==6 and all(v['version_modelo']==6 and abs(v['altura_m']-1.7)<.001 for v in views)
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',22);small=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',18)
def save(im,path):
 b=BytesIO();im.save(b,format='PNG');Image.open(BytesIO(b.getvalue())).verify();path.write_bytes(b.getvalue())
sheet=Image.new('RGB',(1560,1675),'#102331');d=ImageDraw.Draw(sheet)
for i,v in enumerate(views):
 p=B/v['archivo'];Image.open(p).verify();im=Image.open(p).convert('RGB');assert im.size==(1440,900)
 x=20+(i%2)*770;y=60+(i//2)*550;sheet.paste(ImageOps.contain(im,(750,469)),(x,y));d.text((x,y-38),str(i+1)+'. '+v['vista'],font=font,fill='white')
save(sheet,B/'Recorrido_Primera_Persona.png')
comp=Image.new('RGB',(1560,1070),'#102331');d=ImageDraw.Draw(comp)
for row,fn in enumerate(['Recorrido_01_Paseo.png','Recorrido_04_Frente_Catedral.png']):
 for col,(path,label) in enumerate([(B/'revision_v6'/('Antes_'+fn),'ANTES - V5'),(B/fn,'AHORA - V6')]):
  x=20+col*770;y=55+row*520;comp.paste(ImageOps.contain(Image.open(path).convert('RGB'),(750,469)),(x,y));d.text((x,y-33),label,font=font,fill='white')
d.text((20,1035),'Mismas camaras. Geometria, follaje, materiales e iluminacion modificados en Blender.',font=small,fill='#bdd6df');save(comp,B/'Comparacion_Realismo_V6.png')
(B/'LEEME_Recorrido.txt').write_text('Seis renders V6 del modelo de Granada a 1,70 m de altura; 1440 x 900 px, Cycles 64 muestras y reduccion de ruido. Son vistas del modelo, no fotos de la ciudad real. Comparacion_Realismo_V6.png conserva dos camaras de V5. Persisten diferencias con el video y contexto aproximado.\n',encoding='utf-8')
notes='''\n\n## Revision V6: relieve, vegetacion y materiales\nSe rehacen ocho variantes de copas con hojas y ramas del paseo; se abren los alcorques; se recortan vanos con profundidad fisica en casas, frente y costados de la catedral; se incorpora desgaste de revoque por altura, humedad discontinua y grano en el pavimento. Se recortan las aceras transversales que invadian el paseo. Se sustituye la luz uniforme por cielo fisico y luz diurna. Se incorporan hojas en maceteras y hierba corta en el primer plano del parque. Los materiales son procedurales; no son escaneos PBR ni fotogrametria.\nEl modelo entregado ya incluye las modificaciones. Para reproducirlo a partir de V5: aplicar realismo_v6.py UNA VEZ sobre V5; luego jardines_v6.py sobre el archivo guardado; despues pavimento_v6.py y ventanas_final_v6.py; finalmente render_v6.py para seis renders. No aplicar realismo_v6.py, jardines_v6.py ni ventanas_final_v6.py de nuevo sobre V6: esas etapas no son idempotentes.\nEl paquete V6 incluye solo los renders nuevos y una comparacion historica identificada. Persisten diferencias de arquitectura, medidas, vegetacion y entorno frente al video. No es una reproduccion identica ni una ciudad completa.\n'''
old_readme=(B/'LEEME.md').read_text(encoding='utf-8')
(B/'LEEME.md').write_text('# Granada - modelo V6\n\nCreado con Blender 4.2.3. Abrir Granada_Video.blend; la camara inicial muestra el paseo. Las seis fotos corresponden al modelo entregado.\n'+notes+'\n\n## Historial de revisiones anteriores\n'+old_readme,encoding='utf-8')
photos=[v['archivo'] for v in views]+['Recorrido_Primera_Persona.png','Comparacion_Realismo_V6.png','camaras_primera_persona.json','render_v6.py','LEEME_Recorrido.txt']
with ZipFile(B/'Fotos_Primera_Persona_Granada.zip','w',ZIP_DEFLATED) as z:
 for fn in photos:z.write(B/fn,fn)
source=['Granada_Video.blend','LEEME.md','realismo_v6.py','jardines_v6.py','pavimento_v6.py','ventanas_final_v6.py','realismo_v6.json','preparar_entrega_v6.py','construir.py','afinar_v2.py','acabado_v2.py','afinar_v3.py','acabado_v3.py','ajuste_camara_v3.py','texturas_v4.py','grano_piedra_v4.py','tejas_contexto_v4.py','realismo_v5.py','entorno_urbano_v5.py','remates_suelos_v5.py','render_realismo_v5.py','granada_osm.xml','referencias.json','Plano_Granada.png','Plano_Granada.svg','Pavimento_del_video.png']
with ZipFile(B/'Granada_Reconstruccion_Video.zip','w',ZIP_DEFLATED,compresslevel=6) as z:
 for fn in source+photos:z.write(B/fn,fn)
 for p in sorted((B/'referencia_recorte').glob('cuadro_*.png')):z.write(p,'referencia_video/'+p.name)
for fn in ['Fotos_Primera_Persona_Granada.zip','Granada_Reconstruccion_Video.zip']:
 with ZipFile(B/fn) as z:assert z.testzip() is None
# Preserve exact identities recovered from Library. The seven photos and photo ZIP were at version zero.
def payload(obj):
 if 'results' in obj:return obj
 return payload(obj['structuredContent'])
ids=json.loads((B.parent/'identidades_recuperadas.json').read_text());latest={r['name']:r for key in ['proyecto','vistas'] for r in payload(ids[key])['results']}
names=['Granada_Video.blend','Granada_Reconstruccion_Video.zip']+[v['archivo'] for v in views]+['Recorrido_Primera_Persona.png','Fotos_Primera_Persona_Granada.zip'];uploads=[]
for fn in names:
 r=latest[fn];version=int(r['version_id']) if r['version_id'] is not None else 0
 uploads.append(dict(local_path=str((B/fn).resolve()),purpose='replace_library_file',library_file_id=r['library_file_id'],expected_current_version=version,version_reason='V6: relieve de vanos, vegetacion, materiales y luz diurna; seis renders actuales'))
uploads.append(dict(local_path=str((B/'Comparacion_Realismo_V6.png').resolve()),purpose='create_library_file',library_artifact_type='image'))
(B/'uploads_v6.json').write_text(json.dumps({'uploads':uploads},ensure_ascii=False));print('V6 PNG Y ZIP VERIFICADOS',len(uploads),stats)
