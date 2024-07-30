import z from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string(),
  HOST: z.string(),
  PORT: z.coerce.number().default(3333),
  FRONT_URL: z.string(),
})

export const env = envSchema.parse(process.env)
