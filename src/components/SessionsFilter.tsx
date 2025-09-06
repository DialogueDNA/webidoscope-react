import React, { useEffect, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, X, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { apiClient } from '@/lib/apiClient';
import { toast } from '@/hooks/use-toast';

export interface SessionFilters {
  startDate?: Date;
  endDate?: Date;
  summaryType?: string;
}

interface SessionsFilterProps {
  filters: SessionFilters;
  onFiltersChange: (filters: SessionFilters) => void;
}

type Preset = { key: string; label: string };

const SessionsFilter: React.FC<SessionsFilterProps> = ({ filters, onFiltersChange }) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loadingPresets, setLoadingPresets] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Load presets when component mounts
  useEffect(() => {
    setLoadingPresets(true);
    apiClient('/api/sessions/summary/presets')
      .then((res) => setPresets(res?.presets ?? []))
      .catch(() =>
        toast({ title: 'Error', description: 'Failed to load summary types', variant: 'destructive' })
      )
      .finally(() => setLoadingPresets(false));
  }, []);

  const handleStartDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, startDate: date });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, endDate: date });
  };

  const handleSummaryTypeChange = (value: string) => {
    onFiltersChange({ ...filters, summaryType: value === 'all' ? undefined : value });
  };

  const handleClearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = filters.startDate || filters.endDate || filters.summaryType;

  return (
    <div className="space-y-4">
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {[filters.startDate, filters.endDate, filters.summaryType].filter(Boolean).length}
            </span>
          )}
        </Button>
        
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {isOpen && (
        <div className="rounded-lg border bg-card p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Created After */}
            <div className="space-y-2">
              <Label>Created After</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate ? format(filters.startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={handleStartDateChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Created Before */}
            <div className="space-y-2">
              <Label>Created Before</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.endDate ? format(filters.endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={handleEndDateChange}
                    initialFocus
                    disabled={(date) => filters.startDate ? date < filters.startDate : false}
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Summary Type */}
            <div className="space-y-2">
              <Label>Summary Type</Label>
              <Select 
                value={filters.summaryType || 'all'} 
                onValueChange={handleSummaryTypeChange}
                disabled={loadingPresets}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {presets.map((preset) => (
                    <SelectItem key={preset.key} value={preset.key}>
                      {preset.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionsFilter;