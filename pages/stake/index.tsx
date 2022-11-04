import { useEffect, useState } from "react";
import { Text } from "@chakra-ui/react";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { AddCircle, Hexagon, MinusHexagon } from "icons";
import { walletState } from "state/atoms/walletAtoms";

import {
  useSdk,
  Collection,
  Stake,
  getFileTypeFromURL,
  NftCollection,
} from "services/nft";
import { useRecoilValue } from "recoil";

const PUBLIC_STAKE_ADDRESS = process.env.NEXT_PUBLIC_STAKE_ADDRESS || "";

export default function StakePage() {
  const { address } = useRecoilValue(walletState);
  const { client } = useSdk();
  const [collection, setCollection] = useState<NftCollection>();

  useEffect(() => {
    (async () => {
      if (!client || !address) {
        return;
      }

      const stakeContract = Stake(PUBLIC_STAKE_ADDRESS).use(client);
      const stakeConfig = await stakeContract.getConfig();
      const collectionContract = Collection(stakeConfig.collection_address).use(
        client
      );
      const collectionConfig = await collectionContract.getConfig();
      let res_collection: any = {};
      try {
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

      console.log(collectionConfig);
    })();
  }, [client]);

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
                <StyledText>100 Block/Day</StyledText>
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
              <StyledButton>
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
