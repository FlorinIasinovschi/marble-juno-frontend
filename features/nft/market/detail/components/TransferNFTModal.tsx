import React, { useState } from "react";
import {
  Modal,
  ChakraProvider,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  HStack,
  Text,
  Stack,
  Input,
} from "@chakra-ui/react";
import { toast } from "react-toastify";
import { Button } from "components/Button";
import styled from "styled-components";
import { NftCard } from "components/NFT/nft-card";
import { isMobile } from "util/device";
import { StyledCloseIcon } from "components/Dialog";

const TransferNFTModal = ({ nft, collection, onHandle }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [address, setAddress] = useState("");
  return (
    <ChakraProvider>
      <Button
        className="btn-buy btn-default"
        css={{
          background: "$white",
          color: "$black",
          stroke: "$black",
          width: "100%",
        }}
        variant="primary"
        size="large"
        onClick={onOpen}
      >
        Transfer NFT
      </Button>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
        <Container>
          <StyledCloseIcon onClick={onClose} offset={20} size="40px" />
          <MainWrapper>
            <Stack spacing={10} width={isMobile() ? "100%" : "55%"}>
              <Stack>
                <Title>Transfer NFT</Title>
                <p>
                  Transfer the NFT to another user or wallet by entering a valid
                  address below
                </p>
              </Stack>
              <Stack>
                <StyledInput
                  onChange={(e) => setAddress(e.target.value)}
                  value={address}
                />
              </Stack>
              <Button
                className="btn-buy btn-default"
                css={{
                  background: "$white",
                  color: "$black",
                  stroke: "$black",
                  width: "100%",
                }}
                variant="primary"
                size="large"
                onClick={async () => {
                  const result = await onHandle(address);
                  if (result) {
                    toast.success(`Transaction Success!`, {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    });
                    onClose();
                  } else
                    toast.error(`Transaction Failed. Try it again`, {
                      position: "top-right",
                      autoClose: 5000,
                      hideProgressBar: true,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    });
                }}
              >
                Transfer NFT
              </Button>
            </Stack>
            <CardWrapper>
              <NftCard nft={nft} collection={collection} id="" />
            </CardWrapper>
          </MainWrapper>
        </Container>
      </Modal>
    </ChakraProvider>
  );
};

const Container = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 50px;
  color: white !important;
  overflow: hidden;
  max-width: 1000px !important;
  @media (max-width: 480px) {
    width: 90vw !important;
    padding: 10px;
    max-height: 100vh;
    overflow: auto;
    border-radius: 10px !important;
  }
`;
const MainWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: start;
  column-gap: 30px;
  p {
    font-size: 20px;
    font-family: Mulish;
  }
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    p {
      font-size: 14px;
    }
  }
`;
const CardWrapper = styled.div`
  display: flex;
  height: 406px;
  width: 300px;
  @media (max-width: 480px) {
    width: 100%;
    height: 100%;
    justify-content: center;
    margin-bottom: 20px;
  }
`;
const StyledInput = styled.input`
  padding: 15px;
  font-size: 20px;
  font-weight: 600;
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09);
  backdrop-filter: blur(40px);
  /* Note: backdrop-filter has minimal browser support */
  font-family: Mulish;
  border-radius: 20px;
  height: 70px;
`;
const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;
export default TransferNFTModal;
