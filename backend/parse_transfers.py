import time
from math import ceil
from web3 import Web3
import multiprocessing
import itertools

event_hash = Web3.keccak(text="Transfer(address,address,uint256)").hex()
w3 = Web3(
    Web3.HTTPProvider(
        "https://eth-mainnet.alchemyapi.io/v2/NGtUbewnL3eCvtxqJQr_biDfjQjPOCBD"
    )
)

all_addresses = []


def get_transfers(page: int):
    from_block = start_block + (page * PAGE_SIZE)
    to_block = start_block + ((page + 1) * PAGE_SIZE)

    contract = w3.eth.contract(
        address=Web3.toChecksumAddress("0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D"),
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

    print(page, from_block, to_block)
    event_filter = contract.events.Transfer.createFilter(
        fromBlock=from_block, toBlock=to_block
    )
    entries = event_filter.get_all_entries()
    print(len(entries))

    addresses = []

    for entry in entries:
        from_address = entry.args["from"]
        to_address = entry.args["to"]

        if from_address != "0x0000000000000000000000000000000000000000":
            addresses.append(from_address)
        if to_address != "0x0000000000000000000000000000000000000000":
            addresses.append(to_address)

    return addresses


start_block = 12287507
end_block = w3.eth.get_block("latest").number

PAGE_SIZE = 2000
pages = ceil((end_block - start_block) / PAGE_SIZE)

print(pages)

print(start_block, end_block, end_block - start_block, pages)


if __name__ == "__main__":
    start_time = time.perf_counter()

    pool = multiprocessing.Pool()

    result = pool.map(get_transfers, range(pages))

    all_addresses = list(itertools.chain.from_iterable(result))

    end_time = time.perf_counter()

    print(f"Gathered {len(all_addresses)} addresses in {end_time - start_time} seconds")
    unique_addresses = list(dict.fromkeys(all_addresses))
    print(f"Found {len(unique_addresses)} addresses")
