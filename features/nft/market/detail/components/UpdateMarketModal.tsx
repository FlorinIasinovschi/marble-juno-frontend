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
  InputGroup,
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
import DateRangePicker from "rsuite/DateRangePicker";
import { toast } from "react-toastify";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

let today = new Date();

const UpdateMarketModal = ({ collectionId, id }) => {
  const { Option } = components;

  const IconOption = (props) => (
    <Option {...props}>
      <HStack>
        <img src={props.data.logoUri} style={{ width: "50px" }} />
        <Text>{props.data.symbol}</Text>
      </HStack>
    </Option>
  );

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: "70px",
      borderRadius: "20px",
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
  const [method, setMethod] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState("");
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
  const onPriceOptionClicked = (value) => () => {
    setPriceSelectedOption(value);
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
    const marketContract = Factory().use(client);
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
    const collectionContract = Marketplace(collection.collection_address).use(
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
      symbol: res_nft.symbol,
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
  }, [loadNft, collectionId, id]);

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
    const marketContract = Factory().use(client);
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

      if (paymentTokens[sellingPriceSelectedOption].type == "cw20") {
        denom = { cw20: paymentTokens[sellingPriceSelectedOption].address };
      } else {
        denom = { native: paymentTokens[sellingPriceSelectedOption].address };
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
              paymentTokens[sellingPriceSelectedOption].denom
            )
          ).toString(),
          reserve_price: parseInt(
            toMinDenom(
              parseFloat(reserverPrice),
              paymentTokens[sellingPriceSelectedOption].denom
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
  };

  const TokenLogo = React.useMemo(() => {
    return (
      <TokenLogoWrapper>
        <img src={nft.paymentToken.logoUri} alt="token" width="35px" />
        <Text>{nft.symbol}</Text>
      </TokenLogoWrapper>
    );
  }, [nft]);

  return (
    <>
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
          Update Price
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
              <Stack spacing={10} width={isMobile() ? "100%" : "600px"}>
                <Stack>
                  <Text fontSize="20px">New Price</Text>
                  <InputGroup>
                    <StyledInput
                      placeholder="Enter New Price"
                      type="number"
                      onChange={(e) => setPrice(e.target.value)}
                    />
                    <StyledInputRightElement children={TokenLogo} />
                  </InputGroup>
                </Stack>

                <Stack>
                  <Text fontSize="20px">New Reserve Price</Text>
                  <InputGroup>
                    <StyledInput
                      placeholder="Enter New Reserve Price"
                      type="number"
                      onChange={(e) => setReserverPrice(e.target.value)}
                    />
                    <StyledInputRightElement children={TokenLogo} />
                  </InputGroup>
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
                  onClick={(e) => startSale(e)}
                >
                  Update Price
                </Button>
              </Stack>
            </MainWrapper>
          </Container>
        </Modal>
      </ChakraProvider>
    </>
  );
};

const CardWrapper = styled.div`
  display: flex;
  height: 556px;
  width: 434px;
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
  padding: 30px;
  color: white !important;
  overflow: hidden;
  max-width: 700px !important;
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
  align-items: start;
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
  width: 300px;
  height: 111px;
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
  border-radius: 20px !important;
  height: 70px !important;
`;

const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 20px;
  }
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

export default UpdateMarketModal;
