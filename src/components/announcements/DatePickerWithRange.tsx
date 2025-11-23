import { useState } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale/pl';
import { CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DatePickerWithRangeProps {
  dateFrom?: Date;
  dateTo?: Date;
  onDateChange: (dateFrom: Date | undefined, dateTo: Date | undefined) => void;
  className?: string;
}

/**
 * Date picker component with range selection.
 */
export function DatePickerWithRange({
  dateFrom,
  dateTo,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dateRange: DateRange | undefined =
    dateFrom || dateTo
      ? {
          from: dateFrom,
          to: dateTo,
        }
      : undefined;

  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      onDateChange(range.from, range.to);
      setIsOpen(false);
    } else if (range?.from) {
      onDateChange(range.from, undefined);
    } else {
      onDateChange(undefined, undefined);
    }
  };

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !dateRange && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, 'd MMM yyyy', { locale: pl })} -{' '}
                  {format(dateRange.to, 'd MMM yyyy', { locale: pl })}
                </>
              ) : (
                format(dateRange.from, 'd MMM yyyy', { locale: pl })
              )
            ) : (
              <span>Wybierz zakres dat</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            locale={pl}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

