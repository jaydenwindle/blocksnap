import { useEffect, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import useSWR from "swr";

import Papa from "papaparse";

import {
  ChakraProvider,
  Box,
  Container,
  Heading,
  Button,
  Flex,
  Center,
  DarkMode,
  HStack,
  useRadio,
  useRadioGroup,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
  Select,
  Textarea,
  Code,
  Stack,
  Checkbox,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Radio,
  RadioGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Tag,
  Text,
  Divider,
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
} from "@chakra-ui/react";
import {
  Provider as WagmiProvider,
  useAccount,
  useConnect,
  erc1155ABI,
  erc20ABI,
  erc721ABI,
} from "wagmi";
import { useForm } from "react-hook-form";

const fetcher = (...args) => fetch(...args).then((res) => res.json());
const textFetcher = (...args) => fetch(...args).then((res) => res.json());

function Header() {
  const [{ data }, connect] = useConnect();
  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  const displayName = accountData?.ens?.name
    ? accountData?.ens?.name
    : `${accountData?.address.slice(0, 6)}...${accountData?.address.slice(-4)}`;

  return (
    <Container maxW="container.lg">
      <Box pt={4} pb={4}>
        <Flex justify="space-between" align="center">
          <Box w={10} h={10} background="#22303E" rounded="full" />
          {accountData && (
            <Button onClick={() => disconnect()}>{displayName}</Button>
          )}
          {!accountData && (
            <Button onClick={() => connect(data.connectors[0])}>Connect</Button>
          )}
        </Flex>
      </Box>
    </Container>
  );
}

function Home() {
  return (
    <>
      <Header />
      <Container maxW="container.lg">
        <Box pt={24} pb={24}>
          <Center flexDirection="column">
            <Heading mb={8}>Make sense of your on-chain data</Heading>
            <Link to="/snapshots/new">
              <Button>Create a Snapshot</Button>
            </Link>
          </Center>
        </Box>
      </Container>
    </>
  );
}

function NewSnapshot() {
  const chains = [
    "ETH Mainnet",
    "Polygon",
    "Arbitrum",
    "Avalanche",
    "Fantom",
    "BSC",
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [{ data: accountData }, disconnect] = useAccount({
    fetchEns: true,
  });

  let navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log(data);

    data.creator = accountData?.address;
    const { contract_abi, event } = data;
    data.contract_abi = JSON.parse(contract_abi);
    data.event = JSON.parse(event);
    const response = await fetch("http://localhost:8000/api/snapshots/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    const result = await response.json();
    console.log(result);

    const { id } = result;

    navigate(`/snapshots/${id}`);
  };

  const contractAbi = watch("contract_abi");
  const event = watch("event");

  const events = JSON.parse(contractAbi || "[]").filter(
    (item) => item.type === "event"
  );

  return (
    <>
      <Header />
      <Container maxW="container.lg">
        <Heading pt={24} pb={12}>
          Create a snapshot
        </Heading>

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
            HolderSnap will query data from this chain to create your snapshot
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
        {/* <FormControl mb={8}>
          <FormLabel htmlFor="contractType">Contract Type</FormLabel>
          <RadioGroup id="contractType">
            <Stack direction="row">
              {contractTypes.map((value) => (
                <Radio key={value} value={value} {...register("contractType")}>
                  {value}
                </Radio>
              ))}
            </Stack>
          </RadioGroup>
        </FormControl> */}
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
              {events.map((event) => (
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
            {JSON.parse(event).inputs.map((input) => (
              <FormControl mb={8}>
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
              </FormControl>
            ))}
            <FormControl mb={8}>
              <FormLabel>From Block Number</FormLabel>
              <Flex flexDirection="row">
                <Input {...register("from_block")} />
              </Flex>
            </FormControl>
            <FormControl mb={8}>
              <FormLabel>To Block Number</FormLabel>
              <Flex flexDirection="row">
                <Input {...register("to_block")} />
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
}

function Snapshot() {
  let params = useParams();
  const [addresses, setAddresses] = useState([]);
  const [events, setEvents] = useState([]);
  const { data, error } = useSWR(
    `http://localhost:8000/api/snapshots/${params.snapshotId}`,
    fetcher
  );

  useEffect(() => {
    if (data?.addresses_cid) {
      console.log(`https://cloudflare-ipfs.com/ipfs/${data.addresses_cid}`);
      Papa.parse(`https://cloudflare-ipfs.com/ipfs/${data.addresses_cid}`, {
        download: true,
        worker: true,
        header: true,
        // step: (row) => {
        //   console.log(row.data);
        //   setAddresses((prev) => [...prev, row.data]);
        // },
        error: (err) => console.log(err),
        complete: (results) => {
          setAddresses(results.data);
        },
      });
    }
  }, [data?.addresses_cid]);

  useEffect(() => {
    if (data?.events_cid) {
      console.log(`https://cloudflare-ipfs.com/ipfs/${data.events_cid}`);
      Papa.parse(`https://cloudflare-ipfs.com/ipfs/${data.events_cid}`, {
        download: true,
        worker: true,
        header: true,
        // step: (row) => {
        //   console.log(row.data);
        //   setEvents((prev) => [...prev, row.data]);
        // },
        error: (err) => console.log(err),
        complete: (results) => {
          setEvents(results.data);
        },
      });
    }
  }, [data?.events_cid]);

  console.log(params, data, addresses);

  return (
    <>
      <Header />
      <Container maxW="container.lg">
        <Heading pt={24}>Snapshot #{params.snapshotId}</Heading>
        <Box pb={12} pt={4}>
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
            Event: {data?.event.name}
          </Tag>
        </Box>
        <Tabs>
          <TabList>
            <Tab>
              Addresses <Tag ml={2}>{data?.addresses_count}</Tag>
            </Tab>
            <Tab>
              Events <Tag ml={2}>{data?.events_count}</Tag>
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel pl={0} pr={0}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {Object.keys(addresses?.[0] || {}).map((key) => (
                      <Th>{key}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {addresses.map((address) => (
                    <Tr>
                      {Object.keys(address).map((key) => (
                        <Td>{address[key]}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
            <TabPanel pl={0} pr={0} overflow={"scroll"}>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {Object.keys(events?.[0] || {}).map((key) => (
                      <Th>{key}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {events.map((event) => (
                    <Tr>
                      {Object.keys(event).map((key) => (
                        <Td>{event[key]}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </>
  );
}

function App() {
  return (
    <WagmiProvider autoConnect>
      <ChakraProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/snapshots/:snapshotId" element={<Snapshot />} />
            <Route path="/snapshots/new" element={<NewSnapshot />} />
          </Routes>
        </HashRouter>
      </ChakraProvider>
    </WagmiProvider>
  );
}

export default App;
