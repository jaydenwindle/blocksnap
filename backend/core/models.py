from django.db import models


class Snapshot(models.Model):
    contract_address = models.CharField(max_length=42)
    start_blocknumber = models.IntegerField(default=3914495)
    public = models.BooleanField(default=True)
    filters = models.JSONField()
    url = models.URLField()


class User(models.Model):
    address = models.CharField(max_length=42)
    snapshots = models.ManyToMany(Snapshot, on_delete=models.RESTRICT)


class Contract(models.Model):
    address = models.CharField(max_length=42)
    deployed_block_number = models.IntegerField(default=3914495)
    abi = models.JSONField()
