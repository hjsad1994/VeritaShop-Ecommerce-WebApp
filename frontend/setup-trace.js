// Prevent EPERM errors by disabling tracing
process.env.OTEL_SDK_DISABLED = 'true';
process.env.NEXT_TELEMETRY_DISABLED = '1';
