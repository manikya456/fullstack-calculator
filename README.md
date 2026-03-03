# Full Stack Calculator (Django + React + Tailwind)

Production-ready calculator web app:
- Backend: Django + Django REST Framework (`calculator_backend`)
- Frontend: React (Vite) + Tailwind CSS (`calculator_frontend`)
- Deployment target: AWS EC2 with Gunicorn + Nginx

## Project Structure

```text
fullstack-calculator/
|-- calculator_backend/
|   |-- calculator_backend/
|   |   |-- settings/
|   |   |   |-- __init__.py
|   |   |   |-- base.py
|   |   |   |-- development.py
|   |   |   `-- production.py
|   |   |-- asgi.py
|   |   |-- urls.py
|   |   `-- wsgi.py
|   |-- calculator/
|   |   |-- serializers.py
|   |   |-- services.py
|   |   |-- tests.py
|   |   |-- urls.py
|   |   `-- views.py
|   |-- deploy/
|   |   |-- gunicorn.service
|   |   |-- nginx-api-only.conf
|   |   `-- nginx-calculator.conf
|   |-- .env.example
|   |-- gunicorn.conf.py
|   |-- manage.py
|   `-- requirements.txt
|-- calculator_frontend/
|   |-- src/
|   |   |-- api/calculatorApi.js
|   |   |-- components/CalculatorButton.jsx
|   |   |-- utils/formatters.js
|   |   |-- App.jsx
|   |   |-- index.css
|   |   `-- main.jsx
|   |-- .env.example
|   |-- package.json
|   |-- postcss.config.js
|   |-- tailwind.config.js
|   `-- vite.config.js
`-- README.md
```

## Backend API

`POST /api/calculate/`

Request:

```json
{
  "num1": 10,
  "num2": 5,
  "operation": "add"
}
```

Response:

```json
{
  "result": 15
}
```

Supported operations:
- `add`
- `subtract`
- `multiply`
- `divide`

Error behavior:
- Division by zero returns `400 Bad Request`
- Invalid payload/operation returns `400 Bad Request`
- Unsupported method returns `405 Method Not Allowed`

## Local Development

### 1) Backend

```bash
cd calculator_backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000`

### 2) Frontend

```bash
cd calculator_frontend
npm install
cp .env.example .env
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## Production Build

### Frontend

```bash
cd calculator_frontend
npm run build
```

This generates `calculator_frontend/dist`.

### Backend static files

```bash
cd calculator_backend
python manage.py collectstatic --noinput
```

## AWS EC2 Deployment (Ubuntu)

### 1) Launch EC2 and configure security group

Allow inbound:
- `22` (SSH) from your IP
- `80` (HTTP) from `0.0.0.0/0`
- `443` (HTTPS) from `0.0.0.0/0` (if using SSL)

### 2) SSH and install system packages

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-venv python3-pip nginx git
```

### 3) Clone project and install backend

```bash
cd /home/ubuntu
git clone <your-repo-url> fullstack-calculator
cd fullstack-calculator
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r calculator_backend/requirements.txt
```

### 4) Configure backend environment

```bash
cd /home/ubuntu/fullstack-calculator/calculator_backend
cp .env.example .env
```

Set production values in `.env`:
- `DJANGO_ENV=production`
- `DJANGO_SECRET_KEY=<strong-secret>`
- `DJANGO_DEBUG=False`
- `DJANGO_ALLOWED_HOSTS=<your-domain>,<your-ec2-public-ip>`
- `DJANGO_CORS_ALLOWED_ORIGINS=http://<your-domain>,http://<your-ec2-public-ip>`
- `DJANGO_CSRF_TRUSTED_ORIGINS=http://<your-domain>,http://<your-ec2-public-ip>`
- `DJANGO_SERVE_FRONTEND_WITH_DJANGO=False`
- `DJANGO_SECURE_SSL_REDIRECT=True`
- `DJANGO_SECURE_HSTS_SECONDS=31536000`

Then:

```bash
source /home/ubuntu/fullstack-calculator/.venv/bin/activate
python calculator_backend/manage.py migrate
python calculator_backend/manage.py collectstatic --noinput
```

### 5) Build frontend

```bash
cd /home/ubuntu/fullstack-calculator/calculator_frontend
npm install
echo "VITE_API_BASE_URL=http://<your-domain-or-ip>" > .env
npm run build
```

### 6A) Serve frontend directly from Nginx (recommended)

```bash
sudo mkdir -p /var/www/calculator_frontend
sudo cp -r /home/ubuntu/fullstack-calculator/calculator_frontend/dist/* /var/www/calculator_frontend/
```

Use Nginx config:
- `calculator_backend/deploy/nginx-calculator.conf`

### 6B) Serve frontend through Django static/templates (optional)

Build with a Django-friendly static base path:

```bash
cd /home/ubuntu/fullstack-calculator/calculator_frontend
npm run build -- --base=/static/frontend/
```

Copy build output into backend:

```bash
mkdir -p /home/ubuntu/fullstack-calculator/calculator_backend/templates/frontend
mkdir -p /home/ubuntu/fullstack-calculator/calculator_backend/static/frontend
cp /home/ubuntu/fullstack-calculator/calculator_frontend/dist/index.html /home/ubuntu/fullstack-calculator/calculator_backend/templates/frontend/index.html
cp -r /home/ubuntu/fullstack-calculator/calculator_frontend/dist/assets /home/ubuntu/fullstack-calculator/calculator_backend/static/frontend/
```

Set:
- `DJANGO_SERVE_FRONTEND_WITH_DJANGO=True`

Use Nginx config:
- `calculator_backend/deploy/nginx-api-only.conf`

### 7) Configure Gunicorn systemd service

```bash
sudo cp /home/ubuntu/fullstack-calculator/calculator_backend/deploy/gunicorn.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable gunicorn
sudo systemctl start gunicorn
sudo systemctl status gunicorn
```

### 8) Configure Nginx

For option 6A:

```bash
sudo cp /home/ubuntu/fullstack-calculator/calculator_backend/deploy/nginx-calculator.conf /etc/nginx/sites-available/calculator
```

For option 6B:

```bash
sudo cp /home/ubuntu/fullstack-calculator/calculator_backend/deploy/nginx-api-only.conf /etc/nginx/sites-available/calculator
```

Then:

```bash
sudo ln -s /etc/nginx/sites-available/calculator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Gunicorn Run Command (manual)

```bash
cd /home/ubuntu/fullstack-calculator/calculator_backend
source ../.venv/bin/activate
export DJANGO_ENV=production
gunicorn --config gunicorn.conf.py calculator_backend.wsgi:application
```

## Notes

- Frontend supports keyboard input (`0-9`, `.`, `+`, `-`, `*`, `/`, `Enter`, `Backspace`, `Escape`, `C`).
- API errors are shown inside the calculator display.
- CORS is configurable with environment variables.
