import { useEffect } from "react";
import { HashRouter, Routes, Route, Link } from "react-router-dom";
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

function RadioCard(props) {
  const { getInputProps, getCheckboxProps } = useRadio(props);

  const input = getInputProps();
  const checkbox = getCheckboxProps();

  return (
    <Box as="label">
      <input {...input} />
      <Box
        {...checkbox}
        cursor="pointer"
        borderWidth="1px"
        borderRadius="md"
        boxShadow="md"
        _checked={{
          bg: "gray.700",
          color: "white",
          borderColor: "teal.600",
        }}
        _focus={{
          boxShadow: "outline",
        }}
        px={5}
        py={3}
      >
        {props.children}
      </Box>
    </Box>
  );
}

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
  const contractTypes = ["ERC721", "ERC1155", "ERC20", "Custom"];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const contractAbi = watch("contractAbi");
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
          <FormLabel htmlFor="contractAbi">Contract ABI</FormLabel>
          <Textarea
            id="contractAbi"
            placeholder="[...]"
            {...register("contractAbi")}
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
                  <Input
                    {...register(`event_args.${input.name}`)}
                    isDisabled={!input.indexed}
                  />
                  {input.type === "address" && (
                    <Checkbox
                      {...register(`captured_args.${input.name}`)}
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
          <Button isDisabled={!contractAbi || !event}>Generate Snapshot</Button>
        </Box>
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
            <Route path="/snapshots/new" element={<NewSnapshot />} />
          </Routes>
        </HashRouter>
      </ChakraProvider>
    </WagmiProvider>
  );
}

export default App;
