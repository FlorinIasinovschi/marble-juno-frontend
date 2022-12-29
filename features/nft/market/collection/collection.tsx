import { Spinner, Stack, Tab, Text } from "@chakra-ui/react";
import { Button } from "components/Button";
import { IconWrapper } from "components/IconWrapper";
import { NftTable } from "components/NFT";
import { RoundedIconComponent } from "components/RoundedIcon";
import { getCollectionCategory } from "hooks/useCollection";
import { Activity, ArrowDown, Grid, More } from "icons";
import Link from "next/link";
import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useRecoilValue } from "recoil";
import {
  Collection,
  CW721,
  getFileTypeFromURL,
  getRealTokenAmount,
  Market,
  PaymentToken,
  useSdk,
} from "services/nft";
import { walletState } from "state/atoms/walletAtoms";
import styled from "styled-components";
import { SecondGradientBackground } from "styles/styles";
import { isMobile } from "util/device";
import { EditCollectionModal } from "./components/EditCollectionModal";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

interface CollectionProps {
  readonly id: string;
}

export const CollectionPage = ({ id }: CollectionProps) => {
  const { client } = useSdk();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [category, setCategory] = useState("Digital");
  const [filterTab, setFilterTab] = useState("all");
  const [page, setPage] = useState(0);
  const [paymentTokens, setPaymentTokens] = useState<PaymentToken[]>();
  const [loadedNfts, setLoadedNfts] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [collectionInfo, setCollectionInfo] = useState<any>({});

  const getNfts = async (limit = 12) => {
    let paymentTokensAddress = [];
    if (!paymentTokens || !collectionInfo) return;
    for (let i = 0; i < paymentTokens.length; i++) {
      paymentTokensAddress.push(paymentTokens[i].address);
    }
    const cwCollectionContract = Collection(
      collectionInfo.collection_address
    ).use(client);
    const cw721Contract = CW721(collectionInfo.cw721_address).use(client);
    const tokenIdsInfo = await cw721Contract.allTokens(
      (limit * page).toString(),
      limit
    );
    if (tokenIdsInfo.tokens.length < limit) setHasMore(false);
    const nftData = await Promise.all(
      tokenIdsInfo.tokens.map(async (tokenId) => {
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
        try {
          const sale: any = await cwCollectionContract.getSale(Number(tokenId));
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
        } catch (err) {
          res_nft["price"] = 0;
          res_nft["sale"] = {};
        }
        return res_nft;
      })
    );
    setLoadedNfts(loadedNfts.concat(nftData));
    setPage(page + 1);
  };
  useEffect(() => {
    (async () => {
      if (id === undefined || id == "[name]") return false;
      if (!client) {
        return;
      }
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collection = await marketContract.collection(parseInt(id));
      let ipfs_collection = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collection.uri
      );
      let res_collection = await ipfs_collection.json();
      let collection_info: any = {};
      collection_info.id = id;
      collection_info.collection_address = collection.collection_address;
      collection_info.cw721_address = collection.cw721_address;
      collection_info.name = res_collection.name;
      collection_info.description = res_collection.description;
      collection_info.image =
        res_collection.logo &&
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
      collection_info.banner_image =
        res_collection.featuredImage &&
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
    })();
  }, [id, client]);

  useEffect(() => {
    (async () => {
      await getNfts();
    })();
  }, [collectionInfo, paymentTokens]);

  const getMoreNfts = async () => {
    console.log("getMoreNfts: ", hasMore, page);
    if (id === undefined || id == "[name]" || !hasMore) return false;
    getNfts();
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
  const handleFilter = (id: string) => {
    // const filteredNFTs = nfts.filter((nft) => nft.saleType === id)
    // setFiltered(filteredNFTs)
    setFilterTab(id);
  };
  return (
    <CollectionWrapper>
      <Banner>
        {collectionInfo.type === "image" && collectionInfo.banner_image && (
          <BannerImage src={collectionInfo.banner_image} alt="banner" />
        )}
        {collectionInfo.type === "video" && collectionInfo.banner_image && (
          <BannerImageForVideoAndAudio>
            <video controls>
              <source src={collectionInfo.banner_image} />
            </video>
          </BannerImageForVideoAndAudio>
        )}
        {collectionInfo.type === "audio" && collectionInfo.banner_image && (
          <BannerImageForVideoAndAudio>
            <audio controls>
              <source src={collectionInfo.banner_image} />
            </audio>
          </BannerImageForVideoAndAudio>
        )}
        <Stack spacing={5}>
          {collectionInfo.type === "image" && collectionInfo.image && (
            <Logo src={collectionInfo.image} alt="logo" />
          )}
          {collectionInfo.type === "video" && collectionInfo.image && (
            <LogoForVideoAndAudio>
              <video>
                <source src={collectionInfo.image} />
              </video>
            </LogoForVideoAndAudio>
          )}
          {collectionInfo.type === "audio" && collectionInfo.image && (
            <LogoForVideoAndAudio>
              <audio>
                <source src={collectionInfo.image} />
              </audio>
            </LogoForVideoAndAudio>
          )}
          <LogoTitle>{collectionInfo.name}</LogoTitle>

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
          <ProfileInfo>
            <ProfileInfoItem>
              <ProfileInfoTitle>Creator</ProfileInfoTitle>
              <RoundedIconComponent
                size="30px"
                address={collectionInfo.creator}
              />
            </ProfileInfoItem>
            {!isMobile() && (
              <ProfileInfoItem>
                <ProfileInfoTitle>Symbol</ProfileInfoTitle>
                <ProfileInfoContent>Juno</ProfileInfoContent>
              </ProfileInfoItem>
            )}
            {!isMobile() && (
              <ProfileInfoItem>
                <ProfileInfoTitle>Collection Of</ProfileInfoTitle>
                <ProfileInfoContent>{id}</ProfileInfoContent>
              </ProfileInfoItem>
            )}
            <ProfileInfoItem>
              <ProfileInfoTitle>Total Sales</ProfileInfoTitle>
              <ProfileInfoContent>10 Juno</ProfileInfoContent>
            </ProfileInfoItem>
          </ProfileInfo>
        </Stack>
        <ReportWrapper>
          <More />
        </ReportWrapper>
      </Banner>
      <Heading>
        <Stack>
          <Text fontSize={isMobile() ? "24px" : "36px"} fontWeight="700">
            Description
          </Text>
          <DescriptionArea>{collectionInfo.description}</DescriptionArea>
        </Stack>

        {address === collectionInfo.creator && (
          <Link href={`/create`} passHref>
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
      <Heading>
        <Text fontSize={isMobile() ? "24px" : "46px"} fontWeight="700">
          NFTs
        </Text>
      </Heading>
      <FilterWrapper>
        <Filter>
          <FilterCard
            onClick={() => handleFilter("all")}
            isActive={filterTab === "all"}
          >
            All
          </FilterCard>
          <FilterCard
            onClick={() => handleFilter("Direct Sell")}
            isActive={filterTab === "Direct Sell"}
          >
            Buy Now
          </FilterCard>
          <FilterCard
            onClick={() => handleFilter("Auction")}
            isActive={filterTab === "Auction"}
          >
            Live Auction
          </FilterCard>
          <FilterCard
            onClick={() => handleFilter("Offer")}
            isActive={filterTab === "Offer"}
          >
            Active Offers
          </FilterCard>
        </Filter>
        <Sort>
          Most Active <ArrowDown />
        </Sort>
      </FilterWrapper>
      <NftList>
        {loadedNfts.length > 0 && (
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
        {loadedNfts.length === 0 && address === collectionInfo.creator && (
          <Stack
            spacing="50px"
            width={isMobile() ? "100%" : "50%"}
            alignItems="center"
            margin="0 auto"
            textAlign="center"
          >
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
const DescriptionArea = styled(SecondGradientBackground)`
  padding: 25px;
  font-family: Mulish;
  &:before {
    border-radius: 20px;
    opacity: 0.3;
  }
`;
const Heading = styled.div`
  padding: 30px 30px 0 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 650px) {
    padding: 20px;
    flex-direction: column;
    row-gap: 20px;
    button {
      width: 100%;
    }
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
  @media (max-width: 1024px) {
    height: 560px;
    padding: 50px 20px 20px 20px;
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
  video {
    border-radius: 50%;
  }
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
const ProfileInfoItem = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 5px;
`;

const ProfileInfoTitle = styled.div`
  font-size: 14px;
  font-weight: 300;
`;
const ProfileInfoContent = styled.div`
  font-family: Mulish;
  font-size: 20px;
  font-weight: 500;
`;
const ProfileInfo = styled.div`
  padding: 20px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(109, 109, 120, 0.38);
  backdrop-filter: blur(20px);
  background: linear-gradient(0deg, #050616, #050616) padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.13) 0.82%,
        rgba(255, 255, 255, 0.17) 98.47%
      )
      border-box;
  border: 1px solid;

  border-image-source: linear-gradient(
    90.65deg,
    rgba(255, 255, 255, 0.13) 0.82%,
    rgba(255, 255, 255, 0.17) 98.47%
  );
  position: absolute;
  bottom: 40px;
  border-radius: 20px;
  display: flex;
  width: fit-content;
  align-items: center;
  column-gap: 60px;
  @media (max-width: 1024px) {
    position: relative;
    column-gap: 20px;
    bottom: 0;
  }
`;

const ReportWrapper = styled.div`
  position: absolute;
  right: 80px;
  bottom: 40px;
  border-radius: 50%;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(109, 109, 120, 0.38);
  backdrop-filter: blur(20px);
  background: linear-gradient(0deg, #050616, #050616) padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.13) 0.82%,
        rgba(255, 255, 255, 0.17) 98.47%
      )
      border-box;
  border: 1px solid;

  border-image-source: linear-gradient(
    90.65deg,
    rgba(255, 255, 255, 0.13) 0.82%,
    rgba(255, 255, 255, 0.17) 98.47%
  );
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  svg {
    width: 20px;
  }
  @media (max-width: 1024px) {
    right: 20px;
    bottom: 20px;
  }
`;
const Filter = styled.div`
  display: flex;
  column-gap: 20px;
  overflow: auto;
`;
const FilterCard = styled.div<{ isActive: boolean }>`
  border-radius: 30px;

  border: 1px solid;

  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  padding: 15px 30px;
  cursor: pointer;
  text-align: center;
  font-family: Mulish;
  color: ${({ isActive }) => (isActive ? "white" : "rgba(255,255,255,0.5)")};
`;
const FilterWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 30px 30px 0 30px;
  @media (max-width: 1024px) {
    flex-direction: column;
    row-gap: 20px;
  }
`;
const Sort = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(15px);
  /* Note: backdrop-filter has minimal browser support */
  border: 1px solid #ffffff;

  border-radius: 30px;
  padding: 15px 30px;
  font-family: Mulish;
  display: flex;
  align-items: center;
  column-gap: 20px;
  cursor: pointer;
  width: fit-content;
  svg {
    width: 15px;
  }
`;
