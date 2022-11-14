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
  interval: number;
  owner: string;
  lock_time: number;
  total_supply: number;
}

export interface UserStakeInfoType {
  address: string;
  claimed_amount: string;
  claimed_timestamp: number;
  create_unstake_timestamp: number;
  last_timestamp: number;
  token_ids: string[];
  unclaimed_amount: string;
}
export interface StakeInstance {
  readonly contractAddress: string;
  getConfig: () => Promise<StakeContractConfig>;
  getStaking: (address: string) => Promise<UserStakeInfoType>;
}

export interface StakeTxInstance {
  readonly contractAddress: string;
  claim: (owner: string) => Promise<any>;
  createUnstake: (owner: string) => Promise<any>;
  fetchUnstake: (owner: string) => Promise<any>;
}

export interface StakeContract {
  use: (client: CosmWasmClient) => StakeInstance;
  useTx: (client: SigningCosmWasmClient) => StakeTxInstance;
}

export const Stake = (contractAddress: string): StakeContract => {
  const defaultExecuteFee = unsafelyGetDefaultExecuteFee();

  const use = (client: CosmWasmClient): StakeInstance => {
    const getStaking = async (address): Promise<UserStakeInfoType> => {
      const result = await client.queryContractSmart(contractAddress, {
        get_staking: { address },
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
    const claim = async (owner: string): Promise<any> => {
      const result = await client.execute(
        owner,
        contractAddress,
        {
          claim: {},
        },
        defaultExecuteFee
      );
      return result;
    };
    const createUnstake = async (owner: string): Promise<any> => {
      const result = await client.execute(
        owner,
        contractAddress,
        {
          create_unstake: {},
        },
        defaultExecuteFee
      );
      return result;
    };
    const fetchUnstake = async (owner: string): Promise<any> => {
      const result = await client.execute(
        owner,
        contractAddress,
        {
          fetch_unstake: {},
        },
        defaultExecuteFee
      );
      return result;
    };
    return {
      contractAddress,
      claim,
      createUnstake,
      fetchUnstake,
    };
  };

  return { use, useTx };
};
