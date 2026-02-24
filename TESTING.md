# Testing Guide

This document provides information about running and writing tests for the Planning Poker application.

## Overview

The project includes comprehensive test suites for both the server and client:

### Server Tests (Vitest/Jest compatible)
- **SessionManager Tests** - Tests for session creation, joining, disconnection, and state management
- **Vote Calculations Tests** - Tests for vote statistics (min, max, avg, sorting)
- **Voting Handlers Tests** - Tests for voting flow (start voting, vote, reveal, reset)
- **Session Handlers Tests** - Tests for session creation, joining, and state retrieval

### Client Tests (Jest with Testing Library)
- **useVoteHandlers Hook Tests** - Tests for vote submission and estimation confirmation
- **useSessionState Hook Tests** - Tests for session state management and updates

## Running Tests

### Server Tests
```bash
cd server
npm test
# or for Jest
npm run test:jest
```

### Client Tests
```bash
cd client
npm test
# or for Jest
npm run test:jest
```

### Run All Tests with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Files Location

### Server
- `server/tests/sessionManager.test.ts` - Session management tests
- `server/tests/voteCalculations.test.ts` - Vote calculation utility tests
- `server/tests/votingHandlers.test.ts` - Voting handlers tests
- `server/tests/sessionHandlers.test.ts` - Session handlers tests
- `server/jest.config.json` - Jest configuration

### Client
- `client/tests/useVoteHandlers.test.ts` - Vote handlers hook tests
- `client/tests/useSessionState.test.ts` - Session state hook tests
- `client/jest.config.json` - Jest configuration
- `client/jest.setup.ts` - Jest setup and global mocks

## Writing New Tests

### For Server (using Vitest/Jest syntax):

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  let depends: any;

  beforeEach(() => {
    // Setup
    depends = // ...
  });

  it('should do something', () => {
    // Arrange
    const input = // ...
    
    // Act
    const result = // ...
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

### For Client (using Jest with Testing Library):

```typescript
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useYourHook } from '../hooks/useYourHook';

describe('useYourHook', () => {
  it('should initialize correctly', () => {
    const { result } = renderHook(() => useYourHook());
    
    expect(result.current.value).toBeDefined();
  });
  
  it('should update state on action', async () => {
    const { result } = renderHook(() => useYourHook());
    
    act(() => {
      result.current.doSomething();
    });
    
    await waitFor(() => {
      expect(result.current.value).toBe('expected');
    });
  });
});
```

## Test Coverage Goals

Current coverage targets:
- **Utility Functions**: > 95%
- **Hooks**: > 85%
- **Handlers**: > 80%
- **Overall**: > 80%

To check coverage:
```bash
npm test -- --coverage
```

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it
2. **Keep Tests Isolated**: Each test should be independent
3. **Use Meaningful Names**: Test names should clearly describe what is being tested
4. **DRY Testing**: Use beforeEach/afterEach for common setup/teardown
5. **Mock External Dependencies**: Mock sockets, HTTP requests, etc.
6. **Test Edge Cases**: Include tests for empty inputs, errors, etc.

## Common Test Patterns

### Testing Socket Events
```typescript
const mockSocket = {
  emit: vi.fn(),
  on: vi.fn(),
  off: vi.fn(),
};

// Verify emit was called
expect(mockSocket.emit).toHaveBeenCalledWith('event-name', expectedArgs);
```

### Testing Async State Updates
```typescript
const { result } = renderHook(() => useAsyncHook());

act(() => {
  result.current.triggerAsync();
});

await waitFor(() => {
  expect(result.current.data).toBeDefined();
});
```

### Testing Error Cases
```typescript
it('should handle errors', () => {
  const setError = vi.fn();
  
  // Trigger error
  
  expect(setError).toHaveBeenCalledWith('error message');
});
```

## CI/CD Integration

Tests are automatically run on:
- Pull requests
- Commits to main branch
- Pre-commit hooks (optional)

## Troubleshooting

### Tests timing out
- Increase timeout: `it('test', () => { /* */ }, 10000)`
- Check for infinite loops or unresolved promises

### Module not found errors
- Check import paths and aliases
- Ensure jest.config.json has correct moduleNameMapper

### Socket mock issues
- Ensure vi.fn() is properly set up
- Check that callbacks are being called correctly

## Resources

- [Vitest Documentation](https://vitest.dev)
- [Jest Documentation](https://jestjs.io)
- [React Testing Library](https://testing-library.com/react)

## Contact

For questions or issues with tests, please create an issue on the repository.
