import json
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAdminUser
from rest_framework import serializers
from rest_framework import viewsets

from core.tasks import execute_snapshot
from core.models import Snapshot


def health_check(request):
    return JsonResponse({"healthy": True})


class SnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = [
            "id",
            "chain",
            "contract_address",
            "contract_abi",
            "event",
            "from_block",
            "to_block",
            "argument_filters",
            "captured_values",
            "events_cid",
            "events_count",
            "addresses_cid",
            "addresses_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            # "creator",
            "events_cid",
            "events_count",
            "addresses_cid",
            "addresses_count",
        ]


class SnapshotViewSet(viewsets.ModelViewSet):
    queryset = Snapshot.objects.all()
    serializer_class = SnapshotSerializer

    def create(self, request, *args, **kwargs):
        result = super().create(request, *args, **kwargs)

        snapshot_id = result.data.get("id")

        if snapshot_id:
            execute_snapshot.delay(snapshot_id)

        return result
