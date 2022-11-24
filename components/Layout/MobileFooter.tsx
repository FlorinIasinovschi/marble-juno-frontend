import { useEffect, useState } from 'react'
import { Text } from '../Text'
import { styled } from '../theme'
import Link from 'next/link'
import { Button } from '../Button'
import { UpRightArrow, CollapseUp, CollapseDown } from '../../icons'
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
} from '@chakra-ui/react'
import { IconWrapper } from '../IconWrapper'
import { Github } from '../../icons/Github'
import { Medium } from '../../icons/Medium'
import { Discord } from '../../icons/Discord'
import { Telegram } from '../../icons/Telegram'
import { Twitter } from '../../icons/Twitter'
import {
  ChakraProvider,
  Stack,
  Flex,
  HStack,
  StackDivider,
} from '@chakra-ui/react'

export const MobileFooterBar = () => {
  const [openQuickNav, setOpenQuickNav] = useState(false)
  const [openCommunityNav, setOpenCommunityNav] = useState(true)
  const [openCompanyNav, setOpenCompanyNav] = useState(true)

  const buttonIconCss = {
    borderRadius: '50%',

    width: '45px',
    height: '45px',
    backdropFilter: 'blur(40px)',
    position: 'relative',
    background: 'transparent',
    '& svg': {
      fill: 'white',
    },

    '&::before': {
      content: '',
      position: 'absolute',
      left: 0,
      top: 0,
      borderRadius: '50%',
      width: '100%',
      height: '100%',
      background: 'rgba(18, 21, 33)',
      boxShadow:
        '0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6D6D78',
      zIndex: '-1',
      opacity: '0.3',
    },
  }
  return (
    <ChakraProvider>
      <StyledFooter>
        <Flex flexDirection="column">
          <Stack>
            <ContainerForColumn className="bottom-desc-section">
              <Link href="/" passHref>
                <StyledLogo>
                  <StyledImage
                    src="/images/logotext.svg"
                    className="footer-logo"
                  />
                </StyledLogo>
              </Link>
              <Text
                className="footer-desc"
                css={{
                  color: 'rgba(255,255,255,0.5)',
                  fontSize: '18px',
                  padding: '$space$10 0',
                  lineHeight: '32px',
                }}
              >
                Made of Phygital NFTs. Built on COSMOS and NEAR. We empower
                Creators and Brands by connecting them with AR and VR.
              </Text>
            </ContainerForColumn>
          </Stack>
          <Accordion allowToggle>
            <StyledAccordionItem>
              <AccordionButton>
                <h3 className="desktop-section">MARBLE</h3>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ContainerForFooterLinks
                  className={`footer-links ${openQuickNav ? 'open' : 'close'}`}
                >
                  <Link href="https://app.marbledao.finance/dashboard" passHref>
                    Feed
                  </Link>
                  <Link href="/explore" passHref>
                    Browse
                  </Link>
                  <Link href="https://near.marbledao.finance" passHref>
                    DeFi
                  </Link>
                </ContainerForFooterLinks>
              </AccordionPanel>
            </StyledAccordionItem>
            <StyledAccordionItem>
              <AccordionButton>
                <h3 className="desktop-section">Community</h3>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ContainerForFooterLinks
                  className={`footer-links ${
                    openCommunityNav ? 'open' : 'close'
                  }`}
                >
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
              </AccordionPanel>
            </StyledAccordionItem>
            <StyledAccordionItem>
              <AccordionButton>
                <h3 className="desktop-section">Company</h3>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel pb={4}>
                <ContainerForFooterLinks
                  className={`footer-links ${
                    openCompanyNav ? 'open' : 'close'
                  }`}
                >
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
              </AccordionPanel>
            </StyledAccordionItem>
          </Accordion>
        </Flex>
        <HStack spacing={3} marginTop="40px">
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
        <HorizontalDivider />
        <FooterText>
          Copyright ©️ 2022 Marble Dao. All rights reserved.
        </FooterText>
      </StyledFooter>
    </ChakraProvider>
  )
}

const HorizontalDivider = styled('div', {
  height: 0,
  borderTop: '1px solid #363B4E',
  width: '100%',
  margin: '40px 0',
})
const StyledImage = styled('img', {
  // width: "50px",
  width: '200px',
})
const StyledLogo = styled('div', {
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
})
const ContainerForColumn = styled('div', {
  display: 'flex',
  minWidth: '180px',
  flexDirection: 'column',
  ' h3': {
    fontSize: '22px',
    fontWeight: '700',
    marginBottom: '10px',
  },
})

const ContainerForFooterLinks = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  ' a': {
    padding: '15px',
    color: '$textColors$white',
    fontSize: '16px',
    opacity: '0.5',
  },
  height: '100%',
})
const StyledFooter = styled('footer', {
  color: 'white',
  position: 'relative',
  padding: '100px 20px 50px 20px',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundImage: `url(/images/MobileCurveLine.svg)`,
  backgroundPosition: 'top',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
})

const FooterText = styled('div', {
  fontSize: '14px',
  textAlign: 'center',
  opacity: '0.5',
  fontFamily: 'Mulish',
})

const StyledAccordionItem = styled(AccordionItem, {
  padding: '5px 0 !important',
  borderColor: '#363B4E !important',
  ' h3': {
    fontSize: '16px',
    fontWeight: '600',
  },
})
