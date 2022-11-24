import { AppLayout } from "components/Layout/AppLayout";
import NFTExplorer from "features/nft/market/nftexplore";
import Link from "next/link";
import styled from "styled-components";

export default function Explores() {
  return (
    <AppLayout fullWidth={true}>
      <StyledTabList>
        <Link href="/explore/nfts" passHref>
          <StyledTab isActive={true}>{`NFTs`}</StyledTab>
        </Link>
        <Link href="/explore/collections" passHref>
          <StyledTab>{`Collections`}</StyledTab>
        </Link>
        <Link href="/explore/profiles" passHref>
          <StyledTab>{`Profiles`}</StyledTab>
        </Link>
      </StyledTabList>

      <NFTExplorer />
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
