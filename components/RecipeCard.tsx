import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { Recipe } from '@/types/recipe';
import Colors from '@/constants/colors';
import { router } from 'expo-router';
import { useRecipes } from '@/hooks/recipe-store';

interface RecipeCardProps {
  recipe: Recipe;
}

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export default function RecipeCard({ recipe }: RecipeCardProps) {
  const { toggleFavorite } = useRecipes();

  const handlePress = () => router.push(`/recipe/${recipe.id}`);
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    toggleFavorite(recipe.id);
  };

  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'Easy': return Colors.dark.success;
      case 'Medium': return Colors.dark.warning;
      case 'Hard': return Colors.dark.error;
      default: return Colors.dark.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
          <AntDesign
            name="heart"
            size={20}
            color={recipe.isFavorite ? Colors.dark.error : Colors.dark.text}
            style={{ opacity: recipe.isFavorite ? 1 : 0.6 }}
          />
        </TouchableOpacity>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
          <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{recipe.title}</Text>
        
        <View style={styles.info}>
          <View style={styles.infoItem}>
            <FontAwesome5 name="clock" size={14} color={Colors.dark.textSecondary} />
            <Text style={styles.infoText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          
          <View style={styles.infoItem}>
            <AntDesign name="star" size={14} color={Colors.dark.warning} />
            <Text style={styles.infoText}>{recipe.rating}</Text>
          </View>
        </View>
        
        <Text style={styles.category}>{recipe.category}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    backgroundColor: Colors.dark.card,
    borderRadius: 16,
    marginBottom: 16,
    marginTop:5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.dark.cardBorder,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: cardWidth * 0.8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 8,
  },
  difficultyBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    color: Colors.dark.text,
    fontSize: 11,
    fontWeight: '600',
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.dark.text,
    marginBottom: 8,
    lineHeight: 20,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  category: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    marginTop: 4,
  },
});
