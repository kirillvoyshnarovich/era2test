import { useEffect, useState } from "react";
import { ArrowDownAZ, Search } from "lucide-react";
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
];

const SEARCH_DEBOUNCE_MS = 300;

function FilterChipRow<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-0.5 no-scrollbar [-webkit-overflow-scrolling:touch]",
        className,
      )}
      role="group"
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
          className="h-9 shrink-0 px-3.5"
        >
          {option.label}
        </Chip>
      ))}
    </div>
  );
}

export function QueueFilters() {
  const { ui, setStatusFilter, setTypeFilter, setSort, setSearch, loadState } = useQueue();
  const [searchInput, setSearchInput] = useState(ui.search);
  const isDisabled = loadState === "loading" || loadState === "idle";

  useEffect(() => {
    setSearchInput(ui.search);
  }, [ui.search]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      if (searchInput !== ui.search) {
        setSearch(searchInput);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timerId);
  }, [searchInput, setSearch, ui.search]);

  return (
    <div
      className="flex flex-col gap-4 rounded-[14px] border border-border bg-card/60 p-4 md:p-5"
      aria-label="Фильтры очереди"
    >
      <FilterChipRow
        options={STATUS_OPTIONS}
        value={ui.status}
        onChange={setStatusFilter}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <FilterChipRow
          options={TYPE_OPTIONS}
          value={ui.type}
          onChange={setTypeFilter}
          className="lg:max-w-[60%]"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:shrink-0">
          <div className="relative min-w-0 sm:w-[220px] lg:w-[260px]">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              strokeWidth={1.8}
            />
            <Input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Поиск по промпту"
              disabled={isDisabled}
              className="h-9 rounded-full border-border bg-secondary/50 pl-9 text-sm shadow-none focus-visible:ring-primary/40"
              aria-label="Поиск по промпту"
            />
          </div>

          <Select
            value={ui.sort}
            onValueChange={(value) => setSort(value as QueueSort)}
            disabled={isDisabled}
          >
            <SelectTrigger
              className="h-9 w-full rounded-full border-border bg-secondary/50 text-sm shadow-none sm:w-[200px]"
              aria-label="Сортировка"
            >
              <ArrowDownAZ className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
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
        </div>
      </div>
    </div>
  );
}
