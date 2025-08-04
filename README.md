# Speccio - Application de gestion pour agences d'architecture d'intérieur

## 🏗️ Vue d'ensemble

Speccio est une application web complète destinée aux agences d'architecture d'intérieur pour gérer leurs projets, prescriptions, et ressources. Développée avec Next.js 15 et TypeScript, elle offre une interface moderne et intuitive.

## 🚀 Stack technique

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Base de données**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentification**: NextAuth
- **Déploiement**: Vercel (recommandé)

## ✅ Fonctionnalités actuelles

### 1. **Authentification**
- ✅ Connexion par email/mot de passe
- ✅ Sessions sécurisées avec NextAuth
- ❌ Page de création de compte (à implémenter)
- ❌ Réinitialisation du mot de passe (à implémenter)

### 2. **Gestion des projets**
- ✅ CRUD complet (Création, Lecture, Mise à jour, Suppression)
- ✅ Vue liste avec filtres par statut
- ✅ Recherche de projets
- ✅ Vue détaillée avec système d'onglets
- ❌ Vue liste alternative (actuellement que grille)

### 3. **Module Prescriptions**
- ✅ Création/édition de prescriptions
- ✅ Organisation par espaces
- ✅ Gestion des catégories avec couleurs
- ✅ Calcul automatique des prix
- ✅ Statuts: EN_COURS, VALIDÉ, COMMANDÉ, LIVRÉ
- ✅ Import depuis la bibliothèque de ressources

### 4. **Bibliothèque de ressources**
- ✅ Vue grille/liste des ressources
- ✅ Filtres par catégorie et espace
- ✅ Gestion des favoris
- ✅ Modal de création/édition
- ✅ Ajout direct aux projets comme prescriptions

### 5. **Gestion des catégories**
- ✅ API complète pour les catégories
- ✅ Support des couleurs personnalisées
- ✅ Icônes personnalisables

### 6. **Module Fichiers & Plans**
- ⚠️ Interface créée mais upload à tester
- ❌ Drag & drop à implémenter
- ❌ Preview des fichiers à ajouter

## 🔧 Installation et configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (base de données PostgreSQL)

### Installation

```bash
# Cloner le repository
git clone [votre-repo]
cd speccio

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.local
```

### Configuration des variables d'environnement

Créez un fichier `.env.local` avec :

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[VOTRE-SECRET]"

# Supabase (optionnel)
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[VOTRE-CLE-ANON]"
```

### Configuration de la base de données

```bash
# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# (Optionnel) Voir les données
npx prisma studio
```

### Lancer l'application

```bash
# Mode développement
npm run dev

# Build production
npm run build
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 📁 Structure du projet

```
speccio/
├── src/
│   ├── app/              # Routes Next.js (App Router)
│   ├── components/       # Composants React réutilisables
│   ├── lib/             # Utilitaires et configuration
│   └── types/           # Types TypeScript
├── prisma/
│   └── schema.prisma    # Schéma de base de données
├── public/              # Assets statiques
└── scripts/             # Scripts utilitaires
```

## 🎯 Roadmap - Prochaines étapes

### Court terme (MVP)
1. **Module Fichiers** - Tester et finaliser l'upload
2. **Pages d'authentification** - Création compte & reset password
3. **Templates d'espaces** - Faciliter la création avec des modèles
4. **Vue liste projets** - Alternative à la vue grille
5. **Placeholders** - Pour modules Budget et Commentaires

### Moyen terme
- Module Budget fonctionnel
- Module Commentaires avec notifications
- Module Contacts (fournisseurs/revendeurs)
- Export PDF des prescriptions
- Dashboard avec statistiques

### Long terme
- Application mobile
- Intégration comptable
- Gestion multi-agences
- API publique

## 🐛 Problèmes connus

- L'upload de fichiers nécessite des tests approfondis
- Les modules Budget et Commentaires ne sont que des onglets vides
- Pas de gestion des erreurs réseau (à améliorer)

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le repository
2. Créez une branche (`git checkout -b feature/ma-fonctionnalite`)
3. Committez vos changements (`git commit -m 'Ajout de ma fonctionnalité'`)
4. Push la branche (`git push origin feature/ma-fonctionnalite`)
5. Ouvrez une Pull Request

## 📝 Conventions de code

- **TypeScript** strict mode activé
- **camelCase** pour toutes les variables et fonctions
- **PascalCase** pour les composants React
- **Tailwind CSS** pour le styling
- **Prettier** pour le formatage (config incluse)

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez votre repository GitHub à Vercel
2. Configurez les variables d'environnement
3. Déployez automatiquement à chaque push

### Autres plateformes

L'application est compatible avec toute plateforme supportant Next.js :
- Railway
- Netlify
- Heroku
- VPS avec Node.js

## 📞 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation Prisma/Next.js
- Vérifiez les logs de la console

## 📄 Licence

[À définir selon vos besoins]

---

**Speccio** - Simplifiez la gestion de vos projets d'architecture d'intérieur 🏡