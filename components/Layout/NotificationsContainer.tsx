import { BellIcon } from "@chakra-ui/icons";
import { MenuList, Menu, MenuButton, Text, Box, Icon } from "@chakra-ui/react";
import { FC, useEffect, useState } from "react";
import { styled as tStyled } from "../theme";
import styled from "styled-components";
import { getUserNotifications } from "../../hooks/useNotification";
import { useSelector } from "react-redux";
import { StateType } from "../../store/types";
import { markNotificationsAsRead } from "../../hooks/useNotification";

type Notification = {
  _id: string;
  userId: string;
  title: string;
  message: string;
  url: string;
  displayTime: Date;
  isViewed: boolean;
};

export const NotificationsContainer: FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLaoding, setIsLoading] = useState<boolean>(true);
  const userId = useSelector(
    (state: StateType) => state.profileData.profile_status.id
  );

  const invalidate = async () => {
    getNotificationsData(userId);
  };

  const callToAction = (
    e: React.MouseEvent<HTMLButtonElement>,
    notification: Notification
  ) => {
    e.preventDefault();
    e.stopPropagation();
    markAsRead(e, [notification]);
    window.open(notification.url, "_blank");
  };

  const markAsRead = async (
    e: React.MouseEvent<HTMLButtonElement>,
    notifications: Notification[]
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const notificationsId = notifications.map((n) => n._id);
    try {
      await markNotificationsAsRead(notificationsId);
      invalidate();
    } catch (error) {
      console.log(error);
    }
  };

  const getNotificationsData = async (id: string) => {
    try {
      const notificationsInfo: Notification[] = await getUserNotifications(id);
      setNotifications([...notificationsInfo]);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (userId) {
      getNotificationsData(userId);
    }
  }, [userId]);

  const renderEmptySlots = () => {
    const nOfSlots = Number(5 - notifications.length);
    if (nOfSlots < 1) return null;
    const slots = new Array(nOfSlots).fill("");
    return slots.map((slot, idx) => <EmpyNotificationItem key={idx} />);
  };

  const getUnreadNotifications = (notifications: Notification[]) => {
    return notifications.filter((n) => !n.isViewed);
  };

  const renderNotifications = () => {
    return (
      <>
        {notifications?.map((n: Notification, idx) => (
          <StyledNotificationItem
            isUnread={!n.isViewed}
            key={n._id}
            onClick={(e) => callToAction(e, n)}
          >
            <div>
              <Text fontSize="16px" fontWeight="500">
                {n.title}
              </Text>
              <Message>
                <Text fontSize="12px" fontFamily="Mulish">
                  {n.message}
                </Text>
              </Message>
            </div>
            <Menu>
              <MenuButton onClick={(e) => e.stopPropagation()}>
                <MenuBox>
                  {new Array(3).fill("").map((dot, idx) => (
                    <Text key={idx} fontSize={"6px"} fontFamily="Mulish">
                      &#x2022;
                    </Text>
                  ))}
                </MenuBox>
              </MenuButton>
              <ActionsMenuList>
                <StyledNotificationItem>
                  <button onClick={(e) => markAsRead(e, [n])}>
                    <Text fontSize="14px" fontWeight="600" fontFamily="Mulish">
                      Mark as read
                    </Text>
                  </button>
                </StyledNotificationItem>
                <StyledNotificationItem>
                  <button onClick={(e) => callToAction(e, n)}>
                    <Text fontSize="14px" fontWeight="600" fontFamily="Mulish">
                      Go
                    </Text>
                  </button>
                </StyledNotificationItem>
              </ActionsMenuList>
            </Menu>
          </StyledNotificationItem>
        ))}
      </>
    );
  };

  return (
    <Container>
      <Menu>
        <MenuButton>
          <Box style={{ position: "relative" }}>
            <Icon as={BellIcon} w={"6"} h={"6"} />
            {!isLaoding ? (
              <>
                {getUnreadNotifications(notifications).length ? (
                  <NotificationBadge>
                    {getUnreadNotifications(notifications).length}
                  </NotificationBadge>
                ) : (
                  ""
                )}
              </>
            ) : (
              <LoadingBadge>
                {new Array(3).fill("").map((dot, idx) => (
                  <Text key={idx} fontSize={"9px"} fontFamily="Mulish">
                    &#x2022;
                  </Text>
                ))}
              </LoadingBadge>
            )}
          </Box>
        </MenuButton>
        <StyledMenuList>
          <Flex
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Text fontSize="22px" fontWeight="500">
              Notifications
            </Text>
            <button onClick={(e) => markAsRead(e, notifications)}>
              <Text fontSize="14px" fontWeight="600" fontFamily="Mulish">
                Read all
              </Text>
            </button>
          </Flex>
          {notifications.length ? (
            <>
              {renderNotifications()}
              {renderEmptySlots()}
            </>
          ) : (
            <div style={{ width: "100%", display: "grid" }}>
              <Text fontSize="14px" fontWeight="600" fontFamily="Mulish">
                No new notifications.
              </Text>
            </div>
          )}

          {notifications.length > 4 && (
            <div style={{ width: "100%", display: "grid" }}>
              <button>
                <Text fontSize="14px" fontWeight="600" fontFamily="Mulish">
                  Load More
                </Text>
              </button>
            </div>
          )}
        </StyledMenuList>
      </Menu>
    </Container>
  );
};

const Flex = tStyled("div", {
  display: "flex",
  alignItems: "center",
});

const Container = tStyled("div", {
  zIndex: "2",
});

const Message = styled(Text)`
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2; /* number of lines to show */
  line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MenuBox = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid white;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0.5rem;
  margin-left: 1rem;
`;

const NotificationBadge = tStyled(Box, {
  width: "1.2rem",
  height: "1.2rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxSizing: "border-box",
  position: "absolute",
  borderRadius: "9999px",
  fontSize: "10px;",
  right: "-12px",
  top: "-5px",
  fontWeight: "600",
  backgroundColor: "#E53E3E",
});

const LoadingBadge = tStyled(NotificationBadge, {
  backgroundColor: "transparent",
});

const StyledMenuList = tStyled(MenuList, {
  boxShadow:
    "0px 7px 14px rgba(0, 0, 0, 0.1), inset 0px 14px 24px rgba(17, 20, 29, 0.4) !important",
  background: "rgb(56,56,69) !important",
  border: "1px solid rgba(255,255,255,0.2) !important",
  borderRadius: "24px !important",
  padding: "20px !important",
  width: "400px !important",
  backdropFilter: "blur(80px) !important",
});

const ActionsMenuList = tStyled(StyledMenuList, {
  padding: "10px !important",
  width: "auto !important",
});

const StyledNotificationItem = styled.div<{ isUnread: boolean }>`
  background: linear-gradient(0deg, rgba(5, 6, 22, 0.2), rgba(5, 6, 22, 0.2))
      padding-box,
    linear-gradient(
        90.65deg,
        rgba(255, 255, 255, 0.2) 0.82%,
        rgba(0, 0, 0, 0) 98.47%
      )
      border-box;
  border: 1px solid;
  outline: ${({ isUnread }) => (isUnread ? "2px solid white" : "none")};
  border-image: linear-gradient(
    90.65deg,
    #ffffff 0.82%,
    rgba(0, 0, 0, 0) 98.47%
  );
  box-shadow: 0px 4px 40px rgba(42, 47, 50, 0.09),
    inset 0px 7px 24px rgba(103, 103, 120, 0.2);
  padding: 10px 15px;
  margin: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 20px;
  cursor: pointer;
`;

const EmpyNotificationItem = styled(StyledNotificationItem)`
  height: 2.5rem;
`;
