import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Dialog, StyledCloseIcon } from "components/Dialog";
import { Button } from "components/Button";
import { DateRange } from "rsuite/DateRangePicker";
import { IconWrapper } from "components/IconWrapper";
import { NftPrice } from "components/NFT/nft-card/price";
import { User, CopyNft, Heart, Clock, Package, Credit } from "icons";
import { useHistory, useParams } from "react-router-dom";
import Link from "next/link";
import { toast } from "react-toastify";
import { useTokenBalance } from "../../../../../hooks/useTokenBalance";
import { useBaseTokenInfo } from "../../../../../hooks/useTokenInfo";
import { NftCard } from "components/NFT/nft-card";
import styled from "styled-components";
import {
  NftInfo,
  CW721,
  Marketplace,
  Factory,
  useSdk,
  getRealTokenAmount,
  PaymentToken,
  toMinDenom,
  SALE_TYPE,
  getFileTypeFromURL,
} from "services/nft";
import { RELOAD_STATUS } from "store/types";
import { walletState } from "state/atoms/walletAtoms";
import { useRecoilValue } from "recoil";
import {
  Modal,
  ChakraProvider,
  ModalContent,
  ModalOverlay,
  useDisclosure,
  HStack,
  Text,
  Stack,
  InputGroup,
  InputRightElement,
  Input,
} from "@chakra-ui/react";
import DatePicker from "rsuite/DatePicker";
import { NftDollarPrice } from "components/NFT/nft-card/price";
import { useDispatch, useSelector } from "react-redux";
import { State } from "store/reducers";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { isMobile } from "util/device";

export const OfferModal = ({ nft, handleOffer, collection }) => {
  const { client } = useSdk();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [amount, setAmount] = useState(0);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const proposeNFT = async (e) => {
    const result = await handleOffer(amount);
    if (result) onClose();
  };

  const { isOpen, onOpen, onClose } = useDisclosure();
  const TokenLogo = () => {
    return (
      <TokenLogoWrapper>
        <img src={nft.paymentToken.logoUri} alt="token" width="35px" />
        <Text>{nft.symbol}</Text>
      </TokenLogoWrapper>
    );
  };

  const { balance } = useTokenBalance(nft.paymentToken?.symbol);
  const handleOpen = () => {
    if (!address || !signingClient) {
      toast.error(`Please connect your wallet.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }
    onOpen();
  };
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
        onClick={handleOpen}
      >
        Place Bid
      </Button>

      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />

        <Container>
          <MainWrapper>
            <Stack spacing={10}>
              <Stack>
                <Title>Place a Bid</Title>
                <p>
                  Once your bid is placed, you will be the highest bidder in the
                  auction.Learn more
                </p>
              </Stack>

              <Stack>
                <h1>
                  Minimum Price:{" "}
                  <span style={{ fontWeight: "300" }}>
                    {/* {Number(highestBid) * 1.05 || Number(nft.price)}{" "} */}
                    {nft.symbol}
                  </span>
                </h1>

                <InputGroup>
                  <StyledInput
                    placeholder="Enter amount"
                    type="number"
                    onChange={handleAmountChange}
                    value={amount}
                  />
                  <StyledInputRightElement>
                    <TokenLogo />
                  </StyledInputRightElement>
                </InputGroup>

                <Stack
                  justifyContent="space-between"
                  flexDirection="row"
                  alignItems="center"
                >
                  <h1>Available Balance</h1>
                  <h1>
                    {balance}&nbsp;
                    {nft.symbol}
                  </h1>
                </Stack>
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
                onClick={(e) => {
                  if (amount > balance) return;
                  proposeNFT(e);
                }}
                disabled={amount > balance}
              >
                {amount > balance
                  ? `You Do Not Have Enough ${nft?.symbol}`
                  : "Place Bid"}
              </Button>
            </Stack>
            <CardWrapper>
              <NftCard nft={nft} collection={collection} />
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
  padding: 30px;
  color: white !important;
  overflow: hidden;
  max-width: 1000px !important;
  @media (max-width: 480px) {
    width: 90vw !important;
    padding: 10px;
    max-height: 100vh;
    overflow: auto;
  }
`;
const MainWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  column-gap: 30px;
  p {
    font-size: 20px;
    font-family: Mulish;
  }
  h1 {
    font-size: 20px;
  }
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    p {
      font-size: 14px;
    }
    h1 {
      font-size: 14px;
    }
  }
`;
const CardWrapper = styled.div`
  display: flex;
  width: 434px;
  @media (max-width: 480px) {
    width: 100%;
    height: 100%;
    justify-content: center;
    margin-bottom: 20px;
  }
`;
const StyledInput = styled(Input)`
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px;
  font-size: 30px;
  font-weight: 600;
  background: #272734;
  border-radius: 20px !important;
  display: flex;
  align-items: center;
  height: 70px !important;
`;

const TokenLogoWrapper = styled.div`
  background: rgba(0, 0, 0, 0.2);
  border-radius: 60px;
  padding: 10px 20px 10px 10px;
  display: flex;
  align-items: center;
`;

const StyledInputRightElement = styled.div`
  position: absolute;
  right: 30px;
  top: 8px;
`;
const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;
