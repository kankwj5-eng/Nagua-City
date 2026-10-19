"""Tests of the original-game V4 build while preserving graphics."""
import importlib.util,json,subprocess,tempfile,unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("build_full_original_v4",ROOT/"scripts/build_full_original_v4.py")
builder=importlib.util.module_from_spec(spec);spec.loader.exec_module(builder)
class FullOriginalV4(unittest.TestCase):
 def source(self):
  manifest=json.loads((ROOT/"game/manifest.json").read_text("utf8"))
  return "".join((ROOT/item["path"]).read_text("utf8") for item in manifest["segments"])
 def test_exact_models(self):
  self.assertEqual(len(builder.NEW_IDS),16)
  self.assertEqual(builder.NEW_IDS[:1],["01_mateo"])
  self.assertEqual(builder.NEW_IDS[-2:],["mototaxi-roja","canonera-abierta"])
  self.assertEqual(len(set(builder.NEW_IDS)),16)
 def test_genuine_scene_and_lighting_preserved(self):
  original=self.source()
  patched=builder.patch_app(original)
  for token in (
    "new B.ShadowGenerator(1024,sun)",
    "scene.imageProcessingConfiguration.toneMappingEnabled=true",
    "lightSettings();sky();water()",
    "catalog=await loadAsset('world')",
    "extensions=await loadAsset('extensions')",
    "buildCollision();buildGround();await materials()",
    "await installEnvironment()",
    "installSandinoDistrict()",
    "installArchitecture34()",
    "vegetation42();vehicleFinish42()",
    "materials46();gardens46();compactGeometry46()",
  ):
   self.assertIn(token,original)
   self.assertIn(token,patched,token)
  self.assertIn("await originalV4.prepare('cars')",patched)
  self.assertIn("originalV4.animateWheels",patched)
  self.assertEqual(original,patched)
  self.assertIn("function stepFleet13(dt)",patched)
  self.assertIn("originalV4.makeCar(name,x,z,heading,id)",patched)
  with tempfile.TemporaryDirectory() as d:
   source=Path(d)/"app.js";source.write_text(patched,encoding="utf8")
   subprocess.run(["node","--check",str(source)],check=True,capture_output=True)
 def test_no_legacy_models_in_replaced_game_modules(self):
  checks={
   "game/src/characters/0292-prepare-humans.js":["packed48('humans')","CitizenNear"],
   "game/src/characters/0293-make-human.js":["humanContainers","CitizenLOD"],
   "game/src/characters/0311-human-walk.js":["soleCurves","sampleHuman("],
   "game/src/vehicles/0287-create-vehicle.js":["lowTemplates","templates[name]"],
   "game/src/vehicles/0289-install-fleet.js":["boxer","pickup4x4","caponera_family","data.fleet"],
   "game/src/vehicles/0307-vehicle-variants.js":["discover:'boxer'","caponera_family"],
   "game/src/world/0189-install-world30.js":["caponera_family","pickupwork","urban125"],
  }
  for path,banned in checks.items():
   code=(ROOT/path).read_text("utf8")
   for word in banned:self.assertNotIn(word,code,path)
 def test_protected_input(self):
  with tempfile.TemporaryDirectory() as d:
   source=Path(d)/"source.html";source.write_text("<html></html>")
   with self.assertRaises(ValueError):builder.build(source,source,Path(d)/"build.html")
if __name__=="__main__":unittest.main()
