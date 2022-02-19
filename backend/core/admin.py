from django.contrib import admin
from core.models import Filter, Contract, Snapshot, Profile
# Register your models here.


admin.site.register(Snapshot)
admin.site.register(Filter)
admin.site.register(Contract)
admin.site.register(Profile)
