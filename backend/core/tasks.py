import io
import csv
import time
import multiprocessing
import itertools
import requests
from math import ceil
from web3 import Web3
from celery import shared_task, chord
from django.conf import settings

PAGE_SIZE = 1500
w3 = Web3(
    Web3.HTTPProvider(
        "https://eth-mainnet.alchemyapi.io/v2/NGtUbewnL3eCvtxqJQr_biDfjQjPOCBD"
    )
)


@shared_task
def start_transfer_snapshot(contract_address: str, from_block: int):
    to_block = w3.eth.get_block("latest").number
    pages = ceil((to_block - from_block) / PAGE_SIZE)

    chord(
        (
            gather_events_for_page.s(contract_address, from_block, page)
            for page in range(pages)
        ),
        store_results.s(),
    )()


@shared_task
def gather_events_for_page(contract_address: str, start_block: int, page: int):
    from_block = start_block + (page * PAGE_SIZE)
    to_block = start_block + ((page + 1) * PAGE_SIZE)

    contract = w3.eth.contract(
        address=Web3.toChecksumAddress(contract_address),
        abi=[
            {
                "type": "event",
                "anonymous": False,
                "name": "Transfer",
                "inputs": [
                    {"type": "address", "name": "from", "indexed": True},
                    {"type": "address", "name": "to", "indexed": True},
                    {"type": "uint256", "name": "tokenId", "indexed": True},
                ],
            },
        ],
    )

    event_filter = contract.events.Transfer.createFilter(
        fromBlock=from_block, toBlock=to_block
    )
    entries = event_filter.get_all_entries()

    addresses = []

    for entry in entries:
        from_address = entry.args["from"]
        to_address = entry.args["to"]

        if from_address != "0x0000000000000000000000000000000000000000":
            addresses.append(from_address)
        if to_address != "0x0000000000000000000000000000000000000000":
            addresses.append(to_address)

    return addresses


@shared_task
def store_results(results):
    file = io.StringIO()
    writer = csv.writer(file)

    writer.writerow(["wallet_address"])

    all_addresses = list(set(itertools.chain.from_iterable(results)))

    for address in all_addresses:
        writer.writerow([address])

    pin_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    response = requests.post(
        pin_url,
        files={"file": file.getvalue()},
        headers={
            "Authorization": f"Bearer {settings.PINATA_JWT}"
        },
    )

    print(response.json())
