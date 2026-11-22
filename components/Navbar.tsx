'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Cpu, Search } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Models', href: '/models' },
  { label: 'Compare', href: '/compare' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Labs', href: '/labs' },
  { label: 'Providers', href: '/providers' },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [quickQuery, setQuickQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = quickQuery.trim();
    router.push(trimmed ? `/models?q=${encodeURIComponent(trimmed)}` : '/models');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/models" className="flex items-center gap-2 text-slate-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Cpu className="h-4 w-4" />
            </div>
            <span className="font-mono text-base font-bold tracking-tight">
              OneAtlas
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <form onSubmit={handleSearch} className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={quickQuery}
            onChange={(e) => setQuickQuery(e.target.value)}
            placeholder="Quick jump models..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
          />
        </form>
      </div>
    </header>
  );
}