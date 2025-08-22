import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Colors from '@/constants/colors';
import { mockCategories } from '@/mocks/recipes';
import { useRecipes } from '@/hooks/recipe-store';

export default function CategoryFilter() {
  const { selectedCategory, setSelectedCategory } = useRecipes();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {mockCategories.map((category) => {
        const isSelected = selectedCategory === category.name;
        return (
          <TouchableOpacity
            key={category.id}
            style={[styles.categoryButton, isSelected && styles.selectedButton]}
            onPress={() => setSelectedCategory(category.name)}
            activeOpacity={0.7}
          >
            <Text style={styles.emoji}>{category.icon}</Text>
            <Text style={[styles.categoryText, isSelected && styles.selectedText]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  content: {
    paddingHorizontal: 16,
    gap: 12,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.card,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
    height:30,
    marginBottom:5,
  },
  selectedButton: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  emoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    fontWeight: '500',
  },
  selectedText: {
    color: Colors.dark.text,
  },
});