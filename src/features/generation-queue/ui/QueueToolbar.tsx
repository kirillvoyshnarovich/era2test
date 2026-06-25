import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Chip } from "@/shared/ui/era";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/shared/lib/utils";
import type { QueueFilterStatus, QueueFilterType, QueueSort } from "../model/queueReducer";
import { useQueue } from "../model/useQueue";

const STATUS_OPTIONS: { value: QueueFilterStatus; label: string }[] = [
  { value: "all", label: "Все" },
  { value: "queued", label: "В очереди" },
  { value: "running", label: "Идёт" },
  { value: "done", label: "Готово" },
  { value: "failed", label: "Ошибка" },
];

const TYPE_OPTIONS: { value: QueueFilterType; label: string }[] = [
  { value: "all", label: "Все типы" },
  { value: "text", label: "Текст" },
  { value: "image", label: "Изображение" },
  { value: "video", label: "Видео" },
  { value: "audio", label: "Аудио" },
];

const SORT_OPTIONS: { value: QueueSort; label: string }[] = [
  { value: "newest", label: "Сначала новые" },
  { value: "oldest", label: "Сначала старые" },
  { value: "status", label: "По статусу" },
  { value: "progress-desc", label: "Прогресс: больше" },
  { value: "progress-asc", label: "Прогресс: меньше" },
];

export function QueueToolbar() {
  const { ui, setStatusFilter, setTypeFilter, setSort, setSearch, loadState } = useQueue();
  const [searchInput, setSearchInput] = useState(ui.search);
  const isDisabled = loadState === "loading" || loadState === "idle";

  useEffect(() => {
    setSearchInput(ui.search);
  }, [ui.search]);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    setSearch(value);
  };

  return (
    <div
      className="flex flex-col gap-4 pl-0 p-4 pl-0 md:p-5"
      aria-label="Фильтры очереди"
    >
      <div
        className="flex gap-2 overflow-x-auto pb-0.5 no-scrollbar [-webkit-overflow-scrolling:touch]"
        role="group"
      >
        {STATUS_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            variant="solid"
            active={ui.status === option.value}
            onClick={() => setStatusFilter(option.value)}
            className="h-9 shrink-0 px-3.5"
          >
            {option.label}
          </Chip>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div
          className={cn(
            "flex gap-2 overflow-x-auto pb-0.5 no-scrollbar [-webkit-overflow-scrolling:touch]",
            "lg:max-w-[60%]",
          )}
          role="group"
        >
          {TYPE_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              variant="solid"
              active={ui.type === option.value}
              onClick={() => setTypeFilter(option.value)}
              className="h-9 shrink-0 px-3.5"
            >
              {option.label}
            </Chip>
          ))}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
          <Select
            value={ui.sort}
            onValueChange={(value) => setSort(value as QueueSort)}
            disabled={isDisabled}
          >
            <SelectTrigger
              className="h-9 w-full rounded-full border-border bg-secondary/50 text-sm shadow-none sm:w-[220px]"
              aria-label="Сортировка"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative min-w-0 sm:w-[220px] lg:w-[260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.8}
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Поиск по промпту"
              disabled={isDisabled}
              className="h-9 rounded-full border-border bg-secondary/50 pl-9 text-sm shadow-none focus-visible:ring-primary/40"
              aria-label="Поиск по промпту"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
