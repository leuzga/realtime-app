import { z } from 'zod';

const EnvSchema = z.object({
  PORT: z.coerce.number().int().min(0).max(65535).default(4000),
  NODE_COUNT: z.coerce.number().int().min(1).max(20000).default(250),
  TICK_MS: z.coerce.number().int().min(16).max(10000).default(250),
  UPDATE_RATIO: z.coerce.number().min(0).max(1).default(0.3),
  SEED: z.coerce.number().int().optional()
});

export interface Config {
  readonly port: number;
  readonly nodeCount: number;
  readonly tickMs: number;
  readonly updateRatio: number;
  readonly seed: number | undefined;
}

export const parseConfig = (env: Readonly<Record<string, string | undefined>>): Config => {
  const parsed = EnvSchema.parse(env);
  return {
    port: parsed.PORT,
    nodeCount: parsed.NODE_COUNT,
    tickMs: parsed.TICK_MS,
    updateRatio: parsed.UPDATE_RATIO,
    seed: parsed.SEED
  };
};
