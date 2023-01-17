import { LinkBox } from "@chakra-ui/react";
import Link from "next/link";
import styled from "styled-components";
import { NftCard } from "../nft-card";

export function NftTable({ data, nft_column_count = 3 }) {
  return (
    <NftGrid columns={nft_column_count}>
      {data.map((nft, index) => (
        <Link
          href={`/nft/${nft.collectionId}/${nft.tokenId}`}
          passHref
          key={index}
        >
          <LinkBox as="picture">
            <NftCard nft={nft} />
          </LinkBox>
        </Link>
      ))}
    </NftGrid>
  );
}
const NftGrid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: ${({ columns }) => `repeat(${columns},1fr)`};
  grid-row-gap: 20px;
  grid-column-gap: 20px;
  padding: 20px;
  overflow: hidden;
  overflow: auto;
`;
