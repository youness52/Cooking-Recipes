import React from 'react';
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native';
import Colors from '@/constants/colors';
import RecipeCard from '@/components/RecipeCard';
import CategoryFilter from '@/components/CategoryFilter';
import { useFilteredRecipes } from '@/hooks/recipe-store';
import { Recipe } from '@/types/recipe';
import { useRecipes } from '@/hooks/recipe-store';



export default function HomeScreen() {
  const recipes = useFilteredRecipes();
  const { isLoading } = useRecipes();

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard recipe={item} />
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CategoryFilter />
      
      {recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No recipes found</Text>
          <Text style={styles.emptySubtext}>Try a different category or search term</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipe}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});