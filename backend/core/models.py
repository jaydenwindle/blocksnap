from django.db import models
from django.contrib.auth.models import User


class Snapshot(models.Model):
    contract_address = models.CharField(max_length=42)
    start_blocknumber = models.IntegerField(default=3914495)
    last_snapshot_block = models.IntegerField()
    public = models.BooleanField(default=True)
    filters = models.JSONField()
    url = models.URLField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.contract_address} Snapshot: {self.pk}"


class Profile(models.Model):
    user = models.OneToOneField(User)
    address = models.CharField(max_length=42, primary_key=True)
    snapshots = models.ManyToManyField(Snapshot)

    def __str__(self):
        return f"{self.address}"


class Contract(models.Model):
    address = models.CharField(max_length=42)
    deployed_block_number = models.IntegerField(default=3914495)
    abi = models.JSONField()

    def __str__(self):
        return f"{self.address}"
