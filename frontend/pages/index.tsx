import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Text,
} from "@chakra-ui/react";

import Header from "../components/Header";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Blocksnap - On-chain Data Snapshots Made Easy</title>
        <meta
          name="description"
          content="Blocksnap makes it easy to capture point-in-time snapshots of blockchain data to power allowlist, airdrops, and data analysis"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Container maxW="container.lg">
        <Box pt={24} pb={24}>
          <Center flexDirection="column">
            <Heading mb={8}>On-chain Data Snapshots Made Easy</Heading>
            <Text fontSize="lg" textAlign="center" mb={8}>
              Capture point-in-time snapshots of blockchain data <br></br> to
              power allowlist, airdrops, and data analysis
            </Text>
            <Link href="/snapshots/new">
              <Button>Create a Snapshot</Button>
            </Link>
          </Center>
        </Box>
      </Container>
    </>
  );
};

export default Home;
