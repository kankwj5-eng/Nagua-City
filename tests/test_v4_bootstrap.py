"""Evita un error real de Chromium: buscar asset-humans cuando V4 lo eliminó."""
import importlib.util
import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("package_original_v4",ROOT/"scripts/package_original_v4.py")
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class TestV4Bootstrap(unittest.TestCase):
    def test_bootstrap_omits_only_removed_humans(self):
        original=b'<script>window.INTEGRATED={};'+module.BOOTSTRAP_OLD+b'{const el=document.getElementById("asset-"+name);INTEGRATED[name]=el.textContent;el.remove();}</script>'
        patched=module.patch_bootstrap(original)
        self.assertIn(module.BOOTSTRAP_V4,patched)
        self.assertNotIn(module.BOOTSTRAP_OLD,patched)
        self.assertIn(b'INTEGRATED[name]=el.textContent',patched)
        for needed in [b'"world"',b'"extensions"',b'"vehicles"',b'"data"',b'"babylon"',b'"loaders"',b'"surfaces"']:
            self.assertIn(needed,patched)
        self.assertNotIn(b'"humans"',patched)

    def test_rejects_ambiguous_or_missing_preload_instead_of_breaking_runtime(self):
        with self.assertRaisesRegex(ValueError,"exactamente una"):
            module.patch_bootstrap(b"no bootstrap")
        with self.assertRaisesRegex(ValueError,"exactamente una"):
            module.patch_bootstrap(module.BOOTSTRAP_OLD+b"\n"+module.BOOTSTRAP_OLD)


if __name__=="__main__":
    unittest.main()
