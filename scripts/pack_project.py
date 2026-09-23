#!/usr/bin/env python3
import os
import zipfile
import shutil

root_dir = os.path.abspath(os.getcwd())
zip_output = os.path.join(root_dir, 'TradingFund_ERP_Loyiha.zip')
public_dir = os.path.join(root_dir, 'public')
public_zip = os.path.join(public_dir, 'TradingFund_ERP_Loyiha.zip')

includes = [
    'src',
    'electron',
    'public',
    'index.html',
    'package.json',
    'bun.lock',
    'tsconfig.json',
    'vite.config.ts',
    'electron-builder.json',
    'Ishga_tushirish.bat',
    'build-windows-exe.bat',
    'README_OQING.txt',
    'metadata.json',
    '.env.example',
    '.gitignore',
    'PROMPTLAR_TARIXI.md',
    'PROMPTLAR_TARIXI.txt',
    'LOYIHA_TALABLARI_VA_ALGORITMLAR.md',
    'LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf',
    'CLAUDE_PROJECT_PROMPT.md',
]

print(f"Archiving Trading Fund ERP to {zip_output}...")

with zipfile.ZipFile(zip_output, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for item in includes:
        item_path = os.path.join(root_dir, item)
        if not os.path.exists(item_path):
            print(f"Skipping missing item: {item}")
            continue

        if os.path.isdir(item_path):
            for dirpath, dirnames, filenames in os.walk(item_path):
                # Exclude node_modules or .git if somehow inside
                if 'node_modules' in dirpath or '.git' in dirpath:
                    continue
                for filename in filenames:
                    if filename.endswith('.zip'):
                        continue
                    full_path = os.path.join(dirpath, filename)
                    arcname = os.path.relpath(full_path, root_dir)
                    zipf.write(full_path, arcname)
        else:
            zipf.write(item_path, item)

print("ZIP successfully created!")

# Copy to public folder
os.makedirs(public_dir, exist_ok=True)
shutil.copyfile(zip_output, public_zip)
print(f"Copied ZIP to {public_zip} for direct download.")

# Print zip summary
zip_size = os.path.getsize(zip_output)
print(f"ZIP Size: {zip_size:,} bytes ({zip_size / (1024 * 1024):.2f} MB)")
