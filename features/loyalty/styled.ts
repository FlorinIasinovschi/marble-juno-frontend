import styled from 'styled-components'

export const Container = styled.div``
export const Header = styled.div`
  text-align: center;
  font-size: 46px;
`
export const ContentWrapper = styled.div`
  margin: 40px 0;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  position: relative;
  background: transparent;
  border-radius: 30px;
  &:before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    content: '';
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.06) 100%
    );
    border-radius: 30px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    box-shadow: 0px 7px 14px 0px #0000001a;

    box-shadow: 0px 14px 24px 0px #11141d66 inset;
    opacity: 0.7;
  }
`
export const GridItem = styled.div`
  display: grid;
  grid-template-rows: 25% 1fr 1fr 1fr 1fr 1fr 1fr;
  min-height: 800px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 30px 0 0 30px;
`
export const TitleItem = styled.div`
  padding: 0 20px;
  h1 {
    font-size: 16px;
  }
  p {
    font-size: 14px;
    font-family: Mulish;
  }
`
export const CardWrapper = styled.div<{ isLast: boolean }>`
  display: grid;
  grid-template-rows: 25% 1fr 1fr 1fr 1fr 1fr 1fr;
  border: 1px solid rgba(255, 255, 255, 0.1);
  ${({ isLast }) =>
    isLast &&
    `border-bottom-right-radius: 30px;
    border-top-right-radius: 30px;`}
`

const titleColor = ['#FFFFFF', '#A2A3A8', '#B1973B', '#608B97']

export const CardTitle = styled.div<{ level: number }>`
  padding-inline: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  h1 {
    font-size: 28px;
    color: ${({ level }) => titleColor[level]};
  }
  p {
    font-size: 14px;
    font-family: Mulish;
  }
  border-bottom: 1px solid #434960;
`
export const IconWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 70px;
  width: 70px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  background: rgb(24, 27, 42);
  box-sizing: border-box;
  padding: 10px;
`
export const Icon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;

  &:before {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    content: '';
    opacity: 0.2;
    border-radius: 50%;
    box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
  }
`
export const CardContent = styled.div`
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  justify-self: center;
`
export const CheckIconWrapper = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 8px rgba(0, 0, 0, 0.2);
`

export const HeaderIconWrapper = styled.div`
  height: 30px;
  display: flex;
  justify-content: center;
`
export const LeaderboardWrapper = styled.div`
  h1 {
    font-size: 28px;
  }
`
export const FilterWrapper = styled.div`
  display: flex;
  align-items: center;
  padding-block: 20px;
  h2 {
    font-size: 14px;
    margin-right: 40px;
  }
`
export const FilterItem = styled.div<{ isActive: boolean }>`
  position: relative;
  background: ${({ isActive }) => (isActive ? '#FFFFFF' : 'transparent')};
  border-radius: 9px;
  width: 110px;
  height: 40px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ isActive }) => (isActive ? 'black' : 'white')};
  margin-inline: 10px;
  &:before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    content: '';
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.06) 100%
    );
    border-radius: 9px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    box-shadow: 0px 7px 14px 0px #0000001a;

    box-shadow: 0px 14px 24px 0px #11141d66 inset;
    opacity: 0.7;
  }
`

export const TableWrapper = styled.table`
  width: 100%;
`
export const TableHeader = styled.tr`
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1fr;
  width: 100%;
  th {
    font-size: 14px;
    text-align: center;
  }
`
const getRowBackground = (id: number) => {
  switch (id) {
    case 1:
      return '#B1973B'
    case 2:
      return '#A5A6AC'
    case 3:
      return '#A05822'
    default:
      return 'transparent'
  }
}
export const TableRow = styled.tr<{ id: number }>`
  position: relative;
  background: ${({ id }) => getRowBackground(id)};
  border-radius: 16px;
  width: 100%;
  height: 70px;
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr 1fr 1fr 1fr;
  margin-block: 15px;
  color: ${({ id }) => (id > 3 ? 'white' : 'black')};
  &:before {
    position: absolute;
    top: 0;
    right: 0;
    left: 0;
    bottom: 0;
    content: '';
    width: 100%;
    height: 100%;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.06) 0%,
      rgba(255, 255, 255, 0.06) 100%
    );
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);

    box-shadow: 0px 7px 14px 0px #0000001a;

    box-shadow: 0px 14px 24px 0px #11141d66 inset;
    opacity: 0.7;
  }
  td {
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      width: 42px;
      height: 42px;
      margin-right: 10px;
      border-radius: 50%;
      /* border: 2px solid ${({ id }) => (id > 3 ? 'white' : 'black')}; */
    }
    p {
      font-size: 11px;
      font-family: Mulish;
    }
  }
`
