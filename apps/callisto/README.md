# Callisto — iconographie antique du jeu et de l'enfance

Vitrine publique de la base Callisto (prof. Véronique Dasen, projet ERC
Locus Ludi) : culture matérielle et représentations du jeu et de l'enfance
dans l'Antiquité, alimentée par NocoDB (EDDB). Elle remplace la vitrine
construite sur `eddb-vue`.

Construite sur le modèle de la vitrine pressearchiv : filtres dans la barre
latérale, frise par siècle, liste de fiches, panneau de détail, adresse
partageable.

## Données

La vitrine ne lit que la table *Representations* de la base NocoDB
*Callisto*. Le serveur charge en mémoire les fiches publiées (case
`Publication`, environ 1 200 fiches, rechargées toutes les heures), ne garde
que les champs de la liste blanche (`src/lib/collection-config.ts`), puis
filtre, compte et pagine pour le navigateur. **Aucune image n'est exposée** :
leurs droits ne sont pas libres.

Routes : `/api/items` (liste filtrée), `/api/items/<id>` (fiche),
`/api/facets` (périodes, matériaux, catégories, formes, sujets, centres
producteurs, étendue des datations).

## Développement

Prérequis : Node.js 22+ et un jeton NocoDB propre à la vitrine, dans
`.env.local` :

```env
NOCODB_API_TOKEN=your_token_here
```

`NEXT_PUBLIC_NOCODB_API_URL` est défini dans `.env`, versionné.

```bash
npm ci                                   # à la racine du monorepo
npm run dev --workspace=apps/callisto    # http://localhost:3000
npm test --workspace=apps/callisto
```

## Production

Podman + Quadlet sur svx-web-eddb, sous https://eddb.unifr.ch/callisto :
[déploiement initial](docs/podman-deploy.md), [mise à jour](docs/podman-update.md).
