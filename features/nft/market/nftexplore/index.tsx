import { LinkBox, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { NftCard } from "components/NFT";
import InfiniteScroll from "react-infinite-scroll-component";
import {
  Marketplace,
  CW721,
  getFileTypeFromURL,
  getRealTokenAmount,
  Factory,
  PaymentToken,
  useSdk,
} from "services/nft";
import { Container, ExploreWrapper } from "./styled";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

const Explore = () => {
  // const id = "5";
  // const { client } = useSdk();

  // const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  // const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  // const [hasMore, setHasMore] = useState(true);
  // const [collectionInfo, setCollectionInfo] = useState<any>({});
  // const [page, setPage] = useState(0);

  // const getNfts = async (limit = 12) => {
  //   let paymentTokensAddress = [];
  //   if (!paymentTokens || !collectionInfo) return;
  //   for (let i = 0; i < paymentTokens.length; i++) {
  //     paymentTokensAddress.push(paymentTokens[i].address);
  //   }
  //   const cwCollectionContract = Marketplace(
  //     collectionInfo.collection_address
  //   ).use(client);
  //   const cw721Contract = CW721(collectionInfo.cw721_address).use(client);
  //   const tokenIdsInfo = await cw721Contract.allTokens(
  //     (limit * page).toString(),
  //     limit
  //   );
  //   if (tokenIdsInfo.tokens.length < limit) setHasMore(false);
  //   const nftData = await Promise.all(
  //     tokenIdsInfo.tokens.map(async (tokenId) => {
  //       let nftInfo = await cw721Contract.allNftInfo(tokenId);
  //       let ipfs_nft = await fetch(
  //         process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.info.token_uri
  //       );
  //       let res_nft = await ipfs_nft.json();
  //       res_nft["tokenId"] = tokenId;
  //       res_nft["created"] = res_nft["owner"];
  //       res_nft.collectionId = id;
  //       res_nft["owner"] = nftInfo.access.owner;
  //       if (res_nft["uri"].indexOf("https://") == -1) {
  //         res_nft["image"] =
  //           process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"];
  //       } else {
  //         res_nft["image"] = res_nft["uri"];
  //       }
  //       let nft_type = await getFileTypeFromURL(res_nft["image"]);
  //       res_nft["type"] = nft_type.fileType;
  //       try {
  //         const sale: any = await cwCollectionContract.getSale(Number(tokenId));
  //         let paymentToken: any;
  //         if (sale.denom.hasOwnProperty("cw20")) {
  //           paymentToken =
  //             paymentTokens[paymentTokensAddress.indexOf(sale.denom.cw20)];
  //         } else {
  //           paymentToken =
  //             paymentTokens[paymentTokensAddress.indexOf(sale.denom.native)];
  //         }
  //         res_nft["paymentToken"] = paymentToken;
  //         res_nft["price"] = getRealTokenAmount({
  //           amount: sale.initial_price,
  //           denom: paymentToken?.denom,
  //         });
  //         res_nft["owner"] = sale.provider;
  //         res_nft["sale"] = sale;
  //       } catch (err) {
  //         res_nft["price"] = 0;
  //         res_nft["sale"] = {};
  //       }
  //       return res_nft;
  //     })
  //   );
  //   setLoadedNfts(loadedNfts.concat(nftData));
  //   setPage(page + 1);
  // };
  // useEffect(() => {
  //   (async () => {
  //     if (id === undefined) return false;
  //     if (!client) {
  //       return;
  //     }
  //     const marketContract = Factory().use(client);
  //     let collection = await marketContract.collection(parseInt(id));
  //     let ipfs_collection = await fetch(
  //       process.env.NEXT_PUBLIC_PINATA_URL + collection.uri
  //     );
  //     let res_collection = await ipfs_collection.json();
  //     let collection_info: any = {};
  //     collection_info.id = id;
  //     collection_info.collection_address = collection.collection_address;
  //     collection_info.cw721_address = collection.cw721_address;
  //     collection_info.name = res_collection.name;
  //     collection_info.image =
  //       process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;

  //     setCollectionInfo(collection_info);
  //     const response = await fetch(
  //       process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
  //     );
  //     const paymentTokenList = await response.json();
  //     setPaymentTokens(paymentTokenList.tokens);
  //   })();
  // }, [id, client]);

  // useEffect(() => {
  //   (async () => {
  //     await getNfts();
  //   })();
  // }, [collectionInfo, paymentTokens]);

  // const getMoreNfts = async () => {
  //   console.log("getMoreNfts: ", hasMore, page);
  //   if (id === undefined || !hasMore) return false;
  //   getNfts();
  // };

  return (
    <></>
    // <ExploreWrapper>
    //   {loadedNfts.length > 0 && (
    //     <InfiniteScroll
    //       dataLength={loadedNfts.length}
    //       next={getMoreNfts}
    //       hasMore={hasMore}
    //       loader={
    //         <div
    //           style={{
    //             width: "100%",
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //             height: "100%",
    //             padding: "20px",
    //           }}
    //         >
    //           <Spinner size="xl" />
    //         </div>
    //       }
    //       endMessage={<h4></h4>}
    //     >
    //       <Container>
    //         {loadedNfts.map((nftInfo, index) => (
    //           <Link
    //             href={`/nft/${nftInfo.collectionId}/${nftInfo.tokenId}`}
    //             passHref
    //             key={index}
    //           >
    //             <LinkBox as="picture">
    //               <NftCard nft={nftInfo} collection={collectionInfo} id="" />
    //             </LinkBox>
    //           </Link>
    //         ))}
    //       </Container>
    //     </InfiniteScroll>
    //   )}
    // </ExploreWrapper>
  );
};

export default Explore;
