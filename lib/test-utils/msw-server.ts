// Mock Service Worker server for testing
import { setupServer } from 'msw/node'

// Empty handlers array - add handlers as needed for specific tests
export const server = setupServer()

// Enable API mocking before tests run
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))

// Reset handlers after each test
afterEach(() => server.resetHandlers())

// Clean up after tests
afterAll(() => server.close())