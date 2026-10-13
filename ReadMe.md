# Hoxha Decor

A professional website for **Hoxha Decor**, a metalwork workshop that designs, manufactures and installs custom pieces: railings, gates, doors, windows, interior doors, lampshades, chairs, sun loungers, awnings and a wide range of accessories. The workshop handles orders of every size, small and large, across the whole country and abroad.

---

## Features

- Modern homepage with animations (GSAP / Three.js)
- **Projects** page (portfolio with category filters) and **Process** page (how the work is done)
- **"Request a Quote"** form for custom orders
- Language switcher
- Responsive design for mobile, tablet and desktop
- Reusable navbar and footer built with Django templates

## Tech Stack

| Area | Technology |
|---|---|
| Backend | Python, Django |
| Frontend | HTML (Django templates), Tailwind CSS, JavaScript |
| Animation | GSAP, Three.js |
| Database | SQLite (development) / PostgreSQL (production) |

## Project Structure

```
Hoxha-Decor/
├── manage.py
├── requirements.txt
├── .env.example
├── hoxhadecor_project/    # settings.py, urls.py, wsgi.py
├── core/                  # views.py, urls.py, models.py
├── templates/             # base.html, index.html, navbar.html, footer.html
└── static/
    ├── stilizimi.css
    ├── java1.js
    └── image/
```

## Getting Started

**Requirements:** Python 3.10+ and Git.

```bash
# 1. Clone the repository
git clone https://github.com/sarapupriqi-sys/Hoxha-Decor.git
cd Hoxha-Decor

# 2. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables (see below)
cp .env.example .env

# 5. Set up the database and start the server
python manage.py migrate
python manage.py runserver
```

Open in your browser: <http://127.0.0.1:8000>

## Environment Variables

Create a `.env` file (never commit it to GitHub):

```env
DJANGO_SECRET_KEY=use_a_long_random_secret_key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost
EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

## Deployment

For production:

1. Set `DJANGO_DEBUG=False` and configure `ALLOWED_HOSTS` with your domain
2. Run `python manage.py collectstatic`
3. Serve the app with `gunicorn hoxhadecor_project.wsgi`
4. Serve static files with `whitenoise` or Nginx
5. Enable HTTPS and make sure `python manage.py check --deploy` reports no warnings

Suitable platforms: Render, Railway, PythonAnywhere or a VPS.

## Contact

**Hoxha Decor**
📞 _phone_ · ✉️ _email_ · 📍 _address_

## Author

Developed by **Sara Pupriqi**
[LinkedIn](https://www.linkedin.com/in/sara-pupriqi-951967432) · [GitHub](https://github.com/sarapupriqi-sys)

## License

All rights reserved by Hoxha Decor. The code and images may not be reproduced without permission.