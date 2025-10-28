import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Grid, SearchBar, AdSlot } from '@notania/ui';
import { GameCard } from '@/components/GameCard';
import { useGameSearch } from '@/lib/api';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const activeQuery = typeof router.query.q === 'string' ? router.query.q : '';
  const { data } = useGameSearch(activeQuery);

  useEffect(() => {
    setQuery(activeQuery);
  }, [activeQuery]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-semibold text-white">Search the library</h1>
      <SearchBar
        query={query}
        onQueryChange={setQuery}
        onSubmit={() => {
          if (!query) return;
          router.push(`/search?q=${encodeURIComponent(query)}`);
        }}
      />
      <AdSlot id="notania-search-top" className="h-24 w-full rounded-xl border border-white/10" />
      <Grid>
        {data?.data.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </Grid>
    </div>
  );
}
