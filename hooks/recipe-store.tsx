import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Recipe } from '@/types/recipe';
import { mockRecipes } from '@/mocks/recipes';

const STORAGE_KEY = 'user_recipes';
const FAVORITES_KEY = 'favorite_recipes';

export const [RecipeProvider, useRecipes] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Load user recipes from AsyncStorage
  const userRecipesQuery = useQuery({
    queryKey: ['userRecipes'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error('Error loading recipes:', error);
        return [];
      }
    },
  });

  // Load favorites from AsyncStorage
  const favoritesQuery = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(FAVORITES_KEY);
        return stored ? new Set(JSON.parse(stored)) : new Set();
      } catch (error) {
        console.error('Error loading favorites:', error);
        return new Set();
      }
    },
  });

  useEffect(() => {
    if (favoritesQuery.data) {
      setFavorites(favoritesQuery.data as Set<string>);
    }
  }, [favoritesQuery.data]);

  // Save user recipes mutation
  const saveRecipesMutation = useMutation({
    mutationFn: async (recipes: Recipe[]) => {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
      return recipes;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userRecipes'] });
    },
  });

  // Save favorites mutation
  const saveFavoritesMutation = useMutation({
    mutationFn: async (favoriteIds: string[]) => {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
      return favoriteIds;
    },
  });

  // Combine mock recipes with user recipes
  const allRecipes = useMemo(() => {
    const userRecipes = userRecipesQuery.data || [];
    return [...mockRecipes, ...userRecipes].map(recipe => ({
      ...recipe,
      isFavorite: favorites.has(recipe.id),
    }));
  }, [userRecipesQuery.data, favorites]);

  // Filter recipes based on search and category
  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           recipe.ingredients.some((ing: string) => ing.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allRecipes, searchQuery, selectedCategory]);

  // Get favorite recipes
  const favoriteRecipes = useMemo(() => {
    return allRecipes.filter(recipe => recipe.isFavorite);
  }, [allRecipes]);

  const addRecipe = useCallback(async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'rating'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      rating: 0,
    };
    
    const currentRecipes = userRecipesQuery.data || [];
    const updatedRecipes = [...currentRecipes, newRecipe];
    await saveRecipesMutation.mutateAsync(updatedRecipes);
    return newRecipe;
  }, [userRecipesQuery.data, saveRecipesMutation]);

  const toggleFavorite = useCallback(async (recipeId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(recipeId)) {
      newFavorites.delete(recipeId);
    } else {
      newFavorites.add(recipeId);
    }
    setFavorites(newFavorites);
    await saveFavoritesMutation.mutateAsync(Array.from(newFavorites));
  }, [favorites, saveFavoritesMutation]);

  const getRecipeById = useCallback((id: string) => {
    return allRecipes.find(recipe => recipe.id === id);
  }, [allRecipes]);

  const updateRecipe = useCallback(async (updatedRecipe: Recipe) => {
    const currentRecipes = userRecipesQuery.data || [];
    const recipeIndex = currentRecipes.findIndex((r: Recipe) => r.id === updatedRecipe.id);
    
    if (recipeIndex !== -1) {
      const updatedRecipes = [...currentRecipes];
      updatedRecipes[recipeIndex] = updatedRecipe;
      await saveRecipesMutation.mutateAsync(updatedRecipes);
    }
  }, [userRecipesQuery.data, saveRecipesMutation]);

  const removeRecipe = useCallback(async (recipeId: string) => {
    const currentRecipes = userRecipesQuery.data || [];
    const updatedRecipes = currentRecipes.filter((r: Recipe) => r.id !== recipeId);
    await saveRecipesMutation.mutateAsync(updatedRecipes);
  }, [userRecipesQuery.data, saveRecipesMutation]);

  const isUserRecipe = useCallback((recipeId: string) => {
    const userRecipes = userRecipesQuery.data || [];
    return userRecipes.some((r: Recipe) => r.id === recipeId);
  }, [userRecipesQuery.data]);

  return useMemo(() => ({
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
  }), [
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
  ]);
});

export function useFilteredRecipes() {
  const { recipes } = useRecipes();
  return recipes;
}

export function useFavoriteRecipes() {
  const { favoriteRecipes } = useRecipes();
  return favoriteRecipes;
}