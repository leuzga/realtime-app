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
export type TelemetryData = z.infer<typeof TelemetrySchema>;

export const ServerMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('snapshot'), nodes: z.array(TelemetrySchema) }),
  z.object({ type: z.literal('batch'), updates: z.array(TelemetrySchema) })
]);
export type ServerMessage = z.infer<typeof ServerMessageSchema>;

export const parseMessage = (raw: string): ServerMessage => ServerMessageSchema.parse(JSON.parse(raw));
