import { EditIcon } from "@chakra-ui/icons";
import {
  ChakraProvider,
  IconButton,
  Modal,
  ModalContent,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { Button } from "components/Button";
import { useEffect, useState } from "react";
import styled from "styled-components";
import { checkRegularExp } from "util/index";

const PlaceBidModal = ({ onHandleSave, profileInfo }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [profile, setProfile] = useState(profileInfo);
  const [nameExpError, setNameExpError] = useState(false);
  useEffect(() => {
    setProfile(profileInfo);
  }, [profileInfo]);
  const onHandleChange = (e) => {
    if (e.target.name == "name" && e.target.value.length > 30) return;
    if (e.target.name == "name") {
      const regRes = checkRegularExp(e.target.value);
      if (!regRes) {
        setNameExpError(true);
      } else {
        setNameExpError(false);
      }
    }
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };
  return (
    <ChakraProvider>
      <IconButton
        aria-label="Edit Profile"
        icon={<EditIcon />}
        onClick={onOpen}
        variant="outline"
        colorScheme="whiteAlpha"
      />
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
        <Container>
          <Stack spacing={10}>
            <Stack>
              <Text fontSize="30px" fontWeight="700" textAlign="center">
                Edit your Profile
              </Text>
            </Stack>
            <GridContainer>
              <Stack>
                <InputLabel>User name</InputLabel>
                <StyledInput
                  name="name"
                  onChange={onHandleChange}
                  value={profile.name}
                />
                <Error show={nameExpError}>
                  You can only input letters, numbers and underscores.{" "}
                </Error>
              </Stack>
              <Stack>
                <InputLabel>Bio</InputLabel>
                <StyledInput
                  name="bio"
                  onChange={onHandleChange}
                  value={profile.bio}
                />
              </Stack>
              <Stack>
                <InputLabel>Email Address</InputLabel>
                <StyledInput
                  name="mail"
                  onChange={onHandleChange}
                  value={profile.mail}
                />
              </Stack>
              <Stack>
                <InputLabel>Discord Username</InputLabel>
                <StyledInput
                  name="discord"
                  onChange={onHandleChange}
                  value={profile.discord}
                />
              </Stack>
            </GridContainer>
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
              onClick={() => {
                onHandleSave(profile).then((value) => {
                  if (value) onClose();
                });
              }}
            >
              Save
            </Button>
          </Stack>
        </Container>
      </Modal>
    </ChakraProvider>
  );
};

const Container = styled(ModalContent)`
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
const InputLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  padding: 0 20px;
`;
const StyledInput = styled.input`
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px;
  font-size: 20px;
  background: #272734;
  border-radius: 20px !important;
  display: flex;
  align-items: center;
  font-family: Mulish;
`;
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  @media (max-width: 650px) {
    display: flex;
    flex-direction: column;
  }
`;

const Error = styled.div<{ show: boolean }>`
  color: red;
  font-size: 16px;
  font-family: Mulish;
  display: ${({ show }) => (show ? "block" : "none")};
`;

export default PlaceBidModal;
