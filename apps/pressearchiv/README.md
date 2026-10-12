# Pressearchiv — Archives de presse de l'Institut de plurilinguisme

Vitrine publique des archives de presse sur l'enseignement des langues et la
politique linguistique en Suisse (articles de presse et littérature grise
depuis 2014), alimentée par NocoDB (EDDB). Prototype.

Construite sur le modèle de la vitrine datacant (mêmes technologies, même
charte), dont elle reprend la structure : filtres dans la barre latérale,
liste de fiches, panneau de détail, adresse partageable.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query

## Données

La vitrine ne lit que la base NocoDB **Pressearchiv Public**, copie de la
base complète sans les textes intégraux (droits d'auteur). Le serveur charge
la base en mémoire (environ 4 000 notices, rechargées toutes les heures), ne
garde que les notices `ok_for_public = YES` et les champs de la liste
blanche (`src/lib/archive-config.ts`), puis filtre, compte et pagine pour le
navigateur. Ni le texte intégral ni les PDF ne sont exposés.

Routes : `/api/articles` (liste filtrée), `/api/articles/<id>` (notice),
`/api/facets` (collections, sources, mots-clés, langues, années).

## Développement

### Prérequis

- Node.js 22+
- Un jeton NocoDB lisant la base *Pressearchiv Public* : on développe
  toujours sur l'API, comme en production

### Installation

L'application fait partie du monorepo `eddb-showcases` : les dépendances
s'installent à sa racine (voir son `README.md`).

```bash
npm ci            # à la racine du monorepo
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
NOCODB_API_TOKEN=your_token_here
```

> `NEXT_PUBLIC_NOCODB_API_URL` est déjà défini dans `.env` et versionné dans le repo.

### Lancer le serveur de développement

```bash
npm run dev --workspace=apps/pressearchiv   # depuis la racine
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

### Tests

```bash
npm test
```

## Production

Le déploiement se fait via Podman + Quadlet sur la VM.

- [Procédure de déploiement initial](docs/podman-deploy.md)
- [Procédure de mise à jour](docs/podman-update.md)
