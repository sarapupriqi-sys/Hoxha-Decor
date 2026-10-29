from django.core import mail
from django.test import TestCase, override_settings
from django.urls import reverse

from .models import MesazhKontakti, Oferta

@override_settings(SECURE_SSL_REDIRECT=False)
class FaqetTest(TestCase):
    def test_faqet_hapen(self):
        for name in ['home', 'about', 'punimet', 'procesi', 'contact', 'privatesia']:
            with self.subTest(name=name):
                self.assertEqual(self.client.get(reverse(name)).status_code, 200)

    def test_kontakti_ruhet_dhe_dergon_email(self):
        self.client.post(reverse('contact'), {'emri': 'Test', 'telefoni': '0690000000'})
        self.assertEqual(MesazhKontakti.objects.count(), 1)
        self.assertEqual(len(mail.outbox), 1)

    def test_kontakti_pa_telefon_nuk_ruhet(self):
        self.client.post(reverse('contact'), {'emri': 'Test'})
        self.assertEqual(MesazhKontakti.objects.count(), 0)

    def test_honeypot(self):
        self.client.post(reverse('contact'), {'emri': 'Bot', 'telefoni': '1', 'website': 'x'})
        self.assertEqual(MesazhKontakti.objects.count(), 0)

    def test_oferta_ruhet(self):
        r = self.client.post(reverse('oferta'), {
            'emri': 'Test', 'telefoni': '069', 'lloji_punimit': 'Portë', 'detaje': 'Hyrje 3 m',
        })
        self.assertEqual(r.status_code, 204)
        oferta = Oferta.objects.get()
        self.assertEqual(oferta.lloji_punimit, 'Portë')
        self.assertEqual(oferta.detaje, 'Hyrje 3 m')

    def test_oferta_dergon_email(self):
        self.client.post(reverse('oferta'), {
            'emri': 'Test', 'telefoni': '069', 'lloji_punimit': 'Portë', 'detaje': 'Hyrje 3 m',
        })
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Portë', mail.outbox[0].subject)
        self.assertIn('069', mail.outbox[0].body)
        self.assertIn('Hyrje 3 m', mail.outbox[0].body)

    def test_oferta_ruhet_edhe_nese_emaili_deshton(self):
        with override_settings(EMAIL_BACKEND='django.core.mail.backends.smtp.EmailBackend',
                               EMAIL_HOST='127.0.0.1', EMAIL_PORT=1, EMAIL_TIMEOUT=1):
            r = self.client.post(reverse('oferta'), {
                'emri': 'Test', 'telefoni': '069', 'lloji_punimit': 'Portë',
            })
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Oferta.objects.count(), 1)

    def test_oferta_pa_lloji_punimit(self):
        r = self.client.post(reverse('oferta'), {'emri': 'Test', 'telefoni': '069', 'lloji_punimit': ''})
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Oferta.objects.count(), 0)

    def test_oferta_pa_emer_ose_telefon(self):
        r = self.client.post(reverse('oferta'), {'emri': '', 'telefoni': '069', 'lloji_punimit': 'Portë'})
        self.assertEqual(r.status_code, 400)
        self.assertEqual(Oferta.objects.count(), 0)

    def test_oferta_honeypot(self):
        r = self.client.post(reverse('oferta'), {
            'emri': 'Bot', 'telefoni': '1', 'lloji_punimit': 'Portë', 'website_hp': 'x',
        })
        self.assertEqual(r.status_code, 204)
        self.assertEqual(Oferta.objects.count(), 0)
        self.assertEqual(len(mail.outbox), 0)

    def test_oferta_vetem_post(self):
        self.assertEqual(self.client.get(reverse('oferta')).status_code, 405)

    def test_not_found_page_404(self):
        response = self.client.get('/faqe-qe-nuk-ekziston-kjo/')
        self.assertEqual(response.status_code, 404)