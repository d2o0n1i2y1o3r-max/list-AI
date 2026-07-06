# 📋 Technical Task: Ilovaga "Donate" (Homiylik) funksiyasini qo'shish

## Tavsif
Foydalanuvchilar loyihani qo'llab-quvvatlashi uchun ilovaga xavfsiz pul o'tkazish imkoniyatini qo'shish kerak. To'lovlar xavfsiz va real vaqt rejimida amalga oshirishi shart.

---

## 1. UI/UX (Frontend) Talablari

### ✅ Bajarildi
- **Tugma joylashuvi**: Settings sahifasida "Donate" (Homiylik qilish) tugmasi qo'shildi
- **Confirmation Dialog**: Modal oyna yaratildi:
  - Qisqa tushuntirish matni ("Loyihani qo'llab-quvvatlash uchun homiylik qiling")
  - Tayyor summa tugmalari ($1, $5, $10, $20, $50)
  - Custom summa kiritish uchun input maydoni
  - "Yuborish" (Send) va "Bekor qilish" (Cancel) tugmalari
- **Double-click himoyasi**: "Yuborish" tugmasi bosilganda disabled holatga o'tadi
- **Tarjimalar**: O'zbek, Ingliz va Rus tillarida tarjimalar qo'shildi

### Fayllar
- `src/components/Common/DonateModal.jsx` - Modal komponenti
- `src/components/Settings/SettingsPage.jsx` - Tugma va integratsiya
- `src/i18n/uz.json`, `src/i18n/en.json`, `src/i18n/ru.json` - Tarjimalar

---

## 2. Xavfsizlik va Backend (PCI-DSS muvofiqligi)

### ✅ Bajarildi
- **Karta ma'lumotlari himoyasi**: Karta raqamlari hech qachon frontend orqali o'tmaydi
- **To'lov provayderi**: Stripe Checkout integratsiyasi qilindi
- **SDK**: `@stripe/stripe-js` paketi o'rnatildi
- **Stripe utility**: `src/lib/stripe.js` yaratildi

### Fayllar
- `src/lib/stripe.js` - Stripe inicializatsiyasi va Checkout sessiyasi
- `package.json` - `@stripe/stripe-js` dependency

---

## 3. Webhook va Ma'lumotlar Bazasi (Firestore)

### ✅ Bajarildi
- **Cloud Function**: `createCheckoutSession` - Stripe Checkout sessiyasini yaratadi
- **Cloud Function**: `stripeWebhook` - To'lov tasdiqlangandan keyin webhookni qabul qiladi
- **Firestore**: `donations` kolleksiyasiga yozuv qo'shadi:
  ```javascript
  {
    donorId: userId,
    amount: number,
    timestamp: serverTimestamp,
    status: "completed" | "expired",
    transactionId: sessionId
  }
  ```

### Fayllar
- `functions/index.js` - Cloud Functions
- `functions/package.json` - Dependencies (stripe, firebase-admin, firebase-functions)

---

## 4. Status xabarlari

### ✅ Bajarildi
- **Success**: "Pul muvaffaqiyatli yechib olindi, rahmat!" - yashil xabar
- **Error**: "To'lov muvaffaqiyatsiz bo'ldi. Iltimos, qayta urinib ko'ring." - qizil xabar
- **Processing**: "To'lov qayta ishlanmoqda..." - loading state

---

## ⚠️ SOZLASH VA DEPLOYMENT (Dasturchi uchun)

### 1-qadam: Stripe API kalitlarini oling
1. Stripe Dashboardga kiring (https://dashboard.stripe.com)
2. **Developers** → **API keys** bo'limiga o'ting
3. **Publishable key** (pk_) va **Secret key** (sk_) nusxalang

### 2-qadam: Frontend sozlash
`.env` faylni oching va quyidagini qo'shing:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key
```

### 3-qadam: Cloud Functions sozlash
```bash
cd functions
cp .env.example .env
```

`functions/.env` faylni oching va quyidagini qo'shing:
```env
STRIPE_SECRET_KEY=sk_test_your_actual_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### 4-qadam: Dependencies o'rnatish
```bash
cd functions
npm install
```

### 5-qadam: Webhook sozlash
1. Stripe Dashboard → **Developers** → **Webhooks**
2. **Add endpoint** bosing
3. Cloud Function URL kiriting (deploydan keyin):
   ```
   https://your-region-your-project.cloudfunctions.net/stripeWebhook
   ```
4. Eventlarni tanlang:
   - `checkout.session.completed`
   - `checkout.session.expired`
5. Webhook signing secret (whsec_) nusxalang va `functions/.env` ga qo'shing

### 6-qadam: Cloud Functions deploy qilish
```bash
cd functions
npm run deploy
```

Yoki rootdan:
```bash
firebase deploy --only functions
```

### 7-qadam: Frontend URL yangilash
`src/lib/stripe.js` faylda Cloud Function URL ni yangilang:
```javascript
const response = await fetch('https://your-region-your-project.cloudfunctions.net/createCheckoutSession', {
```

---

## 🧪 TEST REJIMI

### Test kartalar (Stripe Sandbox)
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0025 0000 3155`

### Test flow
1. Ilovani oching
2. Settings → Donate tugmasini bosing
3. Summani tanlang
4. "Yuborish" tugmasini bosing
5. Stripe Checkoutga yo'naltirilasiz
6. Test karta bilan to'lovni yakunlang
7. Firestore `donations` kolleksiyasini tekshiring

---

## 🚀 PRODUCTION GA O'TISH

1. Stripe Dashboardda **Live mode**ga o'ting
2. Live API kalitlarini oling
3. `.env` fayllarni live kalitlar bilan yangilang
4. Cloud Functionsni qayta deploy qiling
5. Production webhook endpoint sozlang

---

## 🔒 XAVFSIZLIK QOIDALARI

- ❌ `.env` fayllarni hech qachon git'ga commit qilmang
- ❌ Secret kalitlarni frontend kodida ishlatmang
- ✅ Webhook uchun har doim HTTPS ishlating
- ✅ Webhook signature verificationni yoqib qo'ying

---

## 📚 QO'SHIMCHA RESURSLAR

- To'liq sozlash hujjati: `STRIPE_SETUP.md`
- Stripe dokumentatsiya: https://stripe.com/docs
- Firebase Cloud Functions: https://firebase.google.com/docs/functions

---

## ✅ CHECKLIST

- [ ] Stripe account ochildi
- [ ] Test API kalitlari olingandi
- [ ] Frontend `.env` sozlandi
- [ ] Cloud Functions `.env` sozlandi
- [ ] Dependencies o'rnatildi
- [ ] Webhook endpoint sozlandi
- [ ] Cloud Functions deploy qilindi
- [ ] Frontend URL yangilandi
- [ ] Test rejimda sinab ko'rildi
- [ ] Production kalitlari sozlandi (tayyor bo'lganda)
