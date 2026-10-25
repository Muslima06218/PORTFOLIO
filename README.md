# Muslima Portfolio — React + Node.js

Portfolio, admin panel va Node.js backend bitta loyihada. Sayt o‘zbek, rus, ingliz va arab tillarida ishlaydi. Admin panel orqali barcha tarjima matnlarini tahrirlash, saqlash va admin parolini almashtirish mumkin.

## Windows’da ishga tushirish

1. ZIP faylni **Extract All / Hammasini chiqarish** orqali to‘liq oching.
2. Ichidagi `muslima-portfolio-react` papkasini oching. Bu papkada `package.json` ko‘rinib turishi kerak.
3. Eng oson yo‘l: `START-WINDOWS.bat` faylini ikki marta bosing. U paketlarni kerak bo‘lsa o‘zi o‘rnatib, serverni ishga tushiradi.

Yoki shu papkada terminal ochib, buyruqlarni bajaring:

```bash
npm install
npm run dev
```

Portfolio: `http://localhost:5173`  
Admin panel: `http://localhost:5173/admin`

Terminal oynasi ochiq turgan paytda saytni yuqoridagi manzillardan brauzerda oching. Serverni to‘xtatish uchun `Ctrl+C` bosing.

Birinchi marta ishga tushganda terminal admin parolini ko‘rsatadi. Foydalanuvchi nomi `admin`. Parolni saqlab qo‘ying; keyingi ishga tushirishlarda parol qayta ko‘rsatilmaydi. Admin paneldan uni yangilash mumkin.

## Admin panel

1. `/admin` sahifasiga kiring.
2. Terminalda ko‘rsatilgan parol bilan tizimga kiring.
3. Tilni tanlang, matnlarni tahrirlang va **O‘zgarishlarni saqlash** tugmasini bosing.
4. Saytni yangilang — o‘zgarishlar ko‘rinadi.

Ma’lumotlar `data/` ichida saqlanadi. Bu papka `.gitignore` ichida; admin paroli va tahrirlangan kontentni GitHub’ga yubormaslik uchun.

## GitHub’ga yuklash

GitHub’da bo‘sh repository yarating va loyiha papkasida quyidagi buyruqlarni bajaring. `USERNAME` hamda `REPOSITORY` o‘rniga o‘z ma’lumotlaringizni yozing:

```bash
git init
git add .
git commit -m "Add Muslima React portfolio"
git branch -M main
git remote add origin https://github.com/USERNAME/REPOSITORY.git
git push -u origin main
```

## Build / production

```bash
npm run build
npm start
```

Node.js server `dist/` fayllarini, admin API va JSON ma’lumotlarini boshqaradi. `npm start` ishlayotgan Node.js server kerak bo‘ladi; faqat GitHub Pages’da backend ishlamaydi.

## Tahrirlanadigan HTML belgilar

Format saqlanadigan matnlarda `<br>`, `<strong>` va `<em>` teglaridan foydalanish mumkin. Qolgan HTML teglar xavfsizlik uchun sahifada matn sifatida ko‘rsatiladi.
