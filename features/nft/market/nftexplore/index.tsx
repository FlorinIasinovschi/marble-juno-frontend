import * as React from "react";
import styled from "styled-components";
import { useState, useEffect } from "react";
import { Spinner } from "@chakra-ui/react";

import { NftTable } from "components/NFT";
import {
  CW721,
  Market,
  Collection,
  useSdk,
  PaymentToken,
  NftInfo,
  getRealTokenAmount,
  getFileTypeFromURL,
} from "services/nft";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { State } from "store/reducers";
import { NFT_COLUMN_COUNT, FILTER_STATUS } from "store/types";
import { LoadingProgress } from "components/LoadingProgress";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";
let airdroppedCollectionId1 = 3;
let airdroppedCollectionId2 = 4;
let marbleCollectionId = 5;
let nftCurrentIndex = 0;

const Explore = () => {
  const id = "5";
  const pageCount = 10;

  const { client } = useSdk();

  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [traits, setTraits] = useState([]);
  const [tokens, setNFTIds] = useState<number[]>([]);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [cw721Address, setCw721Address] = useState("");
  const [numTokens, setNumTokens] = useState(0);
  const [isCollapse, setCollapse] = useState(false);
  const [isMobileFilterCollapse, setMobileFilterCollapse] = useState(true);
  const [isLargeNFT, setLargeNFT] = useState(true);
  const [reloadCount, setReloadCount] = useState(0);
  const [currentTokenCount, setCurrentTokenCount] = useState(0);
  const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  const [nfts, setNfts] = useState<NftInfo[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const dispatch = useDispatch();
  const uiListData = useSelector((state: State) => state.uiData);
  const { nft_column_count } = uiListData;

  const filterData = useSelector((state: State) => state.filterData);
  const { filter_status } = filterData;
  const [searchVal, setSearchVal] = useState("");

  const buyData = useSelector((state: State) => state.buyData);
  const { buy_status } = buyData;
  const offerData = useSelector((state: State) => state.offerData);
  const { offer_status } = offerData;
  const reloadData = useSelector((state: State) => state.reloadData);
  const { reload_status } = reloadData;

  const [buyId, setBuyId] = useState("");
  const [isBuyShowing, setIsBuyShowing] = useState(false);
  const [offerId, setOfferId] = useState("");
  const [isOfferShowing, setIsOfferShowing] = useState(false);

  const [directSellNFTs, setDirectSellNFTs] = useState(0);
  const [autionNFTs, setAuctionNFTs] = useState(0);
  const [activeOfferNFTs, setActiveOfferNFTs] = useState(0);
  const [collectionInfo, setCollectionInfo] = useState<any>({});
  const [filter, setFilter] = useState("All");
  const ImageSizePrimary= process.env.NEXT_PUBLIC_PINATA_PRIMARY_IMAGE_SIZE;
  const ImageSizeSecondary=process.env.NEXT_PUBLIC_PINATA_SECONDARY_IMAGE_SIZE;

  const closeFilterStatusButton = (fstatus) => {
    filter_status.splice(filter_status.indexOf(fstatus), 1);
    //setFilterData(FILTER_STATUS, filter_status)
    dispatch({
      type: FILTER_STATUS,
      payload: filter_status,
    });
    return true;
  };
  const closeFilterAllStatusButtons = () => {
    //setFilterData(FILTER_STATUS, [])
    dispatch({
      type: FILTER_STATUS,
      payload: [],
    });
    return true;
  };
  const handleSearch = (event) => {
    if (event.key.toLowerCase() === "enter") {
      setSearchVal(event.target.value);
    }
  };
  useEffect(() => {
    (async () => {
      if (id === undefined) return false;
      if (!client) {
        return;
      }
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collection = await marketContract.collection(parseInt(id));
      let ipfs_collection = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collection.uri 
      );
      let res_collection = await ipfs_collection.json();
      // set collection info
      let collection_info: any = {};
      collection_info.id = id;
      collection_info.collection_address = collection.collection_address;
      collection_info.cw721_address = collection.cw721_address;
      collection_info.name = res_collection.name;
      collection_info.description = res_collection.description;
     
      collection_info.slug = res_collection.slug;
      collection_info.creator = collection.owner ?? "";
      collection_info.cat_ids = res_collection.category;
      collection_info.royalties = res_collection.royalties;


      if(res_collection.logo){
        let collection_type = await getFileTypeFromURL(
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
        );
        collection_info.type = collection_type.fileType;
      }
      else{
        collection_info.type ='image';
      }
    
      collection_info.image =process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo + ImageSizePrimary;
      collection_info.banner_image =process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage + ImageSizeSecondary;

      setCollectionInfo(collection_info);
      const response = await fetch(
        process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
      );
      const paymentTokenList = await response.json();
      setPaymentTokens(paymentTokenList.tokens);
      let paymentTokensAddress = [];
      for (let i = 0; i < paymentTokenList.tokens.length; i++) {
        paymentTokensAddress.push(paymentTokenList.tokens[i].address);
      }
      let collectionDenom = "";
      setCollectionAddress(collection.collection_address);
      setCw721Address(collection.cw721_address);

      const cwCollectionContract = Collection(
        collection.collection_address
      ).use(client);
      let sales: any = await cwCollectionContract.getSales();
      let saleIds = [];
      for (let i = 0; i < sales.length; i++) {
        saleIds.push(sales[i].token_id);
      }
      const cw721Contract = CW721(collection.cw721_address).use(client);
      let numTokensForCollection = await cw721Contract.numTokens();
      setNumTokens(numTokensForCollection);
      let collectionNFTs = [];
      collectionNFTs.splice(0, collectionNFTs.length);
      collectionNFTs.length = 0;
      collectionNFTs = [];

      let tokenIdsInfo = await cw721Contract.allTokens();
      let tokenIds: any;
      if (parseInt(id) == marbleCollectionId) {
        tokenIds = ["1", "1001", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      } else if (
        parseInt(id) == airdroppedCollectionId1 ||
        parseInt(id) == airdroppedCollectionId2
      ) {
        tokenIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
      } else {
        tokenIds = tokenIdsInfo.tokens;
      }
      const nftData = await Promise.all(
        tokenIds.map(async (tokenId) => {
          let nftInfo = await cw721Contract.allNftInfo(tokenId);
          let ipfs_nft = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.info.token_uri
          );
          let res_nft = await ipfs_nft.json();
          res_nft["tokenId"] = tokenId;
          res_nft["created"] = res_nft["owner"];
          res_nft.collectionId = id;
          res_nft["owner"] = nftInfo.access.owner;
          if (res_nft["uri"].indexOf("https://") == -1) {
            res_nft["image"] =
              process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"] + ImageSizePrimary;
          } else {
            res_nft["image"] = res_nft["uri"] + ImageSizePrimary;
          }
          let nft_type = await getFileTypeFromURL(res_nft["image"]);
          res_nft["type"] = nft_type.fileType;
          if (saleIds.indexOf(parseInt(tokenId)) != -1) {
            let sale = sales[saleIds.indexOf(parseInt(tokenId))];
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
            res_nft["paymentToken"] = paymentToken;
            res_nft["price"] = getRealTokenAmount({
              amount: sale.initial_price,
              denom: paymentToken?.denom,
            });
            res_nft["owner"] = sale.provider;
            res_nft["sale"] = sale;
          } else {
            res_nft["price"] = 0;
            res_nft["sale"] = {};
          }
          return res_nft;
        })
      );
      setLoadedNfts(nftData);
      setReloadCount(reloadCount + 1);
    })();
  }, [id, client]);

  useEffect(() => {
    (async () => {
      if (id === undefined) return false;
      if (!client) {
        return;
      }
      let currentTraits = [];
      //getMoreNfts()
      setNfts([]);
      // for (let i = 0; i < loadedNfts.length; i++){

      //   if (filter_status.length == 0
      //     || filter_status.indexOf(loadedNfts[i].attributes[0].value) != -1
      //     || filter_status.indexOf(loadedNfts[i].attributes[1].value) != -1
      //     || filter_status.indexOf(loadedNfts[i].attributes[2].value) != -1
      //     || filter_status.indexOf(loadedNfts[i].attributes[3].value) != -1
      //     || filter_status.indexOf(loadedNfts[i].attributes[4].value) != -1
      //     || filter_status.indexOf(loadedNfts[i].attributes[5].value) != -1
      //     || filter_status.indexOf(loadedNfts[i].attributes[7].value) != -1
      //   ){

      //     currentTraits.push(loadedNfts[i])
      //   }
      // }

      if (filter === "All") {
        currentTraits = loadedNfts;
      } else if (filter === "NotSale") {
        currentTraits = loadedNfts.filter(
          (nft) => Object.keys(nft.sale).length === 0
        );
      } else {
        currentTraits = loadedNfts.filter(
          (nft) => nft.sale.sale_type === filter
        );
      }

      setTraits(currentTraits);
      let nftsForCollection = [];
      let hasMoreFlag = false;
      let i = 0;
      let nftIndex = 0;
      let isPageEnd = false;
      if (currentTraits.length == 0) isPageEnd = true;
      while (!isPageEnd) {
        if (searchVal == "" || currentTraits[i].name.indexOf(searchVal) != -1) {
          let uri = currentTraits[i].uri;
          if (uri.indexOf("https://") == -1) {
            uri = process.env.NEXT_PUBLIC_PINATA_URL + currentTraits[i].uri;
          }
          uri+=ImageSizePrimary;
          if (currentTraits[i].price > 0) {
            nftsForCollection.push({
              tokenId: currentTraits[i].tokenId,
              address: "",
              image: uri,
              name: currentTraits[i].name,
              user: currentTraits[i].owner,
              price: currentTraits[i].price,
              total: 2,
              collectionName: "",
              sale: currentTraits[i].sale,
              symbol: currentTraits[i].symbol,
              paymentToken: currentTraits[i].paymentToken,
              type: currentTraits[i].type,
              created: currentTraits[i].created,
              collectionId: id,
            });
          } else {
            nftsForCollection.push({
              tokenId: currentTraits[i].tokenId,
              address: "",
              image: uri,
              name: currentTraits[i].name,
              user: currentTraits[i].owner,
              price: currentTraits[i].price,
              total: 2,
              collectionName: "",
              sale: currentTraits[i].sale,
              symbol: "Marble",
              paymentToken: {},
              type: currentTraits[i].type,
              created: currentTraits[i].created,
              collectionId: id,
            });
          }

          hasMoreFlag = true;
          nftIndex++;
          if (nftIndex == pageCount) {
            isPageEnd = true;
          }
        }
        i++;
        if (i == currentTraits.length) {
          isPageEnd = true;
          hasMoreFlag = false;
        }
      }
      nftCurrentIndex = i;
      setNfts(nftsForCollection);
      setHasMore(hasMoreFlag);
    })();
  }, [searchVal, reloadCount, filter]);

  const getMoreNfts = async () => {
    if (id === undefined || !hasMore) return false;
    let start_after = loadedNfts.length.toString();
    let tokenIds: any = [];
    let tokenIdsInfo;
    const cw721Contract = CW721(cw721Address).use(client);
    if (parseInt(id) == marbleCollectionId) {
      if (reloadCount * 10 < 1000) {
        for (let m = 1; m < 11; m++) {
          tokenIds.push((reloadCount * 10 + m).toString());
        }
      }
    } else if (
      parseInt(id) == airdroppedCollectionId1 ||
      parseInt(id) == airdroppedCollectionId2
    ) {
      if (reloadCount * 10 < numTokens) {
        let maxToken = 11;
        if ((reloadCount + 1) * 10 > numTokens) {
          maxToken = numTokens - reloadCount * 10 + 1;
        }
        for (let m = 1; m < maxToken; m++) {
          tokenIds.push((reloadCount * 10 + m).toString());
        }
      }
    } else {
      tokenIdsInfo = await cw721Contract.allTokens(start_after);
      tokenIds = tokenIdsInfo.tokens;
    }
    const cwCollectionContract = Collection(collectionAddress).use(client);
    let sales: any = await cwCollectionContract.getSales();
    let saleIds = [];
    for (let i = 0; i < sales.length; i++) {
      saleIds.push(sales[i].token_id);
    }
    let paymentTokensAddress = [];
    for (let i = 0; i < paymentTokens.length; i++) {
      paymentTokensAddress.push(paymentTokens[i].address);
    }
    const nftData = await Promise.all(
      tokenIds.map(async (tokenId) => {
        let nftInfo = await cw721Contract.allNftInfo(tokenId);
        let ipfs_nft = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.info.token_uri
        );
        let res_nft = await ipfs_nft.json();
        res_nft["tokenId"] = tokenId;
        res_nft["created"] = res_nft["owner"];
        res_nft["owner"] = nftInfo.access.owner;
        res_nft.collectionId = id;
        if (res_nft["uri"].indexOf("https://") == -1) {
          res_nft["image"] =
            process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"]+ ImageSizePrimary;
        } else {
          res_nft["image"] = res_nft["uri"] + ImageSizePrimary;
        }
        let nft_type = await getFileTypeFromURL(res_nft["image"]);
        res_nft["type"] = nft_type.fileType;
        if (saleIds.indexOf(parseInt(tokenId)) != -1) {
          let sale = sales[saleIds.indexOf(parseInt(tokenId))];
          let paymentToken: any;
          if (sale.denom.hasOwnProperty("cw20")) {
            paymentToken =
              paymentTokens[paymentTokensAddress.indexOf(sale.denom.cw20)];
          } else {
            paymentToken =
              paymentTokens[paymentTokensAddress.indexOf(sale.denom.native)];
          }
          res_nft["paymentToken"] = paymentToken;
          res_nft["price"] = getRealTokenAmount({
            amount: sale.initial_price,
            denom: paymentToken?.denom,
          });
          res_nft["owner"] = sale.provider;
          res_nft["sale"] = sale;
        } else {
          res_nft["price"] = 0;
          res_nft["sale"] = {};
        }
        return res_nft;
      })
    );
    setLoadedNfts(loadedNfts.concat(nftData));
    setReloadCount(reloadCount + 1);
  };

  useEffect(() => {
    setBuyId(buy_status);
    setIsBuyShowing(true);
  }, [dispatch, buy_status]);
  useEffect(() => {
    setOfferId(offer_status);
    setIsOfferShowing(true);
  }, [dispatch, offer_status]);

  return (
    <ExploreWrapper rapper>
      {/* <Filter>
        <FilterCard onClick={() => setFilter("Fixed")}>
          <NumberWrapper>{directSellNFTs}</NumberWrapper>
          Buy Now
        </FilterCard>
        <FilterCard onClick={() => setFilter("Auction")}>
          <NumberWrapper>{autionNFTs}</NumberWrapper>
          Live Auction
        </FilterCard>
        <FilterCard onClick={() => setFilter("NotSale")}>
          <NumberWrapper>{activeOfferNFTs}</NumberWrapper>
          Active Offers
        </FilterCard>
      </Filter> */}
      {(reloadCount >= 2 || loadedNfts.length > 0) && (
        <InfiniteScroll
          dataLength={loadedNfts.length}
          next={getMoreNfts}
          hasMore={hasMore}
          loader={
            <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                padding: "20px",
              }}
            >
              <Spinner size="xl" />
            </div>
          }
          endMessage={<h4></h4>}
        >
          <NftTable data={loadedNfts} type="buy" />
        </InfiniteScroll>
      )}
    </ExploreWrapper>
  );
};

const ExploreWrapper = styled.div``;
const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 20px 0;
  gap: 20px;
`;
const Filter = styled.div`
  display: flex;
  column-gap: 20px;
  width: 800px;
`;
const FilterCard = styled.div`
  border-radius: 30px;
  backdrop-filter: blur(30px);
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  display: flex;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: Mulish;
  align-items: center;
  width: fit-content;
  padding: 10px;
`;
const NumberWrapper = styled.div`
  height: 34px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  margin-right: 10px;
`;
export default Explore;
