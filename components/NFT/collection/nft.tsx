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
        {collections.map(
          (collection, idx) =>
            (activeCategoryId == 0 ||
              collection.cat_ids
                .split(",")
                .indexOf(activeCategoryId.toString()) != -1) && (
              <NftCollectionCard collection={collection} key={collection.id} />
            )
        )}
      </Container>
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 50px 30px;
`;
