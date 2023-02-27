import {
  ChakraProvider,
  Modal,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import styled from 'styled-components'

const ARModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <ChakraProvider>
      <img
        onClick={(e) => {
          e.preventDefault()
          onOpen()
        }}
        src="/images/AR.png"
        alt="img"
      />
      <Modal
        blockScrollOnMount={false}
        isOpen={isOpen}
        onClose={onClose}
        isCentered
      >
        <ModalOverlay backdropFilter="blur(14px)" bg="rgba(0, 0, 0, 0.34)" />
        <Container>
          <iframe
            id="vossleIframe"
            allow="camera;gyroscope;accelerometer;magnetometer;xr-spatial-tracking;microphone;"
            src="https://webar.vossle.com/markerless/?id=test12312312"
            height="700px"
            width="360px"
          ></iframe>
        </Container>
      </Modal>
    </ChakraProvider>
  )
}

const Container = styled(ModalContent)`
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  color: white !important;
  overflow: hidden;
  position: relative;
  max-width: 360px !important;
`

export default ARModal
