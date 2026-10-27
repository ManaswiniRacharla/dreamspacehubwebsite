from django.contrib import admin
from .models import Enquiry

@admin.register(Enquiry)
class EnquiryAdmin(admin.ModelAdmin):
    list_display = ("name", "phone", "city", "interest", "has_plan", "created")
    list_filter = ("has_plan", "city")
    search_fields = ("name", "phone", "email", "city")
