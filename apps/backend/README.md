# TripMakerWeb-BE

Production-ready Node.js authentication backend with JWT tokens, Swagger documentation, and comprehensive security features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment example
cp .env.example .env

# Generate a secure JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add the generated secret to .env as JWT_SECRET

# Start development server
npm run dev
```

## 📚 Documentation

### For Frontend Developers 👉
**[FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md)** - Everything you need to integrate with this backend

### API Documentation (Single Source of Truth)
- **Swagger UI:** http://localhost:3000/api-docs (Local)
- **Swagger UI:** https://trip-maker-web-be.vercel.app/api-docs (Production)
- **OpenAPI JSON:** http://localhost:3000/api-docs.json

### Quick Reference
- **[INTEGRATION.md](./INTEGRATION.md)** - API endpoints, configuration, and curl examples
- **[CURSOR_CLOUD_WORKFLOW.md](./CURSOR_CLOUD_WORKFLOW.md)** - Zero-config development workflow

## ✨ Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Swagger Documentation** - Interactive API documentation
- ✅ **Input Validation** - Server-side validation with express-validator
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **Security Headers** - Helmet.js for security best practices
- ✅ **CORS Support** - Configurable cross-origin resource sharing
- ✅ **Password Hashing** - Secure password storage with scrypt
- ✅ **File-based Storage** - No database required (JSON file storage)
- ✅ **Production Ready** - Configured for Vercel deployment

## 📖 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Server health check | No |
| GET | `/api-docs` | Swagger documentation UI | No |
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user | No |
| GET | `/profile/:id` | Get user profile | Optional |
| PUT | `/profile/:id` | Update user profile | Optional |

**📚 For detailed API documentation, visit:** http://localhost:3000/api-docs

## 🔧 Configuration

Create a `.env` file with these variables:

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
USER_DB_PATH=data/users.json

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:5173,https://trip-maker-web.vercel.app

# JWT Authentication (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
```

⚠️ **IMPORTANT:** Generate a secure `JWT_SECRET` for production:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run in production mode
npm start

# Run tests
npm test
```

## 🚢 Deployment

### Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Create JWT Secret:**
   ```bash
   # Generate a secure secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Add as Vercel secret
   vercel secrets add jwt_secret "your-generated-secret"
   ```

3. **Deploy:**
   ```bash
   vercel --prod
   ```

The `vercel.json` configuration is already set up for deployment.

### Environment Variables in Vercel

Set these in the Vercel Dashboard:

```
NODE_ENV=production
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://trip-maker-web.vercel.app
```

## 🔒 Security Features

### JWT Authentication
- Secure token-based authentication
- Configurable token expiration (default: 7 days)
- Bearer token format in Authorization header

### Rate Limiting
- **Registration:** 5 requests per 15 minutes per IP
- **Login:** 10 requests per 15 minutes per IP
- **Other endpoints:** 100 requests per 15 minutes per IP

### Input Validation
- Email format validation
- Password strength requirements (min 6 characters)
- Field type and enum validation
- SQL injection protection

### Security Headers (Helmet.js)
- XSS Protection
- Content Security Policy
- DNS Prefetch Control
- Frameguard
- HSTS
- And more...

## 🧪 Testing

### Using Swagger UI

1. Start the server: `npm run dev`
2. Open browser: http://localhost:3000/api-docs
3. Click "Try it out" on any endpoint
4. Fill in parameters and execute

### Using curl

```bash
# Register
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'

# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"SecurePass123"}'

# Get Profile (with token)
curl -X GET http://localhost:3000/profile/USER_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📦 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.2.1
- **Authentication:** jsonwebtoken 9.0.2
- **Validation:** express-validator 7.0.1
- **Security:** helmet 7.1.0
- **Rate Limiting:** express-rate-limit 7.1.5
- **CORS:** cors 2.8.5
- **Documentation:** swagger-ui-express 5.0.0, swagger-jsdoc 6.2.8
- **Logging:** morgan 1.10.0
- **Environment:** dotenv 16.3.1

## 🔗 Frontend Integration

This backend is designed to work with the **TripMakerWeb** frontend.

**Frontend Repository:** https://github.com/avinash6982/TripMakerWeb

### 👉 For Frontend Developers
**Share this file:** [FRONTEND_MIGRATION_GUIDE.md](./FRONTEND_MIGRATION_GUIDE.md)

This guide contains:
- ✅ Complete step-by-step code changes
- ✅ JWT token storage implementation
- ✅ Authorization header setup
- ✅ Testing checklist
- ✅ Error handling
- ✅ Migration checklist

**Swagger URL (after deployment):** https://trip-maker-web-be.vercel.app/api-docs

## 📝 Project Structure

```
TripMakerWeb-BE/
├── server.js                      # Main application file
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variables template
├── vercel.json                    # Vercel deployment configuration
├── data/
│   └── users.json                 # User data storage (auto-created)
├── INTEGRATION.md                 # API integration reference
├── FRONTEND_MIGRATION_GUIDE.md    # Frontend migration guide
├── README.md                      # This file
└── LICENSE                        # License information
```

## 🐛 Troubleshooting

### Issue: "JWT_SECRET is required"

**Solution:** Add `JWT_SECRET` to your `.env` file. Generate a secure one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Issue: CORS errors

**Solution:** Add your frontend URL to `CORS_ORIGINS` in `.env`:
```bash
CORS_ORIGINS=http://localhost:5173,https://your-frontend.vercel.app
```

### Issue: Rate limit exceeded

**Solution:** Wait 15 minutes or adjust rate limits in `server.js`.

### Issue: Swagger UI not loading

**Solution:** 
1. Check if server is running
2. Clear browser cache
3. Try accessing `/api-docs.json` directly

## 📄 License

ISC License - See [LICENSE](./LICENSE) file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using Swagger UI
5. Update documentation if needed
6. Submit a pull request

## 📞 Support

- **Issues:** https://github.com/avinash6982/TripMakerWeb-BE/issues
- **API Documentation:** http://localhost:3000/api-docs (when running)
- **Frontend Repo:** https://github.com/avinash6982/TripMakerWeb

---

**Built for:** TripMaker - Travel Planning Platform  
**Version:** 2.0.0  
**Last Updated:** January 30, 2026
