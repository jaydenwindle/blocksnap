import {
  createContext,
  ReactNode,
  useState,
  useContext,
  useEffect,
} from "react";
import { useConnect, useSignMessage } from "wagmi";
import { SiweMessage } from "siwe";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Button,
} from "@chakra-ui/react";

interface SIWEContextType {
  signature?: string;
  message?: string;
  signIn: () => void;
}

const SIWEContext = createContext<SIWEContextType>({} as SIWEContextType);

export function SIWEProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [signature, setSignature] = useState<string | undefined>(undefined);

  const [{ data }, connect] = useConnect();
  const [, signMessage] = useSignMessage();

  const signIn = async () => {
    const { data: connectData } = await connect(data.connectors[0]);
    const signer = await data.connectors[0].getSigner();

    const message = new SiweMessage({
      domain: "https://blocksnap.xyz",
      address: connectData?.account,
      statement: "Sign this message to sign into Blocksnap",
      uri: window.location.origin,
      version: "1",
      chainId: 1,
    });
    const messageToSign = message.prepareMessage();

    const { data: signature } = await signMessage({ message: messageToSign });

    const authData = {
      signature,
      message: messageToSign,
    };

    window.localStorage.setItem("authData", JSON.stringify(authData));
    setMessage(messageToSign);
    setSignature(signature);
  };

  useEffect(() => {
    const data = window.localStorage.getItem("authData");
    window.localStorage.removeItem("authData");
    const parsedData = JSON.parse(data || "null");
    if (parsedData) {
      setMessage(parsedData.message);
      setSignature(parsedData.signature);
    }
  }, []);

  return (
    <SIWEContext.Provider
      value={{
        message,
        signature,
        signIn,
      }}
    >
      {children}
    </SIWEContext.Provider>
  );
}

export function SIWEModal() {
  const { signature, message, signIn } = useSIWE();
  return (
    <Modal
      isOpen={!signature}
      onClose={() => {}}
      isCentered
      closeOnEsc={false}
      closeOnOverlayClick={false}
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>Sign In</ModalHeader>
        <ModalBody>Sign in with your wallet to use Blocksnap</ModalBody>

        <ModalFooter>
          <Button width="full" onClick={signIn}>
            Connect Wallet
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export function useSIWE() {
  return useContext(SIWEContext);
}
