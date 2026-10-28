import logging
logger = logging.getLogger(__name__)
from django.conf import settings
from django.contrib import messages
from django.core.mail import EmailMessage
from django.shortcuts import redirect, render
from .models import MesazhKontakti, Oferta  # Importojmë modelet e reja

MAX_FILES = 5
MAX_FILE = 8 * 1024 * 1024     # Maksimumi 8 MB për çdo foto individuale
MAX_TOTAL = 15 * 1024 * 1024   # Maksimumi 15-20 MB total
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
    
    if request.POST.get('website') or request.POST.get('website_hp'):
        return redirect('contact')

    emri = request.POST.get('emri', '').strip()
    telefoni = request.POST.get('telefoni', '').strip()
    
    if not emri or not telefoni:
        messages.error(request, 'Plotësoni emrin dhe numrin e telefonit.')
        return redirect('contact')

    saved = False
    try:
        lloji = request.POST.get('lloji', '').strip()
        lat = request.POST.get('lat', '').strip()
        lng = request.POST.get('lng', '').strip()
        
        pjese = []
        if lloji:
            pjese.append(f'Lloji: {lloji}')
        if lat and lng:
            pjese.append(f'Vendndodhja: https://www.google.com/maps?q={lat},{lng}')
            
        mesazhi_input = request.POST.get('mesazhi', '').strip()
        if mesazhi_input:
            pjese.append(mesazhi_input)
            
        mesazhi_ruajtur = '\n'.join(pjese)

        MesazhKontakti.objects.create(
            emri=emri,
            telefoni=telefoni,
            email=request.POST.get('email', '').strip(),
            qyteti=request.POST.get('qyteti', '').strip(),
            adresa=request.POST.get('adresa', '').strip(),
            prmasat=request.POST.get('permasat', '').strip(),
            mesazhi=mesazhi_ruajtur
        )
        saved = True
    except Exception:
        logger.exception('Ruajtja e MesazhKontakti dështoi')

    # 2. Përgatitja dhe Dërgimi i Email-it (kodi yt ekzistues)
    lines = [
        f'{k}: {v.strip()}'
        for k, v in request.POST.items()
        if k not in ('csrfmiddlewaretoken', 'website', 'website_hp') and v.strip()
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
    
    if len(files) > MAX_FILES:
        skipped += len(files) - MAX_FILES
        files = files[:MAX_FILES]

    for f in files:
        if f.content_type not in ALLOWED or f.size > MAX_FILE or total + f.size > MAX_TOTAL:
            skipped += 1
            continue
        total += f.size
        email.attach(f.name, f.read(), f.content_type)

    try:
        email.send()
    except Exception:
        logger.exception('Dërgimi i email-it dështoi')
        if saved:
            messages.error(request, 'Kërkesa u ruajt, por dërgimi i emailit dështoi. Na kontaktoni në WhatsApp.')
        else:
            messages.error(request, 'Kërkesa nuk u dërgua. Na kontaktoni në WhatsApp.')
    else:
        msg = "Faleminderit! Kërkesa u dërgua, do t'ju kthejmë përgjigje."
        if skipped > 0:
            msg += f" (Kujdes: {skipped} foto nuk u bashkëngjitën pasi kalonin limitin e madhësisë ose formatit)."
        messages.success(request, msg)
        
    return redirect('contact')


def oferta_view(request):
    """Funksioni për të kapur kërkesat për ofertë nga modalja në faqe"""
    if request.method == 'POST':
        emri = request.POST.get('emri', '').strip()
        telefoni = request.POST.get('telefoni', '').strip()
        
        if emri and telefoni:
            Oferta.objects.create(
                emri=emri,
                telefoni=telefoni,
                lloji_punimit=request.POST.get('lloji_punimit', '').strip(),
                prmasat=request.POST.get('prmasat', '').strip(),
                detaje=request.POST.get('detaje', '').strip()
            )
            messages.success(request, 'Kërkesa për ofertë u dërgua me sukses!')
        else:
            messages.error(request, 'Ju lutemi plotësoni emrin dhe telefonin.')
            
    return redirect('home')  # Ose kthehu te faqja ku ndodhej përdoruesi