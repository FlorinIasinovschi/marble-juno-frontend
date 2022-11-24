import { useEffect, useState } from "react";
import {
  ChakraProvider,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import Link from "next/link";
import styled from "styled-components";
import { AppLayout } from "components/Layout/AppLayout";
import { Explore } from "features/nft/market/explore";
import NFTExplorer from "features/nft/market/nftexplore";
import Profiles from "features/nft/market/profile/allProfiles";
import { fetchAllProfileCounts } from "hooks/useProfile";

export default function Explores() {
  const [profiles, setProfiles] = useState<any>({});

  useEffect(() => {
    (async () => {
      const totalProfiles = await fetchAllProfileCounts();
      setProfiles(totalProfiles);
    })();
  }, []);
  return (
    <AppLayout fullWidth={true}>
      <StyledTabList>
        <Link href="/explore/nfts" passHref>
          <StyledTab>{`NFTs`}</StyledTab>
        </Link>
        <Link href="/explore/collections" passHref>
          <StyledTab>{`Collections`}</StyledTab>
        </Link>
        <Link href="/explore/profiles" passHref>
          <StyledTab isActive={true}>{`Profiles`}</StyledTab>
        </Link>
      </StyledTabList>
      <Profiles profileCounts={profiles} />
    </AppLayout>
  );
}

const StyledTabList = styled.div`
  border-bottom: 2px solid;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 400;
  display: flex;
  margin-bottom: 20px;
  overflow: auto;
  width: fit-content;
  @media (max-width: 800px) {
    width: auto;
  }
`;

const StyledTab = styled.div<{ isActive: boolean }>`
  font-size: 22px;
  font-weight: 400;
  padding: 20px;
  margin: 0 20px;
  cursor: pointer;
  ${({ isActive }) => isActive && "border-bottom: 2px solid"};
  @media (max-width: 1550px) {
    font-size: 18px;
    margin: 0 15px;
    padding: 15px;
  }
`;
