# Déploiement avec Podman + Quadlet

## Prérequis

- Podman installé sur la VM
- Accès au répertoire `/home/podman/.config/containers/systemd/`

## 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd eddb-datacant
```

## 2. Créer le fichier Quadlet

Copier le template et l'adapter :

```bash
cp eddb-datacant.container.example eddb-datacant.container
```

Puis éditer `eddb-datacant.container` :
- Remplacer `your_token_here` par le vrai token NocoDB
- Ajuster `PublishPort` si nécessaire (port externe:3000)

> Ce fichier contient des secrets — il est ignoré par git et ne doit jamais être commité.

## 3. Déployer le fichier Quadlet

```bash
cp eddb-datacant.container /home/podman/.config/containers/systemd/
```

## 4. Builder l'image

```bash
podman build -t eddb-datacant:latest .
```

## 5. Démarrer le service

```bash
systemctl --user daemon-reload
systemctl --user start eddb-datacant.service
```

## Commandes utiles

```bash
# Voir les logs
podman logs -f eddb-datacant

# Statut du service
systemctl --user status eddb-datacant.service

# Redémarrer après un rebuild
podman build -t eddb-datacant:latest .
systemctl --user restart eddb-datacant.service
```

