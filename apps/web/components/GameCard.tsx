import Image from 'next/image';
import { Card } from '@notania/ui';
import { Game } from '@/lib/types';

export interface GameCardProps {
  game: Game;
}

export function GameCard({ game }: GameCardProps) {
  return (
    <Card href={`/games/${game.slug}`} className="bg-slate-900/60">
      <div className="relative h-48 w-full overflow-hidden">
        <Image src={game.thumbnailUrl} alt={game.title} fill className="object-cover transition duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="text-xs uppercase tracking-wide text-indigo-400">{game.genre}</span>
        <h3 className="text-lg font-semibold text-white">{game.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-400">{game.description}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
          <span>{game.players} players</span>
          <span>{game.rating.toFixed(1)} ★</span>
        </div>
      </div>
    </Card>
  );
}
