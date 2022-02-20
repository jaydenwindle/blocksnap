import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";

import { Box, Button, Center, Container, Heading } from "@chakra-ui/react";

import { useSIWE } from "../../components/SIWEProvider";
import Header from "../../components/Header";

const SnapshotList: NextPage = () => {
  const { signature, message } = useSIWE();
  const { data, error } = useSWR(
    `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots/`,
    (...args) => {
      console.log(args);
      return fetch(...args, {
        headers: {
          "X-Blocksnap-Auth-Signature": signature || "",
          "X-Blocksnap-Auth-Message": message?.split("\n").join(",") || "",
        },
      }).then((res) => res.json());
    }
  );

  console.log(data);

  return (
    <>
      <Head>
        <title>Blocksnap - Your Snapshots</title>
        <meta name="description" content="" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />
      <Container maxW="container.lg"></Container>
    </>
  );
};

export default SnapshotList;
