import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Progress, ChakraProvider } from '@chakra-ui/react'
import { MagicStar, CheckIcon } from 'icons'
import {
  Container,
  Header,
  ContentWrapper,
  GridItem,
  TitleItem,
  CardWrapper,
  CardTitle,
  IconWrapper,
  Icon,
  CardContent,
  CheckIconWrapper,
  HeaderIconWrapper,
  LeaderboardWrapper,
  FilterWrapper,
  FilterItem,
  TableWrapper,
  TableHeader,
  TableRow,
} from './styled'

const Icons = {
  Basic: (
    <svg
      width="10"
      height="11"
      viewBox="0 0 10 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.56173 0.59668H0V10.3597H9.56173V0.59668Z" fill="white" />
    </svg>
  ),
  Silver: (
    <svg
      width="36"
      height="14"
      viewBox="0 0 36 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.56173 2.2002H0V11.9632H9.56173V2.2002Z" fill="white" />
      <path
        d="M35.1263 0.590088H22.3438V13.5739H35.1263V0.590088Z"
        fill="white"
      />
    </svg>
  ),
  Gold: (
    <svg
      width="68"
      height="20"
      viewBox="0 0 68 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.56173 4.89868H0V14.6617H9.56173V4.89868Z" fill="white" />
      <path
        d="M35.1282 3.28809H22.3457V16.2719H35.1282V3.28809Z"
        fill="white"
      />
      <path
        d="M67.0839 0.0671387H47.9102V19.5429H67.0839V0.0671387Z"
        fill="white"
      />
    </svg>
  ),
  Platinum: (
    <svg
      width="112"
      height="30"
      viewBox="0 0 112 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M9.56173 9.71265H0V19.4757H9.56173V9.71265Z" fill="white" />
      <path
        d="M35.1263 8.10229H22.3438V21.0861H35.1263V8.10229Z"
        fill="white"
      />
      <path d="M67.082 4.88159H47.9082V24.3573H67.082V4.88159Z" fill="white" />
      <path d="M111.922 0H83.1865V29.1884H111.922V0Z" fill="white" />
    </svg>
  ),
}

const loyaltyConstant = [
  {
    id: 0,
    title: 'Basic',
    description: 'Welcome to Marble. Your journey starts here',
    total: '25$',
    staked: '0',
    liquidity: '25$',
    nft: '0',
    governance: false,
    cash: '0%',
  },
  {
    id: 1,
    title: 'Silver',
    description: 'You are a DAO member! Stake, vote and enjoy benefits',
    total: '50$',
    staked: '1',
    liquidity: '50$',
    nft: '1',
    governance: true,
    cash: '0.5%',
  },
  {
    id: 2,
    title: 'Gold',
    description: 'Exclusive deals on products and experiences made by Marble',
    total: '150$',
    staked: '10',
    liquidity: '150$',
    nft: '3',
    governance: true,
    cash: '1%',
  },
  {
    id: 3,
    title: 'Platinum',
    description:
      'Full privileges on Marble. Early access and reserved discounts',
    total: '500$',
    staked: '50',
    liquidity: '500$',
    nft: '5',
    governance: true,
    cash: '3%',
  },
]

const leaderboardConstant = [
  {
    id: 1,
    src: '/profile.png',
    name: 'Christian Albert',
    level: '3',
    rankChange: 1,
    quests: '10',
    points: '10',
  },
  {
    id: 2,
    src: '/profile.png',
    name: 'Joshua Thenderson',
    level: '2',
    rankChange: 1,
    quests: '10',
    points: '10',
  },
  {
    id: 3,
    src: '/profile.png',
    name: 'Nicholas Halden',
    level: '2',
    rankChange: 1,
    quests: '10',
    points: '10',
  },
  {
    id: 4,
    src: '/profile.png',
    name: 'Eric Dunham',
    level: '1',
    rankChange: 1,
    quests: '10',
    points: '10',
  },
  {
    id: 5,
    src: '/profile.png',
    name: 'Harry Potter',
    level: '1',
    rankChange: 1,
    quests: '10',
    points: '10',
  },
]

const Loyalty = () => {
  const [filter, setFilter] = useState('Basic')
  return (
    <ChakraProvider>
      <Container>
        <Header>Loyalty Program</Header>
        <ContentWrapper>
          <GridItem>
            <CardTitle>
              <h1>
                Loyalty <br /> Features
              </h1>
            </CardTitle>
            <TitleItem>
              <h1>$token in wallet</h1>
              <p>Hold $TOKEN in your wallet</p>
            </TitleItem>
            <TitleItem>
              <h1>Staked TOKEN</h1>
              <p>Stake and lock TOKEN to earn more</p>
            </TitleItem>
            <TitleItem>
              <h1>Liquidity Provider</h1>
              <p>Contribute and enjoy the APR</p>
            </TitleItem>
            <TitleItem>
              <h1>NEAR NFT Holder</h1>
              <p>Your digital identity on Marble</p>
            </TitleItem>
            <TitleItem>
              <h1>Governance</h1>
              <p>Participate and vote</p>
            </TitleItem>
            <TitleItem>
              <h1>CashBack</h1>
            </TitleItem>
          </GridItem>
          {loyaltyConstant.map((element) => (
            <CardWrapper key={element.id} isLast={element.id === 3}>
              <CardTitle level={element.id}>
                <HeaderIconWrapper>{Icons[element.title]}</HeaderIconWrapper>
                <h1>{element.title}</h1>
                <p>{element.description}</p>
              </CardTitle>
              <CardContent>{element.total}</CardContent>
              <CardContent>{element.staked}</CardContent>
              <CardContent>{element.liquidity}</CardContent>
              <CardContent>{element.nft}</CardContent>
              <CardContent>
                {element.governance ? (
                  <CheckIconWrapper>
                    <CheckIcon fill="black" />
                  </CheckIconWrapper>
                ) : (
                  '-'
                )}
              </CardContent>
              <CardContent>{element.cash}</CardContent>
            </CardWrapper>
          ))}
        </ContentWrapper>
        <LeaderboardWrapper>
          <h1>Leaderboard</h1>
          <FilterWrapper>
            <h2>filters category</h2>
            {loyaltyConstant.map((element) => (
              <FilterItem
                key={element.id}
                isActive={filter === element.title}
                onClick={() => setFilter(element.title)}
              >
                {element.title}
              </FilterItem>
            ))}
          </FilterWrapper>
          <TableWrapper>
            <TableHeader>
              <th>Position</th>
              <th>Player name</th>
              <th>Level</th>
              <th>Rank change(24h)</th>
              <th>Quests</th>
              <th>Points</th>
            </TableHeader>
            {leaderboardConstant.map((element) => (
              <TableRow id={element.id} key={element.id}>
                <td>{element.id}</td>
                <td style={{ justifyContent: 'start' }}>
                  <img src={element.src} alt="img" />
                  {element.name}
                </td>
                <td>
                  <p>LVL1</p>
                  <Progress
                    colorScheme="green"
                    size="sm"
                    borderRadius="20px"
                    border="0.680272px solid rgba(255, 255, 255, 0.2)"
                    background="#272734"
                    width="-webkit-fill-available"
                    value={Number(element.level)}
                    max={4}
                  />
                  <p>LVL2</p>
                </td>
                <td>{element.id}</td>
                <td>{element.quests}/10</td>
                <td>{element.points}</td>
              </TableRow>
            ))}
          </TableWrapper>
        </LeaderboardWrapper>
      </Container>
    </ChakraProvider>
  )
}

export default Loyalty
