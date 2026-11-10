"""Derimod TalentX derleme betiği.

Tek kaynak: source/src.html (+ source/logo.svg). Elle yalnızca bunlar düzenlenir.
Üretilenler (elle düzenlemeyin):
  site/index.html            Azure'a giden sayfa (tam <head>, UTF-8)
  api/src/core.client.js     Sunucunun vm içinde çalıştırdığı uygulama kodu (kurallar tek yerde)
  build/preview.html         Claude önizlemesi (artifact) için sürüm; depoya girmez
Kullanım:  python3 source/build.py
"""
import os, re, subprocess, sys, tempfile
H = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(H)
s = open(os.path.join(H, 'src.html'), encoding='utf-8').read()
logo = open(os.path.join(H, 'logo.svg'), encoding='utf-8').read().strip()
out = s.replace('__LOGO__', logo)
head = '<!doctype html>\n<html lang="tr">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
import hashlib, base64, shutil
os.makedirs(os.path.join(ROOT, 'site'), exist_ok=True)
# Canlı sürüm: üçüncü taraf kütüphaneler kendi alanımızdan (site/vendor) sunulur ve sayfaya
# katı bir İçerik Güvenlik Politikası (CSP) eklenir. CSP yalnızca bu sayfadaki tek <script>
# bloğunun SHA-256 özetine izin verir; verinin içine sızmış bir <img onerror=...> ya da
# <script> hiçbir koşulda çalışmaz.
dep = out.replace('https://cdnjs.cloudflare.com/ajax/libs/', 'vendor/')
scripts = re.findall(r'<script>(.*?)</script>', dep, re.S)
assert len(scripts) == 1, 'Beklenen tek satır içi <script> bloğu: ' + str(len(scripts))
h = base64.b64encode(hashlib.sha256(scripts[0].encode('utf-8')).digest()).decode()
csp = ("default-src 'self'; script-src 'self' 'sha256-" + h + "'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
       "font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; "
       "frame-src 'self' blob:; object-src 'none'; base-uri 'none'; form-action 'self'")
head_dep = head + '<meta http-equiv="Content-Security-Policy" content="' + csp + '">\n<meta name="referrer" content="strict-origin-when-cross-origin">\n'
open(os.path.join(ROOT, 'site', 'index.html'), 'w', encoding='utf-8').write(head_dep + dep + '\n</html>\n')
vsrc, vdst = os.path.join(H, 'vendor'), os.path.join(ROOT, 'site', 'vendor')
if os.path.isdir(vdst): shutil.rmtree(vdst)
shutil.copytree(vsrc, vdst)
os.makedirs(os.path.join(ROOT, 'build'), exist_ok=True)
open(os.path.join(ROOT, 'build', 'preview.html'), 'w', encoding='utf-8').write(out)
js = re.search(r'<script>(.*)</script>', out, re.S).group(1)
open(os.path.join(ROOT, 'api', 'src', 'core.client.js'), 'w', encoding='utf-8').write(
    '// OTOMATİK ÜRETİLDİ: source/src.html içindeki uygulama kodu. Elle düzenlemeyin; source/build.py yeniden üretir.\n' + js)
# sözdizimi denetimi
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as f:
    f.write(js); tmp = f.name
r = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
os.unlink(tmp)
if r.returncode:
    print(r.stderr); sys.exit(1)
print('Tamam:', len(out), 'karakter · site/index.html, api/src/core.client.js, build/preview.html')
