import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Progress, ChakraProvider } from '@chakra-ui/react'
import { StateType } from 'store/types'
import { Button } from 'components/Button'
import { Menu, MenuItem } from 'components/Menu'
import {
  Container,
  Header,
  ContentWrapper,
  GridContainer,
  GridItem,
  LoyaltyStatusWrapper,
  UserStatusWrapper,
  UserInfoItem,
  UserAvatar,
  UserInfoWrapper,
  ProgressWrapper,
  PointValue,
  RewardWrapper,
  QuestCardWrapper,
  QuestCard,
  ProgressValue,
  QuestLink,
  CardClaimArea,
  ClaimButton,
} from './styled'

const questType = [
  'Make A Swap On Dex',
  'Buy An Nft On Marketplace',
  'Provide Liquidity To The Pool',
]
const completedQuestType = ['Buy Marble On Junoswap']

const questCardContent = [
  {
    title: 'Make a Swap On DEX',
    content:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    value: 50,
    link: 'https://near.marbledao.finance',
    linkText: 'Make the swap URL LINK',
    id: '1',
  },
  {
    title: 'Buy An Nft On Marketplace',
    content:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    value: 50,
    link: 'https://near.marbledao.finance',
    linkText: 'Make the swap URL LINK',
    id: '1',
  },
  {
    title: 'Provide Liquidity To The Pool',
    content:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    value: 50,
    link: 'https://near.marbledao.finance',
    linkText: 'Make the swap URL LINK',
    id: '1',
  },
  {
    title: 'Buy Marble On Junoswap',
    content:
      "Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    value: 50,
    link: 'https://near.marbledao.finance',
    linkText: 'Make the swap URL LINK',
    id: '1',
  },
]

const Quests = () => {
  const profileInfo = useSelector(
    (state: StateType) => state.profileData.profile_status
  )
  const [activeQuest, setActiveQuest] = useState(questType[0])
  const imageUrl = process.env.NEXT_PUBLIC_PINATA_URL + profileInfo.avatar
  return (
    <ChakraProvider>
      <Container>
        <Header>Marble quests</Header>
        <ContentWrapper>
          <GridContainer>
            <GridItem>
              <LoyaltyStatusWrapper>Loyalty: Plantinum</LoyaltyStatusWrapper>
            </GridItem>
            <GridItem>
              <UserStatusWrapper>
                <UserInfoItem>
                  <UserAvatar src={imageUrl} alt="user" />
                  <UserInfoWrapper>
                    <h1>{profileInfo.name || profileInfo.id}</h1>
                    <ProgressWrapper>
                      <p>LVL1</p>
                      <Progress
                        colorScheme="green"
                        size="sm"
                        borderRadius="20px"
                        border="0.680272px solid rgba(255, 255, 255, 0.2)"
                        background="transparent"
                        width="-webkit-fill-available"
                        value={80}
                      />
                      <p>LVL2</p>
                      <PointValue>7000/10000</PointValue>
                    </ProgressWrapper>
                  </UserInfoWrapper>
                </UserInfoItem>
                <RewardWrapper>
                  <h2>
                    Reward <br /> 10 MARBLE
                  </h2>
                  <Button
                    className="btn-buy btn-default"
                    css={{
                      background: '$white',
                      color: '$black',
                      stroke: '$black',
                      width: '80px',
                      height: '40px',
                    }}
                    variant="primary"
                    size="large"
                  >
                    claim
                  </Button>
                </RewardWrapper>
              </UserStatusWrapper>
            </GridItem>
          </GridContainer>
          <GridContainer>
            <GridItem>
              <Menu title="active">
                {questCardContent.map((item) => (
                  <MenuItem
                    key={item}
                    onClick={() => setActiveQuest(item.title)}
                    active={item.title == activeQuest}
                  >
                    {item.title}
                  </MenuItem>
                ))}
              </Menu>
              <Menu title="completed">
                {completedQuestType.map((item) => (
                  <MenuItem
                    key={item}
                    onClick={() => setActiveQuest(item)}
                    active={item == activeQuest}
                  >
                    {item}
                  </MenuItem>
                ))}
              </Menu>
            </GridItem>
            <GridItem>
              <QuestCardWrapper>
                {questCardContent.map((item) => (
                  <QuestCard key={item.id}>
                    <h1>{item.title}</h1>
                    <p>{item.content}</p>
                    <ProgressWrapper>
                      <Progress
                        colorScheme="green"
                        borderRadius="20px"
                        border="0.680272px solid rgba(255, 255, 255, 0.2)"
                        background="transparent"
                        width="-webkit-fill-available"
                        height="30px"
                        max={10}
                        value={8}
                      />
                      <ProgressValue>8/10</ProgressValue>
                    </ProgressWrapper>
                    <QuestLink target="__blank" href={item.link}>
                      {item.linkText}
                    </QuestLink>
                    <h2>Rewards</h2>
                    <CardClaimArea>
                      <p>10.000 points</p>
                      <ClaimButton>Claim</ClaimButton>
                    </CardClaimArea>
                  </QuestCard>
                ))}
              </QuestCardWrapper>
            </GridItem>
          </GridContainer>
        </ContentWrapper>
      </Container>
    </ChakraProvider>
  )
}

export default Quests
