from django.http import Http404, JsonResponse
from django.shortcuts import render
from django.views.decorators.http import require_POST
from . import content
from .forms import EnquiryForm

def home(r):
    return render(r, "hub/home.html", {"services": content.SERVICES, "stats": content.STATS, "promises": content.PROMISES})

def journey(r): return render(r, "hub/journey.html", {"journey": content.JOURNEY})
def why(r): return render(r, "hub/why.html", {"promises": content.PROMISES, "stats": content.STATS})
def franchise(r): return render(r, "hub/franchise.html", {"fr": content.FRANCHISE, "models": content.FRANCHISE_MODELS})
def experience(r): return render(r, "hub/experience.html", {"services": content.SERVICES, "industries": content.INDUSTRIES})

def _list(r, kind, title, intro, items):
    return render(r, "hub/listing.html", {"kind": kind, "title": title, "intro": intro, "items": items})

def services(r):
    return _list(r, "service", "Services", "One vision, end-to-end delivery. Open any service to see it as a 3D projection.", content.SERVICES)

def industries(r):
    return _list(r, "industry", "Who we serve", "Built for every project type. Open any field to see its projection.", content.INDUSTRIES)

def _detail(r, kind, items, slug, back):
    for i, it in enumerate(items):
        if it["slug"] == slug:
            return render(r, "hub/detail.html", {"item": it, "kind": kind, "back": back, "next": items[(i + 1) % len(items)]})
    raise Http404

def service(r, slug): return _detail(r, "service", content.SERVICES, slug, "services")
def industry(r, slug): return _detail(r, "industry", content.INDUSTRIES, slug, "industries")

def contact(r):
    return render(r, "hub/contact.html", {"interest": r.GET.get("interest", "")})

@require_POST
def enquire(r):
    form = EnquiryForm(r.POST)
    if form.is_valid():
        form.save()
        return JsonResponse({"ok": True, "message": "Thanks. We'll call you within one working day to fix your session."})
    return JsonResponse({"ok": False, "errors": {k: v[0] for k, v in form.errors.items()}}, status=400)