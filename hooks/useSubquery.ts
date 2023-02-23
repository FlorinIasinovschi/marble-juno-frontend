import { useEffect, useCallback } from "react";
import axios from "axios";
import { SUBQUERY_URL } from "util/constants";

const useSubquery = () => {
  const getAllNfts = useCallback(
    async ({ filter, skip = 0, limit = 12, sort }) => {
      if (filter == "all") {
        const query = `query {
          nftEntities(filter:{collectionId:{notEqualTo: "null"}},orderBy:${sort},offset:${skip},first: ${limit}) {
            nodes {
              id
              name
              imageUrl
              owner
              collection {
                uri
                name
                collectionId
              }
            }
          }
      }`;
        const {
          data: {
            data: {
              nftEntities: { nodes },
            },
          },
        } = await axios.post(SUBQUERY_URL, { query });
        return nodes;
      } else {
        const filterQuery = {
          fixed: `filter: {type: {equalTo: "Fixed"}},`,
          auction: `filter: {type: {equalTo: "Auction"}, bids: {equalTo: 0}},`,
          offer: `filter: {type: {equalTo: "Auction"}, bids: {greaterThan: 0}},`,
        };
        console.log("sort-esfesfs: ", sort, skip, limit);
        const query = `query {
          marketplaceEntities(${filterQuery[filter]}orderBy:${sort},offset:${skip},first: ${limit}) {
            nodes {
              nftInfo {
                id
                name
                imageUrl
                createdTime
                collection {
                  uri
                  name
                  collectionId
                }
              }
            }
          }
        }`;
        const {
          data: {
            data: {
              marketplaceEntities: { nodes },
            },
          },
        } = await axios.post(SUBQUERY_URL, { query });
        return nodes.map((_node) => _node.nftInfo);
      }
    },
    []
  );
  const getAllCollections = useCallback(async ({ filter, skip, limit }) => {
    let query = "";
    if (filter == "All") {
      query = `query {
        collectionEntities(offset: ${skip}, first:${limit}) {
          nodes{
            name
            uri
            creator
            collectionId
          }
        }
      }`;
    } else {
      query = `query {
        collectionEntities(filter:{category: {equalTo: "${filter}"}},offset: ${skip}, first:${limit}) {
          nodes{
            name
            uri
            creator
            collectionId
          }
        }
      }`;
    }
    const {
      data: {
        data: {
          collectionEntities: { nodes },
        },
      },
    } = await axios.post(SUBQUERY_URL, { query });
    return nodes;
  }, []);
  const getOwnedNfts = useCallback(
    async ({ owner, filter, skip = 0, limit = 12, sort }) => {
      if (filter == "all") {
        const query = `query {
          nftEntities(filter:{collectionId:{notEqualTo: "null"}, owner: {equalTo:"${owner}"}},orderBy:${sort},offset:${skip},first: ${limit}) {
            nodes {
              id
              name
              imageUrl
              owner
              collection {
                uri
                name
                collectionId
              }
            }
          }
      }`;
        const {
          data: {
            data: {
              nftEntities: { nodes },
            },
          },
        } = await axios.post(SUBQUERY_URL, { query });
        return nodes;
      } else {
        const filterQuery = {
          fixed: `filter: {type: {equalTo: "Fixed"}, owner:{equalTo: "${owner}"}},`,
          auction: `filter: {type: {equalTo: "Auction"}, bids: {equalTo: 0}, owner:{equalTo: "${owner}"}},`,
          offer: `filter: {type: {equalTo: "Auction"}, bids: {greaterThan: 0}, owner:{equalTo: "${owner}"}},`,
        };
        const query = `query {
          marketplaceEntities(${filterQuery[filter]}orderBy:${sort},offset:${skip},first: ${limit}) {
            nodes {
              nftInfo {
                id
                name
                imageUrl
                createdTime
                collection {
                  uri
                  name
                  collectionId
                }
              }
            }
          }
        }`;
        const {
          data: {
            data: {
              marketplaceEntities: { nodes },
            },
          },
        } = await axios.post(SUBQUERY_URL, { query });
        console.log("result: ", nodes);
        return nodes.map((_node) => _node.nftInfo);
      }
    },
    []
  );
  const getOwnedNftCounts = useCallback(async (owner) => {
    const fetchAllNftCounts = async () => {
      const query = `query {
        nftEntities(filter:{collectionId:{notEqualTo: "null"}, owner: {equalTo:"${owner}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            nftEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const fetchAllFixedCounts = async () => {
      const query = `query {
        marketplaceEntities(filter: {type: {equalTo: "Fixed"}, owner:{equalTo: "${owner}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            marketplaceEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const fetchAllAuctionCounts = async () => {
      const query = `query {
        marketplaceEntities(filter: {type: {equalTo: "Auction"}, bids: {equalTo: 0}, owner:{equalTo: "${owner}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            marketplaceEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const fetchAllOfferCounts = async () => {
      const query = `query {
        marketplaceEntities(filter: {type: {equalTo: "Auction"}, bids: {greaterThan: 0}, owner:{equalTo: "${owner}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            marketplaceEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const [nft, fixed, auction, offer] = await Promise.all([
      fetchAllNftCounts(),
      fetchAllFixedCounts(),
      fetchAllAuctionCounts(),
      fetchAllOfferCounts(),
    ]);
    return { nft, fixed, auction, offer };
  }, []);
  const getCreatedNfts = useCallback(
    async ({ creator, filter, skip = 0, limit = 12, sort }) => {
      if (filter == "all") {
        const query = `query {
          nftEntities(filter:{collectionId:{notEqualTo: "null"}, creator: {equalTo:"${creator}"}},orderBy:${sort},offset:${skip},first: ${limit}) {
            nodes {
              id
              name
              imageUrl
              owner
              collection {
                uri
                name
                collectionId
              }
            }
          }
      }`;
        const {
          data: {
            data: {
              nftEntities: { nodes },
            },
          },
        } = await axios.post(SUBQUERY_URL, { query });
        return nodes;
      } else {
        const filterQuery = {
          fixed: `filter: {type: {equalTo: "Fixed"}, creator:{equalTo: "${creator}"}},`,
          auction: `filter: {type: {equalTo: "Auction"}, bids: {equalTo: 0}, creator:{equalTo: "${creator}"}},`,
          offer: `filter: {type: {equalTo: "Auction"}, bids: {greaterThan: 0}, creator:{equalTo: "${creator}"}},`,
        };
        const query = `query {
          marketplaceEntities(${filterQuery[filter]}orderBy:${sort},offset:${skip},first: ${limit}) {
            nodes {
              nftInfo {
                id
                name
                imageUrl
                createdTime
                collection {
                  uri
                  name
                  collectionId
                }
              }
            }
          }
        }`;
        const {
          data: {
            data: {
              marketplaceEntities: { nodes },
            },
          },
        } = await axios.post(SUBQUERY_URL, { query });
        console.log("result: ", nodes);
        return nodes.map((_node) => _node.nftInfo);
      }
    },
    []
  );
  const getCreatedNftCounts = useCallback(async (creator) => {
    const fetchAllNftCounts = async () => {
      const query = `query {
        nftEntities(filter:{collectionId:{notEqualTo: "null"}, creator: {equalTo:"${creator}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            nftEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const fetchAllFixedCounts = async () => {
      const query = `query {
        marketplaceEntities(filter: {type: {equalTo: "Fixed"}, creator:{equalTo: "${creator}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            marketplaceEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const fetchAllAuctionCounts = async () => {
      const query = `query {
        marketplaceEntities(filter: {type: {equalTo: "Auction"}, bids: {equalTo: 0}, creator:{equalTo: "${creator}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            marketplaceEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const fetchAllOfferCounts = async () => {
      const query = `query {
        marketplaceEntities(filter: {type: {equalTo: "Auction"}, bids: {greaterThan: 0}, creator:{equalTo: "${creator}"}}) {
          totalCount
        }
      }`;
      const {
        data: {
          data: {
            marketplaceEntities: { totalCount },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return totalCount;
    };
    const [nft, fixed, auction, offer] = await Promise.all([
      fetchAllNftCounts(),
      fetchAllFixedCounts(),
      fetchAllAuctionCounts(),
      fetchAllOfferCounts(),
    ]);
    return { nft, fixed, auction, offer };
  }, []);
  const fetchOwnedCollections = useCallback(
    async ({ creator, skip, limit }) => {
      const query = `query {
        collectionEntities(filter:{creator: {equalTo:"${creator}"}}, offset:${skip}, first:${limit}) {
          nodes{
            id
            name
            uri
            creator
            collectionId
            category
          }
        }
      }`;
      const {
        data: {
          data: {
            collectionEntities: { nodes },
          },
        },
      } = await axios.post(SUBQUERY_URL, { query });
      return nodes;
    },
    []
  );
  const getSpecialNftInfo = useCallback(async (id) => {
    const query = `query {
      nftEntities(filter:{id: {equalTo:"${id}"}}) {
        nodes{
          owner
          imageUrl
          collection {
            name
            uri
          }
        }
      }
    }`;
    const {
      data: {
        data: {
          nftEntities: { nodes },
        },
      },
    } = await axios.post(SUBQUERY_URL, { query });
    return nodes[0];
  }, []);
  const fetchCollectionsById = useCallback(async (ids) => {
    const query = `query {
      collectionEntities(filter: {collectionId: {in: ["1"]}}) {
        nodes {
          name
          category
          creator
          uri
          collectionId
          nftEntitiesByCollectionId(first: 3, orderBy:CREATED_TIME_DESC) {
            nodes {
              id
              name
              owner
              vrUri
              arUri
              imageUrl
            }
          }
        }
      }
    }`;
    const {
      data: {
        data: {
          collectionEntities: { nodes },
        },
      },
    } = await axios.post(SUBQUERY_URL, { query });
    return nodes;
  }, []);
  return {
    getAllNfts,
    getAllCollections,
    getOwnedNfts,
    getOwnedNftCounts,
    getCreatedNfts,
    getCreatedNftCounts,
    fetchOwnedCollections,
    getSpecialNftInfo,
    fetchCollectionsById,
  };
};

export default useSubquery;
