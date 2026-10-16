"""Publish a small web entry while preserving the portable, offline single HTML.

The input is the verified modular build. Only the PWA copy is transformed:
zone gzip payloads, base64 material images, and embedded pack resources move
to versioned HTTP resources.  The browser fetches them as they are needed.
"""
from __future__ import annotations

import base64
import hashlib
import json
import re
from pathlib import Path

BLOCK = re.compile(
    rb'(<script type="application/octet-stream" id="'
    rb'((?:zone48|image48|resource48)-[a-zA-Z0-9-]+)'
    rb'">)([^<]*)(</script>)'
)
IMAGE_DATA_URL = re.compile(rb'^data:(image/(?:png|jpeg|webp));base64,', re.I)
EXTENSIONS = {b"image/png": ".png", b"image/jpeg": ".jpg", b"image/webp": ".webp"}


def split_web_game(path: Path, assets: Path) -> dict:
    """Externalize resources from an HTML *web copy*, never the original build."""
    if not path.is_file():
        raise FileNotFoundError(path)
    source = path.read_bytes()
    assets.mkdir(parents=True, exist_ok=True)
    types = {"zone48": 0, "image48": 0, "resource48": 0}
    savings = {"zone48": 0, "image48": 0, "resource48": 0}
    full_bytes = 0
    payload_by_type = {"zone48": 0, "image48": 0, "resource48": 0}
    resource_packs = {}

    def replace(match: re.Match[bytes]) -> bytes:
        nonlocal full_bytes
        identifier = match.group(2).decode("ascii")
        family = identifier.split("-", 1)[0]
        packed = match.group(3)
        if not packed:
            raise ValueError("Empty required asset: " + identifier)
        if family == "zone48":
            payload = base64.b64decode(packed, validate=True)
            if not payload.startswith(bytes((31, 139))):
                raise ValueError("Zone is not gzipped: " + identifier)
            suffix, representation = ".gz", "gzip"
        elif family == "image48":
            prefix = IMAGE_DATA_URL.match(packed)
            if prefix:
                mime = prefix.group(1).lower()
                payload = base64.b64decode(packed[prefix.end():], validate=True)
                suffix = EXTENSIONS[mime]
            else:
                payload = base64.b64decode(packed, validate=True)
                suffix = ".jpg" if payload.startswith(bytes((255, 216))) else ".png"
            representation = "image"
        else:
            # Keep GLB/model data byte-for-byte; textures can be handed directly
            # to Babylon as URLs and should not be downloaded at startup.
            header = IMAGE_DATA_URL.match(packed)
            candidate = packed[header.end():] if header else packed
            is_image = bool(header) or candidate.startswith(
                (b"/9j/", b"iVBORw0KGgo", b"UklGR")
            )
            if is_image:
                payload = base64.b64decode(candidate, validate=True)
                if payload.startswith(bytes((255, 216))):
                    suffix = ".jpg"
                elif payload.startswith(bytes((137, 80, 78, 71))):
                    suffix = ".png"
                elif payload.startswith(b"RIFF") and payload[8:12] == b"WEBP":
                    suffix = ".webp"
                else:
                    raise ValueError("Invalid embedded image: " + identifier)
                representation = "image"
            else:
                payload = packed
                suffix, representation = ".txt", "text"
            pack = identifier.split("-", 2)[1]
            summary = resource_packs.setdefault(pack, {"image": 0, "text": 0, "bytes": 0})
            summary[representation] += 1
            summary["bytes"] += len(payload)
        digest = hashlib.sha256(payload).hexdigest()[:16]
        filename = f"{identifier}-{digest}{suffix}"
        target = assets / filename
        target.write_bytes(payload)
        full_bytes += len(payload)
        payload_by_type[family] += len(payload)
        types[family] += 1
        savings[family] += len(packed) - len(filename)
        return (
            f'<script type="application/octet-stream" id="{identifier}" '
            f'data-src="./assets/stream/{filename}" data-format="{representation}"></script>'
        ).encode("ascii")

    rewritten, total = BLOCK.subn(replace, source)
    if total < 100 or not types["zone48"] or not types["image48"] or not types["resource48"]:
        raise ValueError("Web streaming found an incomplete catalog; refusing to publish")
    if len(rewritten) >= len(source) * .85:
        raise ValueError("Fast entry did not remove sufficient embedded data")
    path.write_bytes(rewritten)
    report = {
        "originalHtmlBytes": len(source),
        "fastHtmlBytes": len(rewritten),
        "htmlBytesRemoved": len(source) - len(rewritten),
        "resources": total,
        "byType": types,
        "payloadBytes": full_bytes,
        "payloadBytesByType": payload_by_type,
        "resourcePacks": resource_packs,
        "assetDirectory": "assets/stream",
        "portableBuildPreserved": True,
    }
    return report


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--game", type=Path, required=True)
    p.add_argument("--assets", type=Path, required=True)
    args = p.parse_args()
    print(json.dumps(split_web_game(args.game, args.assets), ensure_ascii=False))
