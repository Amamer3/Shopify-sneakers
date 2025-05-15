import React from 'react';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, SortAsc, SortDesc } from "lucide-react";

interface OrderFilterProps {
  onStatusChange: (status: string) => void;
  onDateRangeChange: (range: { start: Date; end: Date } | null) => void;
  onSortChange: (by: 'date' | 'total' | 'status', direction: 'asc' | 'desc') => void;
  selectedStatus: string;
  selectedDateRange: { start: Date; end: Date } | null;
  selectedSort: { by: 'date' | 'total' | 'status'; direction: 'asc' | 'desc' };
}

export function OrderFilter({
  onStatusChange,
  onDateRangeChange,
  onSortChange,
  selectedStatus,
  selectedDateRange,
  selectedSort,
}: OrderFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">      <Select 
        onValueChange={onStatusChange} 
        value={selectedStatus || "all"}
        defaultValue="all"
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="processing">Processing</SelectItem>
          <SelectItem value="shipped">Shipped</SelectItem>
          <SelectItem value="delivered">Delivered</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !selectedDateRange && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDateRange?.start ? (
              selectedDateRange.end ? (
                <>
                  {format(selectedDateRange.start, "LLL dd, y")} -{" "}
                  {format(selectedDateRange.end, "LLL dd, y")}
                </>
              ) : (
                format(selectedDateRange.start, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={{
              from: selectedDateRange?.start || undefined,
              to: selectedDateRange?.end || undefined,
            }}
            onSelect={(range) => {
              if (range?.from && range?.to) {
                onDateRangeChange({ start: range.from, end: range.to });
              } else {
                onDateRangeChange(null);
              }
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      <Select 
        onValueChange={(value) => {
          const [by, direction] = value.split('-') as ['date' | 'total' | 'status', 'asc' | 'desc'];
          onSortChange(by, direction);
        }}
        value={`${selectedSort.by}-${selectedSort.direction}`}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">
            <span className="flex items-center">
              Date <SortDesc className="ml-2 h-4 w-4" />
            </span>
          </SelectItem>
          <SelectItem value="date-asc">
            <span className="flex items-center">
              Date <SortAsc className="ml-2 h-4 w-4" />
            </span>
          </SelectItem>
          <SelectItem value="total-desc">
            <span className="flex items-center">
              Total <SortDesc className="ml-2 h-4 w-4" />
            </span>
          </SelectItem>
          <SelectItem value="total-asc">
            <span className="flex items-center">
              Total <SortAsc className="ml-2 h-4 w-4" />
            </span>
          </SelectItem>
          <SelectItem value="status-asc">
            <span className="flex items-center">
              Status <SortAsc className="ml-2 h-4 w-4" />
            </span>
          </SelectItem>
          <SelectItem value="status-desc">
            <span className="flex items-center">
              Status <SortDesc className="ml-2 h-4 w-4" />
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
