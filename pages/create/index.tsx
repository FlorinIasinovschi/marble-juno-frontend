import * as React from 'react'
import styled from 'styled-components'
import { default_image } from 'util/constants'
import Link from 'next/link'
import { AppLayout } from 'components/Layout/AppLayout'
import { RoundedIcon } from 'components/RoundedIcon'
import { Stack, Text } from '@chakra-ui/react'
import { Create } from 'icons'
import { isMobile } from 'util/device'

export default function Home() {
    return (
        <AppLayout fullWidth={true}>
            <Container>
                <Stack spacing={isMobile() ? '20px' : '50px'}>
                    <Title>Create On Marble Dao</Title>
                    <Collections>
                        <Stack spacing={isMobile() ? '10px' : '30px'}>
                            <SubTitle>Your Collection</SubTitle>

                            <Link href={`/collection/create`} passHref>
                                <Card>
                                    <IconWrapper>
                                        <Create />
                                    </IconWrapper>
                                    <Text
                                        fontSize={isMobile() ? '14px' : '20px'}
                                        fontWeight="700"
                                    >
                                        Create A New Collection
                                    </Text>
                                </Card>
                            </Link>

                            {/* Owned collections */}
                        </Stack>
                    </Collections>
                </Stack>
            </Container>
        </AppLayout>
    )
}

const IconWrapper = styled.div`
  background: rgba(255, 255, 255, 0.16);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
  }
`

const Container = styled.div`
  padding: 70px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 480px) {
    padding: 10px;
  }
`

const Title = styled.div`
  font-size: 46px;
  font-weight: 600;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 22px;
  }
`
const SubTitle = styled.div`
  font-size: 30px;
  font-weight: 600;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`

const Collections = styled.div`
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  box-shadow: 0px 7px 14px rgba(0, 0, 0, 0.1),
    inset 0px 14px 24px rgba(17, 20, 29, 0.4);
  backdrop-filter: blur(30px);
  border-radius: 30px;
  width: 1000px;
  padding: 50px;
  border: 1px solid;
  border-image-source: linear-gradient(
    106.01deg,
    rgba(255, 255, 255, 0.2) 1.02%,
    rgba(255, 255, 255, 0) 100%
  );
  @media (max-width: 480px) {
    width: 100%;
    padding: 20px;
  }
`
const Card = styled.div`
  background: linear-gradient(0deg, #050616, #050616) padding-box,
    linear-gradient(90.65deg, #ffffff 0.82%, rgba(0, 0, 0, 0) 98.47%) border-box;
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
  backdrop-filter: blur(40px);
  border-radius: 20px;
  border: 1px solid;
  border-image-source: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );
  padding: 25px;
  display: flex;
  align-items: center;
  cursor: pointer;
`