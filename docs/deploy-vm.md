# Deploy na VM

VM alvo:

```bash
ssh root@64.225.59.107
```

## 1. Preparar a VM

```bash
apt update && apt upgrade -y
apt install -y git curl ca-certificates
curl -fsSL https://get.docker.com | sh
apt install -y docker-compose-plugin
```

## 2. Enviar o projeto para a VM

Opção simples, a partir da sua máquina local:

```bash
cd C:\Users\Bobi\Desktop\vinicius-morais-office
scp -r . root@64.225.59.107:/opt/vinicius-morais-office
```

Se o projeto estiver em um Git remoto, prefira clonar na VM:

```bash
mkdir -p /opt
cd /opt
git clone SEU_REPOSITORIO_GIT vinicius-morais-office
cd vinicius-morais-office
```

## 3. Criar variáveis de produção

Na VM:

```bash
cd /opt/vinicius-morais-office
cp .env.production.example .env.production
nano .env.production
```

Preencha:

```bash
POSTGRES_PASSWORD=uma-senha-forte
RAILS_MASTER_KEY=conteudo-do-arquivo-backend/config/master.key
APP_HOST=64.225.59.107
PUBLIC_API_URL=http://64.225.59.107
CORS_ORIGINS=64.225.59.107
```

Para ver a master key local:

```bash
cat backend/config/master.key
```

## 4. Build e subida

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Ver logs:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f
```

Ver saúde da API:

```bash
curl http://64.225.59.107/up
```

Abrir:

```text
http://64.225.59.107
```

## 5. Rodar seeds iniciais

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml exec backend bundle exec rails db:seed
```

Login local criado pelo seed:

```text
cliente@viniciusmorais.adv.br
password
```

## 6. Deploy de atualização

Depois de alterar código:

```bash
cd /opt/vinicius-morais-office
git pull
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml exec backend bundle exec rails db:migrate
```

## 7. Quando tiver domínio e SSL

Atualize `.env.production`:

```bash
APP_HOST=seudominio.com.br
PUBLIC_API_URL=https://seudominio.com.br
CORS_ORIGINS=seudominio.com.br
RAILS_ASSUME_SSL=true
RAILS_FORCE_SSL=true
```

Depois coloque um proxy com SSL, como Caddy, Traefik, Nginx + Certbot ou Cloudflare Tunnel.
