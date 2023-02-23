import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { styled } from "components/theme";
import { Button } from "components/Button";
import DateCountdown from "components/DateCountdownMin";
import { IconWrapper } from "components/IconWrapper";
import { User, CopyNft, Heart, Clock, Package, Credit } from "icons";
import { useHistory, useParams } from "react-router-dom";
import TransferNFTModal from "./components/TransferNFTModal";
import BurnNFTModal from "./components/BurnNFTModal";
import { RoundedIcon, RoundedIconComponent } from "components/RoundedIcon";
import { OfferModal } from "./components/OfferModal";
import Card from "./components/card";
import Link from "next/link";
import {
  NftInfo,
  CW721,
  Marketplace,
  Factory,
  useSdk,
  getRealTokenAmount,
  PaymentToken,
  SALE_TYPE,
  getFileTypeFromURL,
  toMinDenom,
  Royalty,
  DurationType,
} from "services/nft";
import { walletState } from "state/atoms/walletAtoms";
import { useRecoilValue } from "recoil";
import {
  ChakraProvider,
  Flex,
  Stack,
  Text,
  Grid,
  HStack,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { State } from "store/reducers";
import { toast } from "react-toastify";
import { NFTName, TokenInfoWrapper, NftBuyOfferTag } from "./styled";
import { isMobile, isPC } from "util/device";
import SimpleTable from "./table";
import OnSaleModal from "./components/OnSaleModal";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import { RELOAD_STATUS } from "store/types";
import { useRouter } from "next/router";
import { FACTORY_ADDRESS, MARKETPLACE_ADDRESS } from "util/constants";
interface DetailParams {
  readonly collectionId: string;
  readonly id: string;
}

interface MarketStatus {
  data?: any;
  isOnMarket: boolean;
  isStarted: boolean;
  isEnded?: boolean;
}

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

interface CollectionInfoType {
  royalties: Royalty[];
  image: string;
  name: string;
  id: string;
  creatory: string;
  address: string;
}

interface NftInfoType {
  creator: string;
  description: string;
  image: string;
  name: string;
  owner: string;
  price: string;
  sale: any;
  type: string;
  paymentToken: any;
  symbol: string;
  created_at: string;
}

export const NFTDetail = ({ collectionId, id }) => {
  const { client } = useSdk();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const reloadData = useSelector((state: State) => state.reloadData);
  const { reload_status } = reloadData;
  const [reloadCount, setReloadCount] = useState(0);
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [marketStatus, setMarketStatus] = useState<MarketStatus>({
    isOnMarket: false,
    isStarted: false,
  });
  const router = useRouter();
  const [time, setTime] = useState(Math.round(new Date().getTime() / 1000));
  const [highestBid, setHighestBid] = useState(0);
  const [isBidder, setIsBidder] = useState(false);
  const [isTopBidder, setTopBidder] = useState(false);
  const [nft, setNft] = useState<NftInfoType>({
    creator: "",
    description: "",
    image: "",
    name: "",
    owner: "",
    price: "",
    sale: {},
    type: "",
    paymentToken: {},
    symbol: "",
    created_at: "",
  });
  const [collectionInfo, setCollectionInfo] = useState<CollectionInfoType>();

  const loadNft = useCallback(async () => {
    if (!client) return;
    if (
      collectionId === undefined ||
      collectionId == "[collection]" ||
      id === undefined ||
      id == "[id]"
    )
      return false;

    const factoryContract = Factory().use(client);
    let collection = await factoryContract.collection(collectionId);
    let res_collection: any = {};
    try {
      let ipfs_collection = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collection.uri
      );
      res_collection = await ipfs_collection.json();
    } catch (err) {}
    console.log("collection: ", collection, res_collection);

    const cw721Contract = CW721(collection.address).use(client);
    let nftInfo = await cw721Contract.allNftInfo(id);
    const nftMetadata = nftInfo.info.extension;
    const collectionState = await cw721Contract.getCollectionState();
    setCollectionInfo({
      royalties: collectionState.royalty_info,
      image: process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo,
      name: collection.name,
      id: collection.id,
      creatory: collection.creator,
      address: collection.address,
    });
    let res_nft: any = {};
    let nft_type = await getFileTypeFromURL(
      process.env.NEXT_PUBLIC_PINATA_URL + nftMetadata.image_url
    );
    res_nft["type"] = nft_type.fileType;
    res_nft["creator"] = nftMetadata.minter;
    res_nft["owner"] = nftInfo.access.owner;
    res_nft.image = process.env.NEXT_PUBLIC_PINATA_URL + nftMetadata.image_url;
    res_nft.name = nftMetadata.name;
    res_nft.description = nftMetadata.description;
    const marketplaceContract = Marketplace(MARKETPLACE_ADDRESS).use(client);
    const response = await fetch(
      process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
    );
    const paymentTokenList = await response.json();
    setPaymentTokens(paymentTokenList.tokens);
    let paymentTokensAddress = [];
    for (let i = 0; i < paymentTokenList.tokens.length; i++) {
      paymentTokensAddress.push(paymentTokenList.tokens[i].address);
    }
    console.log("paymenttoken: ", paymentTokenList);
    try {
      let sale: any = await marketplaceContract.getSale(id, collection.address);
      console.log("sale: ", sale);
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
      res_nft["owner"] = sale.provider;
      res_nft["sale"] = sale;
      // get highest bid and bidder
      if (sale.requests.length > 0) {
        let maxBid = 0;
        let bidder = "";
        sale.requests.forEach((request) => {
          if (request.price > maxBid) {
            maxBid = getRealTokenAmount({
              amount: request.price,
              denom: paymentToken.denom,
            });
            bidder = request.address;
          }

          if (request.address == address) {
            setIsBidder(true);
          }
        });
        setHighestBid(maxBid);
        setTopBidder(bidder == address);
      }
    } catch (err) {
      res_nft["price"] = 0;
      res_nft["sale"] = {};
    }
    setNft(res_nft);
  }, [client, address, collectionId, id]);

  useEffect(() => {
    loadNft();
  }, [loadNft, collectionId, id, reloadCount, reload_status]);

  const cancelSale = async (e) => {
    try {
      e.preventDefault();
      const marketplaceContract =
        Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
      console.log("herjewlkjfklejkflj", collectionInfo.address);
      const result = await marketplaceContract.cancelSale(
        address,
        id,
        collectionInfo.address
      );
      console.log("result: ", result);
      toast.success(`You have cancelled this NFT successfully.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      let rCount = reloadCount + 1;
      setReloadCount(rCount);
      return false;
    } catch (err) {
      console.log("cancel sale error: ", err);
    }
  };
  const acceptSale = async (e) => {
    try {
      const marketplaceContract =
        Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
      let accept = await marketplaceContract.acceptSale(
        address,
        id,
        collectionInfo.address
      );
      console.log("result: ", accept);
      toast.success(`You have accepted this NFT Auction successfully.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      let rCount = reloadCount + 1;
      setReloadCount(rCount);
      return false;
    } catch (err) {
      console.error("acceptsaleError: ", err);
    }
  };
  const handleBy = async (e) => {
    if (!address) {
      toast.warning(`Please connect your wallet first`, {
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
    const marketplaceContract =
      Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
    let msg: any;
    if (nft.paymentToken.type == "cw20") {
      msg = { propose: { token_id: id, nft_address: collectionInfo.address } };
      let encodedMsg: string = toBase64(
        new TextEncoder().encode(JSON.stringify(msg))
      );
      let buy = await marketplaceContract.buy(
        address,
        nft.paymentToken.address,
        parseInt(
          toMinDenom(parseFloat(nft.price), nft.paymentToken.denom)
        ).toString(),
        encodedMsg
      );
      console.log("buy: ", buy);
    } else {
      let buy = await marketplaceContract.propose(
        address,
        id,
        collectionInfo.address,
        parseInt(
          toMinDenom(parseFloat(nft.price), nft.paymentToken.denom)
        ).toString(),
        nft.paymentToken.denom
      );
    }
    setReloadCount(reloadCount + 1);
    toast.success(`You have buyed this NFT successfully.`, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };
  const handleCancelBid = async () => {
    if (!address) {
      toast.warning(`Please connect your wallet first`, {
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
    try {
      const marketplaceContract =
        Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
      let cancelpropose = await marketplaceContract.cancelPropose(
        address,
        id,
        collectionInfo.address
      );
      toast.success(`Transaction Success.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setReloadCount(reloadCount + 1);
    } catch (err) {
      toast.error(`Transaction Failed`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const handleManualReceipt = async () => {
    try {
      if (!address) {
        toast.warning(`Please connect your wallet first`, {
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
      const marketplaceContract =
        Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
      const result = await marketplaceContract.manualReceiveNft(
        address,
        id,
        collectionInfo.address
      );
      toast.success(`You have buyed this NFT successfully.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setReloadCount(reloadCount + 1);
    } catch (err) {
      console.error("manual send nft error: ", err);
    }
  };
  const handleSale = async ({
    sellType,
    price,
    reserverPrice,
    startDate,
    endDate,
    paymentToken,
  }) => {
    try {
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
        return false;
      }
      let duration_type: DurationType = {
        startTime: Math.round(new Date(startDate).getTime() / 1000),
        endTime: Math.round(new Date(endDate).getTime() / 1000),
      };
      // const marketContract = Factory().use(client);
      // let collection = await marketContract.collection(collectionId);
      const marketplaceContract =
        Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
      const cw721Contract = CW721(collectionInfo.address).useTx(signingClient);
      let msg: any;
      let denom: any;
      if (sellType == SALE_TYPE[0]) {
        if (paymentToken.type == "cw20") {
          denom = { cw20: paymentToken.address };
        } else {
          denom = { native: paymentToken.address };
        }
        msg = {
          sale_type: sellType,
          duration_type: SALE_TYPE[0],
          initial_price: parseInt(
            toMinDenom(parseFloat(price), paymentToken.denom)
          ).toString(),
          reserve_price: parseInt(
            toMinDenom(parseFloat(price), paymentToken.denom)
          ).toString(),
          denom,
        };
        let encodedMsg: string = toBase64(
          new TextEncoder().encode(JSON.stringify(msg))
        );
        let nft = await cw721Contract.sendNft(
          address,
          MARKETPLACE_ADDRESS,
          id,
          encodedMsg
        );
      } else if (sellType == SALE_TYPE[1]) {
        if (paymentToken.type == "cw20") {
          denom = { cw20: paymentToken.address };
        } else {
          denom = { native: paymentToken.address };
        }
        msg = {
          sale_type: sellType,
          duration_type: {
            Time: [duration_type.startTime, duration_type.endTime],
          },
          initial_price: parseInt(
            toMinDenom(parseFloat(price), paymentToken.denom)
          ).toString(),
          reserve_price: parseInt(
            toMinDenom(parseFloat(reserverPrice), paymentToken.denom)
          ).toString(),
          denom,
        };
        let encodedMsg: string = toBase64(
          new TextEncoder().encode(JSON.stringify(msg))
        );
        let nft = await cw721Contract.sendNft(
          address,
          MARKETPLACE_ADDRESS,
          id,
          encodedMsg
        );
      }
      toast.success(`You have completed List Items for Sale.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setReloadCount(reloadCount + 1);
      return true;
    } catch (err) {
      return false;
    }
  };
  const handleBurnNFT = async () => {
    try {
      const cw721Contract = CW721(collectionInfo.address).useTx(signingClient);
      const data = await cw721Contract.burn(address, id);
      router.push("/explore");
      return data;
    } catch (err) {
      console.log("err: ", err);
      return false;
    }
  };
  const handleOffer = async (amount) => {
    try {
      let minAmount = nft.sale.initial_price;
      let isFisrtBidder = true;
      if (nft.sale.requests.length > 0) {
        minAmount = nft.sale.requests[nft.sale.requests.length - 1].price;
        isFisrtBidder = false;
      }
      console.log("amountCheck: ", minAmount, amount);
      const minAmountInReal = getRealTokenAmount({
        amount: minAmount,
        denom: nft.paymentToken.denom,
      });

      if (amount <= minAmountInReal) {
        if (!isFisrtBidder) {
          toast.warning(
            `The offer price should be greater than ${minAmountInReal}.`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            }
          );
          return false;
        }
      }
      const marketplaceContract =
        Marketplace(MARKETPLACE_ADDRESS).useTx(signingClient);
      let msg: any;
      if (nft.paymentToken.type == "cw20") {
        msg = {
          propose: { token_id: id, nft_address: collectionInfo.address },
        };
        let encodedMsg: string = toBase64(
          new TextEncoder().encode(JSON.stringify(msg))
        );
        let buy = await marketplaceContract.buy(
          address,
          nft.paymentToken.address,
          parseInt(toMinDenom(amount, nft.paymentToken.denom)).toString(),
          encodedMsg
        );
      } else {
        let buy = await marketplaceContract.propose(
          address,
          id,
          collectionInfo.address,
          parseInt(toMinDenom(amount, nft.paymentToken.denom)).toString(),
          nft.paymentToken.denom
        );
      }
      toast.success(`You have offered this NFT successfully.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setReloadCount(reloadCount + 1);
      return true;
    } catch (err) {
      console.log("offerError: ", err);
      return false;
    }
  };
  const handleTransfer = async (_address) => {
    try {
      const cw721Contract = CW721(collectionInfo.address).useTx(signingClient);
      const data = await cw721Contract.transfer(address, _address, id);
      setReloadCount(reloadCount + 1);
      return data;
    } catch (err) {
      console.log("err: ", err);
      return false;
    }
  };
  return (
    <ChakraProvider>
      <Stack>
        <Banner>
          <BannerImage src={collectionInfo?.image} alt="banner" />
          {nft.type === "video" ? (
            <NFTImageWrapper>
              <video controls>
                <source src={nft.image} />
              </video>
            </NFTImageWrapper>
          ) : (
            <NFTImageWrapper>
              <NFTImage src={nft.image} alt="nft-image" />
            </NFTImageWrapper>
          )}
        </Banner>
      </Stack>
      <Container>
        <NFTInfoWrapper>
          <NftInfoTag>
            <NFTName>{nft.name}</NFTName>
            <TokenInfoWrapper>
              <Stack spacing={3}>
                <Text fontSize="14px">Collection</Text>
                <Link href={`/collection/${collectionId}`} passHref>
                  <HStack style={{ cursor: "pointer" }}>
                    <RoundedIcon size="26px" src={collectionInfo?.image} />
                    <Text fontSize="14px" fontWeight="800" fontFamily="Mulish">
                      {collectionInfo?.name}
                    </Text>
                  </HStack>
                </Link>
              </Stack>

              <Stack spacing={3}>
                <Text fontSize="14px">Created By</Text>
                <HStack>
                  {nft.creator && (
                    <RoundedIconComponent size="26px" address={nft.creator} />
                  )}
                </HStack>
              </Stack>

              <Stack spacing={3}>
                <Text fontSize="14px">Owned By</Text>

                <HStack>
                  {nft.owner && (
                    <RoundedIconComponent size="26px" address={nft.owner} />
                  )}
                </HStack>
              </Stack>
            </TokenInfoWrapper>
            {!isPC() && (
              <NftInfoTag>
                {Object.keys(nft.sale).length > 0 ? (
                  <NftBuyOfferTag className="nft-buy-offer">
                    {nft.sale.sale_type === "Auction" ? (
                      <>
                        {nft.sale.duration_type.Time[0] < time ? (
                          <NftSale>
                            <IconWrapper icon={<Clock />} />
                            {nft.sale.duration_type.Time[1] < time
                              ? "Auction already ended"
                              : "Auction ends in"}
                            {!(nft.sale.duration_type.Time[1] < time) && (
                              <Text>
                                <DateCountdown
                                  dateTo={
                                    nft.sale.duration_type.Time[1] * 1000 ||
                                    Date.now()
                                  }
                                  dateFrom={
                                    // nft.sale.duration_type.Time[0] * 1000 ||
                                    Date.now()
                                  }
                                  interval={0}
                                  mostSignificantFigure="none"
                                  numberOfFigures={3}
                                  callback={() => undefined}
                                />
                              </Text>
                            )}
                          </NftSale>
                        ) : (
                          <>
                            <NftSale>
                              <IconWrapper icon={<Clock />} />
                              Auction isn&apos;t started. It will start in
                              <Text>
                                <DateCountdown
                                  dateTo={
                                    nft.sale.duration_type.Time[0] * 1000 ||
                                    Date.now()
                                  }
                                  dateFrom={
                                    // nft.sale.duration_type.Time[1] * 1000 ||
                                    Date.now()
                                  }
                                  interval={0}
                                  mostSignificantFigure="none"
                                  numberOfFigures={3}
                                  callback={() => undefined}
                                />
                              </Text>
                            </NftSale>
                          </>
                        )}
                      </>
                    ) : (
                      <NftSale>For Sale</NftSale>
                    )}
                    <PriceTag>
                      <Grid templateColumns="repeat(3, 1fr)" gap={6} margin="0">
                        <Stack>
                          <Text color="rgb(112, 122, 131)" fontSize="14px">
                            {nft.sale.sale_type === "Auction"
                              ? "Start price"
                              : "Current price"}
                          </Text>
                          <Span className="owner-address">
                            {nft.price}&nbsp;
                            {nft.symbol}
                          </Span>
                        </Stack>
                        {nft.sale.sale_type === "Auction" &&
                          nft.owner === address && (
                            <Stack>
                              <Text color="rgb(112, 122, 131)" fontSize="14px">
                                Reserve Price
                              </Text>
                              <Span className="owner-address">
                                {getRealTokenAmount({
                                  amount: nft.sale.reserve_price,
                                  denom: nft.paymentToken.denom,
                                })}
                                &nbsp;
                                {nft.symbol}
                              </Span>
                            </Stack>
                          )}
                        {nft.sale.sale_type === "Auction" && (
                          <Stack>
                            <Text color="rgb(112, 122, 131)">Highest Bid</Text>
                            {highestBid !== 0 && (
                              <Span className="owner-address">
                                {highestBid}&nbsp;
                                {nft.symbol}
                              </Span>
                            )}
                          </Stack>
                        )}
                      </Grid>
                      {nft.sale.sale_type === "Auction" &&
                        nft.sale.duration_type.Time[1] < time &&
                        isBidder &&
                        highestBid &&
                        Number(highestBid) <
                          getRealTokenAmount({
                            amount: nft.sale.reserve_price,
                            denom: nft.paymentToken.denom,
                          }) && (
                          <Text
                            margin="10px 0"
                            fontFamily="Mulish"
                            fontSize="20px"
                          >
                            This auction ended but has not meet the reserve
                            price. The seller can evaluate and accept the
                            highest offer.
                          </Text>
                        )}
                      {nft.owner === address ? (
                        <>
                          {((nft.sale.duration_type.Time &&
                            nft.sale.duration_type.Time[1] < time) ||
                            !nft.sale.requests.length) && (
                            <ButtonGroup>
                              {parseFloat(nft.price) > 0 &&
                              !nft.sale.requests.length ? (
                                <Button
                                  className="btn-buy btn-default"
                                  css={{
                                    background: "$white",
                                    color: "$black",
                                    stroke: "$black",
                                    width: "100%",
                                    padding: "15px auto",
                                  }}
                                  size="large"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    cancelSale(e);
                                    return false;
                                  }}
                                >
                                  Cancel Marketing
                                </Button>
                              ) : (
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
                                    e.preventDefault();
                                    acceptSale(e);
                                    return false;
                                  }}
                                >
                                  Accept Bid
                                </Button>
                              )}
                              {Number(nft.sale.reserve_price) >
                                Number(nft.sale.requests[0]?.price) && (
                                <Button
                                  className="btn-buy btn-default"
                                  css={{
                                    background: "$white",
                                    color: "$black",
                                    stroke: "$black",
                                    width: "100%",
                                    padding: "15px auto",
                                  }}
                                  size="large"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    cancelSale(e);
                                    return false;
                                  }}
                                >
                                  Cancel Marketing
                                </Button>
                              )}
                            </ButtonGroup>
                          )}
                        </>
                      ) : nft.sale.sale_type === "Auction" ? (
                        <Stack
                          direction={isMobile() ? "column" : "row"}
                          alignItems="flex-end"
                        >
                          {nft.sale.duration_type.Time[0] < time &&
                            nft.sale.duration_type.Time[1] > time &&
                            !isBidder && (
                              <Stack paddingTop={10} width="100%">
                                <OfferModal
                                  nft={nft}
                                  handleOffer={handleOffer}
                                  collection={collectionInfo}
                                />
                              </Stack>
                            )}
                          {nft.sale.duration_type.Time[1] < time &&
                            isTopBidder && (
                              <Button
                                className="btn-buy btn-default"
                                css={{
                                  background: "$white",
                                  color: "$black",
                                  stroke: "$black",
                                  width: "100%",
                                }}
                                size="large"
                                onClick={handleManualReceipt}
                              >
                                Receive NFT
                              </Button>
                            )}
                          {isBidder && (
                            <Button
                              className="btn-buy btn-default"
                              css={{
                                background: "$white",
                                color: "$black",
                                stroke: "$black",
                                width: "100%",
                              }}
                              size="large"
                              onClick={handleCancelBid}
                            >
                              Cancel Bid
                            </Button>
                          )}
                        </Stack>
                      ) : (
                        <Button
                          className="btn-buy btn-default"
                          css={{
                            background: "$white",
                            color: "$black",
                            stroke: "$white",
                            width: "100%",
                          }}
                          size="large"
                          onClick={handleBy}
                        >
                          Buy Now
                        </Button>
                      )}
                    </PriceTag>
                  </NftBuyOfferTag>
                ) : (
                  <NftBuyOfferTag className="nft-buy-offer">
                    <Text
                      fontSize="25px"
                      fontWeight="700"
                      fontFamily="Mulish"
                      textAlign="center"
                    >
                      {nft.owner === address
                        ? "Manage NFT"
                        : "This is not for a sale"}
                    </Text>
                    {nft.owner == address && (
                      <PriceTag>
                        <Stack direction="row" spacing={4} marginTop="20px">
                          <OnSaleModal
                            nft={nft}
                            collection={collectionInfo}
                            handleSale={handleSale}
                            paymentTokens={paymentTokens}
                          />
                          <TransferNFTModal
                            nft={nft}
                            collection={collectionInfo}
                            onHandle={handleTransfer}
                          />
                        </Stack>
                        <BurnNFTModal
                          nft={nft}
                          collection={collectionInfo}
                          onHandle={handleBurnNFT}
                        />
                      </PriceTag>
                    )}
                  </NftBuyOfferTag>
                )}
                {Object.keys(nft.sale).length > 0 &&
                  nft.sale.requests.length > 0 && (
                    <Card title="Bid History">
                      <SimpleTable
                        data={nft.sale.requests}
                        unit={""}
                        paymentToken={nft.paymentToken.denom}
                      />
                    </Card>
                  )}
              </NftInfoTag>
            )}
            <Stack>
              <Text fontSize={isMobile() ? "24px" : "28px"} fontWeight="700">
                Royalty
              </Text>
              {collectionInfo &&
                collectionInfo.royalties.map((royalty, index) => (
                  <Flex
                    key={index}
                    justifyContent="space-between"
                    width={isMobile() ? "100%" : "50%"}
                    alignItems="center"
                  >
                    <HStack>
                      <RoundedIconComponent
                        size="26px"
                        address={royalty.address}
                      />
                    </HStack>
                    <Text width="40%" textAlign="right">
                      {Number(royalty.royalty_rate) * 100} %
                    </Text>
                  </Flex>
                ))}
            </Stack>

            <Stack spacing={10}>
              <Card title="Description">
                <Text fontSize="18px" fontWeight="600" fontFamily="Mulish">
                  {nft.description}
                </Text>
              </Card>

              <Card title="Minted On">
                <Text fontSize="18px" fontWeight="600" fontFamily="Mulish">
                  {nft.created_at}
                </Text>
              </Card>
            </Stack>
          </NftInfoTag>
          {isPC() && (
            <NftInfoTag>
              {Object.keys(nft.sale).length > 0 ? (
                <NftBuyOfferTag className="nft-buy-offer">
                  {nft.sale.sale_type === "Auction" ? (
                    <>
                      {nft.sale.duration_type.Time[0] < time ? (
                        <NftSale>
                          <IconWrapper icon={<Clock />} />
                          {nft.sale.duration_type.Time[1] < time
                            ? "Auction already ended"
                            : "Auction ends in"}
                          {!(nft.sale.duration_type.Time[1] < time) && (
                            <Text>
                              <DateCountdown
                                dateTo={
                                  nft.sale.duration_type.Time[1] * 1000 ||
                                  Date.now()
                                }
                                dateFrom={
                                  // nft.sale.duration_type.Time[0] * 1000 ||
                                  Date.now()
                                }
                                interval={0}
                                mostSignificantFigure="none"
                                numberOfFigures={3}
                                callback={() => undefined}
                              />
                            </Text>
                          )}
                        </NftSale>
                      ) : (
                        <>
                          <NftSale>
                            <IconWrapper icon={<Clock />} />
                            Auction isn&apos;t started. It will start in
                            <Text>
                              <DateCountdown
                                dateTo={
                                  nft.sale.duration_type.Time[0] * 1000 ||
                                  Date.now()
                                }
                                dateFrom={
                                  // nft.sale.duration_type.Time[1] * 1000 ||
                                  Date.now()
                                }
                                interval={0}
                                mostSignificantFigure="none"
                                numberOfFigures={3}
                                callback={() => undefined}
                              />
                            </Text>
                          </NftSale>
                        </>
                      )}
                    </>
                  ) : (
                    <NftSale>For Sale</NftSale>
                  )}
                  <PriceTag>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6} margin="0">
                      <Stack>
                        <Text color="rgb(112, 122, 131)" fontSize="14px">
                          {nft.sale.sale_type === "Auction"
                            ? "Start price"
                            : "Current price"}
                        </Text>
                        <Span className="owner-address">
                          {nft.price}&nbsp;
                          {nft.symbol}
                        </Span>
                      </Stack>
                      {nft.sale.sale_type === "Auction" &&
                        nft.owner === address && (
                          <Stack>
                            <Text color="rgb(112, 122, 131)" fontSize="14px">
                              Reserve Price
                            </Text>
                            <Span className="owner-address">
                              {getRealTokenAmount({
                                amount: nft.sale.reserve_price,
                                denom: nft.paymentToken.denom,
                              })}
                              &nbsp;
                              {nft.symbol}
                            </Span>
                          </Stack>
                        )}
                      {nft.sale.sale_type === "Auction" && (
                        <Stack>
                          <Text color="rgb(112, 122, 131)">Highest Bid</Text>
                          {highestBid !== 0 && (
                            <Span className="owner-address">
                              {highestBid}&nbsp;
                              {nft.symbol}
                            </Span>
                          )}
                        </Stack>
                      )}
                    </Grid>
                    {nft.sale.sale_type === "Auction" &&
                      nft.sale.duration_type.Time[1] < time &&
                      isBidder &&
                      highestBid &&
                      Number(highestBid) <
                        getRealTokenAmount({
                          amount: nft.sale.reserve_price,
                          denom: nft.paymentToken.denom,
                        }) && (
                        <Text
                          margin="10px 0"
                          fontFamily="Mulish"
                          fontSize="20px"
                        >
                          This auction ended but has not meet the reserve price.
                          The seller can evaluate and accept the highest offer.
                        </Text>
                      )}
                    {nft.owner === address ? (
                      <>
                        {((nft.sale.duration_type.Time &&
                          nft.sale.duration_type.Time[1] < time) ||
                          !nft.sale.requests.length) && (
                          <ButtonGroup>
                            {parseFloat(nft.price) > 0 &&
                            !nft.sale.requests.length ? (
                              <Button
                                className="btn-buy btn-default"
                                css={{
                                  background: "$white",
                                  color: "$black",
                                  stroke: "$black",
                                  width: "100%",
                                  padding: "15px auto",
                                }}
                                size="large"
                                onClick={(e) => {
                                  e.preventDefault();
                                  cancelSale(e);
                                  return false;
                                }}
                              >
                                Cancel Marketing
                              </Button>
                            ) : (
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
                                  e.preventDefault();
                                  acceptSale(e);
                                  return false;
                                }}
                              >
                                Accept Bid
                              </Button>
                            )}
                            {Number(nft.sale.reserve_price) >
                              Number(nft.sale.requests[0]?.price) && (
                              <Button
                                className="btn-buy btn-default"
                                css={{
                                  background: "$white",
                                  color: "$black",
                                  stroke: "$black",
                                  width: "100%",
                                  padding: "15px auto",
                                }}
                                size="large"
                                onClick={(e) => {
                                  e.preventDefault();
                                  cancelSale(e);
                                  return false;
                                }}
                              >
                                Cancel Marketing
                              </Button>
                            )}
                          </ButtonGroup>
                        )}
                      </>
                    ) : nft.sale.sale_type === "Auction" ? (
                      <Stack
                        direction={isMobile() ? "column" : "row"}
                        alignItems="flex-end"
                      >
                        {nft.sale.duration_type.Time[0] < time &&
                          nft.sale.duration_type.Time[1] > time &&
                          !isBidder && (
                            <Stack paddingTop={10} width="100%">
                              <OfferModal
                                nft={nft}
                                handleOffer={handleOffer}
                                collection={collectionInfo}
                              />
                            </Stack>
                          )}
                        {nft.sale.duration_type.Time[1] < time && isTopBidder && (
                          <Button
                            className="btn-buy btn-default"
                            css={{
                              background: "$white",
                              color: "$black",
                              stroke: "$black",
                              width: "100%",
                            }}
                            size="large"
                            onClick={handleManualReceipt}
                          >
                            Receive NFT
                          </Button>
                        )}
                        {isBidder && (
                          <Button
                            className="btn-buy btn-default"
                            css={{
                              background: "$white",
                              color: "$black",
                              stroke: "$black",
                              width: "100%",
                            }}
                            size="large"
                            onClick={handleCancelBid}
                          >
                            Cancel Bid
                          </Button>
                        )}
                      </Stack>
                    ) : (
                      <Button
                        className="btn-buy btn-default"
                        css={{
                          background: "$white",
                          color: "$black",
                          stroke: "$white",
                          width: "100%",
                        }}
                        size="large"
                        onClick={handleBy}
                      >
                        Buy Now
                      </Button>
                    )}
                  </PriceTag>
                </NftBuyOfferTag>
              ) : (
                <NftBuyOfferTag className="nft-buy-offer">
                  <Text
                    fontSize="25px"
                    fontWeight="700"
                    fontFamily="Mulish"
                    textAlign="center"
                  >
                    {nft.owner === address
                      ? "Manage NFT"
                      : "This is not for a sale"}
                  </Text>
                  {nft.owner == address && (
                    <PriceTag>
                      <Stack direction="row" spacing={4} marginTop="20px">
                        <OnSaleModal
                          collection={collectionInfo}
                          nft={nft}
                          handleSale={handleSale}
                          paymentTokens={paymentTokens}
                        />
                        <TransferNFTModal
                          nft={nft}
                          collection={collectionInfo}
                          onHandle={handleTransfer}
                        />
                      </Stack>
                      <BurnNFTModal
                        nft={nft}
                        collection={collectionInfo}
                        onHandle={handleBurnNFT}
                      />
                    </PriceTag>
                  )}
                </NftBuyOfferTag>
              )}
              {Object.keys(nft.sale).length > 0 &&
                nft.sale.requests.length > 0 && (
                  <Card title="Bid History">
                    <SimpleTable
                      data={nft.sale.requests}
                      unit={""}
                      paymentToken={nft.paymentToken.denom}
                    />
                  </Card>
                )}
            </NftInfoTag>
          )}
        </NFTInfoWrapper>
      </Container>
    </ChakraProvider>
  );
};

const Container = styled("div", {
  padding: "50px",
  "@media (max-width: 1024px)": {
    padding: "20px",
  },
  "@media (max-width: 650px)": {
    padding: "5px",
  },
  maxWidth: "1700px",
  margin: "0 auto",
});
const NFTInfoWrapper = styled("div", {
  display: "flex",
  justifyContent: "space-between",
  columnGap: "40px",
  "@media (max-width: 1024px)": {
    flexDirection: "column",
    rowGap: "40px",
  },
});

const NftInfoTag = styled("div", {
  width: "50%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  rowGap: "40px",
  "@media (max-width: 1024px)": {
    width: "100%",
    rowGap: "20px",
  },
});
const NftSale = styled("div", {
  display: "flex",
  padding: "$12 $16",
  alignItems: "center",
  gap: "$4",
  borderBottom: "1px solid $borderColors$default",
  "&.disabled": {
    color: "$textColors$disabled",
  },
  "@media (max-width: 1024px)": {
    padding: "$4 $16",
  },
  "@media (max-width: 650px)": {
    padding: "$4 $4",
    fontSize: "15px",
  },
});
const PriceTag = styled("div", {
  display: "flex",
  flexDirection: "column",
  padding: "$12 $16",
  " .price-lbl": {
    color: "$colors$link",
  },
  rowGap: "20px",
  "@media (max-width: 1024px)": {
    padding: "$4 $16",
  },
  "@media (max-width: 650px)": {
    padding: "$4 $5",
  },
});
const ButtonGroup = styled("div", {
  display: "flex",
  gap: "$8",
  marginTop: "$space$10",
  " .btn-buy": {
    padding: "$space$10 $space$14",
    " svg": {
      borderRadius: "2px",
    },
  },
  " .btn-offer": {
    padding: "$space$10 $space$14",
    border: "$borderWidths$1 solid $black",
    color: "$black",
    "&:hover": {
      background: "$white",
      color: "$textColors$primary",
      stroke: "$white",
    },
    " svg": {
      border: "$borderWidths$1 solid $black",
      borderRadius: "2px",
    },
  },
  "@media (max-width: 1024px)": {
    flexDirection: "column",
  },
});

const Span = styled("span", {
  fontWeight: "600",
  fontSize: "20px",
  "@media (max-width: 1024px)": {
    fontSize: "16px",
  },
});

const Banner = styled("div", {
  position: "relative",
  height: "950px",
  width: "100%",
  display: "block",
  paddingTop: "190px",
  "@media (max-width: 1550px)": {
    paddingTop: "100px",
    height: "850px",
  },
  "@media (max-width: 1024px)": {
    height: "560px",
    paddingTop: "60px",
  },
});
const BannerImage = styled("img", {
  position: "absolute",
  top: "0",
  left: "0",
  bottom: "0",
  right: "0",
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  zIndex: "-1",
  opacity: "0.1",
});
const NFTImageWrapper = styled("div", {
  position: "relative",
  height: "700px",
  width: "700px",
  border: "1px solid rgba(255,255,255,0.2)",
  background: "rgba(255,255,255,0.06)",
  display: "block",
  borderRadius: "30px",
  margin: "0 auto",
  "@media (max-width: 1024px)": {
    height: "430px",
    width: "350px",
  },
  "@media (max-width: 650px)": {
    width: "100%",
  },
});
const NFTImage = styled("img", {
  position: "absolute",
  top: "25px",
  left: "25px",
  bottom: "25px",
  right: "25px",
  width: "calc(100% - 50px)",
  height: "calc(100% - 50px)",
  objectFit: "cover",
  objectPosition: "center",
  zIndex: "-1",
  borderRadius: "20px",
  "@media (max-width: 1024px)": {
    top: "20px",
    left: "20px",
    bottom: "20px",
    right: "20px",
    width: "calc(100% - 40px)",
    height: "calc(100% - 40px)",
  },
});

const OwnerAction = styled("div", {});
