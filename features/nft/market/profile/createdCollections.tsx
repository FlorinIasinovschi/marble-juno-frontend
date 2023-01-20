import { useEffect, useState } from "react";
import styled from "styled-components";
// import { CollectionFilter } from './filter'
import { ChakraProvider, Spinner, LinkBox } from "@chakra-ui/react";
import { NftTable } from "components/NFT";
import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { default_image } from "util/constants";
import { useRecoilValue } from "recoil";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import {
  Marketplace,
  CW721,
  getFileTypeFromURL,
  getRealTokenAmount,
  Factory,
  PaymentToken,
  useSdk,
} from "services/nft";
import { walletState } from "state/atoms/walletAtoms";
import useSubquery from "hooks/useSubquery";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

const MyCreatedCollections = ({ id }) => {
  const { fetchOwnedCollections } = useSubquery();
  const { client } = useSdk();
  const [ownedCollections, setOwnedCollections] = useState([]);
  useEffect(() => {
    (async () => {
      const collectionList = await fetchOwnedCollections({
        creator: id,
        skip: 0,
        limit: 12,
      });
      const collectionData = await Promise.all(
        collectionList.map(async (_collection) => {
          try {
            let collection_info: any = {};
            const ipfs_collection = await fetch(
              process.env.NEXT_PUBLIC_PINATA_URL + _collection.uri
            );
            const res_collection = await ipfs_collection.json();
            collection_info.id = _collection.collectionId;
            collection_info.name = _collection.name;
            collection_info.description = res_collection.description;
            collection_info.slug = res_collection.slug;
            collection_info.creator = _collection.creator;
            collection_info.cat_ids = _collection.category;

            if (res_collection.logo) {
              let collection_type = await getFileTypeFromURL(
                process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
              );
              collection_info.type = collection_type.fileType;
            } else {
              collection_info.type = "image";
            }
            if (res_collection.logo) {
              collection_info.image =
                process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
            } else {
              collection_info.image = "https://via.placeholder.com/70";
            }
            if (res_collection.featuredImage) {
              collection_info.banner_image =
                process.env.NEXT_PUBLIC_PINATA_URL +
                res_collection.featuredImage;
            } else {
              collection_info.banner_image = "https://via.placeholder.com/70";
            }
            return collection_info;
          } catch (err) {
            return {};
          }
        })
      );
      setOwnedCollections(collectionData);
    })();
  }, [client]);
  console.log("ownedCollectios: ", ownedCollections);
  return (
    <CollectionWrapper>
      <CollectionList>
        {ownedCollections.map((collection, idx) => (
          <Link href={`/collection/${collection.id}`} passHref key={idx}>
            <LinkBox as="picture">
              <NftCollectionCard key={idx} collection={collection} />
            </LinkBox>
          </Link>
        ))}
      </CollectionList>
    </CollectionWrapper>
  );
};

const CollectionWrapper = styled.div`
  @media (max-width: 480px) {
    width: fit-content;
  }
`;

const CollectionList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

export default MyCreatedCollections;
