"""Comprueba el contrato de los 4 GLB finales sin publicar contenido binario."""
import importlib.util,json,struct,tempfile,unittest,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("vehicles4",ROOT/"scripts/import_vehicles_v4.py")
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)

def glb(key,corrupt=None):
 filename,wheels,steering,_=module.VEHICLES[key]
 nodes=[{"name":n} for n in (*wheels,*steering)]
 indices={n:i for i,n in enumerate([x["name"] for x in nodes])}
 animations=[]
 for n in wheels:
  animations.append({"name":"Rodar_"+n,"channels":[{"target":{"node":indices[n],"path":"rotation"}}]})
 for name in ("Direccion_Izquierda","Direccion_Derecha"):
  animations.append({"name":name,"channels":[{"target":{"node":indices[n],"path":"rotation"}} for n in steering]})
 if corrupt=="steering":animations[-1]["channels"][0]["target"]["node"]=0
 if corrupt=="missing":animations.pop()
 paints=[{"name":"pintura","pbrMetallicRoughness":{"baseColorFactor":[.5,.0035,.006,1] if key=="landcruiser" else [.012,.016,.021,1]}}]
 model={"nodes":nodes,"meshes":[{}],"materials":paints,"animations":animations}
 raw=json.dumps(model).encode();raw+=b" "*((-len(raw))%4)
 return b"glTF"+struct.pack("<4I",2,20+len(raw),len(raw),0x4e4f534a)+raw

class ImportVehiclesV4(unittest.TestCase):
 def test_four_only_and_no_old_assets(self):
  with tempfile.TemporaryDirectory() as d:
   src=Path(d)/"source.zip";dest=Path(d)/"modelos"
   with zipfile.ZipFile(src,"w") as z:
    for key,info in module.VEHICLES.items():z.writestr(info[0],glb(key))
   out=module.install(src,dest)
   self.assertEqual(out["vehicleModels"],4)
   self.assertEqual(out["oldVehicleModels"],0)
   self.assertEqual(len(list(dest.glob("*.glb"))),4)
   self.assertEqual(out["vehicles"][0]["id"],"hilux")
   module.install(src,dest)
   self.assertEqual(len(list(dest.glob("*.glb"))),4)
 def test_reject_missing_old_extra_or_broken_anim(self):
  with tempfile.TemporaryDirectory() as d:
   src=Path(d)/"missing.zip";dest=Path(d)/"out"
   with zipfile.ZipFile(src,"w") as z:
    for key,info in list(module.VEHICLES.items())[:3]:z.writestr(info[0],glb(key))
   with self.assertRaises(ValueError):module.install(src,dest)
   self.assertFalse(dest.exists())
   with self.assertRaises(ValueError):module.verify(glb("pulsar","steering"),"pulsar")
   with self.assertRaises(ValueError):module.verify(glb("hilux","missing"),"hilux")
 def test_real_glb_headers(self):
  for key in module.VEHICLES:
   self.assertEqual(module.verify(glb(key),key)["id"],key)

if __name__=="__main__":unittest.main()
