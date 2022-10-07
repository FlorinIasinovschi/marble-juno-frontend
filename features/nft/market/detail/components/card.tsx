import React from 'react'
import styled from 'styled-components'

const Card = ({ title, children }) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </Container>
  )
}

const Container = styled.div`
  padding: 30px;
  width: 100%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 30px;
  @media (max-width: 480px) {
    padding: 15px 20px;
    box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09), inset 0px 7px 24px #6d6d78;
    background: rgba(5, 6, 21, 0.2);
  }
`

const Title = styled.div`
  font-size: 20px;
  font-weight: 700;
  @media (max-width: 480px) {
    font-size: 16px;
  }
`

const Content = styled.div`
  padding: 10px 0 0 0;
`
export default Card
