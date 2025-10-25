# Guide d'Intégration - Frontend Auth Panel

## Vue d'ensemble

Le frontend `void-auth-panel-main` a été intégré avec succès dans l'architecture Nx de `you_fizz` sous le nom `auth-panel`.

## Structure de l'application

```
you_fizz/
├── apps/
│   ├── auth-panel/                 # Application frontend React
│   │   ├── src/
│   │   │   ├── app/               # Composant principal App.tsx
│   │   │   ├── components/        # Composants réutilisables
│   │   │   │   ├── ui/           # Composants UI (shadcn/ui)
│   │   │   │   └── LanguageSwitcher.tsx
│   │   │   ├── pages/            # Pages de l'application
│   │   │   │   ├── Index.tsx
│   │   │   │   ├── SignIn.tsx
│   │   │   │   ├── SignUp.tsx
│   │   │   │   ├── ForgotPassword.tsx
│   │   │   │   └── NotFound.tsx
│   │   │   ├── hooks/            # Hooks personnalisés
│   │   │   ├── lib/              # Utilitaires
│   │   │   ├── i18n/             # Configuration i18n
│   │   │   └── assets/            # Assets statiques
│   │   ├── tailwind.config.ts    # Configuration Tailwind
│   │   ├── postcss.config.js     # Configuration PostCSS
│   │   └── vite.config.ts        # Configuration Vite
│   └── [autres services backend...]
```

## Scripts disponibles

### Développement
```bash
# Démarrer uniquement le frontend
npm run start:frontend

# Démarrer le backend complet
npm run start:dev

# Démarrer frontend + backend ensemble
npm run start:full
```

### Build et déploiement
```bash
# Build de l'application auth-panel
nx build auth-panel

# Build de tous les projets
npm run build
```

## Technologies utilisées

- **React 18** avec TypeScript
- **Vite** comme bundler
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **React Router** pour la navigation
- **React Query** pour la gestion d'état
- **i18next** pour l'internationalisation
- **React Hook Form** pour les formulaires
- **Zod** pour la validation

## Configuration

### Alias TypeScript
L'alias `@` est configuré pour pointer vers `apps/auth-panel/src/` :
```typescript
// tsconfig.base.json
"paths": {
  "@/*": ["apps/auth-panel/src/*"]
}
```

### Configuration Vite
Le fichier `vite.config.ts` inclut :
- Alias `@` pour les imports
- Configuration Nx pour les chemins TypeScript
- Support des assets

### Configuration Tailwind
Le fichier `tailwind.config.ts` inclut :
- Configuration des couleurs personnalisées
- Support du mode sombre
- Animations personnalisées
- Plugin tailwindcss-animate

## Pages disponibles

1. **Index** (`/`) - Page d'accueil
2. **SignIn** (`/signin`) - Connexion
3. **SignUp** (`/signup`) - Inscription
4. **ForgotPassword** (`/forgot-password`) - Mot de passe oublié
5. **NotFound** (`*`) - Page 404

## Intégration avec le backend

L'application frontend est conçue pour communiquer avec les services backend :
- **auth** - Service d'authentification
- **user** - Service utilisateur
- **notification** - Service de notifications
- **api-gateway** - Point d'entrée API

## Développement

### Ajout de nouvelles pages
1. Créer le composant dans `src/pages/`
2. Ajouter la route dans `src/app/app.tsx`
3. Utiliser les composants UI existants dans `src/components/ui/`

### Ajout de nouveaux composants
1. Créer le composant dans `src/components/`
2. Utiliser les utilitaires de `src/lib/utils.ts`
3. Suivre les conventions de shadcn/ui

### Styling
- Utiliser les classes Tailwind CSS
- Utiliser les composants UI de `src/components/ui/`
- Respecter le système de design défini dans `tailwind.config.ts`

## Tests

```bash
# Tests unitaires
nx test auth-panel

# Tests e2e
nx e2e auth-panel-e2e

# Linting
nx lint auth-panel
```

## Déploiement

L'application peut être déployée indépendamment ou avec l'ensemble du monorepo :

```bash
# Build de production
nx build auth-panel

# Les fichiers de build sont dans dist/apps/auth-panel/
```
