# Contributing to TripMaker

Thank you for considering contributing to TripMaker! This document provides guidelines and instructions for contributing to this monorepo.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- Git

### Initial Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/avinash6982/TripMakerWeb.git
   cd TripMakerWeb
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment (no `.env` required)**  
   Local dev uses `.env.development` only. Backend: `apps/backend/.env.development`. Frontend: `apps/frontend/.env.development`. See root `.env.example` and **RENDER_DEPLOYMENT_GUIDE.md** for variable names.

4. **Start development servers**
   ```bash
   # Run both frontend and backend
   npm run dev
   
   # Or run individually
   npm run dev:frontend
   npm run dev:backend
   ```

## Project Structure

```
TripMaker/
├── apps/
│   ├── frontend/          # React/Vite frontend
│   │   ├── src/
│   │   ├── package.json
│   │   └── vite.config.js
│   └── backend/           # Express.js backend
│       ├── server.js
│       └── package.json
├── .cursorrules          # Cursor AI guidelines
├── package.json          # Root workspace config
├── RENDER_DEPLOYMENT_GUIDE.md  # Render deployment (no Vercel)
└── README.md
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow the coding standards outlined in `.cursorrules`
- Write clean, documented code
- Test your changes locally

### 3. Frontend Development

```bash
cd apps/frontend
npm run dev
```

- React components go in `src/pages/` or `src/layouts/`
- Services (API calls) go in `src/services/`
- Use functional components and hooks
- Follow React best practices

### 4. Backend Development

```bash
cd apps/backend
npm run dev
```

- Add routes directly in `server.js` or create separate route files
- Use proper middleware and validation
- Document API endpoints with Swagger annotations
- Test endpoints with the Swagger UI at `/api-docs`

### 5. Testing

```bash
# Run tests (when available)
npm test

# Test builds
npm run build
```

### 6. Commit Changes

Follow conventional commit format:

```bash
git add .
git commit -m "feat: add user profile editing"
git commit -m "fix: resolve CORS issue in production"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### 7. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Coding Standards

### Frontend (React/Vite)

- Use functional components with hooks
- Use `const` for component declarations
- Implement proper error handling
- Use meaningful variable and function names
- Keep components focused and single-purpose
- Use i18next for all user-facing text

Example:
```jsx
import { useState } from 'react';

export const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    try {
      setLoading(true);
      // API call
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return <div>{/* JSX */}</div>;
};
```

### Backend (Express.js)

- Use modern JavaScript (ES6+)
- Implement proper error handling
- Use middleware for common functionality
- Validate all inputs
- Document endpoints with Swagger
- Use environment variables for configuration

Example:
```javascript
app.post('/api/resource',
  authMiddleware,
  [
    body('field').notEmpty().withMessage('Field is required')
  ],
  handleValidationErrors,
  async (req, res, next) => {
    try {
      // Handle request
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
);
```

## API Development

### Adding New Endpoints

1. Add route handler in `apps/backend/server.js`
2. Add Swagger documentation comments
3. Implement proper validation
4. Add error handling
5. Test with Swagger UI

### Swagger Documentation

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     tags: [TagName]
 *     summary: Brief description
 *     description: Detailed description
 *     responses:
 *       200:
 *         description: Success response
 */
app.get('/api/endpoint', (req, res) => {
  // Handler
});
```

## Environment Variables

### Local Development

- Use `.env.development` for local dev (no `.env` required; see `.env.example` for variable names)
- Never commit real secrets; `.env.development` is safe if it has no secrets
- Frontend env vars must be prefixed with `VITE_`

### Production (Vercel)

- Set environment variables in Vercel Dashboard
- Never commit sensitive values
- Use different values for production

## Testing

### Manual Testing

1. **Frontend**
   - Test UI in browser
   - Check responsive design
   - Verify i18n translations
   - Test API integration

2. **Backend**
   - Use Swagger UI at `/api-docs`
   - Test with curl or Postman
   - Verify rate limiting
   - Check error handling

### Automated Testing

(To be implemented)

```bash
npm test
```

## Common Issues

### CORS Errors

- Check `CORS_ORIGINS` in backend `apps/backend/.env.development`
- Verify frontend is using correct API URL
- Check network tab in browser dev tools

### Build Failures

- Run `npm install` to ensure dependencies are up to date
- Check for TypeScript/linting errors
- Verify all imports are correct

### Vercel Deployment Issues

- Check build logs in Vercel Dashboard
- Verify environment variables are set
- Test build locally: `npm run build`

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project coding standards
- [ ] Changes have been tested locally
- [ ] Documentation has been updated
- [ ] Commit messages follow conventional format
- [ ] No console errors or warnings
- [ ] Build passes: `npm run build`

### PR Description

Include:
- Summary of changes
- Motivation and context
- Testing performed
- Screenshots (for UI changes)
- Related issues

### Review Process

1. Automated checks must pass
2. At least one approval required
3. Address review comments
4. Squash commits if requested

## Deployment

### Automatic Deployment

- Push to `main` branch → Production deployment
- Pull requests → Preview deployment

### Manual Deployment

```bash
# Install Vercel CLI
# Deploy via Render Dashboard; see RENDER_DEPLOYMENT_GUIDE.md
# (Optional: npm install -g vercel — we use Render only)

# Deploy preview (Render: use Render Dashboard)
# vercel  # Not used; we use Render

# Deploy production
# vercel --prod  # Not used; deploy via Render
```

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Express.js Documentation](https://expressjs.com)
- [Render Documentation](https://render.com/docs)
- [Swagger Documentation](https://swagger.io/docs)

## Getting Help

- Check existing issues on GitHub
- Read documentation in `/docs` folder
- Review `RENDER_DEPLOYMENT_GUIDE.md` for deployment (Render only)
- Create a new issue with detailed description

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on the code, not the person
- Help others learn and grow

---

Thank you for contributing to TripMaker!
