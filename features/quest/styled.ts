import styled from 'styled-components'
import Image from 'components/Img'
import Link from 'next/link'

export const Container = styled.div``
export const Header = styled.div`
  text-align: center;
  font-size: 46px;
`
export const ContentWrapper = styled.div`
  padding: 40px 0;
`
export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 25% 75%;
  padding: 10px 0;
`
export const GridItem = styled.div`
  margin: 0 10px;
`
export const LoyaltyStatusWrapper = styled.div`
  background: rgba(128, 187, 195, 0.7);
  box-shadow: 0px 4.7619px 9.52381px rgba(0, 0, 0, 0.1),
    inset 0px 9.52381px 16.3265px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(10.2041px);

  border-radius: 20.4082px;
  font-size: 22px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
`
export const GradientWrapper = styled.div`
  background: transparent;
  position: relative;
  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
    border: 0.68px solid;
    border-image-source: linear-gradient(
      106.01deg,
      rgba(255, 255, 255, 0.2) 1.02%,
      rgba(255, 255, 255, 0) 100%
    );

    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.06) 100%
    );
    backdrop-filter: blur(10.2041px);
    box-shadow: 0px 4.7619px 9.52381px rgba(0, 0, 0, 0.1),
      inset 0px 9.52381px 16.3265px rgba(17, 20, 29, 0.4);
    z-index: -1;
    opacity: 0.7;
  }
`
export const UserStatusWrapper = styled(GradientWrapper)`
  border-radius: 20px;
  height: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
  &:before {
    border-radius: 20px;
  }
`
export const UserInfoItem = styled.div`
  display: flex;
  column-gap: 20px;
  width: 70%;
`
export const UserAvatar = styled(Image)`
  border-radius: 50%;
  width: 75px;
  height: 75px;
`
export const UserInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  width: -webkit-fill-available;
  h1 {
    font-size: 13px;
  }
`
export const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  p {
    font-size: 10px;
    font-family: Mulish;
  }
`
export const PointValue = styled.div`
  position: absolute;
  right: 0;
  top: -20px;
  font-size: 10px;
  font-family: Mulish;
`
export const RewardWrapper = styled.div`
  width: 30%;
  display: flex;
  justify-content: space-around;
  margin-left: 20px;
  column-gap: 10px;
  align-items: center;
  h2 {
    font-size: 16px;
    text-align: center;
  }
  button {
    font-weight: 300;
  }
`
export const QuestCardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  column-gap: 10px;
`
export const QuestCard = styled(GradientWrapper)`
  border-radius: 30px;
  padding: 25px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  row-gap: 30px;
  h1 {
    font-size: 18px;
    text-align: center;
    font-weight: 300;
    height: 40px;
  }
  h2 {
    font-size: 15px;
    font-weight: 600;
  }
  p {
    font-size: 13px;
    font-family: Mulish;
    text-align: center;
  }
  &:before {
    border-radius: 30px;
  }
  @media (max-width: 1550px) {
    row-gap: 20px;
  }
`
export const ProgressValue = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
`
export const QuestLink = styled.a`
  font-family: Mulish;
  font-size: 13px;
  text-decoration: underline;
  text-align: center;
`
export const ClaimButton = styled.div<{ disabled: boolean }>`
  height: 100%;
  width: 80px;
  background: rgb(255, 255, 255);
  font-size: 12px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.5 : 1)};
  border-radius: 11px;
  color: black;
  display: flex;
  justify-content: center;
  align-items: center;
`
export const CardClaimArea = styled.div`
  background: transparent;
  border-radius: 11px;
  height: 40px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 15px;
  position: relative;
  p {
    font-size: 12px;
    font-family: Trajan;
  }
  &:before {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    width: 100%;
    content: '';
    background: rgba(255, 255, 255, 0.27);
    filter: blur(2px);
    border-radius: 11px;
    z-index: -1;
  }
`
