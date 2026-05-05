import { beforeAll, afterAll } from 'vitest';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-vitest-minimum-32-chars';
  process.env.PORT = '8081';
});

afterAll(async () => {
  // cleanup if needed
});
