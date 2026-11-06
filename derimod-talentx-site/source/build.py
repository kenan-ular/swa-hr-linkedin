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
os.makedirs(os.path.join(ROOT, 'site'), exist_ok=True)
open(os.path.join(ROOT, 'site', 'index.html'), 'w', encoding='utf-8').write(head + out + '\n</html>\n')
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
