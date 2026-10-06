import { initFleet, tickFleet, type Fleet } from './application/fleet.js';
import { batchMessage, encode, snapshotMessage } from './application/messages.js';
import { parseConfig } from './infrastructure/config.js';
import { mulberry32 } from './infrastructure/rng.js';
import { createTelemetryServer } from './infrastructure/wsServer.js';

// Imperative shell: owns the only mutable cell (current fleet) and the clock.
const config = parseConfig(process.env);
const rng = mulberry32(config.seed ?? Date.now());
let fleet: Fleet = initFleet(rng, config.nodeCount, Date.now());

const server = await createTelemetryServer({
  port: config.port,
  path: '/ws',
  heartbeatMs: 15_000,
  onConnect: () => encode(snapshotMessage(fleet))
});

const timer = setInterval(() => {
  const tick = tickFleet(rng, fleet, Date.now(), config.updateRatio);
  fleet = tick.fleet;
  if (tick.updates.length > 0 && server.clientCount() > 0) {
    server.broadcast(encode(batchMessage(tick.updates)));
  }
}, config.tickMs);

console.log(
  `[telemetry] ws://0.0.0.0:${server.port}/ws · nodes=${config.nodeCount} tick=${config.tickMs}ms ratio=${config.updateRatio}`
);

const shutdown = async (signal: string): Promise<void> => {
  console.log(`[telemetry] ${signal} received, shutting down`);
  clearInterval(timer);
  await server.close();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
