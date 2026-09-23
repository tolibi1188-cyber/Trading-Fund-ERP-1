# TRADING FUND ERP — LOYIHA TALABLARI, MOLIYAVIY MODELLAR VA YAKUNIY ALGORITMLAR QO‘LLANMASI

---

## 1. LOYIHANING UMUMIY MAQSADI VA INTERFEYSLAR ARXITEKTURASI
**Trading Fund ERP** — treyding fondlari, investitsiya boshqaruvi va kapital egalari o‘rtasidagi moliyaviy munosabatlarni avtomatlashtiruvchi, yuqori xavfsizlikka ega buxgalteriya va portfel boshqaruv tizimidir.

Tizim uchta asosiy interfeysdan iborat:
1. **Admin ERP Boshqaruv Paneli (Desktop & Web)**:
   - 1C uslubidagi ixcham, ma'lumotlarga boy jadvallar;
   - Neumorphic Dark FinTech dizayni (chuqur relyef va yorug‘lik zonalari);
   - Inline balans tahriri, real-time qidiruv, CSV eksport, SLA monitoringi.
2. **Investor Shaxsiy Kabineti (Mobile WebApp / Telegram bot formati)**:
   - Investor o‘z shaxsiy balansi, tiklangan zarar ko‘rsatkichi va mavjud erkin kapitalini ko‘radi;
   - 72 soatlik SLA bilan pul yechish arizalarini yuboradi va uning holatini (Sent -> Proof -> Completed) kuzatadi.
3. **Admin Mobil Boshqaruv Ilovasi**:
   - Telefonda harakatda bo‘lganda pul yechish so‘rovlarini tasdiqlash, chek (kvitansiya) biriktirish va aylanmani kuzatish.

---

## 2. INVESTORLAR TOIFALARI VA MOLIYAVIY MODELLAR

Tizimda investorlar qat'iy ikkita toifaga ajratiladi:

### A) OLD INVESTORLAR (Eski Zararni Qoplash Dasturi)
* **Tavsif**: Fondning o‘tmishdagi savdolarida zarar ko‘rgan investorlar.
* **Asosiy parametrlar**:
  - `initialLoss` — dastlabki ko‘rilgan zarar miqdori ($ USD).
  - `recoveredAmount` — bugungi kungacha qoplangan zarar miqdori ($ USD).
  - `recovery` — zararning qoplanish foizi:  
    $$\text{Recovery \%} = \min\left(100, \frac{\text{recoveredAmount}}{\text{initialLoss}} \times 100\right)$$
* **100% tiklangunga qadar qoida**:
  - Savdo daromadining **100%i** eski zararni qoplashga yo‘naltiriladi.
  - Ushbu tiklanayotgan balans qat'iy **bloklangan (locked)** bo‘lib, investor tomonidan yechib olinmaydi.
* **100% to‘liq qoplangandan so‘ng**:
  - Tizim investorni avtomatik ravishda **NEW (50/50)** modeliga o‘tkazadi va keyingi savdo foydalari teng taqsimlanadi.
* **§4 Yangi Kapital (New Active Capital) Qoidasi**:
  - Agar OLD investor zarari hali to‘liq tiklanmasdan turib, yangi investitsiya kiritsa (masalan, $10,000), bu mablag‘ eski zararga aralashmaydi!
  - Ushbu summa alohida `newCapital` sub-balansida hisoblanadi.
  - Undan keladigan foyda 50/50 modelida ishlaydi va investor yangi kapitalini **oyiga 20% limitda** cheklovlarsiz yechib olishi mumkin.

### B) NEW INVESTORLAR (50/50 Standart Modeli)
* **Tavsif**: Yangi qo‘shilgan investorlar (boshlang‘ich zarari $0).
* **Daromad taqsimoti**:
  - Har bir muvaffaqiyatli savdo sessiyasidan olingan foydaning **50%i investor hisobiga**, **50%i fond hisobiga** o‘tkaziladi.
  - Balans to‘liq erkin bo‘lib, belgilangan limitlar doirasida yechib olinishi mumkin.

---

## 3. SAVDO DAROMADINI KREDITLASH VA BALANSNI HISOBLASH ALGORITMLARI

### Algoritm 1: Savdo foydasini kreditlash (Trade Profit)
Investorga `$P` miqdorida umumiy savdo foydasi berilganda:

1. **Agar investor toifasi `OLD` bo‘lsa va `recovery < 100%` bo‘lsa**:
   - `initialLoss` dan qolgan qarz:  
     $$\text{RemainingLoss} = \text{initialLoss} - \text{recoveredAmount}$$
   - Agar $P \le \text{RemainingLoss}$:
     - `recoveredAmount` = `recoveredAmount` + $P$
     - `balance` = `balance` + $P$
     - `recovery` = $(\text{recoveredAmount} / \text{initialLoss}) \times 100$
   - Agar $P > \text{RemainingLoss}$ (Zarar to‘liq yopilib, ortiqcha daromad qolsa):
     - Eski zararni to‘liq 100% yopadi: `recoveredAmount` = `initialLoss`
     - Ortiqcha qolgan daromad: $\Delta = P - \text{RemainingLoss}$
     - Ortiqcha qism 50/50 taqsimlanadi: Investorga $+(\Delta \times 0.5)$, Fondga $+(\Delta \times 0.5)$
     - Investor holati `recovery` = 100% ga yetadi va toifasi avtomatik `NEW` ga o‘tadi.

2. **Agar investor toifasi `NEW` (yoki tiklanib bo‘lgan OLD) bo‘lsa**:
   - Investor hisobiga sof foydaning 50%i kreditlanadi:
     $$\Delta \text{Balance} = P \times 0.5$$
   - Fond ulushi: $P \times 0.5$.

---

## 4. PUL YECHISH VA 72-SOATLIK QAT'IY SLA TIZIMI

Pul yechish bo‘limida shaffoflik va qat'iy intizomni ta'minlash uchun 72 soatlik SLA taymeri o‘rnatilgan:

1. **Ariza yaratilishi (`PENDING`)**:
   - Investor (yoki uning nomidan admin) pul yechish arizasini beradi.
   - Tanlangan usul (USDT TRC20, VISA/Mastercard, UzCard/Humo, Bank SWIFT) va aniq rekvizit kiritiladi.
   - So‘rov yaratilgan vaqtdan boshlab 72:00:00 orqaga hisoblash taymeri ishga tushadi.
   - Kerakli summa balansdan zaxiralanadi (hold qilinadi).

2. **Mablag‘ jo‘natilishi (`SENT`)**:
   - Treyding fondi moliya bo‘limi to‘lovni amalga oshiradi va arizani `SENT` holatiga o‘tkazadi.

3. **Chek ilova qilinishi (`PROOF_SUBMITTED`)**:
   - Moliya xodimi to‘lov tranzaksiyasining tasdig‘ini (kripto TXID, to‘lov kvitansiyasi skrinshoti) yuklaydi.
   - Chekda: Tranzaksiya raqami, sana, summa, to‘lov usuli, jo‘natuvchi va qabul qiluvchi rekvizitlari aks etadi.

4. **Yakunlash (`COMPLETED`)**:
   - Mablag‘ muvaffaqiyatli yetib borgani tasdiqlanadi.
   - SLA taymeri muvaffaqiyat bilan yopiladi.
   - O‘zgarmas Ledger kitobiga yakuniy chiqim yozuvi qayd etiladi.

5. **Rad etish (`REJECTED`)**:
   - Noto‘g‘ri rekvizit yoki xavfsizlik sababli so‘rov rad etilsa, zaxiralangan summa to‘liq avtomatik tarzda investor balansiga qaytariladi (`Refund`).

---

## 5. O‘ZGARMAS MOLIYAVIY LEDGER (AUDIT LOG) STANDARTLARI

Buxgalteriya qonunchiligi va 1C talablari asosida tizimdagi hech bir moliyaviy operatsiya izsiz yo‘qolmaydi:
- Har bir yozuv betakror `entryNumber` (masalan, `LED-2026-0891`) oladi.
- Saqlanadigan ma'lumotlar:
  - `investorId`, `investorName`
  - `timestamp` (ISO formatdagi qat'iy server vaqti)
  - `type` (`TRADE_PROFIT`, `MANUAL_INJECTION`, `WITHDRAWAL_REQUEST`, `WITHDRAWAL_COMPLETED`, `LOSS_ADJUSTMENT`, `INLINE_BALANCE_EDIT`)
  - `amount` (musbat yoki manfiy o‘zgarish)
  - `balanceBefore` va `balanceAfter` (aniq tekshiruv uchun)
  - `recoveryAfter`
  - `description` va `performedBy` (kim tomonidan amalga oshirilgani).

---

## 6. DASTURNI ISHGA TUSHIRISH VA WINDOWS .EXE (PORTABLE) YIG‘ISH

### Veb rejimida ishga tushirish:
```bash
# Kutubxonalarni o'rnatish
npm install

# Dasturni 3000-portda ishga tushirish
npm run dev
```

### Windows uchun Portable .exe fayl yaratish:
Hech qanday o‘rnatishlarsiz to‘g‘ridan-to‘g‘ri fleshkada yoki har qanday kompyuterda ishlaydigan dastur yig‘ish:
```bash
# 1-usul: Tayyor bat skript orqali
Ishga_tushirish.bat
yoki
build-windows-exe.bat

# 2-usul: Buyruq orqali
npm run electron:portable
```
Natijada `release/` papkasida `Trading Fund ERP.exe` fayli hosil bo‘ladi.
