from web3 import Web3
from eth_account.messages import (
    defunct_hash_message,
    _hash_eip191_message,
    encode_defunct,
)
from siwe.siwe import SiweMessage


class SIWEMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        message = request.META.get("HTTP_X_BLOCKSNAP_AUTH_MESSAGE", "").replace(
            ",", "\n"
        )
        signature = request.META.get("HTTP_X_BLOCKSNAP_AUTH_SIGNATURE")

        if message != "":
            encoded_message = encode_defunct(text=message)
            w3 = Web3()
            address = w3.eth.account.recover_message(
                encoded_message, signature=signature
            )

            request.wallet_address = address

        response = self.get_response(request)

        # Code to be executed for each request/response after
        # the view is called.

        return response
