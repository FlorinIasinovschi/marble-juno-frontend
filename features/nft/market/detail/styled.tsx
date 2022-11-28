import styled from "styled-components";
import { SecondGradientBackground } from "styles/styles";

export const NFTName = styled.div`
  font-size: 60px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 45px;
  }
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;
export const MoreTitle = styled.div`
  font-size: 46px;
  font-weight: 700;
  @media (max-width: 1550px) {
    font-size: 30px;
  }
  @media (max-width: 480px) {
    font-size: 24px;
  }
`;
export const TokenInfoWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  @media (max-width: 650px) {
    grid-template-columns: 1fr 1fr;
    row-gap: 20px;
  }
`;
export const NftBuyOfferTag = styled(SecondGradientBackground)`
  padding: 20px;
  &:before {
    border-radius: 30px;
    opacity: 0.3;
  }
  height: 100%;
  margin-bottom: 20px;
  @media (max-width: 650px) {
    padding: 10px 0;
    &:before {
      border-radius: 10px;
    }
  }
`;
