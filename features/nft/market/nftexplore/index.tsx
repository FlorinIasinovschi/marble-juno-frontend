import * as React from "react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Spinner, LinkBox } from "@chakra-ui/react";

import { NftTable, NftCard } from "components/NFT";
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
import {
  ExploreWrapper,
  Filter,
  FilterCard,
  CountWrapper,
  Container,
} from "./styled";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";
let airdroppedCollectionId1 = 3;
let airdroppedCollectionId2 = 4;
let marbleCollectionId = 5;

const Explore = () => {
  const id = "5";
  const { client } = useSdk();

  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [collectionAddress, setCollectionAddress] = useState("");
  const [cw721Address, setCw721Address] = useState("");
  const [numTokens, setNumTokens] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const [filter, setFilter] = useState("All");

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

      if (res_collection.logo) {
        let collection_type = await getFileTypeFromURL(
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
        );
        collection_info.type = collection_type.fileType;
      } else {
        collection_info.type = "image";
      }

      collection_info.image =
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
      collection_info.banner_image =
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage;

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
        tokenIds = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
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
              process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"];
          } else {
            res_nft["image"] = res_nft["uri"];
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
            process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"];
        } else {
          res_nft["image"] = res_nft["uri"];
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

  return (
    <ExploreWrapper>
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
          <Container>
            {loadedNfts.map((nftInfo, index) => (
              <Link
                href={`/nft/${nftInfo.collectionId}/${nftInfo.tokenId}`}
                passHref
                key={index}
              >
                <LinkBox
                  as="picture"
                  transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                >
                  <NftCard nft={nftInfo} id="" type="" />
                </LinkBox>
              </Link>
            ))}
          </Container>
        </InfiniteScroll>
      )}
    </ExploreWrapper>
  );
};

export default Explore;
