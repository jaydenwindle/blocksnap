from rest_framework import serializers
from core.models import Snapshot, Contract, Filter


class SnapshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = ('contract_address', 'user_address', 'start_blocknumber',
                  'public')


class SnapshotListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Snapshot
        fields = ('contract_address', 'url', 'start_blocknumber',
                  'last_snapshot_block')


class ContractSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contract
        fields = ('address', 'deployed_block_number', 'abi')


class FilterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Filter
        fields = ('snapshot', 'filters', 'url')
