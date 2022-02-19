from rest_framework import serializers
from core.models import Snapshot, Contract, Filter


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


class SnapshotListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = ('contract_address', 'start_blocknumber',
                  'last_snapshot_block')


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ('address', 'deployed_block_number', 'abi')


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ('snapshot', 'filters', 'url')
