import React, { useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, SafeAreaView } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import RecipeCard from '@/components/RecipeCard';
import { useRecipes } from '@/hooks/recipe-store';
import { Recipe } from '@/types/recipe';

export default function SearchScreen() {
  const { searchQuery, setSearchQuery, recipes } = useRecipes();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearch = (text: string) => {
    setLocalSearch(text);
    setSearchQuery(text);
  };

  const renderRecipe = ({ item }: { item: Recipe }) => (
    <RecipeCard recipe={item} />
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Search Recipes</Text>
          <View style={styles.searchContainer}>
            <AntDesign name="search1" size={20} color={Colors.dark.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search recipes or ingredients..."
              placeholderTextColor={Colors.dark.textTertiary}
              value={localSearch}
              onChangeText={handleSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        </View>

        {recipes.length === 0 && localSearch.length > 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recipes found</Text>
            <Text style={styles.emptySubtext}>Try searching for something else</Text>
          </View>
        ) : localSearch.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="search1" size={48} color={Colors.dark.textTertiary} />
            <Text style={styles.emptyText}>Start searching</Text>
            <Text style={styles.emptySubtext}>Find your favorite recipes</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.inputBorder,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.dark.text,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  listContent: {
    paddingTop: 16,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    textAlign: 'center',
  },
});
