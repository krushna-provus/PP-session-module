# Test Setup Checklist

A complete Jest/Vitest test suite has been added to your Planning Poker application. Follow this checklist to get everything running.

## ✅ Pre-Setup Verification

- [ ] You have Node.js 16+ installed
- [ ] You have npm or yarn installed
- [ ] Both `server` and `client` directories have `package.json` files
- [ ] You have TypeScript configured in both projects

## 📦 Installation Steps

### Step 1: Server-Side Setup

```bash
# Navigate to server directory
cd server

# Install Jest and related dependencies
npm install --save-dev jest @types/jest ts-jest

# Optional: If you want to use testing utilities
npm install --save-dev socket.io-client
```

**Verify installation:**
```bash
npm list jest ts-jest
```

### Step 2: Client-Side Setup

```bash
# Navigate to client directory
cd client

# Install Jest and React testing utilities
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  jest-environment-jsdom \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event

# Optional: For snapshot testing
npm install --save-dev @testing-library/react-hooks
```

**Verify installation:**
```bash
npm list jest @testing-library/react ts-jest
```

## 🔧 Configuration Verification

### Server Configuration

Check that `server/jest.config.json` exists with:
```json
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/tests"],
  "testMatch": ["**/tests/**/*.test.ts"]
}
```

### Client Configuration

Check that `client/jest.config.json` exists with:
```json
{
  "preset": "ts-jest",
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"],
  "moduleNameMapper": {
    "^@/(.*)$": "<rootDir>/$1"
  }
}
```

Check that `client/jest.setup.ts` exists and is properly configured.

## 📝 Update package.json Scripts

### Server (server/package.json)

Update the scripts section:
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

### Client (client/package.json)

Update the scripts section:
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

## ✅ Verification Steps

### Step 1: Verify Server Tests

```bash
cd server
npm run test:jest

# Expected output:
# PASS  tests/sessionManager.test.ts
# PASS  tests/voteCalculations.test.ts
# PASS  tests/votingHandlers.test.ts
# PASS  tests/sessionHandlers.test.ts
# PASS  tests/integration.test.ts
```

### Step 2: Verify Client Tests

```bash
cd client
npm test

# Expected output:
# PASS  tests/useVoteHandlers.test.ts
# PASS  tests/useSessionState.test.ts
# PASS  tests/components/VotingCards.test.tsx
```

## 📊 Check Test Coverage

### Server Coverage

```bash
cd server
npm run test:coverage

# Look for coverage summary:
# Statement   | Branch   | Function  | Line
# ------------|----------|-----------|----------
# 80%+        | 75%+     | 80%+      | 80%+
```

### Client Coverage

```bash
cd client
npm run test:coverage

# Look for coverage summary showing coverage for:
# - hooks/
# - components/
# - utils/
```

## 🚀 Running Tests

### Development Mode (Watch)

```bash
# Server
cd server && npm run test:watch

# Client
cd client && npm run test:watch
```

### CI/CD Mode (Single Run)

```bash
# Server
cd server && npm run test:jest

# Client
cd client && npm test
```

### Generate Coverage Reports

```bash
# Server
cd server && npm run test:coverage

# Client
cd client && npm run test:coverage
```

## 📁 Verify File Structure

You should now have:

```
planning-poker/
├── TEST-SUMMARY.md                    ✓
├── JEST-SETUP.md                      ✓
├── TESTING.md                         ✓
├── server/
│   ├── jest.config.json               ✓
│   └── tests/
│       ├── fixtures.ts                ✓
│       ├── sessionManager.test.ts     ✓
│       ├── voteCalculations.test.ts   ✓
│       ├── votingHandlers.test.ts     ✓
│       ├── sessionHandlers.test.ts    ✓
│       └── integration.test.ts        ✓
└── client/
    ├── jest.config.json               ✓
    ├── jest.setup.ts                  ✓
    └── tests/
        ├── useVoteHandlers.test.ts    ✓
        ├── useSessionState.test.ts    ✓
        └── components/
            └── VotingCards.test.tsx   ✓
```

## 🐛 Troubleshooting

### Issue: "Cannot find module 'ts-jest'"

**Solution:**
```bash
npm install --save-dev ts-jest
npm cache clean --force
npm install
```

### Issue: "Cannot find module '@testing-library/react'"

**Solution:**
```bash
cd client
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Issue: "ENOENT: jest.config.json"

**Solution:**
- Verify the jest.config.json file exists in both server and client directories
- Check file naming (case-sensitive on Linux/Mac)

### Issue: Tests timing out

**Solution:**
- Increase timeout in jest.config.json:
```json
{
  "testTimeout": 10000
}
```

### Issue: Module resolution errors

**Solution:**
- Verify moduleNameMapper in jest.config.json matches tsconfig.json
- Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Documentation Files

After setup, you have access to:

1. **TEST-SUMMARY.md** - Overview of all test files and quick start
2. **JEST-SETUP.md** - Detailed setup and configuration guide
3. **TESTING.md** - Complete testing documentation and best practices
4. **server/tests/fixtures.ts** - Reusable test data and utilities

## ✅ Post-Setup Checklist

- [ ] All dependencies installed without errors
- [ ] `npm test` runs successfully in both client and server
- [ ] Code coverage reports generate without errors
- [ ] All 95+ tests pass
- [ ] You can see test output with descriptive names
- [ ] Coverage is > 75% on critical paths
- [ ] No TypeScript errors in test files

## 🎯 Next Steps

1. **Run all tests** to verify everything works:
   ```bash
   cd server && npm run test:jest
   cd ../client && npm test
   ```

2. **Review test files** to understand patterns and structure

3. **Write tests for new features** before implementing them (TDD)

4. **Set up CI/CD integration** (GitHub Actions, GitLab CI, etc.)

5. **Increase coverage** to match your team's standards

## 📞 Support Resources

- Check TESTING.md for testing patterns and examples
- Review existing test files for implementation patterns
- Check Jest official docs: https://jestjs.io
- Check Vitest official docs: https://vitest.dev
- Check Testing Library docs: https://testing-library.com

## ✨ Success!

Once all steps are complete, you have:

✅ 95+ test cases  
✅ Full server test coverage  
✅ Client hook and component tests  
✅ Integration test examples  
✅ Comprehensive documentation  
✅ Reusable test fixtures  
✅ Best practices implemented  

**Your testing infrastructure is ready! 🎉**

Start testing: `npm test`
