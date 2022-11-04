import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { AddCircle, Hexagon, MinusHexagon } from "icons";
import { walletState } from "state/atoms/walletAtoms";
import { toast } from "react-toastify";

import {
  Collection,
  Stake,
  NftCollection,
  StakeContractConfig,
  getCollectionInfo,
  CW721,
  CollectionContractConfig,
} from "services/nft";
import { useRecoilValue } from "recoil";
import { toBase64 } from "@cosmjs/encoding";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";

export default function StakePage() {
  const { address, client } = useRecoilValue(walletState);
  const [collection, setCollection] = useState<NftCollection>();
  const [stakeContractConfig, setStakeContractConfig] =
    useState<StakeContractConfig>();
  const [collectionContractConfig, setCollectionContractConfig] =
    useState<CollectionContractConfig>();

  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }
      try {
        const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).use(client);
        const stakeConfig = await stakeContract.getConfig();
        setStakeContractConfig(stakeConfig);
        const collectionContract = Collection(
          stakeConfig.collection_address
        ).use(client);
        const collectionConfig = await collectionContract.getConfig();
        setCollectionContractConfig(collectionConfig);

        const collection_info = await getCollectionInfo(collectionConfig);
        setCollection(collection_info);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [client]);

  const onStake = async () => {
    if (!collectionContractConfig) {
      return;
    }

    const cw721Contract = CW721(collectionContractConfig.cw721_address).useTx(
      client
    );
    const msg = { stake: {} };

    let encodedMsg: string = toBase64(
      new TextEncoder().encode(JSON.stringify(msg))
    );

    const token_id = Math.floor(
      Math.random() * collectionContractConfig.unused_token_id
    );

    try {
      let nft = await cw721Contract.sendNft(
        address,
        PUBLIC_STAKE_ADDRESS,
        token_id.toString(),
        encodedMsg
      );
      toast.success("Sucessfully staked.");
    } catch (e) {
      console.error(e);
      toast.error(`Error:`, e.mesage);
    }
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
                  {stakeContractConfig.daily_reward} Block/Day
                </StyledText>
              </StyledDiv>
              <StyledDiv>
                <StyledSubHeading>Claimable Reward</StyledSubHeading>
                <StyledText>10,000 Block</StyledText>
              </StyledDiv>
            </StyledRow>
            <StyledRow>
              <StyledDiv>
                <StyledSubHeading>Day Staked</StyledSubHeading>
                <StyledText>10</StyledText>
              </StyledDiv>
              <StyledDiv>
                <StyledSubHeading>Days Left</StyledSubHeading>
                <StyledText>9</StyledText>
              </StyledDiv>
            </StyledRow>
            <StyledRow>
              <StyledButton onClick={onStake}>
                <AddCircle />
                &nbsp;Stake
              </StyledButton>
              <StyledButton>
                <MinusHexagon />
                &nbsp;UnStake
              </StyledButton>
              <StyledButton>
                <Hexagon />
                &nbsp;Claim Rewards
              </StyledButton>
            </StyledRow>
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

const StyledButton = styled("button")`
  display: flex;
  background: #ffffff;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  padding: 25px;
  justify-content: center;
  color: black;
  width: 230px;
`;
