import time
from math import ceil
from web3 import Web3
import multiprocessing
import itertools

event_hash = Web3.keccak(text="Transfer(address,address,uint256)").hex()
w3 = Web3(
    Web3.HTTPProvider(
        "https://speedy-nodes-nyc.moralis.io/88bd1896aab0a7a93ae345dc/eth/mainnet/archive",
        request_kwargs={"timeout": 60},
    )
)

all_addresses = []


def get_transfers(page: int):
    from_block = start_block + (page * PAGE_SIZE)
    to_block = start_block + ((page + 1) * PAGE_SIZE)

    contract = w3.eth.contract(
        address=Web3.toChecksumAddress("0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85"),
        abi=[
            {
                "anonymous": False,
                "inputs": [
                    {
                        "indexed": True,
                        "internalType": "address",
                        "name": "from",
                        "type": "address",
                    },
                    {
                        "indexed": True,
                        "internalType": "address",
                        "name": "to",
                        "type": "address",
                    },
                    {
                        "indexed": True,
                        "internalType": "uint256",
                        "name": "tokenId",
                        "type": "uint256",
                    },
                ],
                "name": "Transfer",
                "type": "event",
            },
        ],
    )

    entries = getattr(contract.events, "Transfer").getLogs(
        fromBlock=from_block, toBlock=to_block
    )
    print(f"Page {page}/{pages}: {len(entries)} entries")

    addresses = []

    for entry in entries:
        from_address = entry.args["from"]
        to_address = entry.args["to"]

        if from_address != "0x0000000000000000000000000000000000000000":
            addresses.append(from_address)
        if to_address != "0x0000000000000000000000000000000000000000":
            addresses.append(to_address)

    return addresses


start_block = 9380410
end_block = w3.eth.get_block("latest").number

PAGE_SIZE = 1000
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
