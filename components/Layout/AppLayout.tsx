//import styled from 'styled-components'
import { useEffect, useState } from "react";
import TagManager from "react-gtm-module";
import styled from "styled-components";
import { isPC } from "util/device";
import { FooterBar } from "./FooterBar";
import { MobileFooterBar } from "./MobileFooter";
import { NavigationSidebar } from "./NavigationSidebar";

const tagManagerArgs = {
  gtmId: process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID,
};

//TagManager.initialize(tagManagerArgs)

export const AppLayout = ({
  footerBar = isPC() ? <FooterBar /> : <MobileFooterBar />,
  children,
  fullWidth,
  hasBanner = false,
}) => {
  const [openNav, setOpenNav] = useState(false);

  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);
  return (
    <Container>
      <StyledWrapper>
        <NavigationSidebar openNav={openNav} setOpenNav={setOpenNav} />

        <StyledContainer hasBanner={hasBanner}>
          <main>{children}</main>
        </StyledContainer>

        <StyledFooter>
          <StyledFooterWrapper>{footerBar}</StyledFooterWrapper>
        </StyledFooter>
      </StyledWrapper>
    </Container>
  );
};
const Container = styled.div`
  background: rgb(24, 27, 42);
  justify-content: center;
  display: flex;
`;
const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  color: white;
  width: 100%;
  align-items: center;
`;

const StyledContainer = styled.div<{ hasBanner: boolean }>`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-top: ${({ hasBanner }) => (hasBanner ? "0" : "130px")};
  padding: ${({ hasBanner }) => (hasBanner ? "0" : "40px")};
  ${({ hasBanner }) => !hasBanner && "max-width: 1700px"};
  width: 100%;
  @media (max-width: 1600px) {
    margin-top: 60px;
  }
  @media (max-width: 1024px) {
    margin-top: 80px;
    padding: 10px;
  }
  @media (max-width: 650px) {
    margin-top: 0;
  }
`;

const StyledFooter = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px 0 0 0;
  width: 100%;
`;

const StyledFooterWrapper = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;
