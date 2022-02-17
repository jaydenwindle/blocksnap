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

PAGE_SIZE = 20000
w3 = Web3(
    Web3.HTTPProvider(
        "https://speedy-nodes-nyc.moralis.io/88bd1896aab0a7a93ae345dc/eth/mainnet/archive",
        request_kwargs={"timeout": 60},
    )
)


@shared_task
def start_transfer_snapshot(contract_address: str, event: str):

    response = requests.get(
        (
            "https://api.etherscan.io/api"
            "?module=account"
            "&action=txlist"
            f"&address={Web3.toChecksumAddress(contract_address)}"
            "&startblock=0"
            "&endblock=99999999"
            "&page=1"
            "&offset=10"
            "&sort=asc"
            f"&apikey={settings.ETHERSCAN_API_KEY}"
        )
    )
    deploy_block_number = int(response.json().get("result")[0].get("blockNumber"))
    print(deploy_block_number)

    to_block = w3.eth.get_block("latest").number
    pages = ceil((to_block - deploy_block_number) / PAGE_SIZE)

    response = requests.get(
        (
            "https://api.etherscan.io/api"
            "?module=contract"
            "&action=getabi"
            f"&address={Web3.toChecksumAddress(contract_address)}"
            f"&apikey={settings.ETHERSCAN_API_KEY}"
        )
    )

    abi = response.json().get("result")
    print(abi)

    chord(
        (
            gather_events_for_page.s(
                contract_address, abi, event, deploy_block_number, page
            )
            for page in range(10)
        ),
        store_results.s(),
    )()


@shared_task
def gather_events_for_page(
    contract_address: str, abi: str, event: str, start_block: int, page: int
):
    from_block = start_block + (page * PAGE_SIZE)
    to_block = start_block + ((page + 1) * PAGE_SIZE)

    contract = w3.eth.contract(
        address=Web3.toChecksumAddress(contract_address),
        abi=abi,
    )

    entries = getattr(contract.events, event).getLogs(
        fromBlock=from_block, toBlock=to_block
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
def store_results(results):
    file = io.StringIO()
    writer = csv.writer(file)

    all_entries = list(itertools.chain.from_iterable(results))

    writer.writerow(list(all_entries[0].keys()))

    for entry in all_entries:
        writer.writerow(entry.values())

    print(file.getvalue())

    pin_url = "https://api.pinata.cloud/pinning/pinFileToIPFS"

    response = requests.post(
        pin_url,
        files={"file": file.getvalue()},
        headers={"Authorization": f"Bearer {settings.PINATA_JWT}"},
    )

    print(response.json())
