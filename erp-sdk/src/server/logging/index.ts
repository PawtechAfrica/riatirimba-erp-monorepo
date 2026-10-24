export function createServiceLogger(serviceName: string) {
  return {
    info: (msg: string, meta?: Record<string, unknown>) => {
      console.log(`[${new Date().toISOString()}] [INFO] [${serviceName}] ${msg}`, meta ?? '');
    },
    error: (msg: string, meta?: Record<string, unknown>) => {
      console.error(`[${new Date().toISOString()}] [ERROR] [${serviceName}] ${msg}`, meta ?? '');
    },
    warn: (msg: string, meta?: Record<string, unknown>) => {
      console.warn(`[${new Date().toISOString()}] [WARN] [${serviceName}] ${msg}`, meta ?? '');
    },
  };
}
