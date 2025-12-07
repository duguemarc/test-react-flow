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
    hasConditionalOutputs: z.boolean().optional()
});

export type NodeFormData = z.infer<typeof nodeFormSchema>;