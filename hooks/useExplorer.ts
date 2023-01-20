import { useEffect } from "react";
import { fetchAllProfileCounts } from "hooks/useProfile";
import { COUNT_INFO } from "store/types";
import { useDispatch } from "react-redux";
import { SUBQUERY_URL } from "util/constants";
import axios from "axios";

const useExplorer = () => {
  const dispatch = useDispatch();
  async function fetchAllNFTCollectionCounts() {
    const query = `query {
      nftEntities(filter: {collectionId:{notEqualTo: "null"}}) {
          totalCount
      }
      collectionEntities {
        totalCount
      }
      marketplaceEntities(filter:{type:{equalTo: "Fixed"}}) {
        totalCount
      }
    }`;
    const {
      data: { data },
    } = await axios.post(SUBQUERY_URL, { query });
    return data;
  }
  async function fetchAllAuctionNfts() {
    const query = `query {
      marketplaceEntities(filter:{type:{equalTo: "Auction"}, bids: {equalTo: 0}}) {
        totalCount
      }
    }`;
    const {
      data: { data },
    } = await axios.post(SUBQUERY_URL, { query });
    return data;
  }
  async function fetchOfferNfts() {
    const query = `query {
      marketplaceEntities(filter:{type:{equalTo: "Auction"}, bids: {greaterThan: 0}}) {
        totalCount
      }
    }`;
    const {
      data: { data },
    } = await axios.post(SUBQUERY_URL, { query });
    return data;
  }
  useEffect(() => {
    (async () => {
      const [totalNFTCollections, auctionNfts, offerNfts, totalProfiles] =
        await Promise.all([
          fetchAllNFTCollectionCounts(),
          fetchAllAuctionNfts(),
          fetchOfferNfts(),
          fetchAllProfileCounts(),
        ]);

      dispatch({
        type: COUNT_INFO,
        payload: {
          nft: totalNFTCollections.nftEntities.totalCount,
          collection: totalNFTCollections.collectionEntities.totalCount,
          fixed: totalNFTCollections.marketplaceEntities.totalCount,
          auction: auctionNfts.marketplaceEntities.totalCount,
          offer: offerNfts.marketplaceEntities.totalCount,
          profile: totalProfiles,
        },
      });
    })();
  }, []);

  return null;
};

export default useExplorer;
