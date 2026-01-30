# 🎯 Development User Guide

## Always-Available Test User

For **all development work**, use this consistent test user:

```
Email:    dev@tripmaker.com
Password: DevUser123!
ID:       dev-user-00000000-0000-0000-0000-000000000001
```

---

## ✅ Benefits

1. **Consistent**: Same credentials in local, staging, and production
2. **Auto-Seeded**: Created automatically on first API call
3. **Reliable**: Always available, never expires
4. **Predictable**: Fixed ID for testing user-specific features

---

## 🚀 Usage Examples

### Testing Login (Local)

```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@tripmaker.com","password":"DevUser123!"}'
```

### Testing Login (Deployed)

```bash
curl -X POST https://trip-maker-pink.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"dev@tripmaker.com","password":"DevUser123!"}'
```

### Using in Browser

1. Navigate to: https://trip-maker-pink.vercel.app/
2. Click "Log in"
3. Enter:
   - Email: `dev@tripmaker.com`
   - Password: `DevUser123!`

### Using in Cursor Agent

When developing features that require authentication, Cursor agents should:

```javascript
// Example: Testing a new profile feature
const testUser = {
  email: 'dev@tripmaker.com',
  password: 'DevUser123!'
};

// Login to get token
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(testUser)
});

const { token } = await loginResponse.json();

// Use token for authenticated requests
const profileResponse = await fetch('/api/user/profile', {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

---

## 🔧 How It Works

### Auto-Seeding System

The test user is automatically created by `api/lib/seedUser.js`:

1. On every API call, `readUsers()` is called
2. `readUsers()` calls `seedTestUser()`
3. `seedTestUser()` checks if dev user exists
4. If not, creates it with fixed ID and credentials
5. User is now available for that request and subsequent ones (within same serverless invocation)

### File Structure

```
api/
├── lib/
│   ├── seedUser.js      # Test user seeding logic
│   └── db.js            # Database utilities (auto-seeds on read)
├── auth/
│   ├── login.js         # Uses db.js → auto-seeds
│   └── register.js      # Uses db.js → auto-seeds
└── [other endpoints]
```

---

## 📝 For Cursor Agents

When building new features:

### ✅ DO:
- Always use `dev@tripmaker.com` for testing
- Import and use shared utilities from `api/lib/db.js`
- Assume this user exists (it's auto-seeded)
- Use the fixed ID when testing user-specific features

### ❌ DON'T:
- Create new test users for each test
- Hard-code different credentials
- Skip authentication in tests
- Assume empty database state

---

## 🔄 Integration with New Endpoints

When creating new API endpoints:

```javascript
// Import shared utilities
const { readUsers, writeUsers, verifyToken } = require('../lib/db');

// The test user will be auto-seeded when you call readUsers()
module.exports = async (req, res) => {
  // This automatically seeds the dev user if needed
  const users = await readUsers();
  
  // Your endpoint logic here
  // The dev@tripmaker.com user is guaranteed to exist
};
```

---

## 🧪 Testing Scenarios

### Scenario 1: New User Feature

```javascript
// Test with dev user
const userId = 'dev-user-00000000-0000-0000-0000-000000000001';
// Feature works with consistent, predictable ID
```

### Scenario 2: Multi-User Feature

```javascript
// Dev user is User 1
const devUser = await findUserById('dev-user-00000000-0000-0000-0000-000000000001');

// Create additional test users for User 2, 3, etc.
const testUser2 = await registerUser({
  email: 'test2@example.com',
  password: 'Test123!'
});
```

### Scenario 3: Authentication Flow

```javascript
// Always works, always consistent
await login('dev@tripmaker.com', 'DevUser123!');
// ✅ Guaranteed to succeed
```

---

## 🎓 Best Practices

1. **Use for all manual testing**: Whether local or deployed
2. **Reference in documentation**: Show examples with this user
3. **Cursor agent instructions**: Agents should default to this user
4. **Integration tests**: Use as baseline authenticated user
5. **Demo purposes**: Safe to use in demos (fixed, known state)

---

## ⚠️ Important Notes

### Ephemeral Storage Limitation

Currently using temporary file storage, which means:
- User persists within a single serverless function invocation
- Different requests may get different `/tmp` directories
- Data doesn't persist long-term

**Solution**: Once we set up Vercel KV or Postgres, the dev user will be permanently seeded and persist across all requests.

### Production Considerations

This dev user:
- ✅ Is fine for development and testing
- ✅ Is safe for staging environments
- ⚠️ Should be disabled or removed in production
- ⚠️ Uses a fixed, known password

---

## 📚 Related Files

- `TEST_USER.md` - Credentials reference
- `api/lib/seedUser.js` - Seeding implementation
- `api/lib/db.js` - Database utilities with auto-seed
- `.cursorrules` - Project rules (mentions dev user)

---

**Remember**: When in doubt, use `dev@tripmaker.com` / `DevUser123!` for all your testing! 🚀
