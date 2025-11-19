# 🎯 CHRONOS System - Quick Start Guide

This guide will help you complete the remaining setup and get the system running.

## ⚡ Quick Setup (15 minutes)

### Step 1: Create Environment File (2 minutes)
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your Firebase credentials
nano .env  # or use your preferred editor
```

**Required Variables** (minimum to start):
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456:web:abcdef
```

### Step 2: Fix Build (5 minutes)

**Option A: Quick Fix** - Change imports in affected files:
```bash
# Find all files using @hookform/resolvers/zod
grep -r "@hookform/resolvers/zod" pages/ components/

# Replace with:
# import { zodResolver } from '@hookform/resolvers/zod';
```

**Option B: Vite Config Fix** - Add to `vite.config.ts`:
```javascript
export default defineConfig({
  // ... existing config
  resolve: {
    alias: {
      // ... existing aliases
      '@hookform/resolvers/zod': '@hookform/resolvers/dist/zod.mjs',
    },
  },
});
```

### Step 3: Start Development Server (1 minute)
```bash
npm run dev
```

Visit: http://localhost:5173

## 🔧 Fix Remaining Issues (1-2 hours)

### Update Zod Schemas

The schemas need updating for Zod v4. Here's a template:

```javascript
// OLD (Zod v3)
z.string({
  required_error: 'Field is required',
  invalid_type_error: 'Must be a string',
})

// NEW (Zod v4)
z.string().min(1, 'Field is required')

// For enums
// OLD
z.enum(['A', 'B'], {
  errorMap: () => ({ message: 'Invalid value' })
})

// NEW
z.enum(['A', 'B'])
```

Files to update:
- `schemas/cliente.schema.ts`
- `schemas/producto.schema.ts`
- `schemas/venta.schema.ts`
- `schemas/distribuidor.schema.ts`

### Quick Script to Fix Schemas

Create `scripts/fix-zod-schemas.js`:
```javascript
const fs = require('fs');
const path = require('path');

const schemasDir = path.join(__dirname, '../schemas');
const files = fs.readdirSync(schemasDir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(schemasDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove required_error and invalid_type_error
  content = content.replace(/,?\s*required_error:\s*['"][^'"]*['"]/g, '');
  content = content.replace(/,?\s*invalid_type_error:\s*['"][^'"]*['"]/g, '');
  
  // Fix enum errorMap
  content = content.replace(/errorMap:\s*\([^)]*\)\s*=>\s*\([^)]*\)/g, '');
  
  fs.writeFileSync(filePath, content);
  console.log(`✅ Fixed ${file}`);
});

console.log('✨ All schemas updated!');
```

Run: `node scripts/fix-zod-schemas.js`

## 📊 Verify Everything Works

### 1. Check Build
```bash
npm run build
```

Should complete without errors.

### 2. Test Development Server
```bash
npm run dev
```

Test these URLs:
- http://localhost:5173/ (Dashboard)
- http://localhost:5173/ventas (Sales)
- http://localhost:5173/clientes (Clients)
- http://localhost:5173/bancos (Banking)

### 3. Run Data Migration
```bash
node scripts/importar-datos.js
```

This will import:
- 7 Banks
- Ventas, Clientes, Distribuidores (check data file first)

## 🎨 Features to Test

### Dashboard
- [ ] KPI cards display
- [ ] Charts render
- [ ] Date range filter works
- [ ] Real-time updates

### Forms
- [ ] Venta form validates
- [ ] Cliente form saves
- [ ] Product selection works
- [ ] Payment calculations correct

### Banking
- [ ] All 7 bank pages load
- [ ] Transfers between banks
- [ ] Transaction history
- [ ] Balance calculations

## 🐛 Troubleshooting

### Build Fails
```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Firebase Connection Issues
```bash
# Verify .env file
cat .env | grep VITE_FIREBASE

# Test Firebase connection
node -e "
const { initializeApp } = require('firebase/app');
const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};
const app = initializeApp(config);
console.log('✅ Firebase connected!');
"
```

### Module Not Found
```bash
# Check if package is installed
npm list <package-name>

# If missing, install
npm install <package-name>
```

### TypeScript Errors
```bash
# Run type check
npm run type-check

# For development, you can disable strict mode
# Edit tsconfig.json: "strict": false
```

## 📚 Additional Resources

- [Vite Documentation](https://vitejs.dev)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)
- [TailwindCSS v4](https://tailwindcss.com)
- [Firebase Documentation](https://firebase.google.com/docs)

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ `npm run build` completes without errors
2. ✅ `npm run dev` starts the server
3. ✅ Dashboard loads and shows data
4. ✅ Forms validate and submit
5. ✅ Firebase connection is active
6. ✅ Data migration completes
7. ✅ Real-time updates work

## 🚀 Next Steps After Setup

1. **Add Tests**
   ```bash
   npm run test
   ```

2. **Deploy to Firebase**
   ```bash
   firebase deploy
   ```

3. **Set up CI/CD**
   - Configure GitHub Actions
   - Add automated tests
   - Deploy previews

4. **Monitor and Optimize**
   - Add Sentry for error tracking
   - Enable Google Analytics
   - Monitor performance

---

**Need Help?** Check `VERIFICATION_REPORT.md` for detailed analysis and solutions.

**Estimated Time to Complete**: 15 minutes to 2 hours depending on issues encountered.

Good luck! 🎯
