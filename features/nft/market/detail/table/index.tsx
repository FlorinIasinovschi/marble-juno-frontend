import * as React from "react";
import styled from "styled-components";
import { HStack, Text } from "@chakra-ui/react";
import { RoundedBidIconComponent } from "components/RoundedIcon";
import { getRealTokenAmount } from "services/nft";

const SimpleTable = ({ data, unit, paymentToken }) => {
  return (
    <Container>
      {data.map((element, index) => (
        <BidContainer key={index} isEnd={data.length - 1 === index}>
          <HStack style={{ display: "flex", alignItems: "center" }}>
            <RoundedBidIconComponent
              size="56px"
              address={element.address}
              font="15px"
            />
          </HStack>
          <Text fontFamily="Mulish" fontSize="20px">
            {getRealTokenAmount({ amount: element.price, denom: paymentToken })}{" "}
            {paymentToken}
          </Text>
        </BidContainer>
      ))}
    </Container>
  );
};

const Container = styled.div`
  font-family: Mulish;
`;
const BidContainer = styled.div<{ isEnd: boolean }>`
  display: flex;
  justify-content: space-between;
  ${({ isEnd }) => !isEnd && "border-bottom: 1px solid #434960"};
  padding: 24px 0;
  align-items: center;
`;

export default SimpleTable;
