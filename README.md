# Application Architecture d'Intérieur

Application web pour la gestion de projets d'architecture d'intérieur.

## 🚀 Installation

\`\`\`bash
# Cloner le repo
git clone https://github.com/VOTRE-USERNAME/VOTRE-REPO.git
cd VOTRE-REPO

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Configurer la base de données
npx prisma migrate dev
npx prisma generate

# Seed la base de données
npm run seed
\`\`\`

## 📁 Structure

- `/app` - Pages Next.js (App Router)
- `/components` - Composants React
- `/prisma` - Schéma et migrations
- `/scripts` - Scripts utilitaires
- `/public/uploads` - Fichiers uploadés (ignoré par git)
- `/backups` - Backups de base de données (ignoré par git)

## 🛠️ Scripts disponibles

\`\`\`bash
npm run dev          # Lancer en développement
npm run build        # Build production
npm run seed         # Seed toute la base
npm run backup       # Backup de la base
\`\`\`

## 📦 Fonctionnalités

- ✅ Gestion de projets
- ✅ Espaces par projet
- ✅ Prescriptions
- ✅ Upload de fichiers (plans, 3D, etc.)
- ✅ Bibliothèque de ressources
- ✅ Système de backup