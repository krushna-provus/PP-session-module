# Jest/Vitest Configuration and Test Installation Guide

## Overview

Comprehensive Jest/Vitest test suites have been added for the Planning Poker application covering server-side logic, client-side hooks, utilities, and end-to-end workflows.

## Test Files Added

### Server-Side Tests

1. **sessionManager.test.ts** (39 tests)
   - Session creation and ID generation
   - User joining and participant management
   - Session retrieval and state management
   - User disconnect and cleanup logic
   - Session state aggregation

2. **voteCalculations.test.ts** (16 tests)
   - Minimum vote calculation
   - Maximum vote calculation
   - Average vote calculation with rounding
   - Vote sorting in ascending order
   - Edge cases (empty arrays, single items, duplicates)

3. **votingHandlers.test.ts** (13 tests)
   - Starting voting rounds
   - Submitting individual votes
   - Revealing votes to all participants
   - Resetting votes and state
   - Vote state validation

4. **sessionHandlers.test.ts** (15 tests)
   - Creating new sessions
   - Joining existing sessions
   - Session state retrieval
   - Participant information tracking
   - Error handling for invalid sessions

5. **integration.test.ts** (3 comprehensive end-to-end tests)
   - Complete voting workflow: create → join → vote → reveal
   - Reset votes and start new round
   - Late participant joining and state sync

### Client-Side Tests

1. **useVoteHandlers.test.ts** (11 tests)
   - Hook initialization with default values
   - Vote statistic calculations (min, max, avg)
   - Vote submission via socket
   - Reveal votes functionality
   - Reset votes functionality
   - Min/average/maximum vote selection
   - Manual vote entry
   - Error handling

2. **useSessionState.test.ts** (10 tests)
   - Hook initialization from initial session data
   - Session state updates via socket events
   - User vote tracking in state
   - Error state management
   - Success message state
   - Issue estimation update handling
   - Cleanup on component unmount

### Configuration Files

1. **server/jest.config.json**
   - Jest configuration for Node.js environment
   - TypeScript transformation
   - Test pattern matching

2. **client/jest.config.json**
   - Jest configuration for jsdom (browser environment)
   - Support for Next.js path aliases (@/)
   - Setup files integration

3. **client/jest.setup.ts**
   - Testing Library integration
   - Next.js Image mock
   - Window.matchMedia mock

4. **TESTING.md**
   - Comprehensive testing documentation
   - How to run tests
   - Test writing patterns
   - Best practices

## Installation Steps

### Step 1: Install Jest Dependencies (Server)

```bash
cd server
npm install --save-dev jest @types/jest ts-jest
```

### Step 2: Install Jest Dependencies (Client)

```bash
cd client
npm install --save-dev jest @types/jest ts-jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom
```

### Step 3: Update package.json Scripts

**server/package.json:**
```json
{
  "scripts": {
    "dev": "tsx server.ts",
    "test": "vitest",
    "test:jest": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch"
  }
}
```

**client/package.json:**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### Step 4: Run Tests

```bash
# Server tests
cd server && npm test:jest

# Client tests
cd client && npm test

# With coverage
cd server && npm run test:coverage
cd client && npm run test:coverage

# Watch mode
cd server && npm run test:watch
cd client && npm run test:watch
```

## Test Statistics

- **Total Test Cases**: 95+
- **Server Unit Tests**: 39 (SessionManager)
- **Utility Tests**: 16 (Vote Calculations)
- **Handler Tests**: 28 (Voting + Session Handlers)
- **Integration Tests**: 3 (End-to-end flows)
- **Client Hook Tests**: 21 (Vote and Session State)

## Coverage Goals

Target coverage metrics after running all tests:

```
server/:
  Statement Coverage: > 80%
  Branch Coverage: > 75%
  Function Coverage: > 80%
  Line Coverage: > 80%

client/:
  Statement Coverage: > 75%
  Branch Coverage: > 70%
  Function Coverage: > 75%
  Line Coverage: > 75%
```

## Running All Tests

```bash
# Run all server tests
cd server && npm run test:jest

# Run all client tests
cd client && npm test

# Run both with coverage
npm run test:all:coverage
```

## Test Patterns Used

### 1. **Unit Testing**
- Testing individual functions and hooks
- Mocking external dependencies
- Verifying expected outputs

### 2. **Integration Testing**
- Testing complete workflows
- Socket.io event flows
- Multi-participant scenarios

### 3. **Component Testing (Client)**
- React Hook Testing Library
- Async state updates with waitFor
- Event emission verification

## Mocking Strategy

### Server Tests
- Mock Socket.io instances
- Mock callbacks and event handlers
- Verify emit calls

### Client Tests
- Mock Socket.io client
- Mock React Testing Library utilities
- Verify state updates and side effects

## Best Practices Implemented

1. ✅ Descriptive test names
2. ✅ Arrange-Act-Assert pattern
3. ✅ Setup/teardown with beforeEach/afterEach
4. ✅ Edge case coverage
5. ✅ Error handling tests
6. ✅ Async test handling
7. ✅ Proper cleanup and teardown
8. ✅ Isolated test cases

## Next Steps

1. Install all dependencies (see Installation Steps)
2. Run tests to verify setup: `npm test`
3. Review test files to understand patterns
4. Add new tests when adding features
5. Maintain > 80% coverage on critical paths
6. Integrate tests into CI/CD pipeline

## Troubleshooting

### Issue: "Cannot find module" errors
**Solution**: Ensure path aliases match between jest.config.json and tsconfig.json

### Issue: Socket.io tests failing
**Solution**: Ensure vi.fn() mocks are properly configured with correct parameters

### Issue: Async tests timing out
**Solution**: Increase timeout or check for unresolved promises/callbacks

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Socket.io Testing](https://socket.io/troubleshooting/common-issues)

## Contact

For test-related questions or issues, refer to TESTING.md or create an issue with the `testing` label.
