import { useState, useEffect } from "react";
import styled from "styled-components";
import SelectedNFT from "./components/SelectedNFT";
import Collection from "./components/Collection";
import {
  ChakraProvider,
  Flex,
  Stack,
  HStack,
  Text,
  Grid,
  Button,
} from "@chakra-ui/react";
import { CW721, Factory, useSdk, getFileTypeFromURL } from "services/nft";
import useSubquery from "hooks/useSubquery";
import { isMobile, isPC } from "util/device";
import { SecondGradientBackground } from "styles/styles";

const Home = () => {
  const { client } = useSdk();
  const [nftcollections, setNftCollections] = useState<any[]>([]);
  const { fetchCollectionsById } = useSubquery();
  useEffect(() => {
    (async () => {
      const collectionInfo = await fetchCollectionsById(["1"]);
      setNftCollections(collectionInfo);
    })();
  }, [client]);

  return (
    <Container>
      <ChakraProvider>
        <SelectedNFT />
        <Collections>
          <TextTitle>Curated Collections</TextTitle>

          <Stack spacing="50px">
            {nftcollections.map((nftInfo, index) => (
              <Collection info={nftInfo} key={index} />
            ))}
          </Stack>
        </Collections>
        <Flex justifyContent="center">
          <Paper>
            <MarbleCardGrid>
              <Stack spacing={10}>
                <Title>Discover Phygital NFTs</Title>
                <TextContent textAlign={isMobile() ? "center" : "left"}>
                  Marble, the future of NFTs is already here. Collect Phygital
                  NFTs which bring real Art to life in spectacular 3D. Enjoy
                  sculptures, paintings, and physical artworks through Augmented
                  Reality and Virtual Reality.
                </TextContent>
                <StyledButton>Get Started</StyledButton>
              </Stack>
              <Stack>
                <img src="/images/doubleCardLogo.png" alt="cardlogo" />
              </Stack>
            </MarbleCardGrid>
          </Paper>
        </Flex>
        <Stack marginTop="100px" alignItems="center">
          <Stack spacing={10}>
            <Stack margin="0 auto" alignItems="center">
              <TextTitle>Marble - Where will you fit in?</TextTitle>
              <StyledP>
                Marble is an all-in-one platform hosting an NFT marketplace as
                well as a DeFi exchange with DAO Governance. NFT creators,
                collectors and DeFi fans make us a rock-solid community. Here
                your opinion counts. Your creativity is protected. And your
                digital objects belong to you alone.
              </StyledP>
            </Stack>
            <DestinationGrid>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/createIcon.svg" alt="create" />
                </Round>
                <Stack spacing={isPC() ? 5 : "5px"}>
                  <h1>Create</h1>
                  <TextContent>
                    Mint NFTs in stunning Augmented Reality (AR) and Virtual
                    Reality (VR).
                  </TextContent>
                </Stack>
              </StyledPaper>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/earnIcon.svg" alt="earn" />
                </Round>
                <Stack spacing={isPC() ? 5 : "5px"}>
                  <h1>Earn</h1>
                  <TextContent>
                    Accrue royalties on secondary NFT sales using our smart
                    contracts.
                  </TextContent>
                </Stack>
              </StyledPaper>
              <StyledPaper>
                <Round>
                  <StyledImg src="/images/followIcon.svg" alt="follow" />
                </Round>
                <Stack spacing={isPC() ? 5 : "5px"}>
                  <h1>Follow</h1>
                  <TextContent>
                    Keep an eye on your favourite NFT creators with Marble
                    SocialFi.
                  </TextContent>
                </Stack>
              </StyledPaper>
            </DestinationGrid>
          </Stack>
        </Stack>
        <Stack marginTop={isMobile() ? "50px" : "100px"} alignItems="center">
          <Stack spacing={isMobile() ? "10px" : 10} alignItems="center">
            <TextTitle>Marble is powered by</TextTitle>
            <StyledP>
              The Internet of Blockchains of Cosmos supports our journey from
              multi-chain to cross-chain. Our smart contracts are grounded in
              JUNO&apos;s versatile architecture and NEAR, one of the lean,
              powerful and fastest-growing blockchains. Then, as many top
              metaverses, Pinata offers a safe haven IPFS for NFT storage.
            </StyledP>
            <PartnerGrid>
              <PartnerPaper>
                <StyledImg src="/images/near.svg" alt="near" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/cosmos.svg" alt="cosmos" />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg
                  src="/images/juno.svg"
                  alt="juno"
                  style={{ width: "150px" }}
                />
              </PartnerPaper>
              <PartnerPaper>
                <StyledImg src="/images/pinata.svg" alt="pinata" />
              </PartnerPaper>
            </PartnerGrid>
          </Stack>
        </Stack>
      </ChakraProvider>
    </Container>
  );
};
const DestinationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  column-gap: 20px;
  @media (max-width: 800px) {
    display: flex;
    flex-direction: column;
    row-gap: 15px;
  }
`;
const PartnerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
  overflow: auto;
  @media (max-width: 650px) {
    width: 90vw;
  }
`;
const StyledButton = styled.button`
  width: 326px;
  height: 68px;
  background: white;
  border-radius: 16px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  color: black;
  font-size: 18px;
  font-weight: bold;
  @media (max-width: 650px) {
    width: 100%;
    height: 56px;
    font-size: 16px;
  }
`;
const MarbleCardGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  @media (max-width: 1550px) {
    padding: 0 30px;
  }
  @media (max-width: 1000px) {
    display: flex;
    flex-direction: column-reverse;
    * {
      align-items: center;
    }
  }
`;
const StyledImg = styled.img`
  margin: 0 auto;
`;

const Container = styled.div`
  color: white;
  @media (max-width: 1550px) {
    max-width: 1100px;
    margin-inline: auto;
  }
`;
const StyledP = styled.div`
  color: white;
  font-size: 20px;
  opacity: 0.5;
  font-family: Mulish;
  text-align: center;
  width: 1000px;
  @media (max-width: 1550px) {
    font-size: 18px;
  }
  @media (max-width: 1050px) {
    width: 100%;
  }
  @media (max-width: 650px) {
    font-size: 16px;
    padding: 0 20px;
    width: 100%;
  }
`;
const Collections = styled.div`
  padding: 50px 0;
`;

const Paper = styled(SecondGradientBackground)<{ width?: string }>`
  &:before {
    border-radius: 30px;
    opacity: 0.3;
  }
  padding: 40px 80px;
  width: ${({ width }) => width || "100%"};
  display: flex;
  align-items: center;
  @media (max-width: 1550px) {
    padding: 20px;
  }
`;
const PartnerPaper = styled(Paper)`
  @media (max-width: 650px) {
    width: 120px;
    height: 50px;
  }
`;
const StyledPaper = styled(SecondGradientBackground)`
  &:before {
    opacity: 0.5;
    border-radius: 30px;
  }
  justify-content: center;
  padding: 40px 60px;
  flex-direction: column;
  h1 {
    font-size: 36px;
    font-weight: 700;
    text-align: center;
  }
  @media (max-width: 1550px) {
    padding: 40px 30px;
  }
  @media (max-width: 800px) {
    display: grid;
    justify-content: start;
    grid-template-columns: auto auto;
    padding: 10px;
    align-items: center;
    column-gap: 10px;
    h1 {
      font-size: 20px;
      font-weight: 700;
      text-align: left;
    }
    div {
      text-align: left;
    }
  }
`;

const TextTitle = styled.div`
  font-size: 46px;
  font-weight: 700;
  text-align: center;
  @media (max-width: 1550px) {
    font-size: 35px;
    font-weight: 500;
  }
  @media (max-width: 650px) {
    font-size: 24px;
  }
`;

const TextContent = styled.div<{ textAlign?: string }>`
  font-size: 26px;
  text-align: ${({ textAlign }) => (textAlign ? textAlign : "center")};
  font-weight: 300;
  opacity: 0.5;
  font-family: Mulish;
  @media (max-width: 1550px) {
    font-size: 20px;
  }
  @media (max-width: 650px) {
    font-size: 16px;
  }
`;

const Round = styled.div`
  width: 180px;
  height: 180px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  border-radius: 50%;
  margin: 50px auto;
  @media (max-width: 800px) {
    width: 70px;
    height: 70px;
    margin: 0;
    img {
      width: 30px;
      height: 30px;
    }
  }
`;
const Title = styled.div`
  font-size: 65px;
  font-weight: 400;
  @media (max-width: 1550px) {
    font-size: 40px;
  }
  @media (max-width: 650px) {
    font-size: 30px;
    text-align: center;
  }
`;
export default Home;
