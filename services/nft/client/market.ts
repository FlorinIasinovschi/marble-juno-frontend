import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { Coin } from "@cosmjs/stargate";
import { unsafelyGetDefaultExecuteFee } from "util/fees";
import { FACTORY_ADDRESS } from "util/constants";
export interface MarketContractConfig {
  owner: string;
  max_collection_id: number;
  collection_code_id: number;
  cw721_base_code_id: number;
}
export interface OfferResponse {
  contract: string;
  id: string;
  list_price: Coin;
  seller: string;
  token_id: string;
}

export interface OffersResponse {
  offers: OfferResponse[];
}

export interface CollectionResponse {
  id: string;
  address: string;
  creator: string;
  uri: string;
  category: string;
  name: string;
}

export interface CollectonListResponse {
  collection: CollectionResponse[];
}

export interface MarketInstance {
  readonly contractAddress: string;
  listCollections: () => Promise<CollectionResponse[]>;
  ownedCollections: (address: string) => Promise<CollectionResponse[]>;
  config: () => Promise<MarketContractConfig>;
  collection: (id: string) => Promise<CollectionResponse>;
  //old functions
  numOffers: () => Promise<number>;
  offer: (
    contract: string,
    tokenId: string
  ) => Promise<OfferResponse | undefined>;
  offersBySeller: (
    seller: string,
    startAfter?: string,
    limit?: number
  ) => Promise<OffersResponse>;
  allOffers: (startAfter?: string, limit?: number) => Promise<OffersResponse>;
}

interface Royalty {
  address: string;
  royalty_rate: string;
}
export interface MarketTxInstance {
  readonly contractAddress: string;
  // actions
  addCollection: (
    owner: string,
    name: string,
    royalties: Royalty[],
    category: string
  ) => Promise<any>;
  editUserCollection: (
    owner: string,
    id: string,
    category: string,
    uri: string
  ) => Promise<any>;
}

export interface MarketContract {
  use: (client: CosmWasmClient) => MarketInstance;
  useTx: (client: SigningCosmWasmClient) => MarketTxInstance;
}

export interface EditCollectionDataInstance {
  id: number;
  owner: string;
  collection_address: string;
  cw721_address: string;
  uri: string;
}

export const Factory = (): MarketContract => {
  const contractAddress = FACTORY_ADDRESS;
  const defaultExecuteFee = unsafelyGetDefaultExecuteFee();

  const use = (client: CosmWasmClient): MarketInstance => {
    const config = async (): Promise<MarketContractConfig> => {
      const result = await client.queryContractSmart(contractAddress, {
        config: {},
      });
      return result;
    };
    const listCollections = async (): Promise<CollectionResponse[]> => {
      const result = await client.queryContractSmart(contractAddress, {
        list_collections: {
          // start_after: skip,
          // limit: limit,
        },
      });
      return result;
    };
    const collection = async (id: string): Promise<CollectionResponse> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_collection: { id },
      });
      return result;
    };
    const ownedCollections = async (address): Promise<CollectionResponse[]> => {
      const result = await client.queryContractSmart(contractAddress, {
        owned_collections: {
          owner: address,
        },
      });
      return result;
    };
    const numOffers = async (): Promise<number> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_count: {},
      });
      return result.count;
    };

    const offer = async (
      contract: string,
      tokenId: string
    ): Promise<OfferResponse | undefined> => {
      const result: OffersResponse = await client.queryContractSmart(
        contractAddress,
        { get_offer: { contract, token_id: tokenId } }
      );
      return result.offers.length > 0 ? result.offers[0] : undefined;
    };

    const offersBySeller = async (
      seller: string,
      startAfter?: string,
      limit?: number
    ): Promise<OffersResponse> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_offers: { seller, start_after: startAfter, limit: limit },
      });
      return result;
    };

    const allOffers = async (
      startAfter?: string,
      limit?: number
    ): Promise<OffersResponse> => {
      const result = await client.queryContractSmart(contractAddress, {
        all_offers: { start_after: startAfter, limit: limit },
      });
      return result;
    };
    return {
      contractAddress,
      config,
      listCollections,
      collection,
      numOffers,
      offer,
      offersBySeller,
      allOffers,
      ownedCollections,
    };
  };

  const useTx = (client: SigningCosmWasmClient): MarketTxInstance => {
    const addCollection = async (
      owner: string,
      name: string,
      royalties: Royalty[],
      category: string
    ): Promise<any> => {
      const result = await client.execute(
        owner,
        contractAddress,
        {
          add_user_collection: {
            collection_info: {
              name: name,
              royalties: royalties,
              category: category,
            },
          },
        },
        defaultExecuteFee
      );

      return result;
    };

    const editUserCollection = async (
      owner: string,
      id: string,
      category: string,
      uri: string
    ) => {
      const result = await client.execute(
        owner,
        contractAddress,
        {
          edit_user_collection: {
            id,
            edit_collection_info: {
              category,
              uri,
            },
          },
        },
        defaultExecuteFee
      );
      return result;
    };

    return {
      contractAddress,
      addCollection,
      editUserCollection,
    };
  };

  return { use, useTx };
};
