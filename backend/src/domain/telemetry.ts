import { z } from 'zod';

export const NodeStatusSchema = z.enum(['OK', 'WARNING', 'CRITICAL']);
export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const TelemetrySchema = z.object({
  nodeId: z.string().min(1),
  status: NodeStatusSchema,
  cpuLoad: z.number().min(0).max(100),
  memoryUsage: z.number().min(0).max(100),
  latency: z.number().min(0),
  timestamp: z.number().int().nonnegative()
});

export type TelemetryData = Readonly<z.infer<typeof TelemetrySchema>>;
export type Metrics = Pick<TelemetryData, 'cpuLoad' | 'memoryUsage' | 'latency'>;

/** Wire protocol: full snapshot on connect, then incremental batches per tick. */
export const ServerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('snapshot'), nodes: z.array(TelemetrySchema) }),
  z.object({ type: z.literal('batch'), updates: z.array(TelemetrySchema) })
]);

export type ServerMessage = z.infer<typeof ServerMessageSchema>;

/** Source of uniform randomness in [0, 1). Injected to keep the core pure/deterministic. */
export type Rng = () => number;
