import * as React from "react";
import { useState, useCallback, useEffect, useMemo } from "react";
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
import { DateRange } from "rsuite/DateRangePicker";
import { isMobile } from "util/device";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  NftInfo,
  CW721,
  Collection,
  Market,
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
import DateRangePicker from "rsuite/DateRangePicker";
import { toast } from "react-toastify";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

let today = new Date();

const OnSaleModal = ({ collectionId, id, handleEvent }) => {
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
  const { client } = useSdk();
  const { address, client: signingClient } = useRecoilValue(walletState);

  const [isJsonUploading, setJsonUploading] = useState(false);

  const [nft, setNft] = useState<NftInfo>({
    tokenId: id,
    address: "",
    image: "",
    name: "",
    user: "",
    price: "0",
    total: 2,
    collectionName: "",
    symbol: "MARBLE",
    sale: {},
    paymentToken: {},
    type: "image",
    created: "",
    collectionId: 0,
  });
  const [royalties, setRoyalties] = useState([{ address: "", rate: 0 }]);
  const [inputFields, setInputFields] = useState([{ address: "", rate: 0 }]);
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [price, setPrice] = useState("");
  const [priceDollar, setPriceDollar] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [reserverPrice, setReserverPrice] = useState("");

  const [maximumRoyaltyFee, setMaximumRoyaltyFee] = useState(1);
  const [supply, setSupply] = useState("1");
  const [sellType, setSellType] = useState(SALE_TYPE[0]);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);

  const [duration, setDuration] = useState<DateRange>([
    today,
    new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
  ]);

  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const togglingPrice = () => setIsPriceOpen(!isPriceOpen);
  const [priceSelectedOption, setPriceSelectedOption] = useState(0);
  const [isSellingPriceOpen, setIsSellingPriceOpen] = useState(false);
  const togglingSellingPrice = () => setIsSellingPriceOpen(!isSellingPriceOpen);
  const [sellingPriceSelectedOption, setSellingPriceSelectedOption] =
    useState(0);
  const [isReserverPriceOpen, setIsReserverPriceOpen] = useState(false);
  const togglingReserverPrice = () =>
    setIsReserverPriceOpen(!isReserverPriceOpen);
  const [reserverPriceSelectedOption, setReserverPriceSelectedOption] =
    useState(0);
  const onPriceOptionClicked = (value) => {
    setPriceSelectedOption(paymentTokens.indexOf(value));
    setIsPriceOpen(false);
  };
  const loadNft = useCallback(async () => {
    if (!client) return;
    if (
      collectionId === undefined ||
      collectionId == "[collection]" ||
      id === undefined ||
      id == "[id]"
    )
      return false;
    const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
    let collection = await marketContract.collection(parseInt(collectionId));
    let ipfs_collection = await fetch(
      process.env.NEXT_PUBLIC_PINATA_URL + collection.uri
    );
    let res_collection = await ipfs_collection.json();
    const cw721Contract = CW721(collection.cw721_address).use(client);
    let nftInfo = await cw721Contract.nftInfo(id);
    let ipfs_nft = await fetch(
      process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri
    );
    let res_nft = await ipfs_nft.json();
    let nft_type = await getFileTypeFromURL(
      process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"]
    );
    res_nft["type"] = nft_type.fileType;
    res_nft["created"] = res_nft["owner"];
    res_nft["owner"] = await cw721Contract.ownerOf(id);
    if (res_collection.hasOwnProperty("royalties"))
      setRoyalties(res_collection.royalties);
    const collectionContract = Collection(collection.collection_address).use(
      client
    );
    let sales: any = await collectionContract.getSales();
    let saleIds = [];
    for (let i = 0; i < sales.length; i++) {
      saleIds.push(sales[i].token_id);
    }
    const response = await fetch(
      process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
    );
    const paymentTokenList = await response.json();
    let paymentTokensAddress = [];
    setPaymentTokens(paymentTokenList.tokens);

    for (let i = 0; i < paymentTokenList.tokens.length; i++) {
      paymentTokensAddress.push(paymentTokenList.tokens[i].address);
    }
    if (saleIds.indexOf(parseInt(id)) != -1) {
      let sale = sales[saleIds.indexOf(parseInt(id))];
      let paymentToken: any;
      if (sale.denom.hasOwnProperty("cw20")) {
        paymentToken =
          paymentTokenList.tokens[
            paymentTokensAddress.indexOf(sale.denom.cw20)
          ];
      } else {
        paymentToken =
          paymentTokenList.tokens[
            paymentTokensAddress.indexOf(sale.denom.native)
          ];
      }
      res_nft["symbol"] = paymentToken.symbol;
      res_nft["paymentToken"] = paymentToken;
      res_nft["price"] = getRealTokenAmount({
        amount: sale.initial_price,
        denom: paymentToken.denom,
      });
      res_nft["owner"] = sales[saleIds.indexOf(parseInt(id))].provider;
      res_nft["sale"] = sales[saleIds.indexOf(parseInt(id))];
      res_nft["owner"] = sale.provider;
    } else {
      res_nft["price"] = 0;
      res_nft["sale"] = {};
    }

    let uri = res_nft.uri;
    if (uri.indexOf("https://") == -1) {
      uri = process.env.NEXT_PUBLIC_PINATA_URL + res_nft.uri;
    }
    setNft({
      tokenId: id,
      address: "",
      image: uri,
      name: res_nft.name,
      user: res_nft.owner,
      price: res_nft.price,
      total: 1,
      collectionName: res_collection.name,
      symbol: res_nft["symbol"],
      sale: res_nft.sale,
      paymentToken: res_nft.paymentToken,
      type: res_nft.type,
      created: res_nft.created,
      collectionId: parseInt(collectionId),
    });

    //setSupply(res_collection.supply==undefined?'1':res_collection.supply)
    setMaximumRoyaltyFee(parseFloat(res_collection.maximumRoyaltyFee) / 10000);
  }, [client]);

  useEffect(() => {
    loadNft();
  }, [loadNft, collectionId, id, client]);

  const startSale = async (e) => {
    if (!address || !signingClient) {
      toast.warning(`Please connect your wallet.`, {
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

    let duration_type: DurationType = {
      startTime: Math.round(new Date(startDate).getTime() / 1000),
      endTime: Math.round(new Date(endDate).getTime() / 1000),
    };
    const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
    let collection = await marketContract.collection(collectionId);
    const cw721Contract = CW721(collection.cw721_address).useTx(signingClient);
    let msg: any;
    let denom: any;

    let total_royalty_rate: number = 0;
    let royaltiesArr: any = [];
    //const royalties = [...inputFields]

    for (let i = 0; i < royalties.length; i++) {
      total_royalty_rate += parseFloat(royalties[i]["rate"].toString());
      royalties[i]["rate"] = royalties[i]["rate"];
      royaltiesArr.push({
        address: royalties[i]["address"],
        rate: royalties[i]["rate"],
      });
    }

    total_royalty_rate = total_royalty_rate;
    if (sellType == SALE_TYPE[0]) {
      if (price == "") {
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
      setJsonUploading(true);
      if (paymentTokens[priceSelectedOption].type == "cw20") {
        denom = { cw20: paymentTokens[priceSelectedOption].address };
      } else {
        denom = { native: paymentTokens[priceSelectedOption].address };
      }
      msg = {
        start_sale: {
          sale_type: sellType,
          duration_type: SALE_TYPE[0],
          initial_price: parseInt(
            toMinDenom(
              parseFloat(price),
              paymentTokens[priceSelectedOption].denom
            )
          ).toString(),
          reserve_price: parseInt(
            toMinDenom(
              parseFloat(price),
              paymentTokens[priceSelectedOption].denom
            )
          ).toString(),
          denom,
        },
      };
      let encodedMsg: string = toBase64(
        new TextEncoder().encode(JSON.stringify(msg))
      );
      let nft = await cw721Contract.sendNft(
        address,
        collection.collection_address,
        id,
        encodedMsg
      );
    } else if (sellType == SALE_TYPE[1]) {
      if (price == "") {
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
      if (reserverPrice == "") {
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

      if (parseFloat(reserverPrice) < parseFloat(price)) {
        toast.warning(` the reserve price must be greater than initial price`, {
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
      setJsonUploading(true);
      if (paymentTokens[priceSelectedOption].type == "cw20") {
        denom = { cw20: paymentTokens[priceSelectedOption].address };
      } else {
        denom = { native: paymentTokens[priceSelectedOption].address };
      }
      msg = {
        start_sale: {
          sale_type: sellType,
          duration_type: {
            Time: [duration_type.startTime, duration_type.endTime],
          },
          initial_price: parseInt(
            toMinDenom(
              parseFloat(price),
              paymentTokens[priceSelectedOption].denom
            )
          ).toString(),
          reserve_price: parseInt(
            toMinDenom(
              parseFloat(reserverPrice),
              paymentTokens[priceSelectedOption].denom
            )
          ).toString(),
          denom,
        },
      };
      let encodedMsg: string = toBase64(
        new TextEncoder().encode(JSON.stringify(msg))
      );
      let nft = await cw721Contract.sendNft(
        address,
        collection.collection_address,
        id,
        encodedMsg
      );
    }
    setJsonUploading(false);
    toast.success(`You have completed List Items for Sale.`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    handleEvent();
    onClose();
  };

  // const PaymentTokenSelectMemo = useMemo(() => {
  //   return (
  //     paymentTokens !== undefined &&
  //     paymentTokens.length > 0 && (
  //       <Select
  //         defaultValue={paymentTokens[0]}
  //         options={paymentTokens}
  //         components={{
  //           Option: IconOption,
  //           SingleValue: IconOption,
  //           IndicatorSeparator: () => null,
  //           Input: () => null,
  //         }}
  //         styles={customStyles}
  //         onChange={(e) => {
  //           onPriceOptionClicked(e);
  //         }}
  //       />
  //     )
  //   );
  // }, [paymentTokens]);

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
        disabled={true}
        // onClick={onOpen}
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
                  onClick={(e) => setSellType(SALE_TYPE[1])}
                  isActive={sellType == SALE_TYPE[1]}
                >
                  <h1>Auction</h1>
                  <p>The highest offer wins the auction.</p>
                </StyledRadio>
                <StyledRadio
                  onClick={(e) => setSellType(SALE_TYPE[0])}
                  isActive={sellType == SALE_TYPE[0]}
                >
                  <h1>Fixed Sale</h1>
                  <p>Fixed price to buy</p>
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
                      Input: () => null,
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
                onClick={(e) => startSale(e)}
              >
                Put On Sale
              </Button>
              <Text margin="10px 0 0 0" fontSize={isMobile() ? "14px" : "16px"}>
                5% transaction fee goes to treasury wallet
              </Text>
            </Stack>

            <CardWrapper>
              <NftCard nft={nft} type="buy" />
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
