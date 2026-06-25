# Очередь генераций (ERA2)

Кратко о реализации по ТЗ. Изменения в коммитах `3bee836` (экран + движок) и `d8394e7` (глобальный статус-бар, рефакторинг UI).

## Запуск

```bash
npm install
npm run dev
```

Экран очереди: **`/queue`**. Глобальный индикатор виден на любой странице, пока есть активные задачи (`queued` + `running`).

## Роутинг до `/queue` (ТЗ §4.8)

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

## Бонусные функции (ТЗ §6 и §4.8)

### Реализовано

| Бонус | Что сделано |
|-------|-------------|
| **Свёрнутый статус-бар** (§4.8) | Режим `collapsed` в `MultipleActiveView` — пилюля «N генераций · X%», разворот по клику |
| **Плавный прогресс в баре** (§4.8) | `useSmoothedProgress` — задержка и округление среднего %, бар не дёргается на каждом тике |
| **Доступность (частично)** (§6) | `aria-label` на строках, тулбаре, статистике, кнопках; `aria-busy` при загрузке; `role="alert"` при ошибке; клавиатура `Enter`/`Space` на кликабельной оболочке статус-бара |
| **Расширенная сортировка** | Помимо новых/старых: по статусу, по прогрессу (↑↓) |
| **Debounce поиска** | 300 ms в `QueueProvider`, мгновенный ввод в поле |
| **Подтверждение «Очистить готовые»** | `window.confirm` перед удалением `done`-задач (без Undo) |
| **Safe-area на mobile** | `viewport-fit=cover` + отступ снизу с учётом `env(safe-area-inset-bottom)` |
| **Светлая тема (частично)** (§6) | Очередь на токенах дизайн-системы (`--card`, `--foreground` и т.д.) — наследует тему приложения через `ThemeProvider` |

### Не реализовано

- Юнит-тесты reducer / engine  
- Optimistic UI и Undo  
- Виртуализация списка  
- Drag-to-reorder для `queued`  
- `prefers-reduced-motion`  
- Анимации на framer-motion  
