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
  Factory,
  Marketplace,
  useSdk,
  PaymentToken,
  NftInfo,
  getRealTokenAmount,
  getFileTypeFromURL,
} from "services/nft";
import { SecondGradientBackground } from "styles/styles";
import { default_image, PINATA_URL, MARKETPLACE_ADDRESS } from "util/constants";

interface CollectionType {
  image?: string;
  category: string;
  name: string;
  creator: string;
  id: string;
}
const CollectionInfo = ({ info }) => {
  const [nfts, setNfts] = useState([]);
  const { client } = useSdk();
  const collection: CollectionType = {
    image: info.uri ? PINATA_URL + info.uri : default_image,
    category: info.category,
    name: info.name,
    creator: info.creator,
    id: info.collectionId,
  };
  useEffect(() => {
    (async () => {
      let paymentTokensAddress = [];
      const response = await fetch(
        process.env.NEXT_PUBLIC_COLLECTION_TOKEN_LIST_URL
      );
      const paymentTokenList = await response.json();
      const paymentTokens: PaymentToken[] = paymentTokenList.tokens;
      for (let i = 0; i < paymentTokens.length; i++) {
        paymentTokensAddress.push(paymentTokens[i].address);
      }
      const marketplaceContract = Marketplace(MARKETPLACE_ADDRESS).use(client);
      const _nfts = info.nftEntitiesByCollectionId.nodes;
      const nftData = await Promise.all(
        _nfts.map(async (_nft) => {
          let res_nft: any = {};
          const token_id = _nft.id.split(":")[1];
          const nft_address = _nft.id.split(":")[0];
          res_nft.image = PINATA_URL + _nft.imageUrl;
          res_nft.tokenId = token_id;
          res_nft.type = "image";
          res_nft.owner = _nft.owner;
          res_nft.name = _nft.name;
          try {
            const nft_type = await getFileTypeFromURL(
              PINATA_URL + _nft.imageUrl
            );
            res_nft.type = nft_type.fileType;
          } catch {}
          try {
            const sale: any = await marketplaceContract.getSale(
              token_id,
              nft_address
            );
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
      console.log("nftData: ", nftData);
      setNfts(nftData);
    })();
  }, [info]);
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
              <StyledImage src={collection.image} alt="collection" />
            </ImgDiv>
            <Stack>
              <Title>{collection.name}</Title>
              <SubTitle>{collection.category}</SubTitle>
            </Stack>
          </HStack>
          {!isMobile() && (
            <CreatorInfo>
              <RoundedIconComponent
                size={isClientMobie ? "36px" : "48px"}
                address={collection.creator}
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
              href={`/nft/${collection.id}/${nftInfo.tokenId}`}
              passHref
              key={index}
            >
              <LinkBox as="picture">
                <NftCard
                  nft={nftInfo}
                  collection={{
                    name: collection.name,
                    image: collection.image,
                    collectionId: collection.id,
                  }}
                />
              </LinkBox>
            </Link>
          ))}
        </Grid>
        {isMobile() && (
          <Flex justifyContent="space-between" marginTop="20px">
            <CreatorInfo>
              <RoundedIconComponent
                size={isClientMobie ? "36px" : "48px"}
                address={collection.creator}
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
