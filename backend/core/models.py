from django.db import models
from django.utils import timezone
from core.helpers import hash_args


class Profile(models.Model):
    address = models.CharField(max_length=42, unique=True)
    snapshots = models.ManyToManyField('Snapshot')


class Snapshot(models.Model):
    """
    contract_address: Token Contract Address
    user_address: Address of the user requesting a snapghot
    start_blocknumber: block number to start indexing on
    last_snapshot_block: last block in snapshot
    public: Should the snapshot be publicly accessible or private
    url: URL where the snapshot is stored
    """

    # Contract/Chain Info
    chain = models.TextField()
    contract_address = models.CharField(max_length=42)
    contract_abi = models.JSONField()
    event = models.JSONField()

    # Block range to query
    from_block = models.IntegerField(default=3914495)
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
    public = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.contract_address} Start: {self.from_block} End: {self.to_block}"

    def save(self, *args, **kwargs):
        """On save, update timestamps"""
        self.updated_at = timezone.now()
        self.filter_hash = hash_args(self.contract_address,
                                     self.argument_filters,
                                     self.captured_values)
        return super(Snapshot, self).save(*args, **kwargs)

    class Meta:
        ordering = ['updated_at', 'to_block', 'created_at']


class Contract(models.Model):
    """
    address: wallet address
    deployed_block_number: block number contract was created at
    abi: contract ABI
    """
    address = models.CharField(max_length=42, blank=True, null=True)
    deployed_block_number = models.IntegerField(default=3914495)
    abi = models.JSONField(blank=True, null=True)

    def __str__(self):
        return f"{self.address}"


class Filter(models.Model):
    """
    filters : JSON object of filteres to be applied to a snapshot
    filter_hash: keccak hash of filter json
    url: url of stored filtered snapshot
    """
    snapshot = models.ForeignKey(Snapshot, on_delete=models.CASCADE)
    filter_hash = models.CharField(max_length=64, blank=True, null=True)

    def save(self, *args, **kwargs):
        """On save, update filter hash"""
        self.filter_hash = hash_args(self.snapshot.contract_address,
                                     self.snapshot.argument_filters,
                                     self.snapshot.captured_values)
        return super(Filter, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.filter_hash}"


