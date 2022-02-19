import hashlib


def hash_args(*args):
    """
    Converts input to string and return keccak hex hash of combined input
    """
    st = ''
    for n in args:
        st = st + str(n)
    sha = hashlib.sha3_256()
    sha.update(st).encode('utf-8')
    return sha.hexdigest()

