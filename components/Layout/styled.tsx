import styled from "styled-components";
import { GradientBackground, SecondGradientBackground } from "styles/styles";

export const StyledWrapper = styled.div`
  color: #ffffff;
  height: 108px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #363b4e;
  background: rgba(8, 12, 28, 0.6);
  backdrop-filter: blur(20px);
  position: sticky;
  width: 100%;
  z-index: 100;
  justify-content: space-between;
  padding: 0px 20px;
  @media (max-width: 1550px) {
    height: 80px;
  }
`;

export const StyledListForLinks = styled.div`
  display: flex;
  row-gap: 10px;
  flex-direction: row;
  align-items: center;
  height: 100%;
  column-gap: 40px;
`;
export const StyledLink = styled.div`
  font-size: 16px;
  display: flex;
  align-items: center;

  a {
    display: flex;
    align-items: center;
  }
`;

export const StyledDivForLogo = styled.div`
  align-items: center;
  img {
    width: 200px;
  }
  @media (max-width: 1550px) {
    margin: 0 00px;
    img {
      width: 150px;
    }
  }
  @media (max-width: 767px) {
    display: none;
  }
`;

export const StyledDivForLogoMobile = styled.div`
  align-items: center;
  margin-right: 40px;
  img {
    width: 200px;
  }
  padding-top: 30px;
`;

export const CreateButton = styled.div`
  background: #ffffff;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  cursor: pointer;
  color: black;
  width: 130px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  height: 57px;
  @media (max-width: 1550px) {
    width: 100px;
    border-radius: 10px;
    font-size: 12px;
    height: 37px;
  }
  @media (max-width: 650px) {
    height: 36px;
    font-size: 12px;
    width: 80px;
    border-radius: 14px;
    margin-left: 0px;
  }
`;
export const StyledMenuItem = styled.div`
  background: linear-gradient(0deg, rgba(5, 6, 22, 0.2), rgba(5, 6, 22, 0.2))
      padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.2) 0.82%,
        rgba(0, 0, 0, 0) 98.47%
      )
      border-box;
  border: 1px solid;

  border-image: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );

  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(103, 103, 120, 0.2);
  padding: 20px 25px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 20px;
`;
export const MobileProfileInfo = styled(GradientBackground)`
  &:before {
    opacity: 0.2;
    border-radius: 20px;
  }
  display: flex;
  justify-content: space-between;
  padding: 15px;
  width: 100%;
`;
export const AddressWrapper = styled(SecondGradientBackground)`
  &:before {
    border-radius: 10px;
    opacity: 0.3;
  }
  display: flex;
  p {
    font-size: 14px;
  }
  padding: 10px;
  align-items: center;
`;

const loyaltyButtonColor = {
  basic: "#434960",
  silver: "#A2A3A8",
  gold: "#B1973B",
  platinum: "#608B97",
};

export const LoyaltyButton = styled.div<{ id: string }>`
  background: ${({ id }) => loyaltyButtonColor[id]};
  border-radius: 16px;
  cursor: pointer;
  text-align: center;
  margin-left: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  height: 57px;
  padding-inline: 10px;
  @media (max-width: 1550px) {
    border-radius: 10px;
    font-size: 12px;
    height: 37px;
  }
  @media (max-width: 650px) {
    height: 36px;
    font-size: 12px;
    border-radius: 14px;
    margin-left: 0px;
  }
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const MobileChatAndUserContainer = styled.div`
  position: relative;
  width: 100%;
`;
