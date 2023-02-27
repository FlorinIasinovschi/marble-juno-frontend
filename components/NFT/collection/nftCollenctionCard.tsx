import * as React from "react";
import Link from "next/link";
import { NftCollection } from "services/nft";
import styled from "styled-components";
import { Stack, HStack, LinkBox } from "@chakra-ui/react";
import { isClientMobie } from "util/device";
import { GradientBackground } from "styles/styles";
import { RoundedIconComponent } from "components/RoundedIcon";
import Image from "components/Img";
import {
  PINATA_PRIMARY_IMAGE_SIZE,
  PINATA_SECONDARY_IMAGE_SIZE,
} from "util/constants";
interface NftCollectionCardProps {
  readonly collection: NftCollection;
}

export function NftCollectionCard({
  collection,
}: NftCollectionCardProps): JSX.Element {
  return (
    <CollectionDiv className="collection">
      <ImgDiv className="nft-img-div" isImage={collection.type == "image"}>
        {collection.type == "image" && (
          <StyledImage
            src={collection.image + PINATA_PRIMARY_IMAGE_SIZE}
            alt="NFT Image"
          />
        )}
        {collection.type == "video" && (
          <video controls>
            <source src={collection.image} />
          </video>
        )}
        {collection.type == "audio" && (
          <audio controls>
            <source src={collection.image} />
          </audio>
        )}

        <HoverDiv>
          <Title>{collection.name}</Title>
          <HStack justifyContent="flex-end">
            <RoundedIconComponent
              size="34px"
              address={collection.creator}
              font={isClientMobie ? "15px" : "20px"}
            />
          </HStack>
        </HoverDiv>
      </ImgDiv>
    </CollectionDiv>
  );
}

const CollectionDiv = styled.div`
  border-radius: 20px;
  height: 100%;
  cursor: pointer;
  @media (max-width: 1024px) {
    width: 320px;
  }
`;

const ImgDiv = styled.div<{ isImage: boolean }>`
  width: 100%;
  display: block;
  position: relative;
  ${({ isImage }) => isImage && `padding-bottom: 100%`};

  video {
    border-radius: 20px;
    opacity: 0.5;
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
  border-radius: 20px;
  opacity: 0.5;
`;

const Title = styled.div`
  font-size: 20px;
  overflow-wrap: anywhere;
  @media (max-width: 1450px) {
    font-size: 18px;
  }
`;

const HoverDiv = styled.div<{ hover: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  padding: 50px 30px 70px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
