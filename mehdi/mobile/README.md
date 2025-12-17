# Application de Gestion de Cagnottes

Application mobile React Native avec Expo pour gérer des cagnottes (fonds collectifs) pour des associations.

## 🚀 Fonctionnalités

- ✅ **Création de cagnotte** : Créer une nouvelle cagnotte avec titre, description, objectif et date de création
- ✅ **Suivi de progression** : Visualiser la somme collectée et le pourcentage d'avancement
- ✅ **Liste des cagnottes** : Voir toutes les cagnottes disponibles
- ✅ **Page détail** : Consulter les informations complètes d'une cagnotte
- ✅ **Contribution** : Ajouter un montant à une cagnotte (mise à jour automatique du total)
- ✅ **Modification** : Modifier les informations d'une cagnotte existante
- ✅ **Suppression** : Supprimer une cagnotte et ses contributions associées

## 📋 Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn
- Expo CLI installé globalement (`npm install -g expo-cli`)

## 🛠️ Installation

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Démarrer l'application :

   ```bash
   npm start
   ```

   ou

   ```bash
   npx expo start
   ```

3. Choisir la plateforme :
   - Appuyez sur `a` pour Android
   - Appuyez sur `i` pour iOS
   - Scannez le QR code avec Expo Go sur votre téléphone

## 📱 Structure du projet

```
mobile/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Écran de liste des cagnottes
│   │   └── _layout.tsx         # Layout des tabs
│   ├── cagnotte-detail.tsx     # Écran de détail avec contribution
│   ├── cagnotte-edit.tsx       # Écran de création/modification
│   └── _layout.tsx             # Layout principal
├── database/
│   └── database.ts             # Fonctions de base de données SQLite
└── package.json
```

## 🗄️ Base de données

L'application utilise SQLite via `expo-sqlite` pour stocker les données localement.

### Tables

- **cagnottes** : Stocke les informations des cagnottes
  - id (INTEGER PRIMARY KEY)
  - titre (TEXT)
  - description (TEXT)
  - objectif (REAL)
  - sommeCollectee (REAL)
  - dateCreation (TEXT)

- **contributions** : Stocke les contributions aux cagnottes
  - id (INTEGER PRIMARY KEY)
  - cagnotteId (INTEGER FOREIGN KEY)
  - montant (REAL)
  - dateContribution (TEXT)

La base de données est initialisée automatiquement au démarrage de l'application.

## 🎨 Interface utilisateur

L'application propose une interface moderne et intuitive avec :
- Barre de progression visuelle pour chaque cagnotte
- Statistiques en temps réel (montant collecté, objectif, reste)
- Historique des contributions
- Design responsive et adaptatif

## 📝 Utilisation

### Créer une cagnotte

1. Appuyez sur le bouton `+` en haut à droite de l'écran principal
2. Remplissez le formulaire :
   - Titre (obligatoire)
   - Description (obligatoire)
   - Objectif en euros (obligatoire)
3. Appuyez sur "Créer"

### Contribuer à une cagnotte

1. Appuyez sur une cagnotte dans la liste
2. Entrez le montant de votre contribution
3. Appuyez sur "Contribuer"
4. Le montant est automatiquement ajouté au total collecté

### Modifier une cagnotte

1. Sur l'écran de liste, appuyez sur l'icône de modification (crayon)
2. Modifiez les informations souhaitées
3. Appuyez sur "Modifier"

### Supprimer une cagnotte

1. Sur l'écran de liste, appuyez sur l'icône de suppression (corbeille)
2. Confirmez la suppression

## 🔧 Technologies utilisées

- **React Native** : Framework mobile
- **Expo** : Outils et services pour React Native
- **Expo Router** : Navigation basée sur les fichiers
- **SQLite** : Base de données locale
- **TypeScript** : Typage statique
- **Ionicons** : Bibliothèque d'icônes

## 📦 Dépendances principales

- `expo-sqlite` : Gestion de la base de données SQLite
- `expo-router` : Navigation
- `@expo/vector-icons` : Icônes
- `react-native-reanimated` : Animations
- `react-native-safe-area-context` : Gestion des zones sûres

## 🐛 Dépannage

### La base de données ne se charge pas

Vérifiez que `expo-sqlite` est bien installé :
```bash
npm install expo-sqlite
```

### Erreurs de navigation

Assurez-vous que tous les écrans sont bien déclarés dans `app/_layout.tsx`.

## 📄 Licence

Ce projet est un exemple d'application mobile pour la gestion de cagnottes.
