'use client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export default function SidebarLayout({ sidebar, children }: SidebarLayoutProps) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-primary/80 backdrop-blur-md border-r border-secondary/20">
        {sidebar}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="bg-background/60 backdrop-blur-md min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}