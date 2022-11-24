import { useEffect, useState } from "react";
import { Text } from "../Text";
import styled from "styled-components";
import Link from "next/link";
import { Button } from "../Button";
import { UpRightArrow, CollapseUp, CollapseDown } from "../../icons";
import { IconWrapper } from "../IconWrapper";
import { APP_NAME } from "../../util/constants";
import { Github } from "../../icons/Github";
import { Medium } from "../../icons/Medium";
import { Discord } from "../../icons/Discord";
import { Telegram } from "../../icons/Telegram";
import { Twitter } from "../../icons/Twitter";
import { ChakraProvider, Stack, Flex, HStack } from "@chakra-ui/react";

export const FooterBar = () => {
  const [openQuickNav, setOpenQuickNav] = useState(false);
  const [openCommunityNav, setOpenCommunityNav] = useState(true);
  const [openCompanyNav, setOpenCompanyNav] = useState(true);

  const buttonIconCss = {
    borderRadius: "50%",

    width: "45px",
    height: "45px",
    backdropFilter: "blur(40px)",
    position: "relative",
    background: "transparent",
    "& svg": {
      fill: "white",
    },

    "&::before": {
      content: "",
      position: "absolute",
      left: 0,
      top: 0,
      borderRadius: "50%",
      width: "100%",
      height: "100%",
      background: "rgba(18, 21, 33)",
      boxShadow:
        "0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6D6D78",
      zIndex: "-1",
      opacity: "0.3",
    },
  };
  return (
    <ChakraProvider>
      <StyledFooter>
        {/* <img src="/images/CurveLine.svg" alt="" /> */}
        <Flex width="80%" justifyContent="space-between">
          <Stack width="40%">
            <ContainerForColumn className="bottom-desc-section">
              <Link href="/" passHref>
                <StyledLogo>
                  <StyledImage
                    src="/images/logotext.svg"
                    className="footer-logo"
                  />
                </StyledLogo>
              </Link>
              <TextContent>
                Made of Phygital NFTs. Built on COSMOS and NEAR. We empower
                Creators and Brands by connecting them with AR and VR.
              </TextContent>
              <HStack spacing={3}>
                <Button
                  as="a"
                  href={process.env.NEXT_PUBLIC_DISCORD_LINK}
                  target="__blank"
                  icon={<IconWrapper icon={<Discord />} />}
                  css={buttonIconCss}
                />
                <Button
                  as="a"
                  href={process.env.NEXT_PUBLIC_TELEGRAM_LINK}
                  target="__blank"
                  icon={<IconWrapper icon={<Telegram />} />}
                  css={buttonIconCss}
                />
                <Button
                  as="a"
                  href={process.env.NEXT_PUBLIC_TWITTER_LINK}
                  target="__blank"
                  icon={<IconWrapper icon={<Twitter />} />}
                  css={buttonIconCss}
                />
                <Button
                  as="a"
                  href={process.env.NEXT_PUBLIC_INTERFACE_GITHUB_LINK}
                  target="__blank"
                  icon={<IconWrapper icon={<Github />} />}
                  css={buttonIconCss}
                />
                <Button
                  as="a"
                  href={process.env.NEXT_PUBLIC_MEDIUM_LINK}
                  target="__blank"
                  icon={<IconWrapper icon={<Medium />} />}
                  css={buttonIconCss}
                />
              </HStack>
            </ContainerForColumn>
          </Stack>
          <Stack width="10%" />
          <Stack width="20%">
            <ContainerForColumn className="bottom-quick-section">
              <h3 className="desktop-section">MARBLE</h3>
              <ContainerForFooterLinks
                className={`footer-links ${openQuickNav ? "open" : "close"}`}
              >
                <a
                  href="https://app.marbledao.finance/dashboard"
                  target="__blank"
                >
                  Feed
                </a>
                <Link href="/explore" passHref>
                  Browse
                </Link>
                <a href="https://near.marbledao.finance" target="__blank">
                  DeFi
                </a>
              </ContainerForFooterLinks>
            </ContainerForColumn>
          </Stack>
          <Stack width="20%">
            <ContainerForColumn className="bottom-community-section">
              <h3 className="desktop-section">COMMUNITY</h3>

              <ContainerForFooterLinks>
                <Link href={process.env.NEXT_PUBLIC_MEDIUM_LINK} passHref>
                  Medium
                </Link>
                <Link href={process.env.NEXT_PUBLIC_TWITTER_LINK} passHref>
                  Twitter
                </Link>
                <Link href={process.env.NEXT_PUBLIC_DISCORD_LINK} passHref>
                  Discord
                </Link>
                <Link href={process.env.NEXT_PUBLIC_TELEGRAM_LINK} passHref>
                  Telegram
                </Link>
              </ContainerForFooterLinks>
            </ContainerForColumn>
          </Stack>
          <Stack width="10%">
            <ContainerForColumn className="bottom-company-section">
              <h3 className="desktop-section">Company</h3>

              <ContainerForFooterLinks>
                <Link href="https://marbledao.finance" passHref>
                  Home
                </Link>
                <Link
                  href="https://daodao.zone/dao/juno1zz3gc2p9ntzgjt8dh4dfqnlptdynxlgd4j7u2lutwdg5xwlm4pcqyxnecp"
                  passHref
                >
                  DAO
                </Link>
                <Link
                  href={process.env.NEXT_PUBLIC_INTERFACE_GITHUB_LINK}
                  passHref
                >
                  Github
                </Link>
                <Link href="https://discord.gg/zKbNUByUHR" passHref>
                  Support
                </Link>
              </ContainerForFooterLinks>
            </ContainerForColumn>
          </Stack>
        </Flex>
        <HorizontalDivider />
        <FooterText>
          Copyright ©️ 2022 Marble Dao. All rights reserved.
        </FooterText>
      </StyledFooter>
    </ChakraProvider>
  );
};

const HorizontalDivider = styled.div`
  height: 0;
  border: 1px solid #363b4e;
  width: 80%;
  margin: 40px 0;
`;

const StyledImage = styled.img`
  margin-right: 10px;
  width: 200px;
`;

const StyledLogo = styled.div`
  display: flex;
  flex-direction: row;
`;

const ContainerForColumn = styled.div`
  display: flex;
  min-width: 180px;
  flex-direction: column;
  h3 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 10px;
  }
  @media (max-width: 1550px) {
    h3 {
      font-size: 18px;
    }
  }
`;
const ContainerForFooterLinks = styled.div`
  display: flex;
  flex-direction: column;
  a {
    padding: 15px;
    color: white;
    font-size: 16px;
    opacity: 0.5;
    font-family: Mulish;
  }
  height: 100%;
  @media (max-width: 1550px) {
    a {
      padding: 12px;
      color: white;
      font-size: 16px;
      opacity: 0.5;
    }
  }
`;

const StyledFooter = styled.footer`
  color: white;
  position: relative;
  /* background: transparent; */
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  padding: 150px 0 50px 0;
  &:before {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(/images/CurveLine.svg);
    background-repeat: no-repeat;
    background-size: cover;
  }

  /* background-image: url(/images/CurveLine.svg);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top; */
  /* & > img {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
  } */
`;
const TextContent = styled.div`
  color: white;
  font-size: 18px;
  padding: 20px 0;
  line-height: 32px;
  font-family: Mulish;
  opacity: 0.5;
  @media (max-width: 1550px) {
    font-size: 16px;
  }
`;
const FooterText = styled.div`
  font-size: 16px;
  text-align: center;
  opacity: 0.5;
`;
