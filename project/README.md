# Melosphere

Application de partage de musique en temps réel.

## Configuration de l'environnement

Pour faire fonctionner correctement cette application, vous devez configurer les variables d'environnement suivantes:

### Variables d'environnement requises

Créez un fichier `.env.local` à la racine du dossier `project` avec les variables suivantes:

```
# URL de l'API backend - Choisir l'une des options ci-dessous

# Option 1: URL complète du serveur API (production)
NEXT_PUBLIC_API_URL=http://87.106.162.205:5001

# Option 2: Pour un développement local avec backend sur le même poste
# NEXT_PUBLIC_API_URL=http://localhost:5001

# Option 3: Avec le proxy Vercel (si configuré dans vercel.json)
# NEXT_PUBLIC_API_URL=/api
```

### Démarrage du projet en développement

```bash
cd project
npm install
npm run dev
```

### Déploiement

Pour déployer l'application, assurez-vous que la variable d'environnement `NEXT_PUBLIC_API_URL` est correctement configurée sur la plateforme de déploiement (Vercel, Netlify, etc.). 