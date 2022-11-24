import * as React from "react";
import { NftCollection } from "services/nft";
import styled from "styled-components";
import { NftCollectionCard } from "./nftCollenctionCard";

interface NftCollectionProps {
  readonly collections: NftCollection[];
  readonly activeCategoryId: number;
}

export function NftCollectionTable({
  collections,
  activeCategoryId,
}: NftCollectionProps): JSX.Element {
  return (
    <>
      <Container>
        {collections.map((collection, idx) => (
          <NftCollectionCard collection={collection} key={idx} />
        ))}
      </Container>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 50px 30px;
  padding: 20px;
  @media (max-width: 1550px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;
