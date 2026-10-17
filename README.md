# DROPZONE: AUTO

Telegram Mini App — коллекционирование машин, тюнинг, гонки. Дизайн и решения: [GDD.md](GDD.md).

## Структура
```
index.html        — разметка
css/style.css     — стили (берут цвета темы Telegram)
js/data.js        — машины, кейсы, баланс (менять цифры здесь)
js/game.js        — логика
js/race.js        — гонки
js/rewards.js     — награды: ежедневный бонус, кейс наград, коллекция, места в гараже
js/showroom.js    — покраска и музей
js/admin.js       — админ-панель (7 нажатий на заголовок)
js/profile.js     — профиль, уровни, задания
js/rules.js       — правила и все действия игрока (общие с сервером)
server/           — сервер (Cloudflare Worker + D1)
js/paint.js       — яркость кузова на фото (tools/paint_masks.py)
img/paint/<id>.webp — маски кузова для покраски (tools/paint_masks.py)
img/cars_src/      — исходные фото машин (со студийным фоном)
img/cars/<id>.webp — фото для игры, без фона
img/parts_src/, img/parts/ — то же для деталей
tools/prepare_photos.py — вырезает фон: img/*_src → img/*
```

## Запуск на компьютере
```bash
python -m http.server 5173
```
Открыть http://localhost:5173. Сбросить прогресс: в консоли браузера `localStorage.clear()`.

## Запуск в Telegram
1. Залить папку на любой HTTPS-хостинг (GitHub Pages, Netlify, Vercel — бесплатно).
2. В @BotFather: `/newbot` → создать бота, затем `/newapp` (или Bot Settings → Configure Mini App) → указать HTTPS-ссылку.
3. Открыть бота в Telegram и нажать кнопку приложения.

Прогресс хранится на устройстве и в Telegram CloudStorage (переносится между устройствами).

## Обновление версии
В `index.html` у `style.css` и всех `js/*.js` стоит `?v=N`. При каждом выпуске увеличивай N, иначе Telegram и браузеры могут показывать старую версию из кэша.
