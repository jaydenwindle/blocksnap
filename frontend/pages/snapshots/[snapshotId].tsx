import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import {
  Box,
  Center,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tag,
  Button,
  Link,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { EditIcon, CloseIcon, CheckIcon } from "@chakra-ui/icons";
import { ExternalLinkIcon } from "@chakra-ui/icons";

import Papa from "papaparse";
import { useEffect, useState, useRef, useMemo } from "react";
import useSWR from "swr";
import numbro from "numbro";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";
import "buffer";
import { useRouter } from "next/router";

import Header from "../../components/Header";
import fetcher from "../../utils/fetcher";
import { ethers } from "ethers";
import { useSIWE, SIWEModal } from "../../components/SIWEProvider";
import { useAccount } from "wagmi";

const Home: NextPage = () => {
  const router = useRouter();
  const [merkleTree, setMerkleTree] = useState<MerkleTree | null>(null);
  const [addressToSearch, setAddressToSearch] = useState("");
  const [addressIsInTree, setAddressIsInTree] = useState(false);
  const [merkleProof, setMerkleProof] = useState("");

  const { snapshotId } = router.query;

  const { signature, message, signIn } = useSIWE();

  const [{ data: accountData }] = useAccount({ fetchEns: true });

  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots/${snapshotId}/`,
    (...args: string[]) =>
      fetch(args[0] || "", {
        headers: {
          "X-Blocksnap-Auth-Signature": signature || "",
          "X-Blocksnap-Auth-Message": message?.split("\n").join(",") || "",
        },
      }).then((res) => res.json()),
    { refreshInterval: 1000 }
  );

  useEffect(() => {
    const results: Array<any> = [];

    if (data?.addresses_cid) {
      Papa.parse(`https://cloudflare-ipfs.com/ipfs/${data?.addresses_cid}`, {
        download: true,
        skipEmptyLines: true,
        step: (row) => {
          console.log(row.data);
          results.push(row.data);
        },
        complete: () => {
          console.log("done");
          const leafNodes = results.slice(1).map((row) => keccak256(row[0]));

          const merkleTree = new MerkleTree(leafNodes, keccak256, {
            sortPairs: true,
          });

          console.log(merkleTree.toString());

          console.log(merkleTree.getLeaves());

          setMerkleTree(merkleTree);
        },
      });
    }
  }, [data?.addresses_cid]);

  useEffect(() => {
    if (
      data?.creator &&
      accountData?.address &&
      accountData?.address !== data?.creator &&
      !data?.public
    ) {
      router.replace("/");
    }
  }, [accountData?.address, data?.creator]);

  useEffect(() => {
    if (merkleTree && addressToSearch) {
      const leaf = keccak256(addressToSearch);
      const proof = merkleTree.getProof(leaf);
      const hexProof = merkleTree.getHexProof(leaf);

      console.log(proof);
      console.log(hexProof);
      console.log(MerkleTree.marshalProof(hexProof));

      const isInTree = merkleTree.verify(hexProof, leaf, merkleTree.getRoot());

      setAddressIsInTree(isInTree);
      setMerkleProof(MerkleTree.marshalProof(hexProof));
    }
  }, [merkleTree, addressToSearch]);

  return (
    <>
      <Header />
      <Container maxW="container.lg">
        <SIWEModal />
        <Modal
          isOpen={
            data && signature && (!data?.addresses_cid || !data?.events_cid)
          }
          isCentered
          onClose={() => {}}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader textAlign="center">Generating snapshot...</ModalHeader>
            <ModalBody pb={8}>
              <Center>
                <Spinner />
              </Center>
            </ModalBody>
          </ModalContent>
        </Modal>
        {data?.name ? (
          <Heading pt={24}>{data?.name}</Heading>
        ) : (
          <Heading pt={24}>Snapshot #{snapshotId}</Heading>
        )}
        {data?.description && <Text>{data?.description}</Text>}
        <Box pb={8} pt={4}>
          <Tag mr={4} mb={4}>
            Contract address: {data?.contract_address}
          </Tag>
          <Tag mr={4} mb={4}>
            Chain: {data?.chain}
          </Tag>
          <Tag mr={4} mb={4}>
            Block Range: {data?.from_block}-{data?.to_block}
          </Tag>
          <Tag mr={4} mb={4}>
            Event: {data?.event?.name}
          </Tag>
          <Tag mr={4} mb={4}>
            Min Token Balance: {data?.token_balance}
          </Tag>
        </Box>
        <Box mb={12}>
          <Text fontWeight="bold" mb={2}>
            Merkle Root:
          </Text>
          <InputGroup size="md" mb={4}>
            <Input
              value={merkleTree?.getRoot().toString("hex") || "loading..."}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    merkleTree?.getRoot().toString("hex") || ""
                  );
                }}
              >
                Copy
              </Button>
            </InputRightElement>
          </InputGroup>
          <Text fontWeight="bold" mb={2}>
            Search for address:
          </Text>
          <InputGroup size="md">
            <Input
              value={addressToSearch}
              onChange={(e) => {
                setAddressToSearch(e.target.value);
              }}
            />
          </InputGroup>
          {addressToSearch !== "" && addressIsInTree && (
            <Text mb={2} mt={2}>
              <CheckIcon mr={2} />
              Address exists in merkle tree!
              <Button
                ml={2}
                h="1.75rem"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(merkleProof || "");
                }}
              >
                Copy Proof
              </Button>
            </Text>
          )}
          {addressToSearch !== "" && !addressIsInTree && (
            <Text mb={2} mt={2}>
              <CloseIcon mr={2} />
              Address does not exist in merkle tree
            </Text>
          )}
          <Text></Text>
        </Box>
        <Box>
          <Link
            href={`https://cloudflare-ipfs.com/ipfs/${data?.addresses_cid}`}
            isExternal
          >
            <Button mr={4}>
              Wallets (
              {data?.addresses_count < 1000
                ? data?.addresses_count
                : numbro(data?.addresses_count || 0).format({
                    average: true,
                  })}{" "}
              records) <ExternalLinkIcon mx="2px" ml={2} />
            </Button>
          </Link>
          <Link
            href={`https://cloudflare-ipfs.com/ipfs/${data?.events_cid}`}
            isExternal
          >
            <Button onClick={() => {}}>
              Events (
              {data?.events_count < 1000
                ? data?.events_count
                : numbro(data?.events_count || 0).format({
                    average: true,
                  })}{" "}
              records) <ExternalLinkIcon mx="2px" ml={2} />
            </Button>
          </Link>
        </Box>
      </Container>
    </>
  );
};

export default Home;
