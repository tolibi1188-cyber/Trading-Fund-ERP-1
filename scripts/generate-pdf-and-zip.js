/**
 * Script to generate:
 * 1. LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf (via PDFKit)
 * 2. PROMPTLAR_TARIXI.txt
 * 3. TradingFund_ERP_Loyiha.zip (via Archiver)
 * And places copies in public/ folder for direct download.
 */

import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const PDFDocument = require('pdfkit');
const archiver = require('archiver');

const rootDir = process.cwd();
const pdfPath = path.join(rootDir, 'LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf');
const publicPdfPath = path.join(rootDir, 'public', 'LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf');
const zipPath = path.join(rootDir, 'TradingFund_ERP_Loyiha.zip');
const publicZipPath = path.join(rootDir, 'public', 'TradingFund_ERP_Loyiha.zip');
const promptTxtPath = path.join(rootDir, 'PROMPTLAR_TARIXI.txt');

// Ensure public dir exists
if (!fs.existsSync(path.join(rootDir, 'public'))) {
  fs.mkdirSync(path.join(rootDir, 'public'), { recursive: true });
}

// Step 1: Create PROMPTLAR_TARIXI.txt from PROMPTLAR_TARIXI.md
console.log('Generating PROMPTLAR_TARIXI.txt...');
const mdContent = fs.readFileSync(path.join(rootDir, 'PROMPTLAR_TARIXI.md'), 'utf-8');
fs.writeFileSync(promptTxtPath, mdContent, 'utf-8');

// Step 2: Generate PDF Document
console.log('Generating LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf...');

function generatePdf(outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 40,
      info: {
        Title: 'Trading Fund ERP - Talablar va Algoritmlar',
        Author: 'Trading Fund Engineering Team',
      },
    });

    const writeStream = fs.createWriteStream(outputPath);
    doc.pipe(writeStream);

    // Header banner
    doc.rect(40, 40, doc.page.width - 80, 50).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(16).font('Helvetica-Bold')
       .text('TRADING FUND ERP — YAKUNIY TALABLAR VA ALGORITMLAR', 55, 55, { align: 'left' });
    doc.fontSize(9).font('Helvetica')
       .text('1C FinTech Arxitekturasi, Investorlar Matritsasi va Pul Yechish Standartlari', 55, 75);

    doc.moveDown(3);

    // Section 1
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669')
       .text('1. LOYIHANING UMUMIY MAQSADI VA INTERFEYSLAR');
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(
      'Trading Fund ERP — treyding fondlari, investorlar va kapital boshqaruvi uchun yaratilgan xavfsiz va to\'liq buxgalteriya tizimidir.\n' +
      'Tizim uchta asosiy interfeysni taqdim etadi:\n' +
      '• Admin ERP Boshqaruv Paneli: 1C uslubidagi ixcham ma\'lumotlar jadvali, Neumorphic Dark dizayn, inline balans tahriri, CSV eksport va 72 soatlik SLA monitoringi.\n' +
      '• Investor Shaxsiy Kabineti (Mobile WebApp): Investor balansi, tiklangan zarar ko\'rsatkichi, Yangi Kapital (§4) va pul yechish arizalarini yuborish.\n' +
      '• Admin Mobil Ilovasi: Smartfon orqali arizalarni tezkor tasdiqlash, chek (kvitansiya) biriktirish va audit tekshiruvi.\n',
      { lineGap: 2.5 }
    );

    // Section 2
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669')
       .text('2. INVESTORLAR TOIFALARI VA MOLIYAVIY MODELLAR');
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(
      'A) OLD INVESTORLAR (Eski Zararni Qoplash Dasturi):\n' +
      '• Boshlang\'ich zarar (initialLoss) va Tiklangan summa (recoveredAmount) qat\'iy hisoblanadi.\n' +
      '• Zarar tiklanish foizi: Recovery % = min(100, (recoveredAmount / initialLoss) * 100).\n' +
      '• 100% tiklangunga qadar qoida: Savdo foydasining 100%i eski zararni yopishga ketadi va balans bloklangan (locked) holatda bo\'ladi (yechish cheklangan).\n' +
      '• 100% tiklangandan so\'ng: Tizim avtomatik ravishda investorni NEW (50/50) modeliga o\'tkazadi.\n' +
      '• §4 Yangi Kapital (New Active Capital): Agar OLD investor qo\'shimcha yangi mablag\' kiritsa, bu summa zararga aralashmaydi, alohida hisoblanadi va oyiga 20% limitda cheklovlarsiz yechilishi mumkin.\n\n' +
      'B) NEW INVESTORLAR (50/50 Standart Modeli):\n' +
      '• Boshlang\'ich zarari yo\'q ($0). Har bir savdo sessiyasidan olingan sof foydaning 50%i investorga, 50%i fondga taqsimlanadi. Balans to\'liq erkin.\n',
      { lineGap: 2.5 }
    );

    // Section 3
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669')
       .text('3. SAVDO DAROMADINI KREDITLASH ALGORITMLARI');
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(
      'Savdo foydasi (Profit P) kiritilganda:\n' +
      '1. OLD investor va recovery < 100% bo\'lsa:\n' +
      '   - Qolgan zarar: RemainingLoss = initialLoss - recoveredAmount.\n' +
      '   - Agar P <= RemainingLoss: recoveredAmount += P; balance += P; recovery = (recoveredAmount / initialLoss) * 100.\n' +
      '   - Agar P > RemainingLoss: Eski zarar 100% qoplanadi, ortiqcha summa Delta = P - RemainingLoss esa 50/50 nisbatda investor va fond o\'rtasida bo\'linadi. Investor maqomi NEW ga o\'tadi.\n' +
      '2. NEW investor bo\'lsa: Investor hisobiga P * 0.5 qo\'shiladi, qolgan 50% fond ulushi hisoblanadi.\n',
      { lineGap: 2.5 }
    );

    doc.addPage();

    // Page 2
    doc.rect(40, 40, doc.page.width - 80, 40).fill('#0f172a');
    doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
       .text('PUL YECHISH (SLA), LEDGER VA ISHGA TUSHIRISH', 55, 52);

    doc.moveDown(2.5);

    // Section 4
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669')
       .text('4. PUL YECHISH VA 72-SOATLIK QAT\'IY SLA TIZIMI');
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(
      'Shaffoflik va xavfsizlikni ta\'minlash uchun har bir yechish amaliyoti 72 soatlik SLA nazorati ostida bajariladi:\n' +
      '1. So\'rov yaratilishi (PENDING): So\'rov vaqtidan boshlab 72:00:00 taymeri ishga tushadi, mablag\' zaxiralanadi.\n' +
      '2. Mablag\' jo\'natilishi (SENT): Moliya bo\'limi to\'lovni yuboradi.\n' +
      '3. Chek biriktirilishi (PROOF_SUBMITTED): Tranzaksiya tasdig\'i (kripto TXID yoki bank to\'lov kvitansiyasi skrinshoti) yuklanadi.\n' +
      '4. Yakunlash (COMPLETED): Mablag\' yetib borgani tasdiqlanadi, SLA muvaffaqiyat bilan yopiladi.\n' +
      '5. Rad etish (REJECTED): Noto\'g\'ri rekvizit kiritilganda so\'rov bekor qilinadi va mablag\' avtomatik balansga qaytadi.\n',
      { lineGap: 2.5 }
    );

    // Section 5
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669')
       .text('5. O\'ZGARMAS MOLIYAVIY LEDGER (AUDIT LOG) STANDARTLARI');
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(
      'Buxgalteriya talablariga muvofiq, tizimdagi hech bir moliyaviy o\'zgarish izsiz yo\'qolmaydi:\n' +
      '• Har bir yozuvga betakror entryNumber (LED-2026-XXXX) beriladi.\n' +
      '• Saqlanadigan maydonlar: investorId, sana/vaqt (ISO), operatsiya turi (TRADE_PROFIT, MANUAL_INJECTION, WITHDRAWAL_REQUEST, LOSS_ADJUSTMENT), summa, balanceBefore, balanceAfter, recoveryAfter va amalni bajargan shaxs.\n',
      { lineGap: 2.5 }
    );

    // Section 6
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#059669')
       .text('6. DASTURNI ISHGA TUSHIRISH VA WINDOWS .EXE (PORTABLE) YIG\'ISH');
    doc.fontSize(9).font('Helvetica').fillColor('#1e293b').text(
      'A) Veb rejimida ishga tushirish:\n' +
      '   npm install\n' +
      '   npm run dev  (Dastur http://localhost:3000 manzilida ochiladi)\n\n' +
      'B) Windows uchun Portable .exe yig\'ish:\n' +
      '   1-usul: Ishga_tushirish.bat yoki build-windows-exe.bat faylini ikki marta bosing.\n' +
      '   2-usul: npm run electron:portable buyrug\'ini bering.\n' +
      '   Natijada "release/" papkasida "Trading Fund ERP.exe" fayli hosil bo\'ladi.\n',
      { lineGap: 2.5 }
    );

    doc.rect(40, doc.page.height - 70, doc.page.width - 80, 30).fill('#f1f5f9');
    doc.fillColor('#64748b').fontSize(8).font('Helvetica')
       .text('Trading Fund ERP • Rasmiy Hujjat • Barcha huquqlar himoyalangan', 55, doc.page.height - 60);

    doc.end();
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
  });
}

// Step 3: Create ZIP Archive
function createZip() {
  return new Promise((resolve, reject) => {
    console.log('Creating TradingFund_ERP_Loyiha.zip...');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`Zip archive successfully created: ${archive.pointer()} total bytes.`);
      // Copy zip to public folder for direct web download
      fs.copyFileSync(zipPath, publicZipPath);
      console.log('Copied zip to public/TradingFund_ERP_Loyiha.zip for browser download.');
      resolve();
    });

    archive.on('error', (err) => reject(err));
    archive.pipe(output);

    // List of files and folders to include
    const includes = [
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
    ];

    for (const item of includes) {
      const fullPath = path.join(rootDir, item);
      if (fs.existsSync(fullPath)) {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          // Do not archive self if inside public
          archive.directory(fullPath, item, (entry) => {
            if (entry.name.endsWith('.zip')) return false;
            return entry;
          });
        } else {
          archive.file(fullPath, { name: item });
        }
      }
    }

    archive.finalize();
  });
}

async function main() {
  await generatePdf(pdfPath);
  fs.copyFileSync(pdfPath, publicPdfPath);
  console.log('PDF created successfully at:', pdfPath);
  console.log('Copied PDF to public/LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf');

  await createZip();
  console.log('All packaging completed successfully!');
}

main().catch((err) => {
  console.error('Packaging error:', err);
  process.exit(1);
});
