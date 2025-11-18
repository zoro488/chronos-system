# DevContainer Configuration

Esta configuración permite abrir el proyecto en GitHub Codespaces o en un contenedor local de VS Code.

## 🚀 Uso con GitHub Codespaces

1. Ve al repositorio en GitHub
2. Haz clic en "Code" → "Codespaces" → "Create codespace on main"
3. Espera a que el contenedor se construya (primera vez toma ~3-5 minutos)
4. Una vez listo, ejecuta: `npm run dev`

## 💻 Uso Local con VS Code

### Requisitos Previos
- Docker Desktop instalado y corriendo
- VS Code con la extensión "Dev Containers" instalada

### Pasos
1. Abre el proyecto en VS Code
2. Presiona `F1` y selecciona "Dev Containers: Reopen in Container"
3. Espera a que el contenedor se construya
4. Ejecuta `npm run dev` en la terminal integrada

## 📦 Características Incluidas

### Herramientas
- Node.js 18
- Git
- GitHub CLI (gh)
- npm, npx

### Extensiones de VS Code
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- Auto Rename Tag
- Path Intellisense
- Playwright Test
- GitHub Copilot (si tienes licencia)
- GitLens
- Error Lens
- Todo Tree
- Material Icon Theme
- Code Spell Checker

### Puertos Expuestos
- **5173**: Vite Dev Server
- **3000**: Preview Server
- **4173**: Production Preview

## 🔧 Personalización

Para modificar la configuración, edita `.devcontainer/devcontainer.json`:

- Agregar extensiones: `customizations.vscode.extensions`
- Cambiar configuraciones de VS Code: `customizations.vscode.settings`
- Agregar herramientas: `features`
- Modificar comandos post-creación: `postCreateCommand`

## 📝 Notas

- La primera vez que inicies el contenedor, se ejecutará `npm install` automáticamente
- Los cambios en el código se sincronizan automáticamente
- Las configuraciones de Git se preservan
- SSH keys se montan en modo readonly para seguridad
