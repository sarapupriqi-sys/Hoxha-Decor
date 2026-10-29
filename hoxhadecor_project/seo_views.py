from django.shortcuts import render
from django.urls import reverse

# Emrat e URL-ve (nga urls.py) që duhet të dalin në sitemap.
# Kur shton një faqe të re publike (p.sh. 'privatesia'), shtoje këtu.
SITEMAP_URL_NAMES = ['home', 'about', 'punimet', 'procesi', 'contact','privatesia']


def robots_txt(request):
    return render(
        request,
        'robots.txt',
        {'sitemap_url': request.build_absolute_uri(reverse('sitemap_txt'))},
        content_type='text/plain; charset=utf-8',
    )


def sitemap_txt(request):
    urls = [request.build_absolute_uri(reverse(name)) for name in SITEMAP_URL_NAMES]
    return render(
        request,
        'sitemap.txt',
        {'urls': urls},
        content_type='text/plain; charset=utf-8',
    )