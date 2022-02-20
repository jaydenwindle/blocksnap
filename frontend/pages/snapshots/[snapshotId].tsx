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
} from "@chakra-ui/react";
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

  const { snapshotId } = router.query;

  const { signature, message, signIn } = useSIWE();

  const [{ data: accountData }] = useAccount({ fetchEns: true });

  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots/${snapshotId}/`,
    fetcher,
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
        <Heading pt={24}>Snapshot #{snapshotId}</Heading>
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
        <Box mb={8}>
          <Text fontWeight="bold" mb={2}>
            Merkle Root:
          </Text>
          <InputGroup size="md">
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
