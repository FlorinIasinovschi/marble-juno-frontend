import {
  CosmWasmClient,
  SigningCosmWasmClient,
} from "@cosmjs/cosmwasm-stargate";
import { unsafelyGetDefaultExecuteFee } from "util/fees";
export interface StakeContractConfig {
  collection_address: string;
  cw20_address: string;
  daily_reward: string;
  enabled: boolean;
  interval:number;
  owner: string
}

export interface StakeInstance {
  readonly contractAddress: string;
  getConfig: () => Promise<StakeContractConfig>;
  getStaking: (address: string) => Promise<StakeContractConfig>
}

export interface StakeTxInstance {
  readonly contractAddress: string;
}

export interface StakeContract {
  use: (client: CosmWasmClient) => StakeInstance;
  useTx: (client: SigningCosmWasmClient) => StakeTxInstance;
}

export const Stake = (contractAddress: string): StakeContract => {
  const defaultExecuteFee = unsafelyGetDefaultExecuteFee();

  const use = (client: CosmWasmClient): StakeInstance => {
    const getStaking = async (address): Promise<StakeContractConfig> => {
      const result = await client.queryContractSmart(contractAddress, {
        query_get_staking: {address},
      });
      return result;
    };

    const getConfig = async (): Promise<StakeContractConfig> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_config: {},
      });
      return result;
    };
    
    return {
      contractAddress,
      getConfig,
      getStaking,
    };
  };

  const useTx = (client: SigningCosmWasmClient): StakeTxInstance => {

    return {
      contractAddress,
    };
  };

  return { use, useTx };
};
