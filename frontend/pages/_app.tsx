import { ChakraProvider } from "@chakra-ui/react";
import { Provider as WagmiProvider } from "wagmi";
import type { AppProps } from "next/app";
import { SIWEProvider } from "../components/SIWEProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider autoConnect>
      <ChakraProvider>
        <SIWEProvider>
          <Component {...pageProps} />
        </SIWEProvider>
      </ChakraProvider>
    </WagmiProvider>
  );
}

export default MyApp;
