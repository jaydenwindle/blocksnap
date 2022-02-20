from rest_framework import serializers
from core.models import Snapshot, Contract, Filter, Profile


class SnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = [
            "id",
            "creator",
            "public",
            "chain",
            "contract_address",
            "contract_abi",
            "rpc_url",
            "event",
            "from_block",
            "to_block",
            "token_balance",
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
            "events_cid",
            "events_count",
            "addresses_cid",
            "addresses_count",
        ]


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["address", "snapshots"]


class SnapshotListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = ("contract_address", "from_block", "to_block")


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ("address", "deployed_block_number", "abi")


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ("snapshot", "filters", "url")
