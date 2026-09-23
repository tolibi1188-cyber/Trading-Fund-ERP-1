# TRADING FUND ERP — LOYIHA PROMPTLARI TARIXI

Ushbu hujjatda loyihaning boshlanishidan to yakuniy holatigacha foydalanuvchi (Buyurtmachi) tomonidan yuborilgan barcha topshiriqlar, talablar va ularning tizimda bajarilish tarixi xronologik tartibda keltirilgan.

---

## 1. Dastlabki Loyihalashtirish va Arxitektura Prompti
**Vaqti:** Loyiha boshlanishi  
**Foydalanuvchi so‘rovi:**
> Trading Fund uchun to‘liq ERP tizimini yaratish. 1C buxgalteriya uslubida bo‘lsin. 2 xil toifadagi investorlar bo‘lsin: OLD (eski zarar ko‘rgan, zarari 100% tiklanguncha daromad bloklanadi, yangi kapital kiritsa alohida hisoblanadi) va NEW (50/50 daromad taqsimoti). Pul yechish so‘rovlari uchun 72 soatlik qat'iy SLA taymer, to‘lov cheklari (receipts), o‘zgarmas moliyaviy audit (Ledger) tizimi, CSV eksport va tushunarli boshqaruv paneli yaratilsin.

**Amalga oshirilgan ishlar:**
- React 19, TypeScript, Tailwind CSS asosida to‘liq FinTech ERP tizimi yaratildi.
- OLD va NEW investorlar mantig‘i, tiklanish foizlari (`initialLoss`, `recoveredAmount`, `recovery`, `newCapital`) ishlab chiqildi.
- 72 soatlik geri hisoblash taymeri bilan pul yechish moduli yaratildi.
- O‘zgarmas moliyaviy Ledger jurnali va to‘lov cheklari modali qo‘shildi.

---

## 2. Desktop (Windows .exe) Ilova So‘rovi
**Foydalanuvchi so‘rovi:**
> Dasturni nafaqat brauzerda, balki kompyuterda Windows uchun dastur (.exe) sifatida o‘rnatmasdan ham (portable) ishlatish imkoni bo‘lsin.

**Amalga oshirilgan ishlar:**
- Loyihaga **Electron** infratuzilmasi ulandi (`electron/main.cjs`, `electron-builder.json`).
- `package.json` ga `electron:build` va `electron:portable` skriptlari qo‘shildi.
- Windows foydalanuvchilari uchun `Ishga_tushirish.bat` va `build-windows-exe.bat` tayyorlandi.

---

## 3. Mobil Ilova va Shaxsiy Kabinet So‘rovi
**Foydalanuvchi so‘rovi:**
> Investorlar va adminlar uchun telefon ko‘rinishi (Mobile WebApp / Telegram bot mini app formatida) ham bo‘lsin. Investor o‘z hisobini, pul yechishini ko‘ra olsin.

**Amalga oshirilgan ishlar:**
- `InvestorMobileApp.tsx` — Investorning shaxsiy kabineti (balans, tiklanish holati, pul yechish so‘rovi, tarix).
- `AdminMobileApp.tsx` — Admin uchun telefondan boshqarish (tezkor tasdiqlash, chek ko‘rish).
- Bosh menyuda rejimlar o‘rtasida (Admin ERP, Investor Mobile, Admin Mobile) bir marta bosishda o‘tish tugmalari joylashtirildi.

---

## 4. Neumorphic Dizayn So‘rovi
**Foydalanuvchi so‘rovi:**
> "dizaynni yanada chiroyli qilib ber Neumorphic qilib ber"

**Amalga oshirilgan ishlar:**
- Tizim to‘liq zamonaviy **Neumorphic Dark FinTech** uslubiga o‘tkazildi.
- `index.css` da maxsus taktil shadow va gradient tokenlari (`neu-card`, `neu-inset`, `neu-btn`, `neu-btn-emerald`, `neu-segment-active`) yaratildi.
- Barcha kartalar, panellar, boshqaruv tugmalari va drawerlar 3D chuqurlik va yorug‘lik effektlari bilan boyitildi.

---

## 5. Pul Yechish Bo‘limida Summalarni Bir Tekis Joylashtirish So‘rovi
**Foydalanuvchi so‘rovi:**
> "pul yechish punktida summalar bir tekis joylashsin tepadan pastga"

**Amalga oshirilgan ishlar:**
- `WithdrawalsView.tsx` jadvali qayta ishlandi: 12-ustunli qat'iy CSS grid joriy etildi.
- Raqamlar uchun `tabular-nums` va `JetBrains Mono` shrifti o‘rnatilib, barcha dollar summalari yuqoridan pastga bitta vertikal chiziqda tekislandi.
- Mobil ilovalar (`InvestorMobileApp`, `AdminMobileApp`) hamda Dashboarddagi so‘rovlar summalari ham qat'iy o‘ngga tekislangan tabular ustunga joylashtirildi.

---

## 6. Investorlar Ro‘yxati va Shriftlar Takomillashuvi So‘rovi
**Foydalanuvchi so‘rovi:**
> "investorlar ro'yhati bo'limini yanada takomillashtirib ber Shriftlar ham chiroyli bo'lsin"

**Amalga oshirilgan ishlar:**
- `index.html` va global CSS ga **JetBrains Mono** (moliyaviy ma'lumotlar uchun) va **Plus Jakarta Sans** (zamonaviy UI matnlari uchun) shriftlari ulandi.
- Tepada 4 ta Neumorphic KPI umumiy xulosa kartalari qo‘shildi (Jami investorlar, Jami AUM, Zarar tiklanishi, Yangi kapital §4).
- 1C Jadval ichida balansni sichqoncha bilan 2 marta bosib bevosita jadval ichida tahrirlash (inline edit) imkoniyati yaratildi.
- Dual-view (1C Jadval rejimi va 3D Kartalar rejimi) qo‘shildi.

---

## 7. Oynaga Sig‘dirish va Shaxsiy Ma'lumotlarni Maxfiylashtirish So‘rovi
**Foydalanuvchi so‘rovi:**
> "oynaga sig'may qolibdiku sig'dirib ber, pasport dannilar va telefon raqamlarni olib tashla va ustiga bopsganda chiqadigan qilib ber"

**Amalga oshirilgan ishlar:**
- Jadval ustunlari ixchamlashtirilib, gorizontal siljish (horizontal overflow) butunlay bartaraf etildi; jadval har qanday ekranga 100% sig‘adigan qilindi.
- Pasport seriya/raqami va telefon raqamlari ochiq jadval yuzasidan xavfsizlik va ixchamlik maqsadida olib tashlandi.
- Investor ismi yoki yonidagi **`Pasport/Tel`** tugmasi bosilganda ochiluvchi maxsus Neumorphic modal darcha yaratildi. Ushbu darchada pasport va telefon raqami, bitta bosishda nusxa olish (`Copy`), to‘g‘ridan-to‘g‘ri qo‘ng‘iroq qilish (`Call`) va email jo‘natish tugmalari taqdim etildi.

---

## 8. Loyihani To‘liq ZIP, PDF Qo‘llanma va Promptlar Tarixi Bilan Saqlash So‘rovi
**Foydalanuvchi so‘rovi:**
> "loyihani to'liq zip holatda ber. Va loyiha ga qo'yilgan talablarni, algoritmlar bo'yicha yakuniy instruksiyalarni ham pdf qilib ichiga joyla. promptlar tarixini ham bitta filega joylab uni ham zipga joyla"

**Amalga oshirilgan ishlar:**
- `LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf` — barcha talablar, moliyaviy formulalar va foydalanish qo‘llanmasi jamlangan PDF hujjati yaratildi.
- `PROMPTLAR_TARIXI.md` va `PROMPTLAR_TARIXI.txt` fayllari yaratildi.
- Butun loyiha (manba kodlari, komponentlar, public aktivlar, skriptlar, PDF va promptlar tarixi) bitta toza `TradingFund_ERP_Loyiha.zip` arxiviga joylandi va dastur interfeysiga hamda `public/` papkasiga to‘g‘ridan-to‘g‘ri yuklab olish uchun joylashtirildi.
