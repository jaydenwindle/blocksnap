from django.shortcuts import render
from django.http import HttpResponse

from core.tasks import start_transfer_snapshot

# Create your views here.
def trigger_task(request):
    start_transfer_snapshot.delay("0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", 12287507)
    return HttpResponse("hi")
