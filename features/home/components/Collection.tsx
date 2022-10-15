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

const CollectionInfo = ({ info }) => {
  const [nfts, setNfts] = useState([]);
  const { client } = useSdk();
  const fetchTokensInfo = useCallback(async () => {
    try {
      const cwCollectionContract = Collection(info.collection_address).use(
        client
      );
      let sales: any = await cwCollectionContract.getSales();
      const cw721Contract = CW721(info.cw721_address).use(client);
      let tokenIdsInfo = await cw721Contract.allTokens();

      let tokenIds = tokenIdsInfo.tokens.slice(0, 4);
      let collectionNFTs = [];
      for (let i = 0; i < tokenIds.length; i++) {
        let nftInfo = await cw721Contract.nftInfo(tokenIds[i]);
        let ipfs_nft = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri
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
        res_nft["owner"] = res_nft.owner;
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
              <Image src={info.image} alt="collection" />
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
          templateColumns="repeat(4, 1fr)"
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
                <NftCard nft={nftInfo} type="" />
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

const Container = styled.div`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  box-shadow: 0px 7px 14px 0px #0000001a;
  backdrop-filter: blur(30px);
  margin: 10px 0;
  padding: 40px 0 20px 0;
  height: 100%;
  @media (max-width: 480px) {
    padding: 10px 0 10px 0;
  }
`;
const Image = styled.img`
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
  @media (max-width: 480px) {
    width: 50px;
  }
`;
const CreatorInfo = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: rgba(255, 255, 255, 0.2);
  border-radius: 60px;
  display: flex;
  padding: 10px;
  align-items: center;
  height: 70px;
  width: 210px;
  justify-content: space-around;
  @media (max-width: 1550px) {
    height: 50px;
    width: 160px;
  }
`;

const Title = styled.div`
  font-size: 30px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 23px;
  }
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;
const SubTitle = styled.div`
  font-size: 20px;
  font-weight: 600;
  @media (max-width: 1550px) {
    font-size: 15px;
  }
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;
export default CollectionInfo;
