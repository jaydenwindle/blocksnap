from django.http import JsonResponse
from rest_framework import viewsets
from core.tasks import execute_snapshot
from core.serializers import SnapshotSerializer
from core.models import Snapshot


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



