import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { supabase } from '@/lib/supabase';

import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useRecipes } from '@/hooks/recipe-store';
import { useLocalSearchParams, router } from 'expo-router';
import { mockCategories } from '@/mocks/recipes';
import { Recipe } from '@/types/recipe';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams();
  const { getRecipeById, updateRecipe } = useRecipes();
  
  const recipe = getRecipeById(id as string);
  
  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [category, setCategory] = useState('Dinner');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [ingredients, setIngredients] = useState(['']);
  const [instructions, setInstructions] = useState(['']);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  useEffect(() => {
    if (recipe) {
      setTitle(recipe.title);
      setPrepTime(recipe.prepTime.toString());
      setCookTime(recipe.cookTime.toString());
      setServings(recipe.servings.toString());
      setCategory(recipe.category);
      setDifficulty(recipe.difficulty);
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : ['']);
      setInstructions(recipe.instructions.length > 0 ? recipe.instructions : ['']);
      setImageUrl(recipe.image || '');
      setVideoUrl(recipe.videoUrl || '');
    }
  }, [recipe]);

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Recipe not found</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <AntDesign name="arrowleft" size={20} color={Colors.dark.text} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const addIngredient = () => setIngredients([...ingredients, '']);
  const removeIngredient = (index: number) => ingredients.length > 1 && setIngredients(ingredients.filter((_, i) => i !== index));
  const updateIngredient = (index: number, value: string) => { const updated = [...ingredients]; updated[index] = value; setIngredients(updated); };
  const addInstruction = () => setInstructions([...instructions, '']);
  const removeInstruction = (index: number) => instructions.length > 1 && setInstructions(instructions.filter((_, i) => i !== index));
  const updateInstruction = (index: number, value: string) => { const updated = [...instructions]; updated[index] = value; setInstructions(updated); };

  const handleSubmit = async () => {
  if (!title || !prepTime || !cookTime || !servings) {
    Alert.alert('Error', 'Please fill in all required fields');
    return;
  }

  const filteredIngredients = ingredients.filter(i => i.trim());
  const filteredInstructions = instructions.filter(i => i.trim());

  if (filteredIngredients.length === 0 || filteredInstructions.length === 0) {
    Alert.alert('Error', 'Please add at least one ingredient and instruction');
    return;
  }

  const { error } = await supabase
    .from('recipes')
    .update({
      title,
      image: imageUrl || recipe.image,
      prepTime: parseInt(prepTime),
      cookTime: parseInt(cookTime),
      servings: parseInt(servings),
      difficulty,
      category,
      ingredients: filteredIngredients,
      instructions: filteredInstructions,
      video_url: videoUrl || null,
    })
    .eq('id', recipe.id);

  if (error) {
    console.error(error);
    Alert.alert('Error', 'Failed to update recipe');
    return;
  }

  Alert.alert('Success', 'Recipe updated successfully!', [
    { text: 'OK', onPress: () => router.back() },
  ]);
  
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <AntDesign name="arrowleft" size={20} color={Colors.dark.text} />
            </TouchableOpacity>
            <View style={styles.headerContent}>
              <MaterialCommunityIcons name="chef-hat" size={32} color={Colors.dark.accent} />
              <Text style={styles.title}>Edit Recipe</Text>
            </View>
            <View style={styles.placeholder} />
          </View>

          {/* Title, Image, Video */}
          <View style={styles.section}>
            <Text style={styles.label}>Recipe Title *</Text>
            <TextInput style={styles.input} placeholder="Enter recipe name" placeholderTextColor={Colors.dark.textTertiary} value={title} onChangeText={setTitle} />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Image URL (optional)</Text>
            <TextInput style={styles.input} placeholder="https://example.com/image.jpg" placeholderTextColor={Colors.dark.textTertiary} value={imageUrl} onChangeText={setImageUrl} />
          </View>
          <View style={styles.section}>
            <Text style={styles.label}>Video URL (optional)</Text>
            <TextInput style={styles.input} placeholder="https://youtube.com/watch?v=..." placeholderTextColor={Colors.dark.textTertiary} value={videoUrl} onChangeText={setVideoUrl} />
          </View>

          {/* Prep & Cook Time */}
          <View style={styles.row}>
            <View style={styles.halfSection}>
              <Text style={styles.label}>Prep Time (min) *</Text>
              <TextInput style={styles.input} placeholder="15" placeholderTextColor={Colors.dark.textTertiary} value={prepTime} onChangeText={setPrepTime} keyboardType="numeric" />
            </View>
            <View style={styles.halfSection}>
              <Text style={styles.label}>Cook Time (min) *</Text>
              <TextInput style={styles.input} placeholder="30" placeholderTextColor={Colors.dark.textTertiary} value={cookTime} onChangeText={setCookTime} keyboardType="numeric" />
            </View>
          </View>

          {/* Servings */}
          <View style={styles.section}>
            <Text style={styles.label}>Servings *</Text>
            <TextInput style={styles.input} placeholder="4" placeholderTextColor={Colors.dark.textTertiary} value={servings} onChangeText={setServings} keyboardType="numeric" />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              {mockCategories.slice(1).map(cat => (
                <TouchableOpacity key={cat.id} style={[styles.categoryButton, category === cat.name && styles.selectedCategory]} onPress={() => setCategory(cat.name)}>
                  <Text style={[styles.categoryText, category === cat.name && styles.selectedCategoryText]}>{cat.icon} {cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Difficulty */}
          <View style={styles.section}>
            <Text style={styles.label}>Difficulty</Text>
            <View style={styles.difficultyContainer}>
              {(['Easy', 'Medium', 'Hard'] as const).map(level => (
                <TouchableOpacity key={level} style={[styles.difficultyButton, difficulty === level && styles.selectedDifficulty]} onPress={() => setDifficulty(level)}>
                  <Text style={[styles.difficultyText, difficulty === level && styles.selectedDifficultyText]}>{level}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Ingredients</Text>
              <TouchableOpacity onPress={addIngredient} style={styles.addButton}>
                <AntDesign name="plus" size={20} color={Colors.dark.accent} />
              </TouchableOpacity>
            </View>
            {ingredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <TextInput style={styles.listInput} placeholder={`Ingredient ${index + 1}`} placeholderTextColor={Colors.dark.textTertiary} value={ingredient} onChangeText={value => updateIngredient(index, value)} />
                {ingredients.length > 1 && (
                  <TouchableOpacity onPress={() => removeIngredient(index)}>
                    <AntDesign name="minus" size={20} color={Colors.dark.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Instructions</Text>
              <TouchableOpacity onPress={addInstruction} style={styles.addButton}>
                <AntDesign name="plus" size={20} color={Colors.dark.accent} />
              </TouchableOpacity>
            </View>
            {instructions.map((instruction, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <TextInput style={styles.listInput} placeholder={`Step ${index + 1}`} placeholderTextColor={Colors.dark.textTertiary} value={instruction} onChangeText={value => updateInstruction(index, value)} multiline />
                {instructions.length > 1 && (
                  <TouchableOpacity onPress={() => removeInstruction(index)}>
                    <AntDesign name="minus" size={20} color={Colors.dark.error} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Update Recipe</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.dark.background },
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingTop: 16 },
  headerContent: { alignItems: 'center', flex: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.dark.card, borderRadius: 20, padding: 8, gap: 8 },
  backButtonText: { color: Colors.dark.text, fontSize: 14, fontWeight: '500' },
  placeholder: { width: 60 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.dark.text, marginTop: 12 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  errorText: { fontSize: 18, color: Colors.dark.text, textAlign: 'center' },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  halfSection: { flex: 1, marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.dark.text, marginBottom: 8 },
  input: { backgroundColor: Colors.dark.inputBackground, borderRadius: 12, padding: 14, fontSize: 16, color: Colors.dark.text, borderWidth: 1, borderColor: Colors.dark.inputBorder },
  categoryScroll: { flexDirection: 'row' },
  categoryButton: { backgroundColor: Colors.dark.card, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: Colors.dark.cardBorder },
  selectedCategory: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  categoryText: { color: Colors.dark.textSecondary, fontSize: 14, fontWeight: '500' },
  selectedCategoryText: { color: Colors.dark.text },
  difficultyContainer: { flexDirection: 'row', gap: 12 },
  difficultyButton: { flex: 1, backgroundColor: Colors.dark.card, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.cardBorder },
  selectedDifficulty: { backgroundColor: Colors.dark.accent, borderColor: Colors.dark.accent },
  difficultyText: { color: Colors.dark.textSecondary, fontSize: 14, fontWeight: '600' },
  selectedDifficultyText: { color: Colors.dark.text },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  addButton: { backgroundColor: Colors.dark.card, borderRadius: 16, padding: 6 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  stepNumber: { color: Colors.dark.textSecondary, fontSize: 16, fontWeight: '600', width: 20 },
  listInput: { flex: 1, backgroundColor: Colors.dark.inputBackground, borderRadius: 12, padding: 12, fontSize: 14, color: Colors.dark.text, borderWidth: 1, borderColor: Colors.dark.inputBorder },
  submitButton: { backgroundColor: Colors.dark.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 32 },
  submitButtonText: { color: Colors.dark.text, fontSize: 18, fontWeight: 'bold' },
});
