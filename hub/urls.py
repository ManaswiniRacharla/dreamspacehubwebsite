from django.urls import path
from . import views as v
urlpatterns = [
    path("", v.home, name="home"), path("journey/", v.journey, name="journey"),
    path("experience/", v.experience, name="experience"),
    path("services/", v.services, name="services"), path("services/<slug:slug>/", v.service, name="service"),
    path("who-we-serve/", v.industries, name="industries"), path("who-we-serve/<slug:slug>/", v.industry, name="industry"),
    path("why-us/", v.why, name="why"), path("franchise/", v.franchise, name="franchise"),
    path("contact/", v.contact, name="contact"), path("enquire/", v.enquire, name="enquire"),
]
