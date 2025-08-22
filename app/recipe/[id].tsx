import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useRecipes } from '@/hooks/recipe-store';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { getRecipeById, toggleFavorite, removeRecipe, isUserRecipe } = useRecipes();
  const [isDeleting, setIsDeleting] = useState(false);
  
  const recipe = getRecipeById(id as string);

  if (!recipe) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  const getDifficultyColor = () => {
    switch (recipe.difficulty) {
      case 'Easy': return Colors.dark.success;
      case 'Medium': return Colors.dark.warning;
      case 'Hard': return Colors.dark.error;
      default: return Colors.dark.textSecondary;
    }
  };

  const handleEdit = () => router.push(`/edit-recipe/${recipe.id}`);
  const handleDelete = () => {
    Alert.alert(
      'Delete Recipe',
      'Are you sure you want to delete this recipe? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              await removeRecipe(recipe.id);
              router.back();
            } catch {
              Alert.alert('Error', 'Failed to delete recipe');
            } finally {
              setIsDeleting(false);
            }
          }
        }
      ]
    );
  };
  const handleVideoPress = () => recipe.videoUrl && Linking.openURL(recipe.videoUrl);
  const canEdit = isUserRecipe(recipe.id);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{recipe.title}</Text>
            <Text style={styles.author}>by {recipe.author}</Text>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.favoriteButton} onPress={() => toggleFavorite(recipe.id)}>
              <AntDesign 
                name="heart" 
                size={20} 
                color={recipe.isFavorite ? Colors.dark.error : Colors.dark.text} 
                style={{ opacity: recipe.isFavorite ? 1 : 0.6 }} 
              />
            </TouchableOpacity>
            {canEdit && (
              <>
                <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                  <AntDesign name="edit" size={20} color={Colors.dark.text} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={isDeleting}>
                  <AntDesign name="delete" size={20} color={Colors.dark.error} />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <FontAwesome5 name="clock" size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.statText}>{recipe.prepTime + recipe.cookTime} min</Text>
          </View>
          <View style={styles.statItem}>
            <FontAwesome5 name="user-friends" size={20} color={Colors.dark.textSecondary} />
            <Text style={styles.statText}>{recipe.servings} servings</Text>
          </View>
          <View style={styles.statItem}>
            <AntDesign name="star" size={20} color={Colors.dark.warning} />
            <Text style={styles.statText}>{recipe.rating}</Text>
          </View>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor() }]}>
            <Text style={styles.difficultyText}>{recipe.difficulty}</Text>
          </View>
        </View>

        {recipe.videoUrl && (
          <TouchableOpacity style={styles.videoButton} onPress={handleVideoPress}>
            <AntDesign name="play" size={20} color={Colors.dark.text} />
            <Text style={styles.videoButtonText}>Watch Video Tutorial</Text>
          </TouchableOpacity>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chef-hat" size={20} color={Colors.dark.accent} />
            <Text style={styles.sectionTitle}>Ingredients</Text>
          </View>
          {recipe.ingredients.map((ingredient: string, index: number) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.bullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="chef-hat" size={20} color={Colors.dark.accent} />
            <Text style={styles.sectionTitle}>Instructions</Text>
          </View>
          {recipe.instructions.map((instruction: string, index: number) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
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
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.dark.text,
    marginBottom: 4,
  },
  author: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  favoriteButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 8,
  },
  editButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 8,
  },
  deleteButton: {
    backgroundColor: Colors.dark.card,
    borderRadius: 20,
    padding: 8,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.accent,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  videoButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: Colors.dark.text,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.dark.text,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingLeft: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.dark.accent,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 15,
    color: Colors.dark.text,
    flex: 1,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.dark.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 15,
    color: Colors.dark.text,
    flex: 1,
    lineHeight: 22,
  },
});