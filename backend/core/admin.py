from django.contrib import admin
from core.models import Filter, Contract, Snapshot
# Register your models here.


admin.site.register(Snapshot)
admin.site.register(Filter)
admin.site.register(Contract)
