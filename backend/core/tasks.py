import json
import io
import csv
import time
import multiprocessing
import itertools
from click import argument
import requests
from math import ceil
from web3 import Web3
from celery import shared_task, chord, chain
from django.conf import settings
from core.models import Snapshot


PAGE_SIZE = 2000
w3 = Web3(
    Web3.HTTPProvider(
        "https://eth-mainnet.alchemyapi.io/v2/NGtUbewnL3eCvtxqJQr_biDfjQjPOCBD",
        request_kwargs={"timeout": 60},
    )
)


@shared_task
def execute_snapshot(snapshot_id: int):
    try:
        snapshot = Snapshot.objects.get(pk=snapshot_id)
    except Snapshot.DoesNotExist:
        return

    pages = ceil((snapshot.to_block - snapshot.from_block) / PAGE_SIZE)

    chain(
        chord(
            (gather_events_for_page.s(snapshot_id, page) for page in range(10)),
            store_event_results.s(snapshot_id),
        ),
        gather_addresses.s(snapshot_id),
        store_addresses.s(snapshot_id),
    )()


@shared_task
def gather_events_for_page(snapshot_id: int, page: int):
    try:
        snapshot = Snapshot.objects.get(pk=snapshot_id)
    except Snapshot.DoesNotExist:
        return

    from_block = snapshot.from_block + (page * PAGE_SIZE)
    to_block = snapshot.from_block + ((page + 1) * PAGE_SIZE)

    contract = w3.eth.contract(
        address=Web3.toChecksumAddress(snapshot.contract_address),
        abi=snapshot.contract_abi,
    )

    parsed_filters = {}

    for key in snapshot.argument_filters.keys():
        if snapshot.argument_filters[key]:
            parsed_filters[key] = snapshot.argument_filters[key]

    print(from_block, to_block, parsed_filters)

    entries = getattr(contract.events, snapshot.event["name"]).getLogs(
        fromBlock=from_block, toBlock=to_block, argument_filters=parsed_filters
    )

    parsed_entries = []
    for entry in entries:
        parsed_entry = {}

        for arg in entry.args.keys():
            value = entry.args[arg]
            if type(value) == "HexBytes":
                value = Web3.toHex(value)
            parsed_entry[arg] = entry.args[arg]

        parsed_entries.append(parsed_entry)

        parsed_entry["transactionHash"] = Web3.toHex(entry.transactionHash)

    return parsed_entries


@shared_task
def store_event_results(results, snapshot_id):
    try:
        snapshot = Snapshot.objects.get(pk=snapshot_id)
    except Snapshot.DoesNotExist:
        return

    file = io.StringIO()
    writer = csv.writer(file)

    all_entries = list(itertools.chain.from_iterable(results))

    writer.writerow(list(all_entries[0].keys()))

    for entry in all_entries:
        writer.writerow(entry.values())

    pin_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    response = requests.post(
        pin_url,
        files={
            "file": file.getvalue(),
        },
        headers={"Authorization": f"Bearer {settings.PINATA_JWT}"},
    )

    result = response.json()

    print(result)

    snapshot.events_cid = result["IpfsHash"]
    snapshot.events_count = len(all_entries)
    snapshot.save()

    return all_entries


@shared_task
def gather_addresses(results, snapshot_id):
    try:
        snapshot = Snapshot.objects.get(pk=snapshot_id)
    except Snapshot.DoesNotExist:
        return

    print(snapshot.captured_values)

    addresses = []

    values_to_capture = []
    for key in snapshot.captured_values.keys():
        if snapshot.captured_values[key]:
            values_to_capture.append(key)

    for entry in results:
        for value in values_to_capture:
            addresses.append(entry.get(value))

    addresses_deduped = list(dict.fromkeys(addresses))
    print(len(addresses_deduped))

    return addresses_deduped


@shared_task
def store_addresses(addresses, snapshot_id):
    try:
        snapshot = Snapshot.objects.get(pk=snapshot_id)
    except Snapshot.DoesNotExist:
        return

    file = io.StringIO()
    writer = csv.writer(file)

    writer.writerow(["Wallet Address"])

    for address in addresses:
        writer.writerow([address])

    pin_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    response = requests.post(
        pin_url,
        files={
            "file": file.getvalue(),
        },
        headers={"Authorization": f"Bearer {settings.PINATA_JWT}"},
    )

    result = response.json()

    print(result)

    snapshot.addresses_cid = result["IpfsHash"]
    snapshot.addresses_count = len(addresses)
    snapshot.save()
