import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import DateCountdown from "components/DateCountdown";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { Button } from "components/Button";
import { walletState } from "state/atoms/walletAtoms";
import { getRandomInt } from "util/numbers";
import { toast } from "react-toastify";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  convertToFixedDecimalNumber,
  convertMicroDenomToDenom,
} from "util/conversion";
import {
  Collection,
  Stake,
  NftCollection,
  CW721,
  UserStakeInfoType,
  useSdk,
  getFileTypeFromURL,
} from "services/nft";
import { useRecoilValue } from "recoil";
import { GradientBackground, SecondGradientBackground } from "styles/styles";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";
interface StakeConfigType {
  daily_reward: string;
  enabled: boolean;
  cw20_address: string;
  interval: number;
  lock_time: number;
  collection_address: string;
  cw721_address: string;
  total_supply: number;
  end_date: number;
}

export default function StakePage() {
  const { client } = useSdk();
  const [collection, setCollection] = useState<NftCollection>();
  const { address, client: signingClient } = useRecoilValue(walletState);
  const [stakeConfig, setStakeConfig] = useState<StakeConfigType>({
    daily_reward: "0",
    enabled: false,
    cw20_address: "",
    interval: 0,
    lock_time: 0,
    collection_address: "",
    cw721_address: "",
    total_supply: 0,
    end_date: 0,
  });
  const [rCount, setRCount] = useState(0);
  const [userStakeInfo, setUserStakeInfo] = useState<UserStakeInfoType>({
    address: "",
    claimed_amount: "0",
    unclaimed_amount: "0",
    create_unstake_timestamp: 0,
    token_ids: [],
    last_timestamp: 0,
    claimed_timestamp: 0,
  });
  const [ownedNfts, setOwnedNfts] = useState([]);
  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }
      const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).use(client);
      try {
        const userStakeInfo = await stakeContract.getStaking(address);
        console.log("userStakeInfo: ", userStakeInfo);
        setUserStakeInfo(userStakeInfo);
      } catch (err) {
        setUserStakeInfo({
          address: "",
          claimed_amount: "0",
          unclaimed_amount: "0",
          create_unstake_timestamp: 0,
          token_ids: [],
          last_timestamp: 0,
          claimed_timestamp: 0,
        });
      }
      try {
        const _stakeConfig = await stakeContract.getConfig();
        const collectionContract = Collection(
          _stakeConfig.collection_address
        ).use(client);
        const collectionConfig = await collectionContract.getConfig();
        setStakeConfig({
          ..._stakeConfig,
          cw721_address: collectionConfig.cw721_address,
        });
        let res_collection: any = {};
        let ipfs_collection = await fetch(
          process.env.NEXT_PUBLIC_PINATA_URL + collectionConfig.uri
        );
        res_collection = await ipfs_collection.json();

        let collection_info: any = {};
        collection_info.id = 0;
        collection_info.name = res_collection.name;
        collection_info.description = res_collection.description;
        collection_info.image =
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
        collection_info.banner_image = res_collection.featuredImage
          ? process.env.NEXT_PUBLIC_PINATA_URL + res_collection.featuredImage
          : process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo;
        collection_info.slug = res_collection.slug;
        collection_info.creator = collectionConfig.owner ?? "";
        collection_info.cat_ids = res_collection.category;

        let collection_type = await getFileTypeFromURL(
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo
        );
        collection_info.type = collection_type.fileType;

        setCollection(collection_info);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [client, address, rCount]);
  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }
      try {
        const cw721Contract = CW721(stakeConfig.cw721_address).use(client);
        const tokenIdsInfo = await cw721Contract.tokens(address);
        const tokenIds = tokenIdsInfo.tokens;
        setOwnedNfts(tokenIds);
      } catch (err) {
        console.log("get ownedToekns Error: ", err);
      }
    })();
  }, [stakeConfig, client, address]);
  const handleStake = async () => {
    try {
      const selectedNum = getRandomInt(ownedNfts.length);
      const cw721Contract = CW721(stakeConfig.cw721_address).useTx(
        signingClient
      );
      let encodedMsg: string = toBase64(
        new TextEncoder().encode(JSON.stringify({ stake: {} }))
      );

      const result = await cw721Contract.sendNft(
        address,
        PUBLIC_STAKE_ADDRESS,
        ownedNfts[selectedNum],
        encodedMsg
      );
      toast.success(`Successfully Staked`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setRCount(rCount + 1);
    } catch (err) {}
  };
  const handleUnstake = async () => {
    try {
      if (
        userStakeInfo.create_unstake_timestamp > 0 &&
        userStakeInfo.create_unstake_timestamp + stakeConfig.lock_time >
          Date.now() / 1000
      ) {
        return;
      }
      const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).useTx(signingClient);
      if (userStakeInfo.create_unstake_timestamp === 0) {
        const unCrateUnstakeResult = await stakeContract.createUnstake(address);
      } else {
        const fetchUnstakeResult = await stakeContract.fetchUnstake(address);
      }
      toast.success(`Successfully Unstaked`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setRCount(rCount + 1);
    } catch (err) {
      console.log("unstakeError: ", err);
    }
  };

  const handleClaim = async () => {
    const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).useTx(signingClient);
    try {
      await stakeContract.claim(address);
      setRCount(rCount + 1);
      toast.success(`Successfully Claimed`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } catch (err) {
      console.log("error: ", err);
      toast.error(`Insufficient funds.`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  const getClaimableReward = () => {
    if (stakeConfig.interval === 0) return 0;
    if (userStakeInfo.create_unstake_timestamp !== 0)
      return userStakeInfo.unclaimed_amount;
    if (stakeConfig.total_supply === 0) return 0;

    return convertToFixedDecimalNumber(
      convertMicroDenomToDenom(userStakeInfo.unclaimed_amount, 6)
    );
  };
  const getDailyRewards = () => {
    if (
      stakeConfig.total_supply === 0 ||
      userStakeInfo.create_unstake_timestamp !== 0
    )
      return 0;
    const dailyReward =
      (Number(stakeConfig.daily_reward) * userStakeInfo.token_ids.length) /
      stakeConfig.total_supply;
    return convertToFixedDecimalNumber(
      convertMicroDenomToDenom(dailyReward, 6)
    );
  };
  const getLeftDays = () => {
    if (Date.now() / 1000 > stakeConfig.end_date) {
      return "Staking Finished";
    }
    return ((stakeConfig.end_date - Date.now() / 1000) / 86400).toFixed(0);
  };
  return (
    <AppLayout fullWidth={false}>
      <Container>
        <Header>NFT Staking</Header>
        {collection && (
          <StakingCardWrapper>
            <CollectionCardWrapper>
              <NftCollectionCard collection={collection} />
            </CollectionCardWrapper>
            <CollectionContent>
              <h1>{collection.name}</h1>
              <StakingInfoContainer>
                <InfoContent>
                  <h2>Daily Rewards</h2>
                  <h3>
                    {getDailyRewards()}
                    Block/Day
                  </h3>
                </InfoContent>
                <InfoContent>
                  <h2>Claimable Reward</h2>
                  <h3>{getClaimableReward()} Block</h3>
                </InfoContent>
                <InfoContent>
                  <h2>Total Staked</h2>
                  <h3>
                    {userStakeInfo.token_ids.length}/
                    {ownedNfts.length + userStakeInfo.token_ids.length}
                  </h3>
                </InfoContent>
                <InfoContent>
                  <h2>Days Left</h2>
                  <h3>{getLeftDays()}</h3>
                </InfoContent>
              </StakingInfoContainer>
              {userStakeInfo.create_unstake_timestamp !== 0 && (
                <CountDownWrapper>
                  Time Left &nbsp;
                  <DateCountdown
                    dateTo={
                      userStakeInfo.create_unstake_timestamp +
                      stakeConfig.lock_time
                    }
                    numberOfFigures={3}
                    callback={() => {
                      setRCount(rCount + 1);
                    }}
                  />
                </CountDownWrapper>
              )}
              <ButtonWrapper>
                {userStakeInfo.create_unstake_timestamp === 0 && (
                  <StyledButton
                    disabled={ownedNfts.length === 0}
                    onClick={handleStake}
                  >
                    Stake
                  </StyledButton>
                )}
                <StyledButton
                  disabled={
                    userStakeInfo.create_unstake_timestamp +
                      stakeConfig.lock_time >
                      Date.now() / 1000 || userStakeInfo.token_ids.length === 0
                  }
                  onClick={handleUnstake}
                >
                  {userStakeInfo.create_unstake_timestamp === 0
                    ? "Unstake"
                    : "Fetch Nft"}
                </StyledButton>
                <StyledButton
                  disabled={getClaimableReward() === 0}
                  onClick={handleClaim}
                >
                  Claim Rewards
                </StyledButton>
              </ButtonWrapper>
            </CollectionContent>
          </StakingCardWrapper>
        )}
      </Container>
    </AppLayout>
  );
}
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const Header = styled.div`
  font-size: 50px;
  font-weight: 700;
  padding-bottom: 20px;
  @media (max-width: 1550px) {
    font-weight: 500;
    margin-top: 20px;
  }
`;
export const StakingCardWrapper = styled(SecondGradientBackground)`
  &:before {
    border-radius: 20px;
    opacity: 0.5;
  }
  padding: 40px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 2.5fr;
  @media (max-width: 1550px) {
    padding: 20px;
  }
  @media (max-width: 1024px) {
    display: flex;
    flex-direction: column;
    align-items: center;
    row-gap: 20px;
    padding: 10px;
  }
`;
export const CollectionCardWrapper = styled.div``;

export const CollectionContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-left: 30px;
  width: 100%;
  h1 {
    font-size: 42px;
    font-weight: 500;
  }

  @media (max-width: 1024px) {
    text-align: center;
    padding-left: 0;
  }
`;

export const StakingInfoContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  row-gap: 30px;
  @media (max-width: 650px) {
    display: flex;
    flex-direction: column;
  }
`;
export const InfoContent = styled.div`
  h2 {
    font-size: 28px;
    font-weight: 500;
  }
  h3 {
    font-size: 26px;
    font-weight: 500;
    opacity: 0.5;
  }
  @media (max-width: 650px) {
    display: flex;
    justify-content: space-between;
    h2 {
      font-size: 18px;
    }
    h3 {
      font-size: 15px;
    }
  }
`;

export const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 50px;
  @media (max-width: 650px) {
    display: flex;
    flex-direction: column;
    row-gap: 20px;
    padding-top: 50px;
  }
`;

export const OwnedNftsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  width: 100%;
  margin-top: 50px;
`;
export const CountDownWrapper = styled.div`
  display: flex;
  align-items: center;
  font-size: 28px;
  font-weight: 700;
`;
export const StyledButton = styled(Button)`
  background: white;
  color: black;
  stroke: black;
  padding: 10px;
  font-weight: 500;

  @media (max-width: 1550px) {
    height: 56px;
    font-size: 15px;
  }
`;
