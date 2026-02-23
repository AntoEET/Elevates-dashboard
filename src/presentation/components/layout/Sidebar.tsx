'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  User,
  UserPlus,
  Gauge,
  Brain,
  Shield,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  FileSpreadsheet,
  Megaphone,
  Linkedin,
  Instagram,
  Mail,
  LogOut,
  Calendar,
  ListTodo,
  Clock,
  PenLine,
  DollarSign,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES, ROUTE_LABELS } from '@/shared/constants';
import type { DashboardView } from '@/shared/schemas';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  view: DashboardView;
}

const navItems: NavItem[] = [
  {
    href: ROUTES.COMMAND_CENTER,
    label: ROUTE_LABELS['command-center'],
    icon: LayoutDashboard,
    view: 'command-center',
  },
  {
    href: ROUTES.CLIENT_PERFORMANCE,
    label: ROUTE_LABELS['client-performance'],
    icon: Users,
    view: 'client-performance',
  },
  {
    href: ROUTES.OPERATIONS,
    label: ROUTE_LABELS['operations'],
    icon: Gauge,
    view: 'operations',
  },
  {
    href: ROUTES.INTELLIGENCE,
    label: ROUTE_LABELS['intelligence'],
    icon: Brain,
    view: 'intelligence',
  },
  {
    href: ROUTES.GOVERNANCE,
    label: ROUTE_LABELS['governance'],
    icon: Shield,
    view: 'governance',
  },
  {
    href: '/finance',
    label: 'Finance',
    icon: DollarSign,
    view: 'finance' as DashboardView,
  },
  {
    href: ROUTES.CRM,
    label: ROUTE_LABELS['crm'],
    icon: UserPlus,
    view: 'crm',
  },
];

const PROSPECTION_URL = 'https://docs.google.com/spreadsheets/d/12FCR7FlfPcu9AGhr4m7PLsgI6GtGQsJc/edit?pli=1&gid=503242274#gid=503242274';

// Marketing Social Media Links
const SOCIAL_MEDIA_LINKS = {
  LINKEDIN: 'https://www.linkedin.com/feed/',
  INSTAGRAM: 'https://www.instagram.com/',
};

// Email
const MAIL_URL = 'https://mail.hostinger.com/v2/mailboxes/INBOX';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const isActive = (href: string) => pathname === href;

  const NavLink = ({ item, collapsed = false }: { item: NavItem; collapsed?: boolean }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const link = (
      <Link
        href={item.href}
        onClick={() => setIsMobileOpen(false)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
          'hover:bg-sidebar-accent',
          active && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium',
          !active && 'text-sidebar-foreground/70 hover:text-sidebar-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', active && 'text-primary')} />
        {!collapsed && <span className="truncate text-sm">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" className="glass">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  const SidebarContent = ({ collapsed = false, onToggle }: { collapsed?: boolean; onToggle?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-2 px-3 py-3', collapsed && 'justify-center px-2')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-foreground/20 flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <>
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-sm text-sidebar-foreground">Elevates</span>
              <span className="text-[10px] text-muted-foreground">AI Decision Engine</span>
            </div>
            {onToggle && (
              <button
                onClick={onToggle}
                className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>
      {collapsed && onToggle && (
        <div className="flex justify-center px-2 -mt-1">
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors text-muted-foreground hover:text-sidebar-foreground"
            title="Expand sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5">
        {navItems.map((item, index) => (
          <React.Fragment key={item.href}>
            <NavLink item={item} collapsed={collapsed} />
            {/* Add Prospection link after Operations */}
            {item.view === 'operations' && (
              collapsed ? (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <a
                      href={PROSPECTION_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                        'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                        'justify-center'
                      )}
                    >
                      <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="glass">
                    Prospection
                  </TooltipContent>
                </Tooltip>
              ) : (
                <a
                  href={PROSPECTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground'
                  )}
                >
                  <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate text-sm">Prospection</span>
                </a>
              )
            )}
          </React.Fragment>
        ))}

        {/* Daily Section */}
        <div className={cn('pt-2 mt-2 border-t border-sidebar-border', collapsed && 'pt-1 mt-1')}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Clock className="h-3 w-3" />
              <span>Daily</span>
            </div>
          )}

          {/* Calendar */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/calendar"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'justify-center',
                    isActive('/calendar') && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  )}
                >
                  <Calendar className={cn('h-4 w-4 flex-shrink-0', isActive('/calendar') && 'text-primary')} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                Calendar
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/calendar"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                'pl-5',
                isActive('/calendar') && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <Calendar className={cn('h-4 w-4 flex-shrink-0', isActive('/calendar') && 'text-primary')} />
              <span className="truncate text-sm">Calendar</span>
            </Link>
          )}

          {/* Task List */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/tasks"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'justify-center',
                    isActive('/tasks') && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  )}
                >
                  <ListTodo className={cn('h-4 w-4 flex-shrink-0', isActive('/tasks') && 'text-primary')} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                Task List
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/tasks"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                'pl-5',
                isActive('/tasks') && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <ListTodo className={cn('h-4 w-4 flex-shrink-0', isActive('/tasks') && 'text-primary')} />
              <span className="truncate text-sm">Task List</span>
            </Link>
          )}

          {/* Mail */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href={MAIL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'justify-center'
                  )}
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                Mail
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              href={MAIL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                'pl-5'
              )}
            >
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm">Mail</span>
            </a>
          )}
        </div>

        {/* Marketing Section */}
        <div className={cn('pt-2 mt-2 border-t border-sidebar-border', collapsed && 'pt-1 mt-1')}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <Megaphone className="h-3 w-3" />
              <span>Marketing</span>
            </div>
          )}

          {/* LinkedIn */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href={SOCIAL_MEDIA_LINKS.LINKEDIN}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'justify-center'
                  )}
                >
                  <Linkedin className="h-4 w-4 flex-shrink-0" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                LinkedIn
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              href={SOCIAL_MEDIA_LINKS.LINKEDIN}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                'pl-5'
              )}
            >
              <Linkedin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm">LinkedIn</span>
            </a>
          )}

          {/* Instagram */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <a
                  href={SOCIAL_MEDIA_LINKS.INSTAGRAM}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'justify-center'
                  )}
                >
                  <Instagram className="h-4 w-4 flex-shrink-0" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                Instagram
              </TooltipContent>
            </Tooltip>
          ) : (
            <a
              href={SOCIAL_MEDIA_LINKS.INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                'pl-5'
              )}
            >
              <Instagram className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-sm">Instagram</span>
            </a>
          )}

          {/* Post Generator */}
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  href="/marketing"
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200',
                    'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                    'justify-center',
                    isActive('/marketing') && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                  )}
                >
                  <PenLine className={cn('h-4 w-4 flex-shrink-0', isActive('/marketing') && 'text-primary')} />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="glass">
                Post Generator
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              href="/marketing"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200',
                'hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground',
                'pl-5',
                isActive('/marketing') && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
              )}
            >
              <PenLine className={cn('h-4 w-4 flex-shrink-0', isActive('/marketing') && 'text-primary')} />
              <span className="truncate text-sm">Post Generator</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Footer - Account Section */}
      <div className="flex-shrink-0">
        {/* Account Header */}
        <div className={cn('pt-2 border-t border-sidebar-border mx-2', collapsed && 'pt-1')}>
          {!collapsed && (
            <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              <User className="h-3 w-3" />
              <span>Account</span>
            </div>
          )}
        </div>

        <div className={cn('px-2 pb-2', collapsed && 'px-2 pb-2')}>
          {!collapsed ? (
            <div className="space-y-0.5">
              {/* User Profile */}
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-sidebar-accent/50">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-primary-foreground">AM</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">Anthony Maroleau</p>
                  <p className="text-[10px] text-muted-foreground truncate">Executive</p>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-1.5 rounded-md text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="space-y-0.5">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="w-6 h-6 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-sm cursor-default">
                    <span className="text-[9px] font-bold text-primary-foreground">AM</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="glass">
                  <div>
                    <p className="font-medium">Anthony Maroleau</p>
                    <p className="text-xs text-muted-foreground">Executive</p>
                  </div>
                </TooltipContent>
              </Tooltip>

              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="glass">
                  Sign Out
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="glass border-t border-glass-border">
          <nav className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sheet Trigger */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild className="fixed top-4 left-4 z-50 md:hidden">
          <Button variant="outline" size="icon" className="glass">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] p-0 glass">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-screen glass border-r border-glass-border transition-all duration-300 relative',
          isCollapsed ? 'w-[70px]' : 'w-[260px]',
          className
        )}
      >
        <SidebarContent collapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      </aside>
    </TooltipProvider>
  );
}
