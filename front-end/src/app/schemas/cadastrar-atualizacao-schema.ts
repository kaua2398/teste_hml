import { z } from 'zod';

export const demandaSchema = z.object({
  title: z.string().min(5, "O título deve ter no mínimo 5 caracteres"),
  status: z.string().min(1, "Selecione um status"),
  gitLink: z.string()
    .url("Insira uma URL válida")
    .startsWith("https://git.valeshop.com.br", "O link deve começar com https://git.valeshop.com.br")
    .optional()
    .or(z.literal('')), 
  description: z.string()
    .min(10, "A descrição deve ter pelo menos 10 caracteres")
    .max(65535, "A descrição excedeu o limite de 65.535 caracteres")
});