# Очередь генераций (ERA2)

Кратко о реализации по ТЗ. Изменения в коммитах `3bee836` (экран + движок) и `d8394e7` (глобальный статус-бар, рефакторинг UI).

## Запуск

```bash
npm install
npm run dev
```

Экран очереди: **`/queue`**. Глобальный индикатор виден на любой странице, пока есть активные задачи (`queued` + `running`).

## Роутинг до `/queue` (ТЗ §4.8)

Используется **собственный лёгкий SPA-роутер** (`shared/routing`), не `react-router`.

- Таблица маршрутов: `app/router/index.tsx` → `"/queue": QueuePage`
- Страница: `pages/QueuePage.tsx` → виджет `widgets/generation-queue`
- Переходы: `navigate("/queue")` и `<Link to="/queue">` (статус-бар, сайдбар)
- Глобальный индикатор: `QueueGenerationGlobalState` в `app/providers/AppProviders.tsx`, тот же `QueueProvider`

## Персистентность (ТЗ §4.7)

- Ключ: `era2_generation_queue_v1`
- При загрузке: сид из `entities/generation-task`, если в storage пусто; иначе — восстановление из `localStorage`
- **`running` после перезагрузки → `queued`**: в `queueReducer.sanitizeTask` running-задачи сбрасываются в очередь (прогресс сохраняется, `startedAt` очищается), движок стартует их заново по слотам

## Шрифты (ТЗ §5)

Подключены **Geist Variable** и **Geist Mono Variable** (`styles.css`: `--font-sans`, `--font-mono`). Фолбэки: Manrope / JetBrains Mono. Inter не используется.

## Структура (FSD)

```
entities/generation-task   — типы, сид
features/generation-queue  — model (reducer, engine, provider), ui, lib
widgets/generation-queue   — композиция экрана
pages/QueuePage            — /queue
```

Публичный API фичи — только `@/features/generation-queue` (`index.ts`).

## Мок-движок

- `MAX_CONCURRENT = 2`, FIFO по `createdAt`
- Тики прогресса ~400–700 ms, ~15% случайных `failed`
- Реальных API-запросов нет
