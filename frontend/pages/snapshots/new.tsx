import {
  Box,
  Button,
  Checkbox,
  Code,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Textarea,
  Text,
  Tag,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import Header from "../../components/Header";
import { useSIWE, SIWEModal } from "../../components/SIWEProvider";
import { useEffect } from "react";
import { useAccount } from "wagmi";

import { ethers } from "ethers";

const Home: NextPage = () => {
  const chains = ["ETH Mainnet", "Polygon", "Arbitrum", "Optimism"];

  const getProviderForChain = (chain: string): string | null => {
    switch (chain) {
      case "ETH Mainnet":
        return `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      case "Polygon":
        return `https://polygon-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      case "Arbitrum":
        return `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      case "Optimism":
        return `https://opt-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`;
      default:
        return null;
    }
  };

  const getBlockApiForChain = (chain: string): string | null => {
    switch (chain) {
      case "ETH Mainnet":
        return `https://api.etherscan.io/api?apikey=${process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY}`;
      case "Polygon":
        return `https://api.polygonscan.com/api?apikey=${process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY}`;
      case "Arbitrum":
        return `https://api.arbiscan.io/api?apikey=${process.env.NEXT_PUBLIC_ARBISCAN_API_KEY}`;
      case "Optimism":
        return `https://api-optimistic.etherscan.io/api?apikey=${process.env.NEXT_PUBLIC_OPTIMISM_API_KEY}`;
      default:
        return null;
    }
  };

  const { signature, message, signIn } = useSIWE();

  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const router = useRouter();

  const onSubmit = async (data: any) => {
    console.log(data);

    const { contract_abi, event } = data;
    data.contract_abi = JSON.parse(contract_abi);
    data.event = JSON.parse(event);
    data.rpc_url = getProviderForChain(data.chain) || "";

    data.token_balance = data.token_balance || 0;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/snapshots/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Blocksnap-Auth-Signature": signature || "",
          "X-Blocksnap-Auth-Message": message?.split("\n").join(",") || "",
        },
        body: JSON.stringify(data),
      }
    );
    const result = await response.json();
    console.log(result);

    const { id } = result;

    router.push(`/snapshots/${id}`);
  };

  const chain = watch("chain");
  const contractAbi = watch("contract_abi");
  const event = watch("event");
  const contractAddress = watch("contract_address");

  const events = JSON.parse(contractAbi || "[]").filter(
    (item: { type: string }) => item.type === "event"
  );
  const supportsTokenBalance =
    JSON.parse(contractAbi || "[]").filter(
      (item: { type: string; name: string }) =>
        item.type === "function" && item.name === "balanceOf"
    ).length > 0;

  useEffect(() => {
    async function getContractFirstTransaction() {
      if (contractAddress && getBlockApiForChain(chain)) {
        const apiUrl = getBlockApiForChain(chain);
        const response = await fetch(
          `${apiUrl}&module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc`
        );

        const data = await response.json();

        const [firstTx] = data?.result || [];

        if (firstTx?.blockNumber) {
          setValue("from_block", firstTx.blockNumber);
        } else {
          setValue("from_block", "");
        }
      }
    }

    async function getContractAbi() {
      if (contractAddress && getBlockApiForChain(chain)) {
        const apiUrl = getBlockApiForChain(chain);
        const response = await fetch(
          `${apiUrl}&module=contract&action=getabi&address=${contractAddress}`
        );

        const data = await response.json();

        if (!data?.result?.includes("not verified")) {
          setValue("contract_abi", data.result);
        } else {
          setValue("contract_abi", "");
        }
      }
    }

    getContractFirstTransaction();
    getContractAbi();
  }, [contractAddress, chain]);

  useEffect(() => {
    async function getBlockNumberForChain() {
      const providerUrl = getProviderForChain(chain);
      if (providerUrl) {
        const provider = new ethers.providers.JsonRpcProvider(providerUrl);

        setValue("to_block", await provider.getBlockNumber());
      }
    }

    getBlockNumberForChain();
  }, [chain]);

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <Container maxW="container.lg">
        <Heading pt={24} pb={12}>
          Create a snapshot
        </Heading>

        <SIWEModal />

        <FormControl mb={8}>
          <FormLabel htmlFor="chain">Chain</FormLabel>
          <RadioGroup id="chain" defaultValue={"ETH Mainnet"}>
            <Stack direction="row">
              {chains.map((value) => (
                <Radio key={value} value={value} {...register("chain")}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
          <FormHelperText>
            Blocksnap will query data from this chain to create your snapshot
          </FormHelperText>
        </FormControl>
        <FormControl mb={8}>
          <FormLabel htmlFor="contract_address">Contract Address</FormLabel>
          <Input
            id="contract_address"
            {...register("contract_address")}
            placeholder="0x..."
          />
        </FormControl>
        <FormControl mb={8}>
          <FormLabel htmlFor="contract_abi">Contract ABI</FormLabel>
          <Textarea
            id="contract_abi"
            placeholder="[...]"
            {...register("contract_abi")}
          />
        </FormControl>
        {events.length > 0 && (
          <FormControl mb={8}>
            <FormLabel htmlFor="event">Event</FormLabel>
            <Select
              id="event"
              placeholder="Select event"
              {...register("event")}
            >
              {events.map((event: { name: string }) => (
                <option key={event.name} value={JSON.stringify(event)}>
                  {event.name}
                </option>
              ))}
            </Select>
            <FormHelperText>
              Specify the event you would like to query
            </FormHelperText>
          </FormControl>
        )}
        {event && (
          <>
            <Heading fontSize="xl" mb={4} mt={4}>
              Filter Events
            </Heading>
            {JSON.parse(event).inputs.map(
              (input: { name: string; type: string }) => (
                <FormControl key={input.name} mb={8}>
                  <FormLabel>
                    {input.name} (<Code>{input.type}</Code>)
                  </FormLabel>
                  <Flex flexDirection="row">
                    <Input {...register(`argument_filters.${input.name}`)} />
                    {input.type === "address" && (
                      <Checkbox
                        {...register(`captured_values.${input.name}`)}
                        ml={4}
                      >
                        Capture
                      </Checkbox>
                    )}
                  </Flex>
                  {input.type === "address" && (
                    <Flex flexDirection="row" mt={2}>
                      <Button
                        mr={2}
                        h="1.75rem"
                        size="sm"
                        onClick={() => {
                          setValue(
                            `argument_filters.${input.name}`,
                            "0x0000000000000000000000000000000000000000"
                          );
                        }}
                      >
                        Null Address (0x00..00)
                      </Button>
                      <Button
                        h="1.75rem"
                        size="sm"
                        onClick={() => {
                          setValue(
                            `argument_filters.${input.name}`,
                            accountData?.address
                          );
                        }}
                      >
                        My Address (
                        {`${accountData?.address.slice(
                          0,
                          6
                        )}...${accountData?.address.slice(-4)}`}
                        )
                      </Button>
                    </Flex>
                  )}
                </FormControl>
              )
            )}
            {supportsTokenBalance && (
              <FormControl mb={8}>
                <FormLabel>Minimum Token Balance</FormLabel>
                <Flex flexDirection="row">
                  <Input
                    {...register("token_balance", { valueAsNumber: true })}
                  />
                </Flex>
              </FormControl>
            )}
            <FormControl mb={8}>
              <FormLabel>From Block Number</FormLabel>
              <Flex flexDirection="row">
                <Input {...register("from_block", { valueAsNumber: true })} />
              </Flex>
            </FormControl>
            <FormControl mb={8}>
              <FormLabel>To Block Number</FormLabel>
              <Flex flexDirection="row">
                <Input {...register("to_block", { valueAsNumber: true })} />
              </Flex>
            </FormControl>
          </>
        )}
        <Box mb={24}>
          <Button
            isDisabled={!contractAbi || !event}
            onClick={handleSubmit(onSubmit)}
          >
            Generate Snapshot
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Home;
