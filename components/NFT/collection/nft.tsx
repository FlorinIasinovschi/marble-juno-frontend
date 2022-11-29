import { ChakraProvider, LinkBox } from "@chakra-ui/react";
import Link from "next/link";
import { NftCollection } from "services/nft";
import styled from "styled-components";
import { NftCollectionCard } from "./nftCollenctionCard";

interface NftCollectionProps {
  readonly collections: NftCollection[];
}

export function NftCollectionTable({
  collections,
}: NftCollectionProps): JSX.Element {
  return (
    <ChakraProvider>
      <Container>
        {collections.map((collection, idx) => (
          <Link href={`/collection/${collection.id}`} passHref key={idx}>
            <LinkBox
              as="picture"
              transition="transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1) 0s"
              _hover={{
                transform: "scale(1.05)",
              }}
            >
              <NftCollectionCard key={idx} collection={collection} />
            </LinkBox>
          </Link>
        ))}
      </Container>
    </ChakraProvider>
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
