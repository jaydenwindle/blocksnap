from django.http import JsonResponse
from rest_framework import viewsets
from core.tasks import execute_snapshot
from core.serializers import SnapshotSerializer, SnapshotListSerializer
from core.models import Snapshot
from rest_framework.response import Response
from rest_framework.decorators import api_view


def health_check(request):
    return JsonResponse({"healthy": True})


class SnapshotViewSet(viewsets.ModelViewSet):
    queryset = Snapshot.objects.all()
    serializer_class = SnapshotSerializer

    def create(self, request, *args, **kwargs):
        result = super().create(request, *args, **kwargs)

        snapshot_id = result.data.get("id")

        if snapshot_id:
            execute_snapshot.delay(snapshot_id)

        return result


# Get snapshot list by user
@api_view(['GET'])
def get_snapshot_list_by_user(request, user_address):
    snapshots = Snapshot.objects.filter(user_address=user_address).order_by(
        'last_snapshot_block', 'contract_address')
    serializer = SnapshotListSerializer(snapshots, many=True)
    return Response(serializer.data)


# Get snapshot list by user
@api_view(['GET'])
def get_snapshot_list_by_contract(request, user_address, contract_address):
    snapshots = Snapshot.objects.filter(user_address=user_address,
                                        contract_address=contract_address
                                        ).order_by(
        'last_snapshot_block', 'contract_address')
    serializer = SnapshotListSerializer(snapshots, many=True)
    return Response(serializer.data)


