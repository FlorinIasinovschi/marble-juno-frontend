import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { Button } from "components/Button";
import { walletState } from "state/atoms/walletAtoms";
import { getRandomInt } from "util/numbers";
import { toast } from "react-toastify";
import { fromBase64, toBase64 } from "@cosmjs/encoding";
import {
  useSdk,
  Collection,
  Stake,
  getFileTypeFromURL,
  NftCollection,
  CW721,
  UserStakeInfoType,
} from "services/nft";
import { useRecoilValue } from "recoil";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";
interface StakeConfigType {
  daily_reward: string;
  enabled: boolean;
  cw20_address: string;
  interval: number;
  lock_time: number;
  collection_address: string;
  cw721_address: string;
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
        setUserStakeInfo(userStakeInfo);
      } catch (err) {
        console.log("userStakeInfoError: ", err);
      }
      try {
        const stakeConfig = await stakeContract.getConfig();
        const collectionContract = Collection(
          stakeConfig.collection_address
        ).use(client);
        const collectionConfig = await collectionContract.getConfig();
        setStakeConfig({
          ...stakeConfig,
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
      } catch (err) {
        console.log("err", err);
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
      setRCount(rCount + 1);
    } catch (err) {
      console.log("unstakeError: ", err);
    }
  };

  const handleClaim = async () => {
    const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).useTx(signingClient);
    try {
      const handleClaimResult = await stakeContract.claim(address);
      setRCount(rCount + 1);
    } catch (err) {
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
    const claimable =
      Number(userStakeInfo.unclaimed_amount) +
      Math.floor(
        Math.abs(
          (Date.now() / 1000 - userStakeInfo.last_timestamp) /
            stakeConfig.interval
        )
      ) *
        Number(stakeConfig.daily_reward) *
        userStakeInfo.token_ids.length;

    return claimable;
  };
  return (
    <AppLayout fullWidth={false}>
      <StyledTitle>NFT Staking</StyledTitle>
      {collection && (
        <StyledCard>
          <StyledDivForNftCollection>
            <NftCollectionCard collection={collection} />
          </StyledDivForNftCollection>
          <StyledDivForInfo>
            <StyledHeading>{collection.name}</StyledHeading>
            <StyledRow>
              <StyledDiv>
                <StyledSubHeading>Daily Rewards</StyledSubHeading>
                <StyledText>
                  {Number(stakeConfig.daily_reward) *
                    userStakeInfo.token_ids.length}{" "}
                  Block/Day
                </StyledText>
              </StyledDiv>
              <StyledDiv>
                <StyledSubHeading>Claimable Reward</StyledSubHeading>
                <StyledText>{getClaimableReward()} Block</StyledText>
              </StyledDiv>
            </StyledRow>
            <StyledRow>
              <StyledDiv>
                <StyledSubHeading>Total Staked</StyledSubHeading>
                <StyledText>
                  {ownedNfts.length + userStakeInfo.token_ids.length}/
                  {userStakeInfo.token_ids.length}
                </StyledText>
              </StyledDiv>
              <StyledDiv>
                <StyledSubHeading>Days Left</StyledSubHeading>
                <StyledText>9</StyledText>
              </StyledDiv>
            </StyledRow>
            <ButtonWrapper>
              {userStakeInfo.create_unstake_timestamp === 0 && (
                <Button
                  className="btn-buy btn-default"
                  css={{
                    background: "$white",
                    color: "$black",
                    stroke: "$black",
                    padding: "15px auto",
                  }}
                  disabled={ownedNfts.length === 0}
                  onClick={handleStake}
                >
                  Stake
                </Button>
              )}
              <Button
                className="btn-buy btn-default"
                css={{
                  background: "$white",
                  color: "$black",
                  stroke: "$black",
                  padding: "15px auto",
                }}
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
              </Button>
              {userStakeInfo.create_unstake_timestamp === 0 && (
                <Button
                  className="btn-buy btn-default"
                  css={{
                    background: "$white",
                    color: "$black",
                    stroke: "$black",
                    padding: "15px auto",
                  }}
                  disabled={getClaimableReward() === 0}
                  onClick={handleClaim}
                >
                  Claim Rewards
                </Button>
              )}
            </ButtonWrapper>
          </StyledDivForInfo>
        </StyledCard>
      )}
    </AppLayout>
  );
}

const StyledCard = styled("div")`
  display: flex;
  padding: 40px;
  margin-top: 30px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 70%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(15px);
  border-radius: 30px;
  max-width: 1530px;
  margin: auto;
`;

const StyledDiv = styled("div")`
  flex: 1;
  padding-top: 30px;
  padding-bottom: 30px;
`;

const StyledDivForInfo = styled("div")`
  flex: 1;
  padding-left: 60px;
`;

const StyledRow = styled("div")`
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled(Text)`
  font-size: 50px;
  text-align: center;
  line-height: 60px;
  margin-top: 30px;
  margin-bottom: 30px;
`;

const StyledHeading = styled(Text)`
  font-size: 42px;
  line-height: 50.4px;
`;

const StyledSubHeading = styled(Text)`
  font-size: 28px;
  line-height: 40px;
`;

const StyledText = styled(Text)`
  font-size: 26px;
  line-height: 31.2px;
  opacity: 0.5;
  padding-top: 10px;
`;

const StyledDivForNftCollection = styled("div")`
  width: 400px;
`;

export const ButtonWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  column-gap: 50px;
`;
