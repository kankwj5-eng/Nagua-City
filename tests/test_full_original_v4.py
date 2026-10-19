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
  self.assertIn("list.replaceChildren()",patched)
  self.assertIn("originalV4.animateWheels",patched)
  self.assertIn("if(!originalV4.exists())await prepareAnimations38()",patched)
  self.assertNotEqual(original,patched)
  with tempfile.TemporaryDirectory() as d:
   source=Path(d)/"app.js";source.write_text(patched,encoding="utf8")
   subprocess.run(["node","--check",str(source)],check=True,capture_output=True)
 def test_protected_input(self):
  with tempfile.TemporaryDirectory() as d:
   source=Path(d)/"source.html";source.write_text("<html></html>")
   with self.assertRaises(ValueError):builder.build(source,source,Path(d)/"build.html")
if __name__=="__main__":unittest.main()
