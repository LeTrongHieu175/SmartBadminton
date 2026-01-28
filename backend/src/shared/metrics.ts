import { Counter, Histogram, Registry } from 'prom-client';

export const metricsRegistry = new Registry();

export const registrationSuccessCounter = new Counter({
  name: 'auth_registration_success_total',
  help: 'Total successful user registrations',
  registers: [metricsRegistry],
});

export const registrationFailureCounter = new Counter({
  name: 'auth_registration_failure_total',
  help: 'Total failed user registrations',
  registers: [metricsRegistry],
});

export const registrationDurationHistogram = new Histogram({
  name: 'auth_registration_duration_ms',
  help: 'Registration latency (milliseconds)',
  buckets: [50, 100, 200, 400, 800, 1600, 3200],
  registers: [metricsRegistry],
});

export const loginSuccessCounter = new Counter({
  name: 'auth_login_success_total',
  help: 'Total successful user logins',
  registers: [metricsRegistry],
});

export const loginFailureCounter = new Counter({
  name: 'auth_login_failure_total',
  help: 'Total failed user logins',
  registers: [metricsRegistry],
});

export const loginDurationHistogram = new Histogram({
  name: 'auth_login_duration_ms',
  help: 'Login latency (milliseconds)',
  buckets: [50, 100, 200, 400, 800, 1600, 3200],
  registers: [metricsRegistry],
});

export const availableCourtsSearchCounter = new Counter({
  name: 'courts_available_search_total',
  help: 'Total available courts searches',
  registers: [metricsRegistry],
});

export const availableCourtsEmptyCounter = new Counter({
  name: 'courts_available_empty_total',
  help: 'Total available courts searches with empty result',
  registers: [metricsRegistry],
});

export const availableCourtsDurationHistogram = new Histogram({
  name: 'courts_available_duration_ms',
  help: 'Available courts search latency (milliseconds)',
  buckets: [50, 100, 200, 400, 800, 1600, 3200],
  registers: [metricsRegistry],
});

export const getMetricsSnapshot = (): Promise<string> =>
  metricsRegistry.metrics();
