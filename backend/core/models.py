from django.db import models
from django.utils import timezone


class Snapshot(models.Model):
    contract_address = models.CharField(max_length=42)
    user_address = models.CharField(max_length=42, primary_key=True)
    start_blocknumber = models.IntegerField(default=3914495)
    last_snapshot_block = models.IntegerField()
    public = models.BooleanField(default=True)
    filters = models.JSONField()
    url = models.URLField()
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField()

    def __str__(self):
        return f"{self.contract_address} Snapshot: {self.pk}"

    def save(self, *args, **kwargs):
        ''' On save, update timestamps '''
        self.modified = timezone.now()
        return super(User, self).save(*args, **kwargs)


class Contract(models.Model):
    address = models.CharField(max_length=42)
    deployed_block_number = models.IntegerField(default=3914495)
    abi = models.JSONField()

    def __str__(self):
        return f"{self.address}"
