import '@testing-library/jest-dom';
import { configureMockAxios } from './axios.mock';

// Configure global axios mocks
configureMockAxios();

// Silence act() warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});