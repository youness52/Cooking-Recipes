export interface Recipe {
  id: string;
  title: string;
  image: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rating: number;
  ingredients: string[];
  instructions: string[];
  category: string;
  author: string;
  createdAt: string;
  isFavorite?: boolean;
  videoUrl?: string;
}

export interface RecipeCategory {
  id: string;
  name: string;
  icon: string;
}