# How to Test CI/CD Setup

This guide shows you how to test both **local hooks** (Husky) and **GitHub Actions** workflow.

---

## 🧪 Testing Local Hooks (Husky)

### 1. Test Pre-commit Hook

**What it does:** Runs linting and formatting before you commit.

**Test it:**

```bash
# Make a small change to any file
echo "console.log('test')" >> test-file.ts

# Stage the file
git add test-file.ts

# Try to commit (hook will run automatically)
git commit -m "test: testing pre-commit hook"
```

**Expected behavior:**

- ✅ If code is valid → Commit succeeds
- ❌ If code has errors → Commit blocked, fix errors, try again

**Test with lint error:**

```bash
# Create a file with obvious error
echo "const x = 'unclosed string" >> test-bad.ts

# Stage and commit
git add test-bad.ts
git commit -m "test: file with lint error"
```

**Expected:** Commit should be blocked ❌

---

### 2. Test Commit Message Validation

**What it does:** Validates commit message format.

**Test valid messages:**

```bash
# Good - valid format
git commit --allow-empty -m "feat: add new feature"
git commit --allow-empty -m "fix: resolve bug"
git commit --allow-empty -m "docs: update readme"
```

✅ All should pass

**Test invalid messages:**

```bash
# Bad - no type prefix
git commit --allow-empty -m "add feature"
# Expected: ❌ Rejected

# Bad - capital letter in type
git commit --allow-empty -m "Feat: add feature"
# Expected: ❌ Rejected

# Bad - missing subject
git commit --allow-empty -m "feat:"
# Expected: ❌ Rejected
```

---

## 🚀 Testing GitHub Actions

### Method 1: Push to Test Branch

**Best practice:** Create a test branch first

```bash
# Create and switch to test branch
git checkout -b test-ci-cd

# Make a small change
echo "// Test CI/CD" >> README.md
git add README.md

# Commit
git commit -m "ci: test CI/CD pipeline"

# Push
git push origin test-ci-cd
```

**What happens:**

1. Go to GitHub → Your repository
2. Click "Actions" tab
3. You'll see workflow running
4. Watch it complete

✅ **Success:** All checks pass (green checkmarks)
❌ **Failure:** Click to see which step failed

---

### Method 2: Create Pull Request

**Even better:** Test with a PR

```bash
# Create test branch
git checkout -b test-pr

# Make changes
echo "// Test PR" >> test-file.js
git add .

# Commit
git commit -m "feat: test PR workflow"

# Push
git push origin test-pr

# Then create PR on GitHub
#   - GitHub → New Pull Request
#   - Select test-pr → main
#   - Click "Create Pull Request"
```

**GitHub Actions will:**

- ✅ Run on the PR
- ✅ Show status in PR checks
- ✅ Block merge if tests fail

---

## 📊 Testing Different Scenarios

### Scenario 1: All Tests Pass ✅

```bash
# Add a valid test
git add .
git commit -m "test: add passing test case"
git push origin main
```

**Expected:** ✅ Green checks on GitHub

---

### Scenario 2: Failing Tests ❌

```bash
# Create a failing test
echo "it('should fail', () => expect(true).toBe(false));" >> __tests__/test.spec.ts

git add .
git commit -m "test: add failing test"
git push origin main
```

**Expected:** ❌ Red X on GitHub, workflow fails

---

### Scenario 3: Lint Errors ❌

```bash
# Create file with lint errors
echo "const x=1+2+3" >> bad-file.ts

git add .
git commit -m "fix: add file with lint error"
git push origin main
```

**Expected:** ❌ Lint step fails on GitHub

---

### Scenario 4: Build Errors ❌

```bash
# Introduce syntax error
echo "function broken() { return " >> components/Broken.tsx

git add .
git commit -m "fix: add syntax error"
git push origin main
```

**Expected:** ❌ Build step fails on GitHub

---

## 🔍 How to View Results

### GitHub Actions Dashboard

1. **Go to your repository on GitHub**
2. **Click "Actions" tab**
3. **See workflow runs:**

```
✓ tests (main) - Passed  # ✅ All good
✗ tests (main) - Failed  # ❌ Something failed
  ○ tests (main) - Running  # ⏳ In progress
```

### Check Individual Run

1. **Click on a workflow run**
2. **See jobs:**
   - `test` - Unit tests
   - `e2e` - E2E tests
   - `build` - Build check
3. **Expand any job to see logs**
4. **Click on step to see details**

### Example Logs:

```
✓ Run install dependencies - Success
✓ Run linter - Success
✓ Run unit tests - Success (6 passed)
✓ Run E2E tests - Success
✓ Run build - Success
```

---

## 🐛 Troubleshooting

### Local hooks not running?

```bash
# Reinstall Husky
npx husky install

# Check if .husky files are executable
ls -la .husky/

# Should see: pre-commit and commit-msg are executable
```

### Want to skip hooks temporarily?

```bash
# Skip pre-commit
git commit --no-verify -m "message"

# Skip commit message check
git commit --no-verify -m "message"

# ⚠️ Only use in emergencies!
```

### GitHub Actions not triggered?

```bash
# Check if workflow file exists
ls -la .github/workflows/

# Check file name (must be .yml or .yaml)
# Check triggers in test.yml:
#   - Should include your branch name
#   - Should have proper indentation
```

---

## ✅ Success Checklist

After testing, you should see:

### Local (Husky):

- ✅ Commits automatically run lint-staged
- ✅ Invalid commit messages are rejected
- ✅ Valid commit messages are accepted
- ✅ Code is auto-formatted

### GitHub Actions:

- ✅ Workflow triggers on push
- ✅ All jobs run (test, e2e, build)
- ✅ Tests report coverage
- ✅ Artifacts uploaded
- ✅ PRs show check status

---

## 🎯 Quick Test Commands

```bash
# Test 1: Pre-commit hook
echo "test" > test.ts && git add . && git commit -m "test: test hook"

# Test 2: Invalid commit message
git commit --allow-empty -m "bad message"  # Should fail

# Test 3: Valid commit message
git commit --allow-empty -m "feat: test message"  # Should pass

# Test 4: Push to trigger GitHub Actions
git push origin main
```

---

## 📝 What to Look For

### In Terminal (Local):

```
✓ Running pre-commit checks...
✓ ESLint ✓
✓ Prettier ✓
✓ Tests ✓
[abc1234] feat: your message
```

### On GitHub:

```
Actions tab:
  ✓ tests (main) Passed in 2m 30s

  Jobs:
    ✓ test (1m 15s)
    ✓ e2e (45s)
    ✓ build (30s)
```

---

## 🎉 You're All Set!

Once all tests pass:

- ✅ Local hooks work
- ✅ GitHub Actions work
- ✅ CI/CD is fully functional

Now you can develop with confidence! 🚀
