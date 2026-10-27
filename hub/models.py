from django.db import models

class Enquiry(models.Model):
    PLAN_CHOICES = [("yes", "Yes, I have one"), ("no", "No"), ("help", "I need help with one")]
    name = models.CharField(max_length=120)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    city = models.CharField(max_length=80)
    plot_size = models.CharField("Plot / built-up area", max_length=80, blank=True)
    interest = models.CharField(max_length=120, blank=True)
    has_plan = models.CharField(max_length=4, choices=PLAN_CHOICES, default="yes")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created"]
        verbose_name_plural = "enquiries"

    def __str__(self):
        return f"{self.name} ({self.city})"
