# Mise à jour de l'application

## 1. Récupérer les dernières modifications

```bash
git pull
```

## 2. Rebuilder l'image

```bash
podman build -t eddb-datacant:latest .
```

## 3. Redémarrer le service

```bash
systemctl --user restart eddb-datacant.service
```

## Vérification

```bash
# Vérifier que le service tourne
systemctl --user status eddb-datacant.service

# Consulter les logs
podman logs -f eddb-datacant
```
