# Project Structure Documentation

This document provides information about the CHRONOS System project structure and how to view it.

## Viewing Project Structure

### Command 1: Ver estructura (View Structure)
To view the project structure with the source directory:

**Linux/Mac:**
```bash
tree src -F
```

**Windows:**
```cmd
tree src /F
```

### Command 2: Ver archivos TSX/TS (View TypeScript/TSX Files)
To list all TypeScript and TSX files in the source directory:

**Linux/Mac:**
```bash
find src -follow -type f \( -name "*.tsx" -o -name "*.ts" \)
```

**Windows PowerShell:**
```powershell
Get-ChildItem -Path src -Recurse -Include *.tsx,*.ts | Select-Object FullName
```

### Command 3: Ver package.json (View package.json)
To view the package configuration:

**Linux/Mac/Windows:**
```bash
cat package.json
```

## Directory Structure

The `src/` directory contains symlinks to the actual source code directories:

- **components/** - React components (UI, layouts, panels, etc.)
- **pages/** - Application pages and routing
- **services/** - Business logic and API services
- **stores/** - State management (Zustand stores)
- **hooks/** - Custom React hooks
- **utils/** - Utility functions and helpers
- **types/** - TypeScript type definitions
- **schemas/** - Data validation schemas
- **forms/** - Form components
- **lib/** - Third-party library configurations
- **config/** - Application configuration
- **constants/** - Application constants
- **brand/** - Branding and design system

## Helper Script

A helper script `view-structure.sh` is provided for Unix/Linux systems to run all three commands in sequence:

```bash
./view-structure.sh
```

This script will display:
1. The project directory structure
2. All TypeScript/TSX files
3. The package.json content

## Notes

- The `src/` directory uses symlinks to organize the project structure without duplicating files
- The `package.json` is symlinked to `automation-package.json` for consistency
- All TypeScript files (`.ts`) and React TypeScript files (`.tsx`) are included in the listing
