"""Build dist/index.html from src/store.html + images/ (images are inlined so the page is one file)."""
import base64, json, pathlib
from PIL import Image
root = pathlib.Path(__file__).parent
keys = ["black", "red", "cream", "navy", "leopard", "denim", "blue", "oliveP"]
assets = {k: "data:image/webp;base64," + base64.b64encode((root / "images" / f"{k}.webp").read_bytes()).decode() for k in keys}
sizes = {k: list(Image.open(root / "images" / f"{k}.webp").size) for k in keys}
html = (root / "src" / "store.html").read_text().replace("__ASSETS__", json.dumps(assets)).replace("__SIZES__", json.dumps(sizes))
(root / "dist" / "index.html").write_text(html)
print(f"Built dist/index.html ({len(html)//1024} KB)")
