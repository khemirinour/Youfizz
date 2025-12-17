---
name: OVH Deployment Plan with External Storage
overview: Plan de déploiement optimisé sur OVH avec VPS pour les services applicatifs et volume externe Block Storage pour MinIO, permettant une scalabilité du stockage à moindre coût.
todos: []
---

# Plan de déploiement OVH avec stockage externe pour MinIO

## Architecture recommandée

### Infrastructure

- **VPS OVH Value** (2 vCores, 4GB RAM, 80GB SSD) : ~6-8€/mois
- Services applicatifs (NestJS microservices)
- Next.js frontend
- PostgreSQL, Redis
- MinIO (sans données)

- **OVH Block Storage** (volume externe) : ~0.10€/GB/mois
- Stockage MinIO (commencer avec 100GB = ~10€/mois)
- Scalable selon les besoins
- Peut être monté/démonté sans redémarrer le VPS

### Coût total estimé

- VPS Value : 6-8€/mois
- Block Storage 100GB : ~10€/mois
- **Total : ~16-18€/mois** (scalable selon stockage)

## Fichiers à créer/modifier

### 1. Configuration Docker Compose avec volume externe

- **Fichier** : `docker-compose.prod.yml`
- Modifier le service MinIO pour utiliser un volume monté depuis `/mnt/minio-storage`
- Configurer les autres services pour la production

### 2. Script de montage du volume Block Storage

- **Fichier** : `scripts/mount-ovh-volume.sh`
- Script pour formater et monter le volume OVH Block Storage
- Configuration automatique dans `/etc/fstab` pour montage au démarrage

### 3. Configuration Nginx pour reverse proxy

- **Fichier** : `nginx/nginx.conf`
- Reverse proxy pour frontend et API
- Configuration SSL avec Let's Encrypt

### 4. Variables d'environnement production

- **Fichier** : `.env.production.example`
- Template avec toutes les variables nécessaires
- Secrets pour JWT, base de données, MinIO

### 5. Script de déploiement

- **Fichier** : `scripts/deploy-ovh.sh`
- Automatisation du déploiement
- Build, pull, restart des services

### 6. Dockerfile pour web-ui (si manquant)

- **Fichier** : `apps/web-ui/Dockerfile`
- Configuration Next.js pour production
- Build optimisé

## Étapes d'implémentation

1. **Créer docker-compose.prod.yml**

- Séparer les services de développement et production
- Configurer MinIO avec volume externe monté
- Ajouter réseau interne pour services
- Configurer healthchecks et restart policies

2. **Créer script de montage volume**

- Détecter le volume Block Storage OVH
- Formater en ext4 si nouveau
- Monter dans `/mnt/minio-storage`
- Configurer permissions pour Docker

3. **Créer configuration Nginx**

- Reverse proxy pour frontend (port 3000)
- Reverse proxy pour API Gateway (port 3000)
- Configuration SSL/HTTPS
- Headers de sécurité

4. **Créer Dockerfile web-ui**

- Multi-stage build pour Next.js
- Optimisation des images
- Configuration pour production

5. **Créer scripts de déploiement**

- Script de montage volume
- Script de déploiement principal
- Script de backup (optionnel)

6. **Documentation de déploiement**

- Guide étape par étape
- Commandes OVH pour créer Block Storage
- Configuration DNS
- Certificats SSL

## Avantages de cette architecture

- **Coût optimisé** : Payez uniquement le stockage nécessaire
- **Scalable** : Augmentez le volume Block Storage sans redémarrer
- **Performances** : SSD local pour services, volume dédié pour fichiers
- **Backup facile** : Snapshot du volume Block Storage possible
- **Flexibilité** : Peut migrer vers OVH Object Storage plus tard si besoin

## Configuration MinIO avec volume externe

Le volume Block Storage sera monté dans `/mnt/minio-storage` et utilisé comme volume Docker pour MinIO, permettant une séparation claire entre les données et les services applicatifs.