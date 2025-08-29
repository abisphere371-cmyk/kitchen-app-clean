import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

const recipeSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional().nullable(),
  prepTime: z.number().optional().nullable(),
  cookTime: z.number().optional().nullable(),
  servings: z.number().optional().nullable(),
  ingredients: z.array(z.any()).optional().default([]),
  instructions: z.array(z.string()).optional().default([]),
  image: z.string().optional().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional().nullable(),
  cuisine: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  nutritionInfo: z.record(z.any()).optional().nullable(),
  cost: z.number().optional().nullable(),
  allergens: z.array(z.string()).optional().default([]),
});

router.get('/', requireAuth, async (_req, res) => {
  try {
    const result = await query(`SELECT * FROM recipes ORDER BY name`);
    res.json(result.rows);
  } catch (err) {
    console.error('Get recipes error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const data = recipeSchema.parse(req.body);
    const result = await query(
      `INSERT INTO recipes (name, category, prep_time, cook_time, servings, ingredients, instructions, image, difficulty, cuisine, tags, nutrition_info, cost, allergens)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        data.name,
        data.category ?? null,
        data.prepTime ?? null,
        data.cookTime ?? null,
        data.servings ?? null,
        JSON.stringify(data.ingredients),
        data.instructions ?? [],
        data.image ?? null,
        data.difficulty ?? null,
        data.cuisine ?? null,
        data.tags ?? [],
        data.nutritionInfo ? JSON.stringify(data.nutritionInfo) : null,
        data.cost ?? null,
        data.allergens ?? []
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Create recipe error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const data = recipeSchema.partial().parse(req.body);
    const { rows } = await query(
      `UPDATE recipes
       SET name = COALESCE($2, name),
           category = COALESCE($3, category),
           prep_time = COALESCE($4, prep_time),
           cook_time = COALESCE($5, cook_time),
           servings = COALESCE($6, servings),
           ingredients = COALESCE($7, ingredients),
           instructions = COALESCE($8, instructions),
           image = COALESCE($9, image),
           difficulty = COALESCE($10, difficulty),
           cuisine = COALESCE($11, cuisine),
           tags = COALESCE($12, tags),
           nutrition_info = COALESCE($13, nutrition_info),
           cost = COALESCE($14, cost),
           allergens = COALESCE($15, allergens),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [
        req.params.id,
        data.name ?? null,
        data.category ?? null,
        data.prepTime ?? null,
        data.cookTime ?? null,
        data.servings ?? null,
        data.ingredients ? JSON.stringify(data.ingredients) : null,
        data.instructions ?? null,
        data.image ?? null,
        data.difficulty ?? null,
        data.cuisine ?? null,
        data.tags ?? null,
        data.nutritionInfo ? JSON.stringify(data.nutritionInfo) : null,
        data.cost ?? null,
        data.allergens ?? null
      ]
    );
    res.json(rows[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    console.error('Update recipe error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(`DELETE FROM recipes WHERE id = $1 RETURNING *`, [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;