'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, LayoutGrid, List } from 'lucide-react';
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import type { ClientTier, ContractHealth } from '@/shared/schemas/client-portfolio';

interface ClientFiltersProps {
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  className?: string;
}

export function ClientFilters({ viewMode = 'list', onViewModeChange, className }: ClientFiltersProps) {
  const { clientFilters, setClientFilters, clearClientFilters, clients } = useClientPortfolioStore();

  const hasActiveFilters =
    clientFilters.search ||
    clientFilters.tier !== 'all' ||
    clientFilters.health !== 'all' ||
    clientFilters.tags.length > 0;

  // Get unique tags from all clients
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    clients.forEach((client) => {
      client.tags.forEach((tag) => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [clients]);

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search clients..."
            value={clientFilters.search}
            onChange={(e) => setClientFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-muted/50 border border-glass-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          {clientFilters.search && (
            <button
              onClick={() => setClientFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Tier Filter */}
        <select
          value={clientFilters.tier}
          onChange={(e) => setClientFilters({ tier: e.target.value as ClientTier | 'all' })}
          className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Tiers</option>
          <option value="enterprise">Enterprise</option>
          <option value="growth">Growth</option>
          <option value="starter">Starter</option>
        </select>

        {/* Health Filter */}
        <select
          value={clientFilters.health}
          onChange={(e) => setClientFilters({ health: e.target.value as ContractHealth | 'all' })}
          className="h-10 w-[140px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <option value="all">All Health</option>
          <option value="healthy">Healthy</option>
          <option value="expanding">Expanding</option>
          <option value="at-risk">At Risk</option>
          <option value="churning">Churning</option>
        </select>

        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div className="flex items-center border border-glass-border rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearClientFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Tag Filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Tags:</span>
          {allTags.map((tag) => {
            const isSelected = clientFilters.tags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  if (isSelected) {
                    setClientFilters({
                      tags: clientFilters.tags.filter((t) => t !== tag),
                    });
                  } else {
                    setClientFilters({
                      tags: [...clientFilters.tags, tag],
                    });
                  }
                }}
              >
                {tag}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
