# GapGPT API
[English](./README.md) | [中文](./README.zh.md) | [فارسی](./README.Fa.md)
این پروژه نسخه وب ChatGPT را از طریق اسکریپت Tampermonkey در مرورگر شما به یک **رابط API محلی و آموزشی** تبدیل می‌کند.

## نکات مهم (خواندن توصیه می‌شود)
- این پروژه صرفاً هدف آموزشی و نمایشی دارد.
- من (`AmirArmaniya`) هیچ مسئولیتی در قبال سو‌ءاستفاده یا عواقب حقوقی اجرا یا توزیع این کد قبول نمی‌کنم.
- قبل از انتشار عمومی، مطمئن شوید که مجوز نسخهٔ اصلی (upstream) را بررسی کرده‌اید.

## شروع سریع
```bash
npm install
npm run start
# یا
docker-compose up
```

سپس Tampermonkey را نصب کرده و محتوای `tampermonkey-script.js` را به عنوان یک اسکریپت جدید وارد کنید. پس از ورود به https://chat.openai.com/، نقطه پایان محلی API معمولاً در:

```
http://localhost:8766/v1/chat/completions
```

## پارامترها و نمونه
- پارامتر اصلی: `messages` (فرمت OpenAI chat)
- نمونه JSON ساده:
```json
{ "messages": [{"role":"user","content":"سلام!"}] }
```

## توجه دربارهٔ مشارکت و مجوز
- این فورک برای دیده شدن/نمایش منتشر شده و مشارکت پذیرفته نمی‌شود.
- پیشنهاد می‌شود از مجوز `MIT` (الگوی موجود در فایل `LICENSE`) استفاده کنید، اما ابتدا مجوز upstream را بررسی کنید.

## قدردانی
این پروژه بر پایه [zsodur/chatgpt-api-by-browser-script](https://github.com/zsodur/chatgpt-api-by-browser-script) ساخته شده است. لطفاً اعتبار و مجوز اصلی را بررسی کنید.

---
ساخته شده با ❤️ — منتشر شده توسط: https://github.com/AmirArmaniya
