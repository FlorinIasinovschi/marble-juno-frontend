import { useEffect, useState } from "react";
import Link from "next/link";
import styled from "styled-components";
import { Stack, Text, HStack } from "@chakra-ui/react";
import { RoundedIconComponent } from "components/RoundedIcon";
import { CW721, Market, useSdk } from "services/nft";

const PUBLIC_MARKETPLACE = process.env.NEXT_PUBLIC_MARKETPLACE || "";

const SelectedNFT = () => {
  const { client } = useSdk();
  const [showData, setShowData] = useState<any>({});
  useEffect(() => {
    (async () => {
      if (!client) return;
      const marketContract = Market(PUBLIC_MARKETPLACE).use(client);
      let collection = await marketContract.collection(5);
      let ipfs_collection = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + collection.uri
      );
      let res_collection = await ipfs_collection.json();
      const cw721Contract = CW721(collection.cw721_address).use(client);
      let nftInfo = await cw721Contract.nftInfo("1");
      const ipfs_nft = await fetch(
        process.env.NEXT_PUBLIC_PINATA_URL + nftInfo.token_uri
      );
      let res_nft = await ipfs_nft.json();
      const show_data = {
        creator: collection.owner,
        collection_logo:
          process.env.NEXT_PUBLIC_PINATA_URL + res_collection.logo,
        collection_name: res_collection.name,
        nft_uri: res_nft.uri,
      };
      setShowData(show_data);
    })();
  }, [client]);
  return (
    <IntroContainer>
      <div>
        <IntroWrapper>
          <Title>
            {/* TILL DEATH DO US PART */}
            Marblenauts
          </Title>

          <HStack spacing={5}>
            <MiniInfoCard>
              <MiniInfoTitle>Created by</MiniInfoTitle>

              <RoundedIconComponent
                size="36px"
                address={showData?.creator}
                font="16px"
              />
            </MiniInfoCard>

            <MiniInfoCard>
              <MiniInfoTitle>Collection</MiniInfoTitle>
              <Info>
                <Image src={showData.collection_logo} alt="" />
                <Name>&nbsp;{showData.collection_name}</Name>
              </Info>
            </MiniInfoCard>
          </HStack>
          <Stack>
            <Link href="/nft/9/1" passHref>
              <StyledButton>View Nft</StyledButton>
            </Link>
          </Stack>
        </IntroWrapper>
      </div>
      <NFTPicture>
        <ImgDiv>
          <Img alt="logo" src={showData?.nft_uri} />
        </ImgDiv>
      </NFTPicture>
    </IntroContainer>
  );
};

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
  @media (max-width: 480px) {
    width: 100%;
  }
`;
const IntroContainer = styled.div`
  display: flex;
  margin-top: 50px;
  justify-content: space-between;
  padding: 0 120px;
  @media (max-width: 480px) {
    flex-direction: column-reverse;
    padding: 0 10px;
    margin-top: 0px;
  }
`;

const Title = styled.div`
  font-size: 50px;
  font-weight: 700;
  padding: 40px 0;
  @media (max-width: 1550px) {
    font-size: 35px;
  }
  @media (max-width: 480px) {
    font-size: 26px;
    text-align: center;
    margin-top: 20px;
  }
`;

const MiniInfoCard = styled.div`
  width: 50%;
  height: 110px;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
  border-radius: 20px;
  padding: 15px;
  border: 1px solid rgba(5, 6, 22, 0.2);
  backdrop-filter: blur(40px);
  @media (max-width: 480px) {
    width: 100%;
  }
`;

const MiniInfoTitle = styled.div`
  font-size: 20px;
  margin: 0 0 10px 0;
  @media (max-width: 1550px) {
    font-size: 16px;
  }
`;
const Name = styled.div`
  font-size: 16px;
  font-weight: 600;
  font-family: Mulish;
`;
const Image = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid #ffffff;
`;
const Info = styled.div`
  display: flex;
  align-items: center;
`;
const NFTPicture = styled.div`
  width: 40%;
  border-radius: 30px;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  padding: 37px;
  @media (max-width: 1550px) {
    padding: 30px;
  }
  @media (max-width: 480px) {
    width: 100%;
    padding: 20px;
  }
`;
const ImgDiv = styled.div`
  width: 100%;
  height: 100%;
  padding-bottom: 100%;
  display: block;
  position: relative;
  border-radius: 20px;
`;
const Img = styled.img`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  border-radius: 40px;
`;
const IntroWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 40px;
  padding: 30px 0;
  @media (max-width: 1550px) {
    row-gap: 20px;
  }
  @media (max-width: 480px) {
    row-gap: 20px;
  }
`;
const PriceArea = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  p {
    font-size: 20px;
  }
  h1 {
    font-size: 36px;
    font-family: Mulish;
  }
  h2 {
    font-size: 22px;
  }
  @media (max-width: 1550px) {
    p {
      font-size: 16px;
    }
    h1 {
      font-size: 30px;
      font-family: Mulish;
    }
    h2 {
      font-size: 16px;
    }
  }
  @media (max-width: 480px) {
    align-items: center;

    p {
      font-size: 14px;
    }
    h1 {
      font-size: 26px;
      font-family: Mulish;
    }
    h2 {
      font-size: 16px;
    }
  }
`;

export default SelectedNFT;
