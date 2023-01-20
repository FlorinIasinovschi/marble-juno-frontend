import { AppLayout } from "components/Layout/AppLayout";
import { Explore } from "features/nft/market/explore";
import Link from "next/link";
import { useSelector } from "react-redux";
import styled from "styled-components";

export default function Explores() {
  const { countInfo } = useSelector((state: any) => state.uiData);

  return (
    <AppLayout fullWidth={true}>
      <StyledTabList>
        <Link href="/explore/nfts" passHref>
          <StyledTab>{`NFTs(${countInfo.nft})`}</StyledTab>
        </Link>
        <Link href="/explore/collections" passHref>
          <StyledTab
            isActive={true}
          >{`Collections(${countInfo.collection})`}</StyledTab>
        </Link>
        <Link href="/explore/profiles" passHref>
          <StyledTab>{`Profiles(${countInfo.profile.profiles})`}</StyledTab>
        </Link>
      </StyledTabList>
      <Explore />
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
