import { Flex, HStack, Stack } from "@chakra-ui/react";
import { RoundedIconComponent } from "components/RoundedIcon";
import DateCountdown from "components/DateCountdownMin";
import { useEffect, useState } from "react";
import {
  Collection,
  CW721,
  getRealTokenAmount,
  Market,
  NftInfo,
  useSdk,
} from "services/nft";
import { GradientBackground } from "styles/styles";
import styled from "styled-components";
import {
  PINATA_PRIMARY_IMAGE_SIZE,
  PINATA_SECONDARY_IMAGE_SIZE,
} from "util/constants";

const saleType = {
  NotSale: "NOT ON SALE",
  Auction: "CURRENT BID",
  Fixed: "BUY NOW",
};

const backgroundColor = {
  NotSale: "rgba(05, 06, 22, 0.2)",
  Auction: "rgba(219, 115, 115, 0.5)",
  Fixed: "#FFFFFF",
};

export function NftCard({ nft, type }: any): JSX.Element {
  return (
    <NftCardDiv
      className="nft-card"
      color={
        backgroundColor[
          Object.keys(nft.sale).length < 0 ? "NotSale" : nft.sale.sale_type
        ]
      }
      revertColor={
        Object.keys(nft.sale).length > 0 && nft.sale.sale_type === "Fixed"
      }
    >
      <>
        {nft.type == "video" && (
          <video controls>
            <source src={nft.image} />
          </video>
        )}
        {nft.type == "audio" && (
          <audio controls>
            <source src={nft.image} />
          </audio>
        )}

        {nft.type == "image" && (
          <ImgDiv className="nft-img-url">
            {" "}
            <Image
              src={nft.image + PINATA_PRIMARY_IMAGE_SIZE}
              alt="NFT Image"
            />
          </ImgDiv>
        )}

        <Stack paddingTop="15px">
          <Flex justifyContent="space-between">
            <NFTName>{nft.name}</NFTName>
            <HStack>
              <RoundedIconComponent size="26px" address={nft.owner} />
            </HStack>
          </Flex>

          <Flex justifyContent="space-between" paddingTop="10px 0">
            <Stack>
              <Title>
                {
                  saleType[
                    Object.keys(nft.sale).length === 0
                      ? "NotSale"
                      : nft.sale.sale_type
                  ]
                }
              </Title>
              {Object.keys(nft.sale).length > 0 &&
                nft.sale.sale_type === "Fixed" && (
                  <Flex alignItems="center">
                    <Value>
                      {getRealTokenAmount({
                        amount: nft.sale.initial_price,
                        denom: nft.paymentToken.denom,
                      })}
                    </Value>
                    &nbsp;
                    <img
                      src={nft.paymentToken.logoUri}
                      alt="token"
                      width="20px"
                      height="20px"
                    />
                  </Flex>
                )}
              {Object.keys(nft.sale).length > 0 &&
                nft.sale.sale_type === "Auction" && (
                  <Flex alignItems="center">
                    {nft.sale.requests.length > 0 ? (
                      <>
                        <Value>
                          {getRealTokenAmount({
                            amount:
                              nft.sale.requests[nft.sale.requests.length - 1]
                                .price,
                            denom: nft.paymentToken.denom,
                          })}
                        </Value>
                        &nbsp;
                        <img
                          src={nft.paymentToken.logoUri}
                          alt="token"
                          width="20px"
                          height="20px"
                        />
                      </>
                    ) : (
                      <>
                        <Value>
                          {getRealTokenAmount({
                            amount: nft.sale.initial_price,
                            denom: nft.paymentToken.denom,
                          })}
                        </Value>
                        &nbsp;
                        <img
                          src={nft.paymentToken.logoUri}
                          alt="token"
                          width="20px"
                          height="20px"
                        />
                      </>
                    )}
                  </Flex>
                )}
            </Stack>
            {nft.sale.sale_type === "Auction" && (
              <Stack>
                <Title>ENDS IN</Title>
                <Timetrack>
                  <DateCountdown
                    dateTo={Number(nft.sale.duration_type.Time[1]) * 1000}
                    dateFrom={Date.now()}
                    interval={0}
                    mostSignificantFigure="none"
                    numberOfFigures={3}
                  />
                </Timetrack>
              </Stack>
            )}
          </Flex>
        </Stack>
      </>
    </NftCardDiv>
  );
}
const NftCardDiv = styled(GradientBackground)<{
  color: string;
  revertColor: boolean;
}>`
  &:before {
    border-radius: 20px;
    opacity: 0.2;
  }
  background: ${({ color }) => color};
  border-radius: 20px;
  padding: 30px;
  height: 100%;
  width: 100%;
  min-width: 320px;
  cursor: pointer;
  color: ${({ revertColor }) => (revertColor ? "black" : "white")};
  @media (max-width: 1550px) {
    padding: 20px;
  }
  p {
    font-size: 16px;
    font-family: Mulish;
    @media (max-width: 1550px) {
      font-size: 16px;
    }
  }
  @media (max-width: 800px) {
    width: 320px;
  }
`;
const NFTName = styled.div`
  font-size: 20px;
`;
const Title = styled.div`
  font-size: 14px;
  @media (max-width: 1550px) {
    font-size: 12px;
  }
`;
const Value = styled.div`
  font-size: 18px;
  @media (max-width: 1550px) {
    font-size: 14px;
  }
`;
const Timetrack = styled.div`
  .dcd-info {
    font-size: 14px;
    width: 100%;
    @media (max-width: 1550px) {
      font-size: 12px;
    }
  }
  .dcd-val {
    font-size: 18px;
    @media (max-width: 1550px) {
      font-size: 14px;
    }
  }
`;

const ImgDiv = styled.div`
  width: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
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
  border-radius: 20px;
`;
const Logo = styled.img<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`;
