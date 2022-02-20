import { Box, Button, Container, Flex } from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useSIWE } from "../components/SIWEProvider";

export default function Header() {
  const { signIn } = useSIWE();
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
          {accountData && <Button onClick={signIn}>{displayName}</Button>}
          {!accountData && <Button onClick={signIn}>Connect</Button>}
        </Flex>
      </Box>
    </Container>
  );
}
