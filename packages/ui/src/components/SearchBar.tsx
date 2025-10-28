import { ChangeEvent } from 'react';
import { Button } from './Button';

export interface SearchBarProps {
  query: string;
  onQueryChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export function SearchBar({ query, onQueryChange, onSubmit, placeholder = 'Search games, genres, tags…' }: SearchBarProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onQueryChange(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="flex w-full flex-col gap-3 rounded-2xl bg-slate-900/60 p-4 shadow-inner shadow-black/30 sm:flex-row sm:items-center">
      <input
        type="search"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="flex-1 rounded-xl border border-white/10 bg-slate-950/70 px-4 py-3 text-base text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
      />
      <Button className="w-full sm:w-auto" onClick={onSubmit}>
        Search
      </Button>
    </div>
  );
}
