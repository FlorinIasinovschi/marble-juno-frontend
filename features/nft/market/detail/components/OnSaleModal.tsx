import { useState, useCallback, useEffect, useMemo, useRef } from "react";
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
  Flex,
} from "@chakra-ui/react";
import Select, { components } from "react-select";
import { Button } from "components/Button";
import styled from "styled-components";
import { NftCard } from "components/NFT/nft-card";
import { isMobile } from "util/device";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  NftInfo,
  CW721,
  Marketplace,
  Factory,
  useSdk,
  toMinDenom,
  DurationType,
  PaymentToken,
  getRealTokenAmount,
  SALE_TYPE,
  getFileTypeFromURL,
} from "services/nft";
import { walletState } from "state/atoms/walletAtoms";
import { useRecoilValue } from "recoil";
import { toast } from "react-toastify";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

let today = new Date();

const OnSaleModal = ({ nft, collection, handleSale, paymentTokens }) => {
  const { Option } = components;
  const IconOption = (props) => (
    <Option {...props}>
      <HStack>
        <img src={props.data.logoUri} style={{ width: "30px" }} alt="img" />
        <Text>{props.data.symbol}</Text>
      </HStack>
    </Option>
  );

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "50px",
      borderRadius: "10px",
      border: "1px solid rgba(255, 255, 255, 0.2) !important",
      background: "#272734",
      color: "#FFFFFF",
      " div:last-child": {
        height: "100%",
        alignItems: "center",
      },
    }),
    menuList: (base, state) => ({
      ...base,
      background: "#272734",
    }),
    option: (base, state) => ({
      ...base,
      color: "white",
      background: "#272734",
      borderRadius: "20px",
      ":hover": {
        background: "#272734",
        opacity: "0.8",
      },
    }),
    singleValue: (base, state) => ({
      ...base,
      color: "white",
    }),
    valueContainer: (base, state) => ({
      ...base,
      display: "flex",
    }),
    menu: (base, state) => ({
      ...base,
      zIndex: "10",
    }),
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [price, setPrice] = useState("");
  const [reserverPrice, setReserverPrice] = useState("");
  const [sellType, setSellType] = useState(SALE_TYPE[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priceSelectedOption, setPriceSelectedOption] = useState(0);
  const onPriceOptionClicked = (value) => {
    setPriceSelectedOption(paymentTokens.indexOf(value));
  };
  const startSale = async () => {
    if (price === "") {
      toast.warning(`Please input a price.`, {
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
    if (sellType === SALE_TYPE[1]) {
      if (startDate === "") {
        toast.warning(`Please input a start date.`, {
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
      if (endDate === "") {
        toast.warning(`Please input a end date.`, {
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

      if (
        new Date(endDate).getTime() < Date.now() ||
        new Date(endDate).getTime() < new Date(startDate).getTime()
      ) {
        toast.warning(`Wrong Time`, {
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
    }
    const _reserve_price =
      Number(reserverPrice) < Number(price) ? price : reserverPrice;
    const result = await handleSale({
      sellType,
      price,
      _reserve_price,
      startDate,
      endDate,
      paymentToken: paymentTokens[priceSelectedOption],
    });
    if (result) onClose();
  };

  return (
    <>
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
        // disabled={true}
        onClick={onOpen}
      >
        Sell Your NFT
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
            <Stack spacing={isMobile() ? 3 : 4}>
              <Stack textAlign="center">
                <Title>Sell Your NFT</Title>
              </Stack>

              <Stack
                direction="row"
                spacing={isMobile() ? 5 : 20}
                justifyContent="center"
                alignItems="center"
              >
                <StyledRadio
                  onClick={(e) => setSellType(SALE_TYPE[0])}
                  isActive={sellType == SALE_TYPE[0]}
                >
                  <h1>Fixed Sale</h1>
                  <p>Fixed price to buy</p>
                </StyledRadio>
                <StyledRadio
                  onClick={(e) => setSellType(SALE_TYPE[1])}
                  isActive={sellType == SALE_TYPE[1]}
                >
                  <h1>Auction</h1>
                  <p>The highest offer wins the auction.</p>
                </StyledRadio>
              </Stack>

              <Stack>
                <Text fontSize="14px">Payment Token</Text>

                {paymentTokens !== undefined && paymentTokens.length > 0 && (
                  <Select
                    defaultValue={paymentTokens[0]}
                    options={paymentTokens}
                    components={{
                      Option: IconOption,
                      SingleValue: IconOption,
                      IndicatorSeparator: () => null,
                      // Input: () => null,
                    }}
                    styles={customStyles}
                    onChange={(e) => {
                      onPriceOptionClicked(e);
                    }}
                  />
                )}
              </Stack>

              <Stack direction="row" alignItems="center" marginTop="20px">
                <Stack spacing={4} style={{ padding: "5px 0" }} width="100%">
                  <Flex gap={8} flexDirection={isMobile() ? "column" : "row"}>
                    <Stack
                      width={
                        !(sellType == SALE_TYPE[1]) || isMobile()
                          ? "100%"
                          : "50%"
                      }
                    >
                      <Text marginLeft="20px">Price</Text>
                      <StyledInput
                        placeholder="Type your value"
                        type="number"
                        onChange={(e) => setPrice(e.target.value)}
                      />
                    </Stack>
                    {sellType == SALE_TYPE[1] && (
                      <Stack width={isMobile() ? "100%" : "50%"}>
                        <Text marginLeft="20px">Reserve Price</Text>
                        <StyledInput
                          placeholder="Type your value"
                          type="number"
                          onChange={(e) => setReserverPrice(e.target.value)}
                        />
                      </Stack>
                    )}
                  </Flex>

                  {sellType == SALE_TYPE[1] && (
                    <Flex gap={8} flexDirection={isMobile() ? "column" : "row"}>
                      <Stack width={isMobile() ? "100%" : "50%"}>
                        <Text marginLeft="20px">Start at</Text>
                        <StyledInput
                          placeholder="Type your value"
                          type="datetime-local"
                          // value={startDate.toISOString()}
                          onChange={(e) => setStartDate(e.target.value)}
                        />
                      </Stack>

                      <Stack width={isMobile() ? "100%" : "50%"}>
                        <Text marginLeft="20px">End at</Text>
                        <StyledInput
                          placeholder="Type your value"
                          type="datetime-local"
                          onChange={(e) => setEndDate(e.target.value)}
                        />
                      </Stack>
                    </Flex>
                  )}
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
                size="medium"
                onClick={startSale}
              >
                Put On Sale
              </Button>
              <Text margin="10px 0 0 0" fontSize={isMobile() ? "14px" : "16px"}>
                5% transaction fee goes to treasury wallet
              </Text>
            </Stack>

            <CardWrapper>
              <NftCard nft={nft} collection={collection} />
            </CardWrapper>
          </MainWrapper>
        </Container>
      </Modal>
    </>
  );
};

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
const Container = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 20px;
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
  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;
const StyledRadio = styled.div<{ isActive: boolean }>`
  color: ${({ isActive }) => (isActive ? "black" : "white")};
  border-radius: 16px;
  box-shadow: ${({ isActive }) =>
    isActive
      ? "0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 8px rgba(0, 0, 0, 0.2)"
      : "inset 0px 7px 8px rgba(0, 0, 0, 0.2)"};
  border: ${({ isActive }) => (isActive ? "" : "1px solid #FFFFFF")};
  padding: 30px;
  width: 200px;
  height: 80px;
  cursor: pointer;
  background: ${({ isActive }) => (isActive ? "#FFFFFF" : "")};
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h1 {
    font-size: 22px;
    font-weight: 700;
  }
  p {
    font-size: 14px;
    font-family: Mulish;
    text-align: center;
  }
  @media (max-width: 480px) {
    width: 50%;
    padding: 15px;
    h1 {
      font-size: 20px;
    }
    p {
      font-size: 12px;
    }
  }
`;

const StyledInput = styled(Input)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: #272734 !important;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09) !important;
  backdrop-filter: blur(40px) !important;
  border-radius: 10px !important;
  height: 50px !important;
`;

const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export default OnSaleModal;
