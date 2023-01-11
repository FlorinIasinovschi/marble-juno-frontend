import React, { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import Link from "next/link";
import {
  ChakraProvider,
  Flex,
  HStack,
  Text,
  Stack,
  Grid,
  LinkBox,
} from "@chakra-ui/react";
import { NftCard } from "components/NFT/nft-card";
import { RoundedIconComponent } from "components/RoundedIcon";
import { isClientMobie, isMobile } from "util/device";
import Image from "components/Img";
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
import { SecondGradientBackground } from "styles/styles";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

const CollectionInfo = ({ info }) => {
  const [nfts, setNfts] = useState([]);
  const [collectionInfo, setCollectionInfo] = useState();
  const { client } = useSdk();
  const fetchTokensInfo = useCallback(async () => {
    try {
      const cwCollectionContract = Collection(info.collection_address).use(
        client
      );
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collection = await marketContract.collection(info.id);
      let ipfs_collection = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collection.uri
      );
      let res_collection = await ipfs_collection.json();
      res_collection.image =
        process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
      setCollectionInfo(res_collection);
      let sales: any = await cwCollectionContract.getSales();
      const cw721Contract = CW721(info.cw721_address).use(client);
      let tokenIdsInfo = await cw721Contract.allTokens();
      let tokenIds = tokenIdsInfo.tokens.slice(0, 3);
      let collectionNFTs = [];
      for (let i = 0; i < tokenIds.length; i++) {
        let nftInfo = await cw721Contract.allNftInfo(tokenIds[i]);
        let ipfs_nft = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.info.token_uri
        );
        let res_nft = await ipfs_nft.json();
        let nft_type = await getFileTypeFromURL(
          res_nft.uri.includes("https://")
            ? res_nft["uri"]
            : process.env.NEXT_PUBLIC_PINATA_URL + res_nft["uri"]
        );
        res_nft["collectionId"] = info.id;
        res_nft["type"] = nft_type.fileType;
        res_nft["tokenId"] = tokenIds[i];
        res_nft["title"] = info.name;
        res_nft["owner"] = nftInfo.access.owner;
        res_nft["image"] = res_nft.uri.includes("https://")
          ? res_nft.uri
          : process.env.NEXT_PUBLIC_PINATA_URL + res_nft.uri;
        res_nft["sale"] =
          sales.find((_sale) => _sale.token_id == res_nft.token_id) || {};

        collectionNFTs.push(res_nft);
      }
      return collectionNFTs;
    } catch (err) {
      return [];
    }
  }, [client]);
  useEffect(() => {
    (async () => {
      const tokensInfo = await fetchTokensInfo();
      setNfts(tokensInfo);
    })();
  }, [client]);
  return (
    <Container>
      <ChakraProvider>
        <Flex
          justifyContent="space-between"
          marginBottom="20px"
          padding="0 30px"
        >
          <HStack>
            <ImgDiv>
              <StyledImage src={info.image} alt="collection" />
            </ImgDiv>
            <Stack>
              <Title>{info.name}</Title>
              <SubTitle>{info.cat_ids}</SubTitle>
            </Stack>
          </HStack>
          {!isMobile() && (
            <CreatorInfo>
              <RoundedIconComponent
                size={isClientMobie ? "36px" : "48px"}
                address={info.creator}
                font={isClientMobie ? "15px" : "20px"}
              />
            </CreatorInfo>
          )}
        </Flex>
        <Grid
          templateColumns="repeat(3, 1fr)"
          gap={6}
          overflowX="auto"
          overflowY="hidden"
          padding={isMobile() ? "0 10px" : "15px 30px"}
        >
          {nfts.map((nftInfo, index) => (
            <Link
              href={`/nft/${nftInfo.collectionId}/${nftInfo.tokenId}`}
              passHref
              key={index}
            >
              <LinkBox
                as="picture"
                transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
                _hover={{
                  transform: isMobile() ? "" : "scale(1.05)",
                }}
              >
                <NftCard nft={nftInfo} collection={collectionInfo} type="" />
              </LinkBox>
            </Link>
          ))}
        </Grid>
        {isMobile() && (
          <Flex justifyContent="space-between" marginTop="20px">
            <CreatorInfo>
              <RoundedIconComponent
                size={isClientMobie ? "36px" : "48px"}
                address={info.creator}
                font={isClientMobie ? "15px" : "20px"}
              />
            </CreatorInfo>
          </Flex>
        )}
      </ChakraProvider>
    </Container>
  );
};

const Container = styled(SecondGradientBackground)`
  &:before {
    border-radius: 30px;
    opacity: 0.3;
  }
  margin: 10px 0;
  padding: 30px 0 20px 0;
  height: 100%;
  @media (max-width: 650px) {
    padding: 10px 0 10px 0;
  }
`;
const StyledImage = styled(Image)`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 50%;
`;
const ImgDiv = styled.div`
  width: 70px;
  padding-bottom: 70px;
  display: block;
  position: relative;
  border-radius: 50%;
  @media (max-width: 1550px) {
    padding-bottom: 55px;
    width: 55px;
  }
  @media (max-width: 650px) {
    width: 50px;
  }
`;
const CreatorInfo = styled(SecondGradientBackground)`
  &:before {
    opacity: 0.7;
    border-radius: 60px;
  }
  display: flex;
  padding: 10px;
  align-items: center;
  height: 70px;
  justify-content: space-around;
  @media (max-width: 1550px) {
    height: 50px;
  }
`;

const Title = styled.div`
  font-size: 30px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 23px;
  }
  @media (max-width: 650px) {
    font-size: 16px;
  }
`;
const SubTitle = styled.div`
  font-size: 20px;
  @media (max-width: 1550px) {
    font-size: 15px;
  }
  @media (max-width: 650px) {
    font-size: 12px;
  }
`;
export default CollectionInfo;
