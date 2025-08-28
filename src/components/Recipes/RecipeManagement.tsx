import React, { useState } from 'react';
import { ChefHat, Plus, Search, Filter, Edit2, Trash2, Clock, Users, Star, Eye, Copy, BookOpen } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Recipe } from '../../types';

export function RecipeManagement() {
  const { recipes, inventoryItems, addRecipe, updateRecipe, deleteRecipe } = useApp();
  const { addInventoryItem } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [viewingRecipe, setViewingRecipe] = useState<Recipe | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [currentIngredientIndex, setCurrentIngredientIndex] = useState<number | null>(null);
  const [newIngredientData, setNewIngredientData] = useState({
    name: '',
    category: 'vegetables' as const,
    unit: '',
    costPerUnit: 0,
    supplier: '',
    minStock: 0,
    maxStock: 0,
    currentStock: 0
  });

  const [newRecipe, setNewRecipe] = useState({
    name: '',
    category: '',
    prepTime: 30,
    cookTime: 30,
    servings: 4,
    ingredients: [],
    instructions: ['Basic preparation steps'],
    image: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    cuisine: '',
    tags: [] as string[],
    nutritionInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    },
    cost: 0,
    allergens: [] as string[]
  });

  const categories = ['all', 'appetizer', 'main course', 'dessert', 'beverage', 'snack', 'soup', 'salad'];

  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || recipe.category.toLowerCase() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddIngredient = () => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { itemId: '', quantity: 0, unit: '' }]
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleIngredientChange = (index: number, field: string, value: any) => {
    setNewRecipe(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const handleAddInstruction = () => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const handleRemoveInstruction = (index: number) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleInstructionChange = (index: number, value: string) => {
    setNewRecipe(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const handleTagToggle = (tag: string) => {
    setNewRecipe(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) 
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleAllergenToggle = (allergen: string) => {
    setNewRecipe(prev => ({
      ...prev,
      allergens: prev.allergens.includes(allergen)
        ? prev.allergens.filter(a => a !== allergen)
        : [...prev.allergens, allergen]
    }));
  };

  const calculateRecipeCost = () => {
    return newRecipe.ingredients.reduce((total, ingredient) => {
      const item = inventoryItems.find(i => i.id === ingredient.itemId);
      return total + (item ? item.costPerUnit * ingredient.quantity : 0);
    }, 0);
  };

  const resetForm = () => {
    setNewRecipe({
      name: '',
      category: '',
      prepTime: 30,
      cookTime: 30,
      servings: 4,
      ingredients: [],
      instructions: ['Basic preparation steps'],
      image: '',
      difficulty: 'medium',
      cuisine: '',
      tags: [],
      nutritionInfo: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      },
      cost: 0,
      allergens: []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipeData = {
      ...newRecipe,
      cost: calculateRecipeCost()
    };
    
    if (editingRecipe) {
      updateRecipe(editingRecipe.id, recipeData);
      setEditingRecipe(null);
    } else {
      addRecipe(recipeData);
    }
    
    resetForm();
    setShowAddModal(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setNewRecipe({
      name: recipe.name,
      category: recipe.category,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: recipe.image || '',
      difficulty: (recipe as any).difficulty || 'medium',
      cuisine: (recipe as any).cuisine || '',
      tags: (recipe as any).tags || [],
      nutritionInfo: (recipe as any).nutritionInfo || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      cost: (recipe as any).cost || 0,
      allergens: (recipe as any).allergens || []
    });
    setShowAddModal(true);
  };

  const handleView = (recipe: Recipe) => {
    setViewingRecipe(recipe);
    setShowViewModal(true);
  };

  const handleDuplicate = (recipe: Recipe) => {
    setNewRecipe({
      name: `${recipe.name} (Copy)`,
      category: recipe.category,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      image: recipe.image || '',
      difficulty: (recipe as any).difficulty || 'medium',
      cuisine: (recipe as any).cuisine || '',
      tags: (recipe as any).tags || [],
      nutritionInfo: (recipe as any).nutritionInfo || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      cost: (recipe as any).cost || 0,
      allergens: (recipe as any).allergens || []
    });
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      deleteRecipe(id);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recipe Management</h2>
          <p className="text-gray-600">Create and manage your restaurant's recipes</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingRecipe(null);
            setShowAddModal(true);
          }}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Recipe</span>
        </button>
      </div>

      {/* Recipe Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <ChefHat className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Recipes</p>
              <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{new Set(recipes.map(r => r.category)).size}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Cook Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.cookTime, 0) / recipes.length) : 0} min
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Servings</p>
              <p className="text-2xl font-bold text-gray-900">
                {recipes.length > 0 ? Math.round(recipes.reduce((sum, r) => sum + r.servings, 0) / recipes.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => (
          <div key={recipe.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              {recipe.image ? (
                <img src={recipe.image} alt={recipe.name} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <ChefHat className="h-12 w-12 text-orange-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">{recipe.name}</h3>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleView(recipe)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="View Recipe"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Edit Recipe"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDuplicate(recipe)}
                    className="p-1 text-purple-600 hover:bg-purple-50 rounded"
                    title="Duplicate Recipe"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete Recipe"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full capitalize">
                  {recipe.category}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor((recipe as any).difficulty || 'medium')}`}>
                  {((recipe as any).difficulty || 'medium').charAt(0).toUpperCase() + ((recipe as any).difficulty || 'medium').slice(1)}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{recipe.prepTime + recipe.cookTime} min</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{recipe.servings} servings</span>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Ingredients: {recipe.ingredients.length}</p>
                <p className="font-medium">Instructions: {recipe.instructions.length} steps</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Recipe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingRecipe(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Recipe Name *</label>
                  <input
                    type="text"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={newRecipe.category}
                    onChange={(e) => setNewRecipe(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.slice(1).map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newRecipe.cost}
                  onChange={(e) => setNewRecipe(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter recipe cost"
                  min="0"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingRecipe(null);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  {editingRecipe ? 'Update Recipe' : 'Create Recipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Recipe Modal */}
      {showViewModal && viewingRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">{viewingRecipe.name}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {viewingRecipe.image && (
                <img 
                  src={viewingRecipe.image} 
                  alt={viewingRecipe.name}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{viewingRecipe.prepTime}</div>
                  <div className="text-sm text-gray-600">Prep Time (min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{viewingRecipe.cookTime}</div>
                  <div className="text-sm text-gray-600">Cook Time (min)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{viewingRecipe.servings}</div>
                  <div className="text-sm text-gray-600">Servings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{viewingRecipe.prepTime + viewingRecipe.cookTime}</div>
                  <div className="text-sm text-gray-600">Total Time (min)</div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Ingredients</h4>
                <ul className="space-y-2">
                  {viewingRecipe.ingredients.map((ingredient, index) => {
                    const item = inventoryItems.find(i => i.id === ingredient.itemId);
                    return (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                        <span>{ingredient.quantity} {ingredient.unit} {item?.name || 'Unknown ingredient'}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Instructions</h4>
                <ol className="space-y-3">
                  {viewingRecipe.instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-gray-700">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}