#!/bin/bash
# Script to view project structure as requested in problem statement
# This provides Unix/Linux equivalents to the Windows commands

echo "==============================================="
echo "Comando 1: Ver estructura (tree src /F equivalent)"
echo "==============================================="
echo ""
if [ -d "src" ]; then
    tree src -F
else
    echo "Note: 'src' directory does not exist. Showing root structure instead:"
    tree -L 2 -I 'node_modules|.git'
fi

echo ""
echo "==============================================="
echo "Comando 2: Ver archivos TSX/TS"
echo "==============================================="
echo ""
if [ -d "src" ]; then
    find src -type f \( -name "*.tsx" -o -name "*.ts" \) | sort
else
    echo "Note: 'src' directory does not exist. Showing all TSX/TS files in project:"
    find . -type f \( -name "*.tsx" -o -name "*.ts" \) -not -path "*/node_modules/*" -not -path "*/.git/*" | sort
fi

echo ""
echo "==============================================="
echo "Comando 3: Ver package.json"
echo "==============================================="
echo ""
if [ -f "package.json" ]; then
    cat package.json
else
    echo "Note: 'package.json' not found in root. Showing automation-package.json instead:"
    if [ -f "automation-package.json" ]; then
        cat automation-package.json
    else
        echo "No package.json files found."
    fi
fi
