from .models import Snapshot
from django import forms


class SnapshotForm(forms.ModelForm):

    class Meta:
        model = Snapshot
        fields = ["contract_address", "start_blocknumber", "public", "filters"]
        labels = {
            "contract_address": "Contract Address",
            "start_blocknumber": "Starting Block Number",
            "public": "Public Snapshot",
            "filters": "Filters"
        }

