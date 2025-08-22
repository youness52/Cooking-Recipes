import createContextHook from '@nkzw/create-context-hook';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Recipe } from '@/types/recipe';
import { supabase } from '@/lib/supabase';

export const [RecipeProvider, useRecipes] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  /**
   * Load recipes from Supabase
   */
  const userRecipesQuery = useQuery({
    queryKey: ['recipes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading recipes:', error.message);
        return [];
      }
      return data || [];
    },
  });

  /**
   * Load favorites from Supabase
   */
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const {
        data,
        error,
      } = await supabase.from('favorites').select('recipe_id');

      if (error) {
        console.error('Error loading favorites:', error.message);
        return new Set();
      }

      return new Set(data?.map((f: { recipe_id: string }) => f.recipe_id));
    },
  });

  useEffect(() => {
    if (favoritesQuery.data) {
      setFavorites(favoritesQuery.data as Set<string>);
    }
  }, [favoritesQuery.data]);

  /**
   * Add recipe mutation
   */
  const addRecipe = useCallback(
    async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'rating'>) => {
      const user = (await supabase.auth.getUser()).data.user;

      const { data, error } = await supabase
        .from('recipes')
        .insert([
          {
            ...recipe,
            rating: 0,
            created_at: new Date().toISOString(),
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      return data;
    },
    [queryClient]
  );

  /**
   * Update recipe mutation
   */
  const updateRecipe = useCallback(
    async (updatedRecipe: Recipe) => {
      const { error } = await supabase
        .from('recipes')
        .update(updatedRecipe)
        .eq('id', updatedRecipe.id);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    [queryClient]
  );

  /**
   * Remove recipe mutation
   */
  const removeRecipe = useCallback(
    async (recipeId: string) => {
      const { error } = await supabase
        .from('recipes')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
    },
    [queryClient]
  );

  /**
   * Toggle favorite mutation
   */
  const toggleFavorite = useCallback(
    async (recipeId: string) => {
      const user = (await supabase.auth.getUser()).data.user;

      if (favorites.has(recipeId)) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('recipe_id', recipeId)
          //.eq('user_id', user?.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert([{ recipe_id: recipeId, user_id: user?.id }]);

        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    [favorites, queryClient]
  );

  /**
   * Combine recipes + favorites
   */
  const allRecipes = useMemo(() => {
    const userRecipes = userRecipesQuery.data || [];
    return userRecipes.map((recipe: Recipe) => ({
      ...recipe,
      isFavorite: favorites.has(recipe.id),
    }));
  }, [userRecipesQuery.data, favorites]);

  /**
   * Filter recipes by search + category
   */
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter((recipe: Recipe) => {
      const matchesSearch =
        recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.ingredients.some((ing: string) =>
          ing.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === 'All' || recipe.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allRecipes, searchQuery, selectedCategory]);

  /**
   * Get only favorites
   */
  const favoriteRecipes = useMemo(() => {
    return allRecipes.filter((recipe: Recipe) => recipe.isFavorite);
  }, [allRecipes]);

  /**
   * Get single recipe by ID
   */
  const getRecipeById = useCallback(
    (id: string) => {
      return allRecipes.find((recipe: Recipe) => recipe.id === id);
    },
    [allRecipes]
  );

  /**
   * Check if recipe belongs to user
   */
  const isUserRecipe = useCallback(
    (recipeId: string) => {
      const userRecipes = userRecipesQuery.data || [];
      return userRecipes.some((r: Recipe) => r.id === recipeId);
    },
    [userRecipesQuery.data]
  );

  return useMemo(
    () => ({
      recipes: filteredRecipes,
      allRecipes,
      favoriteRecipes,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      addRecipe,
      updateRecipe,
      removeRecipe,
      toggleFavorite,
      getRecipeById,
      isUserRecipe,
      isLoading: userRecipesQuery.isLoading || favoritesQuery.isLoading,
    }),
    [
      filteredRecipes,
      allRecipes,
      favoriteRecipes,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      addRecipe,
      updateRecipe,
      removeRecipe,
      toggleFavorite,
      getRecipeById,
      isUserRecipe,
      userRecipesQuery.isLoading,
      favoritesQuery.isLoading,
    ]
  );
});

/**
 * Hooks to use filtered recipes or favorites
 */
export function useFilteredRecipes() {
  const { recipes } = useRecipes();
  return recipes;
}

export function useFavoriteRecipes() {
  const { favoriteRecipes } = useRecipes();
  return favoriteRecipes;
}
