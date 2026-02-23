'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardContent } from '@/presentation/components/glass/GlassCard';
import { ClientCard, ClientGridCard } from './ClientCard';
import { ClientFilters } from './ClientFilters';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Users } from 'lucide-react';
import { useClientPortfolioStore } from '@/store/client-portfolio.store';
import type { ClientProfile } from '@/shared/schemas/client-portfolio';

interface ClientListProps {
  onClientClick?: (client: ClientProfile) => void;
  showFilters?: boolean;
  maxHeight?: string;
  className?: string;
}

export function ClientList({
  onClientClick,
  showFilters = true,
  maxHeight = '600px',
  className,
}: ClientListProps) {
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('list');
  const { isLoadingClients, getFilteredClients } = useClientPortfolioStore();
  const filteredClients = getFilteredClients();

  return (
    <GlassCard size="lg" className={className}>
      <GlassCardHeader>
        <GlassCardTitle className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Client Portfolio
          <span className="text-foreground font-normal">({filteredClients.length})</span>
        </GlassCardTitle>
      </GlassCardHeader>

      {showFilters && (
        <div className="mb-4">
          <ClientFilters viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>
      )}

      <GlassCardContent>
        {isLoadingClients ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No clients found</p>
            <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
          </div>
        ) : (
          <ScrollArea style={{ height: maxHeight }}>
            {viewMode === 'list' ? (
              <div className="space-y-2">
                {filteredClients.map((client) => (
                  <ClientCard
                    key={client.id}
                    client={client}
                    onClick={onClientClick ? () => onClientClick(client) : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client) => (
                  <ClientGridCard
                    key={client.id}
                    client={client}
                    onClick={onClientClick ? () => onClientClick(client) : undefined}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}

// Compact list variant without card wrapper
interface ClientListCompactProps {
  clients: ClientProfile[];
  onClientClick?: (client: ClientProfile) => void;
  isLoading?: boolean;
  className?: string;
}

export function ClientListCompact({
  clients,
  onClientClick,
  isLoading,
  className,
}: ClientListCompactProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No clients found
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {clients.map((client) => (
        <ClientCard
          key={client.id}
          client={client}
          variant="compact"
          onClick={onClientClick ? () => onClientClick(client) : undefined}
        />
      ))}
    </div>
  );
}
