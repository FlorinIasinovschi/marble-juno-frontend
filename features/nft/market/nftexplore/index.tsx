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

  const [filter, setFilter] = useState("All");

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
      const response = await fetch(
        process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
      );
      const paymentTokenList = await response.json();
      setPaymentTokens(paymentTokenList.tokens);
      let paymentTokensAddress = [];
      let collectionDenom = "";
      for (let i = 0; i < paymentTokenList.tokens.length; i++) {
        paymentTokensAddress.push(paymentTokenList.tokens[i].address);
        if (
          paymentTokenList.tokens[i].symbol.toLowerCase() ==
          res_collection.tokens[0].toLowerCase()
        ) {
          collectionDenom = paymentTokenList.tokens[i].denom;
        }
      }
      setCollectionAddress(collection.collection_address);
      setCw721Address(collection.cw721_address);

      const cwCollectionContract = Collection(
        collection.collection_address
      ).use(client);
      let sales: any = await cwCollectionContract.getSales();

      // count of each type
      setDirectSellNFTs(
        sales.filter((sale) => sale.sale_type === "Fixed").length
      );
      setAuctionNFTs(
        sales.filter((sale) => sale.sale_type === "Auction").length
      );

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

      let rCount = 0;
      while (tokenIds.length > 0) {
        const _collectionNfts = await Promise.all(
          tokenIds.map(async (tokenId) => {
            setActiveOfferNFTs(parseInt(tokenId));
            let nftInfo = await cw721Contract.nftInfo(tokenId);
            let ipfs_nft = await fetch(
              process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri
            );
            let res_nft = await ipfs_nft.json();
            res_nft["tokenId"] = tokenId;
            res_nft["created"] = res_nft["owner"];
            res_nft["owner"] = await cw721Contract.ownerOf(res_nft["tokenId"]);
            let res_uri = res_nft["uri"];
            if (res_uri.indexOf("https://") == -1) {
              res_uri = process.env.NEXT_PUBLIC_PINATA_URL + res_uri;
            }
            let nft_type = await getFileTypeFromURL(res_uri);
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
              res_nft["symbol"] = paymentToken.symbol;
              res_nft["paymentToken"] = paymentToken;
              res_nft["price"] = getRealTokenAmount({
                amount: sale.initial_price,
                denom: paymentToken.denom,
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
        // for (let i = 0; i < tokenIds.length; i++) {
        //   setActiveOfferNFTs(parseInt(tokenIds[i]));
        //   let nftInfo = await cw721Contract.nftInfo(tokenIds[i]);
        //   let ipfs_nft = await fetch(
        //     process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri
        //   );
        //   let res_nft = await ipfs_nft.json();
        //   res_nft["tokenId"] = tokenIds[i];
        //   res_nft["created"] = res_nft["owner"];
        //   res_nft["owner"] = await cw721Contract.ownerOf(res_nft["tokenId"]);
        //   let res_uri = res_nft["uri"];
        //   if (res_uri.indexOf("https://") == -1) {
        //     res_uri = process.env.NEXT_PUBLIC_PINATA_URL + res_uri;
        //   }
        //   let nft_type = await getFileTypeFromURL(res_uri);
        //   res_nft["type"] = nft_type.fileType;
        //   if (saleIds.indexOf(parseInt(tokenIds[i])) != -1) {
        //     let sale = sales[saleIds.indexOf(parseInt(tokenIds[i]))];
        //     let paymentToken: any;
        //     if (sale.denom.hasOwnProperty("cw20")) {
        //       paymentToken =
        //         paymentTokenList.tokens[
        //           paymentTokensAddress.indexOf(sale.denom.cw20)
        //         ];
        //     } else {
        //       paymentToken =
        //         paymentTokenList.tokens[
        //           paymentTokensAddress.indexOf(sale.denom.native)
        //         ];
        //     }
        //     res_nft["symbol"] = paymentToken.symbol;
        //     res_nft["paymentToken"] = paymentToken;
        //     res_nft["price"] = getRealTokenAmount({
        //       amount: sale.initial_price,
        //       denom: paymentToken.denom,
        //     });
        //     res_nft["owner"] = sale.provider;
        //     res_nft["sale"] = sale;
        //   } else {
        //     res_nft["price"] = 0;
        //     res_nft["sale"] = {};
        //   }
        //   collectionNFTs.push(res_nft);
        // }
        collectionNFTs = collectionNFTs.concat(_collectionNfts);
        let start_after = tokenIds[tokenIds.length - 1];
        tokenIds.splice(0, tokenIds.length);
        tokenIds.length = 0;
        tokenIds = [];
        if (parseInt(id) == marbleCollectionId) {
          if ((rCount + 1) * 10 < 1000) {
            for (let m = 1; m < 11; m++) {
              tokenIds.push(((rCount + 1) * 10 + m).toString());
            }
          }
        } else if (
          parseInt(id) == airdroppedCollectionId1 ||
          parseInt(id) == airdroppedCollectionId2
        ) {
          if ((rCount + 1) * 10 < numTokensForCollection) {
            let maxToken = 11;
            if ((rCount + 2) * 10 > numTokensForCollection) {
              maxToken = numTokensForCollection - (rCount + 1) * 10 + 1;
            }
            for (let m = 1; m < maxToken; m++) {
              tokenIds.push(((rCount + 1) * 10 + m).toString());
            }
          }
        } else {
          tokenIdsInfo = await cw721Contract.allTokens(start_after);
          tokenIds = tokenIdsInfo.tokens;
        }

        rCount++;
        setReloadCount(rCount);
        setLoadedNfts(collectionNFTs);
      }
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

    let nftsForCollection = [];
    let hasMoreFlag = false;

    let i = nftCurrentIndex;
    let nftIndex = 0;
    let isPageEnd = false;
    if (i == traits.length) {
      isPageEnd = true;
    }
    while (!isPageEnd) {
      if (searchVal == "" || traits[i].name.indexOf(searchVal) != -1) {
        let uri = traits[i].uri;
        if (uri.indexOf("https://") == -1) {
          uri = process.env.NEXT_PUBLIC_PINATA_URL + traits[i].uri;
        }

        if (traits[i].price > 0) {
          nftsForCollection.push({
            tokenId: traits[i].tokenId,
            address: "",
            image: uri,
            name: traits[i].name,
            user: traits[i].owner,
            price: traits[i].price,
            total: 2,
            collectionName: "",
            sale: traits[i].sale,
            symbol: traits[i].symbol,
            paymentToken: traits[i].paymentToken,
            type: traits[i].type,
            created: traits[i].created,
            collectionId: id,
          });
        } else {
          nftsForCollection.push({
            tokenId: traits[i].tokenId,
            address: "",
            image: uri,
            name: traits[i].name,
            user: traits[i].owner,
            price: traits[i].price,
            total: 2,
            collectionName: "",
            sale: traits[i].sale,
            type: traits[i].type,
            created: traits[i].created,
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
      if (i == traits.length) {
        isPageEnd = true;
        hasMoreFlag = false;
      }
    }
    nftCurrentIndex = i;
    setNfts((nft) => [...nft, ...nftsForCollection]);
    setHasMore(hasMoreFlag);
  };

  useEffect(() => {
    if (isLargeNFT) {
      if (nft_column_count <= 3) return;
      //setUIData(NFT_COLUMN_COUNT, nft_column_count - 1)
      dispatch({
        type: NFT_COLUMN_COUNT,
        payload: nft_column_count - 1,
      });
    } else {
      if (nft_column_count >= 5) return;
      //setUIData(NFT_COLUMN_COUNT, nft_column_count +1)
      dispatch({
        type: NFT_COLUMN_COUNT,
        payload: nft_column_count + 1,
      });
    }
  }, [dispatch, isLargeNFT]);

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
      {reloadCount < 2 && (
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
      )}
      {reloadCount >= 2 && (
        <InfiniteScroll
          dataLength={nfts.length}
          next={getMoreNfts}
          hasMore={hasMore}
          loader={<h3> Loading...</h3>}
          endMessage={<h4></h4>}
        >
          <NftTable data={nfts} type="buy" />
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
