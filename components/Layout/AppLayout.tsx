//import styled from 'styled-components'
import { useEffect, useState } from "react";
import TagManager from "react-gtm-module";
import styled from "styled-components";
import { isPC } from "util/device";
import { FooterBar } from "./FooterBar";
import { MobileFooterBar } from "./MobileFooter";
import { NavigationSidebar } from "./NavigationSidebar";
import { Button } from "components/Button";
import Checkbox from "components/Checkbox";
import { useDispatch, useSelector } from "react-redux";
import { setAgreed } from "hooks/useProfile";
import { StyledCloseIcon } from "components/Dialog";
import { getProfileData } from "store/actions/profileAction";
import useExplorer from "hooks/useExplorer";
import {
  ChakraProvider,
  Modal,
  ModalOverlay,
  ModalContent,
  Stack,
  HStack,
  ModalCloseButton,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

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
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [error, setError] = useState(false);
  const [original, setOriginal] = useState(false);
  const [creative, setCreative] = useState(false);

  const profile = useSelector((state: any) => state.profileData.profile_status);
  useExplorer();
  useEffect(() => {
    TagManager.initialize(tagManagerArgs);
  }, []);
  useEffect(() => {
    if (profile._id && !profile.isAgreed) onOpen();
  }, [profile]);
  const handleAgree = async () => {
    if (!original || !creative) {
      setError(true);
      return;
    }
    const result = await setAgreed(profile._id);
    if (result) {
      getProfileData(profile.id, dispatch);
      onClose();
    }
  };
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
        <ChakraProvider>
          <Modal
            blockScrollOnMount={true}
            isOpen={isOpen}
            onClose={() => {}}
            isCentered
          >
            <ModalOverlay
              backdropFilter="blur(14px)"
              bg="rgba(0, 0, 0, 0.34)"
            />
            <ModalContainer>
              <a href="https://google.com">
                <StyledCloseIcon offset={20} size="40px" />
              </a>
              <Card>
                <CardContent>
                  <h1>Accepting Terms of Service and Privacy Policy </h1>
                  <HStack alignItems="start">
                    <span>1.</span>
                    <Text>
                      Illegal Content: This includes anything that infringes on
                      someone&apos;s intellectual property rights, such as using
                      images, videos, or music without permission, or selling
                      counterfeit products.
                    </Text>
                  </HStack>
                  <HStack alignItems="start">
                    <span>2.</span>
                    <Text>
                      Harmful Content: This includes content that promotes hate
                      speech, discrimination, or violence against a specific
                      group of people or individual. It also includes content
                      that promotes self-harm, dangerous behaviors, or illegal
                      activities.
                    </Text>
                  </HStack>
                  <HStack alignItems="start">
                    <span>3.</span>
                    <Text>
                      Offensive Content: This includes content that is
                      considered vulgar, obscene, or offensive to a specific
                      group of people, such as sexually explicit content,
                      nudity, or explicit language.
                    </Text>
                  </HStack>
                  <HStack alignItems="start">
                    <span>4.</span>
                    <Text>
                      Inappropriate Content: This includes content that is not
                      suitable for minors or children, such as gambling or
                      adult-related content.
                    </Text>
                  </HStack>
                  <HStack alignItems="start">
                    <span>5.</span>
                    <Text>
                      Misleading Content: This includes content that is
                      misleading, false, or inaccurate, such as selling NFTs
                      that do not exist or misrepresenting the value or
                      ownership of the NFT.
                    </Text>
                  </HStack>
                </CardContent>

                <Divider />
                <CheckboxContent>
                  <HStack alignItems="center">
                    <Checkbox
                      checked={original}
                      onChange={(e) => {
                        setOriginal(!original);
                      }}
                      size="20px"
                    />
                    <h3>I have read and agree to the Privacy Policy.</h3>
                  </HStack>
                  <HStack alignItems="center">
                    <Checkbox
                      checked={creative}
                      onChange={(e) => setCreative(!creative)}
                      size="20px"
                    />
                    <h3>I have read and agree to the Terms and Conditions.</h3>
                  </HStack>
                  <Stack width="100%" margin="0 auto">
                    <Button
                      className="btn-buy btn-default"
                      css={{
                        background: "$white",
                        color: "$black",
                        stroke: "$black",
                        width: "100%",
                      }}
                      variant="primary"
                      size="large"
                      onClick={handleAgree}
                    >
                      I Agree
                    </Button>
                    <p
                      style={{
                        visibility: error ? "visible" : "hidden",
                        color: "red",
                        fontFamily: "Mulish",
                      }}
                    >
                      Please select all conditions
                    </p>
                  </Stack>
                </CheckboxContent>
              </Card>
            </ModalContainer>
          </Modal>
        </ChakraProvider>
      </StyledWrapper>
    </Container>
  );
};
const Divider = styled.div`
  height: 0px;
  border: 1px solid #363b4e;
  margin: 20px 0;
`;
const Card = styled.div<{ fullWidth: boolean }>`
  /* &:before {
    opacity: 0.3;
    border-radius: 30px;
  } */
  padding: 40px 40px 10px 40px;
  max-width: 1000px;
  width: 100%;
  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

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
  padding: ${({ hasBanner }) => (hasBanner ? "0" : "40px")};
  ${({ hasBanner }) => !hasBanner && "max-width: 1700px"};
  width: 100%;
  @media (max-width: 1600px) {
  }
  @media (max-width: 1024px) {
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
const ModalContainer = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 30px;
  color: white !important;
  max-width: 900px !important;
  @media (max-width: 1000px) {
    max-width: 90vw !important;
    padding: 5px;
  }
`;
const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  h1 {
    text-align: center;
    font-size: 30px;
    font-weight: 500;
  }
  span {
    width: 20px;
  }
  p {
    font-family: Mulish;
    width: fit-content;
    font-size: 16px;
  }
`;
const CheckboxContent = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
`;
