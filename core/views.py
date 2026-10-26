from django.conf import settings
from django.contrib import messages
from django.core.mail import EmailMessage
from django.shortcuts import redirect, render

MAX_FILES = 5
MAX_FILE = 8 * 1024 * 1024     # Maksimumi 8 MB për çdo foto individuale
MAX_TOTAL = 15 * 1024 * 1024   # Maksimumi 15-20 MB total (nën kufirin e Gmail prej ~25 MB)
ALLOWED = ('image/jpeg', 'image/png', 'image/webp')

def home(request):
    return render(request, 'index.html')


def about(request):
    return render(request, 'about.html')


def punimet(request):
    return render(request, 'punimet.html')


def procesi(request):
    return render(request, 'procesi.html')

def privatesia(request):
    return render(request, 'privatesia.html')

def contact(request):
    if request.method != 'POST':
        return render(request, 'contact.html')

    if request.POST.get('website'):  # honeypot: vetëm robotët e plotësojnë
        return redirect('contact')

    if not request.POST.get('emri', '').strip() or not request.POST.get('telefoni', '').strip():
        messages.error(request, 'Plotësoni emrin dhe numrin e telefonit.')
        return redirect('contact')

    lines = [
        f'{k}: {v.strip()}'
        for k, v in request.POST.items()
        if k not in ('csrfmiddlewaretoken', 'website') and v.strip()
    ]
    email = EmailMessage(
        subject='Kërkesë e re nga faqja: ' + ' '.join(request.POST.get('lloji', '').split())[:80],
        body='\n'.join(lines),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.CONTACT_RECIPIENT],
    )

    total = 0
    skipped = 0
    files = [f for _, group in request.FILES.lists() for f in group]
    
    # Numërojmë sa foto u hoqën sepse i kalonin limitit të sasisë (MAX_FILES)
    if len(files) > MAX_FILES:
        skipped += len(files) - MAX_FILES
        files = files[:MAX_FILES]

    for f in files:
        # Kontrollojmë formatin, madhësinë individuale dhe totalin
        if f.content_type not in ALLOWED or f.size > MAX_FILE or total + f.size > MAX_TOTAL:
            skipped += 1
            continue
        total += f.size
        email.attach(f.name, f.read(), f.content_type)

    try:
        email.send()
    except Exception:
        messages.error(request, 'Kërkesa nuk u dërgua. Na shkruani në WhatsApp.')
    else:
        msg = "Faleminderit! Kërkesa u dërgua, do t'ju kthejmë përgjigje."
        if skipped > 0:
            msg += f" (Kujdes: {skipped} foto nuk u bashkëngjitën pasi kalonin limitin e madhësisë ose formatit)."
        messages.success(request, msg)
        
    return redirect('contact')