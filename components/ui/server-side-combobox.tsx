"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface ServerSideComboboxProps {
  value?: string;
  onChange: (value: string) => void;
  fetchOptions: (
    search: string,
    page: number,
  ) => Promise<{ items: Option[]; total: number }>;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  renderOption?: (option: Option) => React.ReactNode;
}

export function ServerSideCombobox({
  value,
  onChange,
  fetchOptions,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  label = "Select",
  renderOption,
}: ServerSideComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [options, setOptions] = React.useState<Option[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [selectedLabel, setSelectedLabel] = React.useState("");

  // Debounce search query
  const debouncedQuery = useQueryDebounce(query, 500);

  // Initial fetch and on query change
  React.useEffect(() => {
    setPage(1);
    setHasMore(true);
    setOptions([]);
    fetchData(debouncedQuery, 1, true);
  }, [debouncedQuery]);

  // Fetch initial label if value is present (and not in options yet)
  React.useEffect(() => {
    if (value && !selectedLabel) {
      // Ideally we would have an API to fetch one item by ID, or we assume the parent passed the initial label in a different way.
      // For now, let's assume if it is in the options list we update it.
      const found = options.find((o) => o.id === value);
      if (found) setSelectedLabel(found.name);
      // If not found, we might want to fetch it specifically or let the parent handle "initial data".
      // For this implementation, we might need a prop `initialLabel` or similar.
    }
    if (value && options.length > 0) {
      const found = options.find((o) => o.id === value);
      if (found) setSelectedLabel(found.name);
    }
  }, [value, options]);

  const fetchData = async (
    search: string,
    pageNum: number,
    replace: boolean,
  ) => {
    setLoading(true);
    try {
      const data = await fetchOptions(search, pageNum);
      if (replace) {
        setOptions(data.items);
      } else {
        setOptions((prev) => [...prev, ...data.items]);
      }
      setHasMore(
        data.items.length > 0 &&
          options.length + data.items.length < data.total,
      );
    } catch (error) {
      console.error("Failed to fetch options", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(debouncedQuery, nextPage, false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {selectedLabel || value
            ? selectedLabel ||
              options.find((o) => o.id === value)?.name ||
              value
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList
            onScroll={handleScroll}
            className="max-h-[300px] overflow-y-auto"
          >
            {loading && page === 1 && (
              <div className="py-6 text-center text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                جاري البحث...
              </div>
            )}

            {!loading && options.length === 0 && (
              <CommandEmpty>لا توجد نتائج.</CommandEmpty>
            )}

            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.id}
                  value={option.id} // We use ID as value for key but display name
                  onSelect={(currentValue) => {
                    // currentValue is often lowercased by CommandItem, so be careful.
                    // But here we use `value` prop on CommandItem as identifier if passed, or content.
                    // Actually Radix/CMDK passes the value prop of CommandItem to onSelect?
                    // Let's manually trigger
                    onChange(option.id);
                    setSelectedLabel(option.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {renderOption ? renderOption(option) : option.name}
                </CommandItem>
              ))}
            </CommandGroup>
            {loading && page > 1 && (
              <div className="py-2 text-center text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin mx-auto" />
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Simple internal hook for debounce if not available
function useQueryDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = React.useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
