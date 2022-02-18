from django.db import models


class User(models.Model):
    address = models.CharField(max_length=42)


class Snapshot(models.Model):
    # creator = models.ForeignKey(User, on_delete=models.CASCADE)

    # Contract/Chain Info
    chain = models.TextField()
    contract_address = models.TextField()
    contract_abi = models.JSONField()
    event = models.JSONField()

    # Block range to query
    from_block = models.IntegerField(default=0)
    to_block = models.IntegerField(default=99999999)

    # Log filters and data to capture
    argument_filters = models.JSONField()
    captured_values = models.JSONField()

    # Results storage (IPFS)
    events_cid = models.TextField()
    events_count = models.BigIntegerField(default=0)
    addresses_cid = models.TextField()
    addresses_count = models.BigIntegerField(default=0)

    # Metadata
    name = models.TextField()
    description = models.TextField()
    public = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
