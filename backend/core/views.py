from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from core.serializers import (
    SnapshotSerializer, ContractSerializer, FilterSerializer,
    SnapshotListSerializer
)
from core.tasks import start_transfer_snapshot
from core.models import Snapshot, Contract, Filter
from rest_framework.decorators import api_view
from rest_framework.response import Response


# Create your views here.
def trigger_task(request):
    start_transfer_snapshot.delay(
        "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D", "Transfer"
    )
    return HttpResponse("hi")


# create Snapshot
@api_view(['POST'])
def create_snapshot(request):
    serializer = SnapshotSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)


# get Snapshot list by user
@api_view(['GET'])
def get_snaphot_list(request, user_address):
    snapshots = Snapshot.objects.filter(user_address=user_address).order_by(
        'last_snapshot_block', 'contract_address')
    serializer = SnapshotListSerializer(snapshots, many=True)
    return Response(serializer.data)


# get Snapshot list for user by contract
@api_view(['GET'])
def get_snaphot_list_by_contract(request, user_address, contract_address):
    snapshots = Snapshot.objects.filter(user_address=user_address,
                                        contract_address=contract_address
                                        ).order_by(
        'contract_address')
    serializer = SnapshotListSerializer(snapshots, many=True)
    return Response(serializer.data)
