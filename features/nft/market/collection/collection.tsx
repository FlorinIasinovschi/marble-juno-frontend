import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ChakraProvider,
  Spinner,
  Stack,
  Tab,
  Text,
  HStack,
} from "@chakra-ui/react";
import styled from "styled-components";
import { Button } from "components/Button";
import { IconWrapper } from "components/IconWrapper";
import { Activity, Grid } from "icons";
import { CollectionFilter } from "./filter";
import { NftTable } from "components/NFT";
import { getCollectionCategory } from "hooks/useCollection";
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
import { useRecoilValue, useSetRecoilState } from "recoil";
import { walletState, WalletStatusType } from "state/atoms/walletAtoms";
import InfiniteScroll from "react-infinite-scroll-component";
import { useDispatch, useSelector } from "react-redux";
import { State } from "store/reducers";
import {
  NFT_COLUMN_COUNT,
  UI_ERROR,
  FILTER_STATUS,
  FILTER_STATUS_TXT,
  BUY_STATUS,
  OFFER_STATUS,
  RELOAD_STATUS,
} from "store/types";
import { BuyDialog } from "features/nft/market/detail/BuyDialog";
import { OfferDialog } from "features/nft/market/detail/OfferDialog";
import { LoadingProgress } from "components/LoadingProgress";
import { RoundedIconComponent } from "components/RoundedIcon";
import { isMobile } from "util/device";
import { EditCollectionModal } from "./components/EditCollectionModal";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";
let airdroppedCollectionId1 = 3;
let airdroppedCollectionId2 = 4;
let marbleCollectionId = 5;
let nftCurrentIndex = 0;

export const CollectionTab = ({ index }) => {
  return (
    <TabWrapper>
      <Tab>
        <Button
          className={`hide tab-link ${index == 0 ? "active" : ""}`}
          as="a"
          variant="ghost"
          iconLeft={<IconWrapper icon={<Grid />} />}
        >
          Items
        </Button>
      </Tab>
      <Tab>
        <Button
          className={`hide tab-link ${index == 1 ? "active" : ""}`}
          as="a"
          variant="ghost"
          iconLeft={<IconWrapper icon={<Activity />} />}
        >
          Activity
        </Button>
      </Tab>
    </TabWrapper>
  );
};

interface CollectionProps {
  readonly id: string;
}

let page = 10;

export const CollectionPage = ({ id }: CollectionProps) => {
  const pageCount = 10;

  const router = useRouter();
  const query = router.query;
  const { asPath, pathname } = useRouter();
  const { client } = useSdk();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [category, setCategory] = useState("Digital");
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [traits, setTraits] = useState([]);
  const [tokens, setNFTIds] = useState<number[]>([]);
  const [collectionAddress, setCollectionAddress] = useState("");
  const [cw721Address, setCw721Address] = useState("");
  const [numTokens, setNumTokens] = useState(0);
  const [isCollapse, setCollapse] = useState(false);
  const [isLargeNFT, setLargeNFT] = useState(true);
  const [filterCount, setFilterCount] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [currentTokenCount, setCurrentTokenCount] = useState(0);
  const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  const [nfts, setNfts] = useState<NftInfo[]>([]);
  const [hasMore, setHasMore] = useState(true);
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
  const [collectionInfo, setCollectionInfo] = useState<any>({});

  const [buyId, setBuyId] = useState("");
  const [offerId, setOfferId] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (id === undefined || id == "[name]") return false;
      if (!client) {
        return;
      }
      setIsLoading(true);

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
      collection_info.image =
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
      collection_info.banner_image =
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage;
      collection_info.slug = res_collection.slug;
      collection_info.creator = collection.owner ?? "";
      collection_info.cat_ids = res_collection.category;
      collection_info.royalties = res_collection.royalties;
      let collection_type = await getFileTypeFromURL(
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
      );
      collection_info.type = collection_type.fileType;

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
  // useEffect(() => {
  //   (async () => {
  //     if (id === undefined || id == "[name]") return false;
  //     if (!client) {
  //       return;
  //     }
  //     let currentTraits = [];
  //     //getMoreNfts()
  //     console.log("loadedNfts: ", loadedNfts);
  //     setNfts([]);

  //     currentTraits = loadedNfts;

  //     setTraits(currentTraits);

  //     let nftsForCollection = [];
  //     let hasMoreFlag = false;
  //     let i = 0;
  //     let nftIndex = 0;
  //     let isPageEnd = false;
  //     if (currentTraits.length == 0) isPageEnd = true;
  //     while (!isPageEnd) {
  //       if (searchVal == "" || currentTraits[i].name.indexOf(searchVal) != -1) {
  //         let uri = currentTraits[i].uri;
  //         if (uri.indexOf("https://") == -1) {
  //           uri = process.env.NEXT_PUBLIC_PINATA_URL + currentTraits[i].uri;
  //         }
  //         if (currentTraits[i].price > 0) {
  //           nftsForCollection.push({
  //             tokenId: currentTraits[i].tokenId,
  //             address: "",
  //             image: uri,
  //             name: currentTraits[i].name,
  //             user: currentTraits[i].owner,
  //             price: currentTraits[i].price,
  //             total: 2,
  //             collectionName: "",
  //             sale: currentTraits[i].sale,
  //             symbol: currentTraits[i].symbol,
  //             paymentToken: currentTraits[i].paymentToken,
  //             type: currentTraits[i].type,
  //             created: currentTraits[i].created,
  //             collectionId: id,
  //           });
  //         } else {
  //           nftsForCollection.push({
  //             tokenId: currentTraits[i].tokenId,
  //             address: "",
  //             image: uri,
  //             name: currentTraits[i].name,
  //             user: currentTraits[i].owner,
  //             price: currentTraits[i].price,
  //             total: 2,
  //             collectionName: "",
  //             sale: currentTraits[i].sale,
  //             symbol: "Marble",
  //             paymentToken: {},
  //             type: currentTraits[i].type,
  //             created: currentTraits[i].created,
  //             collectionId: id,
  //           });
  //         }

  //         hasMoreFlag = true;
  //         nftIndex++;
  //         if (nftIndex == pageCount) {
  //           isPageEnd = true;
  //         }
  //       }
  //       i++;
  //       if (i == currentTraits.length) {
  //         isPageEnd = true;
  //         hasMoreFlag = false;
  //       }
  //     }
  //     nftCurrentIndex = i;
  //     setNfts(nftsForCollection);
  //     // setHasMore(hasMoreFlag);
  //   })();
  // }, [reloadCount, loadedNfts]);
  const getMoreNfts = async () => {
    if (id === undefined || id == "[name]" || !hasMore) return false;
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

  useEffect(() => {
    (async () => {
      if (id === undefined || id == "[name]") return false;
      try {
        const _category = await getCollectionCategory(id);

        setCategory(_category);
      } catch (err) {
        console.log("nft get counts error: ", err);
      }
    })();
  }, [id]);

  // useEffect(() => {
  //   setBuyId(buy_status);
  //   setIsBuyShowing(true);
  // }, [dispatch, buy_status]);
  // useEffect(() => {
  //   setOfferId(offer_status);
  //   setIsOfferShowing(true);
  // }, [dispatch, offer_status]);
  return (
    <CollectionWrapper>
      <Banner>
        {collectionInfo.type === "image" && (
          <BannerImage src={collectionInfo.banner_image} alt="banner" />
        )}
        {collectionInfo.type === "video" && (
          <BannerImageForVideoAndAudio>
            <video controls>
              <source src={collectionInfo.banner_image} />
            </video>
          </BannerImageForVideoAndAudio>
        )}
        {collectionInfo.type === "audio" && (
          <BannerImageForVideoAndAudio>
            <audio controls>
              <source src={collectionInfo.banner_image} />
            </audio>
          </BannerImageForVideoAndAudio>
        )}
        <Stack spacing={5}>
          {collectionInfo.type === "image" && (
            <Logo src={collectionInfo.image} alt="logo" />
          )}
          {collectionInfo.type === "video" && (
            <LogoForVideoAndAudio>
              <video>
                <source src={collectionInfo.image} />
              </video>
            </LogoForVideoAndAudio>
          )}
          {collectionInfo.type === "audio" && (
            <LogoForVideoAndAudio>
              <audio>
                <source src={collectionInfo.image} />
              </audio>
            </LogoForVideoAndAudio>
          )}
          <LogoTitle>{collectionInfo.name}</LogoTitle>
          {address === collectionInfo.owner && (
            <Stack width="250px">{/* edit collection modal */}</Stack>
          )}
          <ProfileLogo>
            <RoundedIconComponent
              size="44px"
              address={collectionInfo.creator}
            />
          </ProfileLogo>
          {address === collectionInfo.creator && (
            <EditCollectionButtonWrapper>
              <EditCollectionModal
                collectionInfo={collectionInfo}
                setCategory={(e) => {
                  setCategory(e);
                }}
                category={category}
              />
            </EditCollectionButtonWrapper>
          )}
        </Stack>
      </Banner>

      <Heading>
        <Text fontSize={isMobile() ? "24px" : "46px"} fontWeight="700">
          NFTs
        </Text>

        {address === collectionInfo.creator && (
          <Link href={`/nft/${id}/create`} passHref>
            <Button
              className="btn-buy btn-default"
              css={{
                background: "$white",
                color: "$black",
                stroke: "$black",
              }}
              variant="primary"
              size="large"
            >
              Mint NFT
            </Button>
          </Link>
        )}
      </Heading>
      <NftList className={`${isCollapse ? "collapse-close" : "collapse-open"}`}>
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
        {nfts.length === 0 && address === collectionInfo.creator && !isLoading && (
          <Stack spacing="50px" width="50%" alignItems="center" margin="0 auto">
            <Text fontSize="30px" fontWeight="700">
              Customize Your Collection
            </Text>
            <Text fontSize="18px" fontWeight="600">
              Before you mint an NFT to your collection, customize it by
              uploading <br /> a logo, cover image and description
            </Text>
            <EditCollectionModal
              collectionInfo={collectionInfo}
              setCategory={(e) => {
                setCategory(e);
              }}
              category={category}
            />
          </Stack>
        )}
      </NftList>
    </CollectionWrapper>
  );
};

const CollectionWrapper = styled.div``;
const Heading = styled.div`
  padding: 40px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #363b4e;
  align-items: center;
  @media (max-width: 480px) {
    padding: 20px;
  }
`;
const LogoTitle = styled.div`
  font-size: 96px;
  font-weight: 900;
  @media (max-width: 1550px) {
    font-size: 72px;
  }
  @media (max-width: 480px) {
    font-size: 30px;
  }
`;
const Banner = styled.div`
  position: relative;
  height: 900px;
  width: 100%;
  display: block;
  padding: 200px 50px 50px 50px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  @media (max-width: 1550px) {
    height: 675px;
    padding: 150px 50px 50px 50px;
  }
  @media (max-width: 480px) {
    height: 560px;
    padding: 150px 20px 20px 20px;
  }
`;
const BannerImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: -1;
`;

const BannerImageForVideoAndAudio = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  z-index: -1;
`;

const Logo = styled.img`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 10px solid #ffffff21;
  @media (max-width: 1550px) {
    width: 135px;
    height: 135px;
  }
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    border: 3px solid #ffffff21;
  }
`;
const EditCollectionButtonWrapper = styled.div`
  width: 300px;
`;

const LogoForVideoAndAudio = styled.div`
  width: 180px;
  height: 180px;
  border-radius: 50%;
  border: 10px solid #ffffff21;
  @media (max-width: 1550px) {
    width: 135px;
    height: 135px;
  }
  @media (max-width: 480px) {
    width: 100px;
    height: 100px;
    border: 3px solid #ffffff21;
  }
`;

const SelectOption = styled.div<{ isActive: boolean }>`
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  border-radius: 30px;
  display: flex;
  padding: 15px;
  min-width: 170px;
  justify-content: center;
  cursor: pointer;
  color: ${({ isActive }) => (isActive ? "#FFFFFF" : "rgba(255,255,255,0.5)")};
`;

const TabWrapper = styled.div``;

const NftList = styled.div`
  padding: 40px;
  @media (max-width: 480px) {
    padding: 20px;
    width: 100%;
  }
`;
const ProfileLogo = styled.div`
  padding: 10px;
  border-radius: 60px;
  background: rgba(0, 0, 0, 0.2);
  display: flex;
  width: fit-content;
  align-items: center;
`;
