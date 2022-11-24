import styled from 'styled-components'

export const ExploreWrapper = styled.div`
  width: 100%;
`
export const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 20px 0;
  gap: 20px;
  overflow: auto;
  @media (max-width: 1550px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  @media (max-width: 1024px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`
export const Filter = styled.div`
  display: flex;
  column-gap: 20px;
  overflow: auto;
`
export const FilterCard = styled.div<{ isActive: boolean }>`
  border-radius: 30px;
  display: flex;
  align-items: center;
  border: 1px solid;

  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  box-shadow: 0px 7px 14px 0px #0000001a, 0px 14px 24px 0px #11141d66 inset;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  padding: 10px 30px 10px 10px;
  cursor: pointer;
  text-align: center;
  font-family: Mulish;
  color: ${({ isActive }) => (isActive ? 'white' : 'rgba(255,255,255,0.5)')};
  @media (max-width: 650px) {
    width: 114px;
    font-size: 12px;
  }
`
export const CountWrapper = styled.div`
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.1);
  margin-right: 5px;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  min-width: 30px;
`
