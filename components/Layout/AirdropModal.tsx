import {
  ChakraProvider,
  Modal,
  ModalContent,
  ModalOverlay,
  Stack,
  useDisclosure,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import { getProfileData } from "store/actions/profileAction";
import axios from "axios";
import { Button } from "components/Button";
import { StyledCloseIcon } from "components/Dialog";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { backend_url } from "util/constants";
import { StateType } from "store/types";

const AirdropModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const dispatch = useDispatch();
  const profile = useSelector(
    (state: StateType) => state.profileData.profile_status
  );
  const [nearAddress, setNearAddress] = useState("");
  const [error, setError] = useState(false);
  const onHandle = async () => {
    try {
      if (nearAddress == "") setError(true);
      const { data } = await axios.post(`${backend_url}/airdrop/set_near`, {
        address: profile.id,
        near: nearAddress,
      });
      if (data) getProfileData(profile.id, dispatch);
      onClose();
    } catch (err) {
      setError(true);
      return false;
    }
  };
  useEffect(() => {
    if (profile.near) setNearAddress(profile.near);
  }, [profile.near]);
  return (
    <ChakraProvider>
      <StyledButton onClick={onOpen}>Input your wallet</StyledButton>
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
        <Container>
          <StyledCloseIcon onClick={onClose} offset={20} size="40px" />
          <MainWrapper>
            <Stack>
              <Title>Register Near Address</Title>
              <p>In put your Near mainnet address.</p>
            </Stack>
            <Stack>
              <StyledInput
                onChange={(e) => setNearAddress(e.target.value)}
                value={nearAddress}
              />
              <Error show={error}>Input valid address.</Error>
            </Stack>
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
              onClick={async () => {
                const result = await onHandle();
                // if (result) {
                //   toast.success(`Transaction Success!`, {
                //     position: "top-right",
                //     autoClose: 5000,
                //     hideProgressBar: true,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //   });
                //   onClose();
                // } else
                //   toast.error(`Transaction Failed. Try it again`, {
                //     position: "top-right",
                //     autoClose: 5000,
                //     hideProgressBar: true,
                //     closeOnClick: true,
                //     pauseOnHover: true,
                //     draggable: true,
                //     progress: undefined,
                //   });
              }}
            >
              Register
            </Button>
          </MainWrapper>
        </Container>
      </Modal>
    </ChakraProvider>
  );
};

const Container = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 30px !important;
  padding: 50px;
  color: white !important;
  overflow: hidden;
  max-width: 800px !important;
  @media (max-width: 480px) {
    width: 90vw !important;
    padding: 10px;
    max-height: 100vh;
    overflow: auto;
    border-radius: 10px !important;
  }
`;
const MainWrapper = styled.div`
  display: flex;
  flex-direction: column;
  row-gap: 20px;
  p {
    font-size: 20px;
    font-family: Mulish;
  }
  @media (max-width: 480px) {
    p {
      font-size: 14px;
    }
  }
`;
const StyledInput = styled.input`
  padding: 15px;
  font-size: 20px;
  font-weight: 600;
  background: #272734;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09);
  backdrop-filter: blur(40px);
  /* Note: backdrop-filter has minimal browser support */
  font-family: Mulish;
  border-radius: 20px;
  height: 70px;
`;
const Title = styled.div`
  font-size: 30px;
  font-weight: 600;
  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const StyledButton = styled.div`
  background: white;
  border-radius: 8px;
  height: 26px;
  color: black;
  font-family: Mulish;
  padding-inline: 5px;
  margin-inline: 20px;
  font-weight: bold;
  cursor: pointer;
`;

const Error = styled.p<{ show: boolean }>`
  color: red;
  font-family: Mulish;
  font-size: 14px;
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
`;

export default AirdropModal;
