import { z } from 'zod';

export const stepTypeSchema = z.enum(['start', 'sms', 'email', 'custom', 'end']);

export const nodeFormSchema = z.object({
    name: z.string()
        .min(1, 'Le nom est requis')
        .max(50, 'Le nom ne peut pas dépasser 50 caractères'),
    stepType: stepTypeSchema,
    description: z.string()
        .max(200, 'La description ne peut pas dépasser 200 caractères')
        .optional(),
    hasConditionalOutputs: z.boolean().optional(),
    successRate: z.number()
        .min(0, 'Le pourcentage doit être entre 0 et 100')
        .max(100, 'Le pourcentage doit être entre 0 et 100')
        .optional()
});

export type NodeFormData = z.infer<typeof nodeFormSchema>;