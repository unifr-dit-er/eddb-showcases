# Mise à jour de l'application

## 1. Récupérer les dernières modifications

```bash
git pull
```

## 2. Rebuilder l'image

Depuis la racine du monorepo (`eddb-showcases`) ; ajouter
`--build-arg NEXT_PUBLIC_BASE_PATH=/pressearchiv` sous un sous-chemin.

```bash
podman build -f apps/pressearchiv/Dockerfile -t eddb-pressearchiv:latest .
```

## 3. Redémarrer le service

```bash
systemctl --user restart eddb-pressearchiv.service
```

## Vérification

```bash
# Vérifier que le service tourne
systemctl --user status eddb-pressearchiv.service

# Consulter les logs
podman logs -f eddb-pressearchiv
```
