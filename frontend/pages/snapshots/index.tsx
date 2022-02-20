import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Text,
  Flex,
} from "@chakra-ui/react";

import { useSIWE, SIWEModal } from "../../components/SIWEProvider";
import Header from "../../components/Header";

const SnapshotList: NextPage = () => {
  const { signature, message } = useSIWE();
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots/`,
    (...args) =>
      fetch(...args, {
        headers: {
          "X-Blocksnap-Auth-Signature": signature || "",
          "X-Blocksnap-Auth-Message": message?.split("\n").join(",") || "",
        },
      }).then((res) => res.json())
  );

  return (
    <>
      <Head>
        <title>Blocksnap - Your Snapshots</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Container maxW="container.lg">
        <Heading pt={24} pb={12}>
          Your Snapshots
        </Heading>

        <SIWEModal />

        <Box>
          {data?.map((snapshot: { id: string }) => (
            <Box
              borderWidth="1px"
              borderRadius="lg"
              overflow="hidden"
              p={4}
              mb={4}
            >
              <Flex
                flexDirection="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Text fontWeight="bold">Snapshot #{snapshot.id}</Text>
                <Link href={`/snapshots/${snapshot.id}`}>
                  <Button>View Snapshot</Button>
                </Link>
              </Flex>
            </Box>
          ))}
        </Box>
      </Container>
    </>
  );
};

export default SnapshotList;
