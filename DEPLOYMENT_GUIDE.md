# Guide de Déploiement OVH

Ce guide vous explique comment déployer l'application YouFizz sur un VPS OVH avec stockage externe pour MinIO.

## Architecture

- **VPS OVH Value** (2 vCores, 4GB RAM, 80GB SSD) : ~6-8€/mois
- **OVH Block Storage** (volume externe) : ~0.10€/GB/mois
- **Coût total estimé** : ~16-18€/mois (pour 100GB de stockage)

## Prérequis

1. VPS OVH avec accès root/sudo
2. Docker et Docker Compose installés
3. Git installé
4. Volume Block Storage OVH créé et attaché au VPS

## Étapes de déploiement

### 1. Préparer le VPS

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt install docker-compose -y

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Créer et monter le volume Block Storage OVH

#### Dans le panel OVH :
1. Allez dans "Public Cloud" > "Block Storage"
2. Créez un nouveau volume (commencez avec 100GB)
3. Attachez le volume à votre VPS

#### Sur le VPS :
```bash
# Exécuter le script de montage
sudo bash scripts/mount-ovh-volume.sh

# Vérifier que le volume est monté
df -h /mnt/minio-storage
```

### 3. Cloner le repository

```bash
# Créer le répertoire de déploiement
sudo mkdir -p /opt/you_fizz
sudo chown -R $USER:$USER /opt/you_fizz
cd /opt/you_fizz

# Cloner le repository
git clone https://gitlab.com/wassim.dallaliii-group/you_fizz.git .
```

### 4. Configurer les variables d'environnement

```bash
# Copier le template
cp .env.production.example .env.production

# Éditer avec vos valeurs de production
nano .env.production
```

**Variables importantes à configurer :**
- `POSTGRES_PASSWORD` : Mot de passe fort pour PostgreSQL
- `REDIS_PASSWORD` : Mot de passe pour Redis
- `MINIO_ROOT_USER` et `MINIO_ROOT_PASSWORD` : Identifiants MinIO
- `JWT_SECRET` : Générer avec `openssl rand -base64 32`
- `SMTP_*` : Configuration email de production
- `NEXT_PUBLIC_API_URL` : URL publique de votre API (ex: https://api.votredomaine.com)
- `NEXT_PUBLIC_SITE_URL` : URL publique de votre site (ex: https://votredomaine.com)
- `FRONTEND_URL` : URL du frontend pour les emails

### 5. Configurer Nginx et SSL

#### Créer le répertoire SSL
```bash
mkdir -p nginx/ssl
```

#### Obtenir un certificat SSL avec Let's Encrypt
```bash
# Installer certbot
sudo apt install certbot -y

# Obtenir le certificat (remplacez votre-domaine.com)
sudo certbot certonly --standalone -d votre-domaine.com -d www.votre-domaine.com

# Copier les certificats
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/
sudo chown -R $USER:$USER nginx/ssl
```

#### Mettre à jour nginx.conf
Éditez `nginx/nginx.conf` et remplacez `server_name _;` par votre domaine :
```nginx
server_name votre-domaine.com www.votre-domaine.com;
```

### 6. Déployer l'application

```bash
# Exécuter le script de déploiement
bash scripts/deploy-ovh.sh

# Ou avec options
bash scripts/deploy-ovh.sh --skip-build  # Pour sauter le build
bash scripts/deploy-ovh.sh --logs        # Pour voir les logs
```

### 7. Vérifier le déploiement

```bash
# Vérifier le statut des services
docker-compose -f docker-compose.prod.yml --env-file .env.production ps

# Voir les logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f

# Tester l'API
curl https://votre-domaine.com/api/health
```

## Commandes utiles

### Gestion des services
```bash
# Démarrer les services
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d

# Arrêter les services
docker-compose -f docker-compose.prod.yml --env-file .env.production down

# Redémarrer un service spécifique
docker-compose -f docker-compose.prod.yml --env-file .env.production restart api-gateway

# Voir les logs d'un service
docker-compose -f docker-compose.prod.yml --env-file .env.production logs -f web-ui
```

### Mise à jour de l'application
```bash
cd /opt/you_fizz
git pull origin main
bash scripts/deploy-ovh.sh
```

### Backup de la base de données
```bash
# Backup PostgreSQL
docker exec you_fizz_postgres pg_dump -U postgres you_fizz > backup_$(date +%Y%m%d).sql

# Restaurer
docker exec -i you_fizz_postgres psql -U postgres you_fizz < backup_20240101.sql
```

### Monitoring
```bash
# Utilisation des ressources
docker stats

# Espace disque
df -h
docker system df

# Logs système
journalctl -u docker -f
```

## Dépannage

### Les services ne démarrent pas
```bash
# Vérifier les logs
docker-compose -f docker-compose.prod.yml --env-file .env.production logs

# Vérifier les variables d'environnement
docker-compose -f docker-compose.prod.yml --env-file .env.production config
```

### MinIO ne peut pas écrire
```bash
# Vérifier que le volume est monté
mountpoint /mnt/minio-storage

# Vérifier les permissions
ls -la /mnt/minio-storage
```

### Problèmes de connexion entre services
```bash
# Vérifier le réseau Docker
docker network inspect you_fizz_you_fizz_network

# Tester la connectivité
docker exec you_fizz_api_gateway ping auth
```

## Sécurité

1. **Changez tous les mots de passe par défaut** dans `.env.production`
2. **Configurez un pare-feu** (UFW) :
   ```bash
   sudo ufw allow 22/tcp
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```
3. **Mettez à jour régulièrement** :
   ```bash
   sudo apt update && sudo apt upgrade -y
   docker-compose -f docker-compose.prod.yml pull
   ```
4. **Configurez les backups automatiques** de la base de données
5. **Surveillez les logs** pour détecter les anomalies

## Support

Pour toute question ou problème, consultez :
- La documentation OVH : https://docs.ovh.com
- Les logs Docker : `docker-compose logs`
- Le statut des services : `docker-compose ps`

