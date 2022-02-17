from django.db import models
from django.utils import timezone
import hashlib
from django.db.models.signals import post_save


class Snapshot(models.Model):
    """
    contract_address: Token Contract Address
    user_address: Address of the user requesting a snapshot
    start_blocknumber: block number to start indexing on
    last_snapshot_block: last block in snapshot
    public: Should the snapshot be publicly accessible or private
    url: URL where the snapshot is stored
    """
    contract_address = models.CharField(max_length=42)
    user_address = models.CharField(max_length=42, primary_key=True)
    start_blocknumber = models.IntegerField(default=3914495)
    last_snapshot_block = models.IntegerField(blank=True)
    public = models.BooleanField(default=True)
    url = models.URLField(blank=True)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField()

    def __str__(self):
        return f"{self.contract_address} Snapshot: {self.pk}"

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        self.modified = timezone.now()
        return super(Snapshot, self).save(*args, **kwargs)


class Contract(models.Model):
    """
    address: wallet address
    deployed_block_number: block number contract was created at
    abi: contract ABI
    """
    address = models.CharField(max_length=42)
    deployed_block_number = models.IntegerField(default=3914495)
    abi = models.JSONField()

    def __str__(self):
        return f"{self.address}"


class Filter(models.Model):
    """
    filters : JSON object of filteres to be applied to a snapshot
    filter_hash: keccak hash of filter json
    url: url of stored filtered snapshot
    """
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE)
    filters = models.JSONField()
    filter_hash = models.CharField(max_length=64, blank=True)
    url = models.URLField()
