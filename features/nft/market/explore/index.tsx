import * as React from "react";
import { useEffect, useState } from "react";
import { Spinner } from "@chakra-ui/react";
import { styled } from "components/theme";

import { CategoryTab, NftCollectionTable } from "components/NFT";
import { NftCategory, NftCollection, getFileTypeFromURL } from "services/nft";
import { Market, useSdk, Collection } from "services/nft";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

export const Explore = () => {
  //const fetcher = (url) => fetch(url).then((res) => res.json());
  //const { data } = useSWR('/api/readfiles', fetcher);
  const data = ["marblenauts"];

  const [nftcategories, setNftCategories] = useState<NftCategory[]>([]);
  const [nftcollections, setNftCollections] = useState<NftCollection[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState(0);
  const { client } = useSdk();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!client) {
        return;
      }

      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collectionList = await marketContract.listCollections();
      console.log("collectionList: ", collectionList);
      let res_categories = await fetch(process.env.NEXT_PUBLIC_CATEGORY_URL);
      let categories = await res_categories.json();
      setNftCategories(categories.categories);
      let collections = [];
      for (let i = 0; i < collectionList.length; i++) {
        let res_collection: any = {};
        try {
          let ipfs_collection = await fetch(
            process.env.NEXT_PUBLIC_PINATA_URL + collectionList[i].uri
          );
          res_collection = await ipfs_collection.json();
          console.log("ipfs_collection: ", res_collection);

          let collection_info: any = {};
          collection_info.id = collectionList[i].id;
          collection_info.name = res_collection.name;
          collection_info.description = res_collection.description;
          collection_info.image =
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
          collection_info.banner_image = res_collection.featuredImage
            ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
            : process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
          collection_info.slug = res_collection.slug;
          collection_info.creator = collectionList[i].owner ?? "";
          collection_info.cat_ids = res_collection.category;

          let collection_type = await getFileTypeFromURL(
            process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
          );
          collection_info.type = collection_type.fileType;
          collections.push(collection_info);
        } catch (err) {
          console.log("err", err);
        }
      }

      setNftCollections(collections);
      setLoading(false);
    })();
  }, [client]);
  console.log("nftcollection: ", nftcollections);
  return (
    <ExploreWrapper>
      <CategoryTab
        categories={nftcategories}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
      />

      {loading ? (
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            padding: "20px",
          }}
        >
          <Spinner size="xl" />
        </div>
      ) : (
        <NftCollectionTable
          collections={nftcollections}
          activeCategoryId={activeCategoryId}
        />
      )}
    </ExploreWrapper>
  );
};

const ExploreWrapper = styled("div", {
  " .category-menus": {
    borderBottom: "1px solid $borderColors$default",
    display: "flex",
    justifyContent: "space-between",
    overFlow: "hidden",
    "&.desktop-section": {
      " >span": {
        minWidth: "8%",
        textAlign: "center",
        paddingBottom: "$8",
        cursor: "pointer",
        "&.active": {
          borderBottom: "4px solid $selected",
        },
      },
    },
    "&.mobile-section": {
      " >span": {
        minWidth: "18%",
        textAlign: "center",
        paddingBottom: "$8",
        cursor: "pointer",
        "&.active": {
          borderBottom: "4px solid $selected",
        },
      },
    },
  },
});
