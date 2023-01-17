import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { unsafelyGetDefaultExecuteFee } from "util/fees";
import { coins, coin } from "@cosmjs/stargate";
import { fromBase64, toBase64 } from "@cosmjs/encoding";

export interface CollectionContractConfig {
  owner: string;
  cw20_address: string;
  cw721_address: string;
  max_tokens: number;
  name: string;
  symbol: string;
  unused_token_id: number;
  royalty: number;
  uri: string;
}

export interface DurationType {
  startTime: number;
  endTime: number;
}
export interface SaleResponse {
  readonly tokenId: number;
  readonly provider: string;
  readonly sale_type: string;
  readonly duration_type: any;
  readonly initial_price: string;
}

export interface CollectionInstance {
  readonly contractAddress: string;
  getSales: () => Promise<SaleResponse[]>;
  getPrice: (token_id: number[]) => Promise<number>;
  getConfig: () => Promise<CollectionContractConfig>;
  getSale: (token_id: string, nft_address: string) => Promise<SaleResponse>;
}
export interface NftBulkExtension {}
export interface CollectionTxInstance {
  readonly contractAddress: string;
  // actions
  propose: (
    sender: string,
    tokenId: string,
    nft_address: string,
    price: string,
    denom: string
  ) => Promise<string>;
  buy: (
    sender: string,
    cw20Address: string,
    amount: string,
    encodedMsg: string
  ) => Promise<string>;
  startSale: (
    sender: string,
    token_id: number,
    sale_type: string,
    duration_type: DurationType,
    initial_price: number
  ) => Promise<string>;
  cancelSale: (
    sender: string,
    token_id: string,
    nft_address: string
  ) => Promise<string>;
  acceptSale: (
    sender: string,
    token_id: string,
    nft_address: string
  ) => Promise<string>;
  cancelPropose: (
    sender: string,
    tokenId: string,
    nft_address: string
  ) => Promise<string>;
  changeContract: (sender: string, cw721_address: string) => Promise<string>;
  changeOwner: (sender: string, owner: string) => Promise<string>;
  changeCw721Owner: (sender: string, owner: string) => Promise<string>;
  manualReceiveNft: (
    sender: string,
    token_id: string,
    nft_address: string
  ) => Promise<string>;
}

export interface CollectionContract {
  use: (client: CosmWasmClient) => CollectionInstance;
  useTx: (client: SigningCosmWasmClient) => Partial<CollectionTxInstance>;
}

export const Marketplace = (contractAddress: string): CollectionContract => {
  const defaultExecuteFee = unsafelyGetDefaultExecuteFee();
  const use = (client: CosmWasmClient): CollectionInstance => {
    const getConfig = async (): Promise<CollectionContractConfig> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_config: {},
      });
      return result;
    };
    const getSales = async (): Promise<SaleResponse[]> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_sales: {},
      });
      return result.list;
    };
    const getSale = async (
      token_id: string,
      nft_address: string
    ): Promise<SaleResponse> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_sale: {
          token_id,
          nft_address,
        },
      });
      return result;
    };
    const getPrice = async (token_id: number[]): Promise<number> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_price: { token_id: token_id },
      });
      return result;
    };
    return {
      contractAddress,
      getConfig,
      getSales,
      getPrice,
      getSale,
    };
  };
  const useTx = (
    client: SigningCosmWasmClient
  ): Partial<CollectionTxInstance> => {
    const defaultFee = {
      amount: [],
      gas: "400000",
    };

    const propose = async (
      sender: string,
      tokenId: string,
      nft_address: string,
      price: string,
      denom: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        { propose: { token_id: tokenId, nft_address, denom: denom } },
        defaultExecuteFee,
        "",
        [coin(price, denom)]
      );
      return result.transactionHash;
    };
    const cancelPropose = async (
      sender: string,
      tokenId: string,
      nft_address: string
    ) => {
      const result = await client.execute(
        sender,
        contractAddress,
        {
          cancel_propose: {
            token_id: tokenId,
            nft_address,
          },
        },
        defaultExecuteFee
      );
      return result.transactionHash;
    };
    const buy = async (
      sender: string,
      cw20Address: string,
      amount: string,
      encodedMsg: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        cw20Address,
        {
          send: { contract: contractAddress, amount: amount, msg: encodedMsg },
        },
        defaultExecuteFee
      );
      return result.transactionHash;
    };

    const startSale = async (
      sender: string,
      token_id: number,
      sale_type: string,
      duration_type: DurationType,
      initial_price: number
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        {
          start_sale: {
            token_id: token_id,
            sale_type: sale_type,
            duration_type: {
              Time: {
                start: duration_type.startTime,
                end: duration_type.endTime,
              },
            },
            initial_price: initial_price.toString(),
          },
        },
        defaultExecuteFee
      );
      return result.transactionHash;
    };
    // const editSale = async (
    //   sender: string,
    //   token_id: number,
    //   sale_type: string,
    //   duration_type: DurationType,
    //   initial_price: number,
    //   reserve_price: number,

    // ): Promise<string> => {
    //   const result = await client.execute(
    //     sender,
    //     contractAddress,
    //     {
    //       start_sale: {
    //         token_id: token_id,
    //         sale_type: sale_type,
    //         duration_type: {
    //           Time: {
    //             start: duration_type.startTime,
    //             end: duration_type.endTime,
    //           },
    //         },
    //         initial_price: initial_price.toString(),
    //       },
    //     },
    //     defaultExecuteFee
    //   );
    //   return result.transactionHash;
    // };
    const cancelSale = async (
      sender: string,
      token_id: string,
      nft_address: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        { cancel_sale: { token_id, nft_address } },
        defaultExecuteFee
      );
      return result.transactionHash;
    };

    const acceptSale = async (
      sender: string,
      token_id: string,
      nft_address: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        { accept_sale: { token_id, nft_address } },
        defaultExecuteFee
      );
      return result.transactionHash;
    };

    const manualReceiveNft = async (
      sender: string,
      token_id: string,
      nft_address: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        {
          manual_send_nft: {
            token_id,
            nft_address,
          },
        },
        defaultExecuteFee
      );
      return result.transactionHash;
    };

    const changeContract = async (
      sender: string,
      cw721_address: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        { change_contract: { cw721_address: cw721_address } },
        defaultFee
      );
      return result.transactionHash;
    };
    const changeOwner = async (
      sender: string,
      owner: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        { change_owner: { owner: owner } },
        defaultFee
      );
      return result.transactionHash;
    };
    const changeCw721Owner = async (
      sender: string,
      owner: string
    ): Promise<string> => {
      const result = await client.execute(
        sender,
        contractAddress,
        { change_cw721_owner: { owner: owner } },
        defaultFee
      );
      return result.transactionHash;
    };

    return {
      contractAddress,
      propose,
      buy,
      startSale,
      cancelSale,
      acceptSale,
      changeContract,
      changeOwner,
      changeCw721Owner,
      cancelPropose,
      manualReceiveNft,
    };
  };
  return { use, useTx };
};
