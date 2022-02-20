import { Box, Button, Container, Flex } from "@chakra-ui/react";
import { useAccount, useConnect } from "wagmi";

export default function Header() {
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
