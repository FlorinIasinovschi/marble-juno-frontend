import { Flex, HStack, Stack } from "@chakra-ui/react";
import { RoundedIconComponent } from "components/RoundedIcon";
import DateCountdown from "components/DateCountdownMin";
import { useEffect, useState } from "react";
import { getRealTokenAmount } from "services/nft";
import { GradientBackground } from "styles/styles";
import { getProfileInfo } from "hooks/useProfile";
import { getReducedAddress } from "util/conversion";
import Image from "components/Img";
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

export function NftCard({ nft, collection }: any): JSX.Element {
  const [hover, setHover] = useState(false);
  const [profile, setProfile] = useState<any>({});
  const handleClick = (e) => {
    e.preventDefault();
  };
  useEffect(() => {
    (async () => {
      const profile_info = await getProfileInfo(nft.owner);
      setProfile(profile_info);
    })();
  }, [nft]);
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
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <Stack padding="15px 20px">
        <Flex justifyContent="space-between">
          <NFTName>{nft.name}</NFTName>
          <HStack>
            <IconWrapper
              revertColor={nft.saleType === "Direct Sell"}
              onClick={handleClick}
            >
              VR
            </IconWrapper>
            <IconWrapper
              revertColor={nft.saleType === "Direct Sell"}
              onClick={handleClick}
            >
              AR
            </IconWrapper>
          </HStack>
          {/* <HStack>
              <RoundedIconComponent size="34px" address={nft.owner} />
            </HStack> */}
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
      <ImgDiv
        className="nft-img-url"
        isImage={nft.type == "image"}
        hover={hover}
      >
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
          <StyledImage
            src={nft.image + PINATA_PRIMARY_IMAGE_SIZE}
            hover={hover}
            alt="NFT Image"
          />
        )}
        <HoverDivContent hover={hover}>
          <HStack>
            <Logo
              src={`${
                process.env.NEXT_PUBLIC_PINATA_URL + profile.avatar
              }${PINATA_SECONDARY_IMAGE_SIZE}`}
              alt="logo"
              size="34px"
            />
            <p>{profile.name || getReducedAddress(nft.owner)}</p>
          </HStack>
          {/* {collection?.image && ( */}
          <HStack>
            <Logo
              src={collection.image + PINATA_SECONDARY_IMAGE_SIZE}
              alt="logo"
              size="34px"
            />
            <p style={{ fontSize: "25px", fontWeight: "bold" }}>
              {collection.name}
            </p>
          </HStack>
          {/* )} */}
        </HoverDivContent>
      </ImgDiv>
    </NftCardDiv>
  );
}

const HoverDivContent = styled.div<{ hover: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  z-index: 10;
  padding: 30px;
  color: white;
  ${({ hover }) => !hover && `display: none`};
`;
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
  height: 100%;
  width: 100%;
  min-width: 320px;
  cursor: pointer;
  color: ${({ revertColor }) => (revertColor ? "black" : "white")};
  display: flex;
  flex-direction: column;
  justify-content: space-between;

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

const ImgDiv = styled.div<{ isImage: boolean; hover: boolean }>`
  width: 100%;
  ${({ isImage }) => isImage && `padding-bottom: 100%`};
  display: block;
  position: relative;
  background: black;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  video {
    border-bottom-left-radius: 20px;
    border-bottom-right-radius: 20px;
    opacity: ${({ hover }) => (hover ? "0.6" : "1")};
  }
`;
const StyledImage = styled(Image)<{ hover: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  opacity: ${({ hover }) => (hover ? "0.6" : "1")};
`;
const Logo = styled(Image)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: 50%;
`;
const IconWrapper = styled.div<{ revertColor: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${({ revertColor }) =>
    revertColor ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"};
  font-family: Mulish;
  font-size: 14px;
  border-radius: 50%;
  width: 34px;
  height: 34px;
`;
