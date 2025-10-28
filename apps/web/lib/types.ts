export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string;
  genre: string;
  categories: string[];
  tags: string[];
  rating: number;
  players: number;
  releaseDate: string;
  playUrl: string;
  thumbnailUrl: string;
  developer: string;
  publisher: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
