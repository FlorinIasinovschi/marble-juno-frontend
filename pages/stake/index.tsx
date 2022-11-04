import { useEffect, useState } from "react";
import {
  ChakraProvider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Tabs,
} from "@chakra-ui/react";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { Explore } from "features/nft/market/explore";
import NFTExplorer from "features/nft/market/nftexplore";
import Profiles from "features/nft/market/profile/allProfiles";
import { fetchAllProfileCounts } from "hooks/useProfile";
import { NftCollectionCard } from "components/NFT/collection/nftCollenctionCard";
import { AddCircle, Hexagon, MinusHexagon } from "icons";

export default function Stake() {
  // const [nfts, setNfts] = useState("");
  // const [collections, setCollections] = useState("");
  const [profiles, setProfiles] = useState<any>({});
  // async function fetchAllNFTCounts() {
  //   const allNFTs = await nftViewFunction({
  //     methodName: 'nft_total_supply',
  //     args: {},
  //   })
  //   return allNFTs
  // }
  // async function fetchAllCollectionCounts() {
  //   const allCollections = await nftViewFunction({
  //     methodName: 'nft_get_series_supply',
  //     args: {},
  //   })
  //   return allCollections
  // }

  useEffect(() => {
    // fetchCollections()
    (async () => {
      // const [totalNFTs, totalCollections, totalProfiles] = await Promise.all([
      //   fetchAllNFTCounts(),
      //   fetchAllCollectionCounts(),
      //   fetchAllProfileCounts(),
      // ]);
      const totalProfiles = await fetchAllProfileCounts();
      // setNfts(totalNFTs)
      // setCollections(totalCollections)
      setProfiles(totalProfiles);
    })();
  }, []);

  const collection = {
    banner_image:
      "https://marbledao.mypinata.cloud/ipfs/QmeXU7nnBhJv1mspNJ3dfE2qL6LtFVKCA9EMEb2Zv8yAxs",
    cat_ids: "0",
    creator: "juno1y6j4usq3cvccquak780ht4n8xjwpr0relzdp5q",
    description:
      "The Marblenauts is a special collection of 1001 Cosmosnauts made of marble.",
    id: 5,
    image:
      "https://marbledao.mypinata.cloud/ipfs/QmeXU7nnBhJv1mspNJ3dfE2qL6LtFVKCA9EMEb2Zv8yAxs",
    name: "Marblenauts",
    slug: "",
    type: "image",
    num_tokens: 3,
  };

  return (
    <AppLayout fullWidth={false}>
      <StyledTitle>NFT Staking</StyledTitle>
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
              {" "}
              bc
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
