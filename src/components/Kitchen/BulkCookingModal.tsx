import React, { useState } from 'react';
import { X, Plus, Minus, ChefHat, Clock, Users } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface BulkCookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cookingData: any) => void;
}

export function BulkCookingModal({ isOpen, onClose, onSubmit }: BulkCookingModalProps) {
  const { recipes, inventoryItems } = useApp();
  
// Pre-defined bulk cooking data
const bulkCookingPresets = [
  {
    id: 'lunch-special',
    name: 'Lunch Special Combo',
    description: 'Popular lunch items for busy hours',
    items: [
      { recipeId: '1', quantity: 10, priority: 'high' }, // Chicken Biryani
      { recipeId: '2', quantity: 8, priority: 'medium' }  // Vegetable Curry
    ],
    estimatedTime: 90,
    servings: 72
  },
  {
    id: 'dinner-rush',
    name: 'Dinner Rush Preparation',
    description: 'Evening dinner preparation',
    items: [
      { recipeId: '1', quantity: 15, priority: 'high' },
      { recipeId: '2', quantity: 6, priority: 'low' }
    ],
    estimatedTime: 120,
    servings: 84
  },
  {
    id: 'weekend-special',
    name: 'Weekend Special Menu',
    description: 'Weekend high-demand items',
    items: [
      { recipeId: '1', quantity: 20, priority: 'high' },
      { recipeId: '2', quantity: 12, priority: 'medium' }
    ],
    estimatedTime: 150,
    servings: 128
  }
];

  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [customItems, setCustomItems] = useState<any[]>([]);
  const [cookingMode, setCookingMode] = useState<'preset' | 'custom'>('preset');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = bulkCookingPresets.find(p => p.id === presetId);
    if (preset) {
      setCustomItems(preset.items.map(item => ({
        ...item,
        recipe: recipes.find(r => r.id === item.recipeId)
      })));
    }
  };

  const addCustomItem = () => {
    setCustomItems([...customItems, {
      recipeId: '',
      quantity: 1,
      priority: 'medium',
      recipe: null
    }]);
  };

  const updateCustomItem = (index: number, field: string, value: any) => {
    const updated = [...customItems];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'recipeId') {
      updated[index].recipe = recipes.find(r => r.id === value);
    }
    
    setCustomItems(updated);
  };

  const removeCustomItem = (index: number) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  const calculateTotalServings = () => {
    return customItems.reduce((total, item) => {
      const recipe = item.recipe || recipes.find(r => r.id === item.recipeId);
      return total + (recipe ? recipe.servings * item.quantity : 0);
    }, 0);
  };

  const calculateEstimatedTime = () => {
    if (selectedPreset && cookingMode === 'preset') {
      const preset = bulkCookingPresets.find(p => p.id === selectedPreset);
      return preset?.estimatedTime || 0;
    }
    
    const maxTime = Math.max(...customItems.map(item => {
      const recipe = item.recipe || recipes.find(r => r.id === item.recipeId);
      return recipe ? (recipe.prepTime + recipe.cookTime) : 0;
    }));
    
    return Math.round(maxTime * 1.2); // Add 20% buffer for bulk cooking
  };

  const checkInventoryAvailability = () => {
    const requiredIngredients: { [key: string]: number } = {};
    
    customItems.forEach(item => {
      const recipe = item.recipe || recipes.find(r => r.id === item.recipeId);
      if (recipe) {
        recipe.ingredients.forEach(ingredient => {
          const key = ingredient.itemId;
          requiredIngredients[key] = (requiredIngredients[key] || 0) + 
            (ingredient.quantity * item.quantity);
        });
      }
    });

    const shortages: any[] = [];
    Object.entries(requiredIngredients).forEach(([itemId, required]) => {
      const inventoryItem = inventoryItems.find(i => i.id === itemId);
      if (inventoryItem && inventoryItem.currentStock < required) {
        shortages.push({
          item: inventoryItem,
          required,
          available: inventoryItem.currentStock,
          shortage: required - inventoryItem.currentStock
        });
      }
    });

    return shortages;
  };

  const handleSubmit = () => {
    const shortages = checkInventoryAvailability();
    
    const cookingData = {
      mode: cookingMode,
      preset: selectedPreset ? bulkCookingPresets.find(p => p.id === selectedPreset) : null,
      items: customItems,
      notes,
      estimatedTime: calculateEstimatedTime(),
      totalServings: calculateTotalServings(),
      inventoryShortages: shortages,
      startTime: new Date().toISOString()
    };

    onSubmit(cookingData);
    onClose();
  };

  const shortages = checkInventoryAvailability();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ChefHat className="h-6 w-6 text-orange-500" />
            <h2 className="text-xl font-semibold text-gray-900">Bulk Cooking Setup</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {/* Cooking Mode Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Cooking Mode</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => setCookingMode('preset')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  cookingMode === 'preset'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Preset
              </button>
              <button
                onClick={() => setCookingMode('custom')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  cookingMode === 'custom'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom Setup
              </button>
            </div>
          </div>

          {/* Preset Selection */}
          {cookingMode === 'preset' && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Select Preset</h3>
              <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-lg">
                <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No Bulk Cooking Presets Available</p>
                <p className="text-sm text-gray-400 mt-2">
                  Use Custom Setup to create your bulk cooking batches.
                </p>
              </div>
            </div>
          )}

          {/* Custom Items or Preset Items */}
          {(cookingMode === 'custom' || selectedPreset) && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">Cooking Items</h3>
                {cookingMode === 'custom' && (
                  <button
                    onClick={addCustomItem}
                    className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {customItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      {cookingMode === 'custom' ? (
                        <select
                          value={item.recipeId}
                          onChange={(e) => updateCustomItem(index, 'recipeId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="">Select Recipe</option>
                          {recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>
                              {recipe.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="font-medium text-gray-900">{item.recipe?.name}</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateCustomItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateCustomItem(index, 'quantity', item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <select
                      value={item.priority}
                      onChange={(e) => updateCustomItem(index, 'priority', e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>

                    {cookingMode === 'custom' && (
                      <button
                        onClick={() => removeCustomItem(index)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Shortages Warning */}
          {shortages.length > 0 && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">Inventory Shortages Detected</h4>
              <div className="space-y-2">
                {shortages.map((shortage, index) => (
                  <div key={index} className="text-sm text-red-700">
                    <span className="font-medium">{shortage.item.name}</span>: 
                    Need {shortage.required} {shortage.item.unit}, 
                    Available {shortage.available} {shortage.item.unit} 
                    (Short by {shortage.shortage} {shortage.item.unit})
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          {customItems.length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Cooking Summary</h4>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-700">
                <div>Total Items: {customItems.length}</div>
                <div>Total Servings: {calculateTotalServings()}</div>
                <div>Estimated Time: {calculateEstimatedTime()} minutes</div>
                <div>Priority Items: {customItems.filter(i => i.priority === 'high').length}</div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cooking Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add any special instructions or notes for the kitchen staff..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={customItems.length === 0}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Bulk Cooking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}