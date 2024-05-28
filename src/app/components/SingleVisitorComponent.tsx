"use client";
import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useDisclosure,
} from "@chakra-ui/react";
import styles from "../styles/admin/editEvent.module.css";
import { IUser } from "@database/userSchema";
import { eventIndividualHours } from ".././lib/hours";
import { Schema } from "mongoose";
import { IEvent } from "database/eventSchema";
import makeUserAdmin from "../actions/makeUserAdmin";
import makeAdminUser from "../actions/makeAdminUser";

interface Event {
  _id: string;
  eventName: string;
  eventImage: string | null;
  eventType: string;
  location: string;
  description: string;
  checklist: string;
  wheelchairAccessible: boolean;
  spanishSpeakingAccommodation: boolean;
  startTime: Date;
  endTime: Date;
  volunteerEvent: boolean;
  groupsAllowed: Schema.Types.ObjectId[] | null;
  attendeeIds: Schema.Types.ObjectId[];
  registeredIds: Schema.Types.ObjectId[];
}

function SingleVisitorComponent({ visitorData }: { visitorData: IUser }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [events, setEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(visitorData.role);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const eventIds = visitorData.eventsAttended.map((e) => e.eventId);
        const fetchedEvents = await Promise.all(
          eventIds.map((id, idx) =>
            fetch(`/api/events/${id}`)
              .then((res) => res.json())
              .then((data) => {
                return {
                  ...data,
                  attendeeIds: data.attendeeIds || [],
                  startTime: visitorData.eventsAttended[idx].startTime,
                  endTime: visitorData.eventsAttended[idx].endTime,
                };
              })
          )
        );
        setEvents(fetchedEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
      }
      setLoading(false);
    };

    if (
      visitorData &&
      visitorData.eventsAttended &&
      visitorData.eventsAttended.length > 0
    ) {
      fetchEvents();
    }
  }, [visitorData]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const handleRoleChange = async () => {
    console.log("role change");
    try {
      const result =
        userRole === "admin"
          ? await makeAdminUser(visitorData.email)
          : await makeUserAdmin(visitorData.email);
      setUserRole(result.role);
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  return (
    <>
      <div className={styles.link}>
        <Text onClick={onOpen}>Details & Role</Text>
      </div>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent
          style={{ width: "60vw", height: "65vh", overflow: "auto" }}
          maxW="100rem"
        >
          <ModalHeader
            style={{
              padding: "1% 5%",
              textAlign: "left",
              fontSize: "35px",
              fontWeight: "bold",
              fontFamily: "Lato",
              width: "100%",
            }}
          >
            <Flex direction="column" align="center" p={4}>
              <Text>
                {visitorData.firstName} {visitorData.lastName}
              </Text>
              {userRole === "user" ? (
                <Button
                  mt={2}
                  color="#d93636"
                  bg="white"
                  border="2px"
                  _hover={{ bg: "#d93636", color: "white" }}
                  onClick={handleRoleChange}
                >
                  Make Admin
                </Button>
              ) : (
                <Button
                  mt={2}
                  bg="#E0AF48"
                  color="black"
                  _hover={{ bg: "#C19137", color: "black" }}
                  onClick={handleRoleChange}
                >
                  Revert to User
                </Button>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <hr />
          <ModalBody
            style={{ display: "flex", padding: "0%" }}
            className={styles.parentContainer}
          >
            <Box className={styles.infoBox}>
              <Text className={styles.visitorInfoSmallHeader}>
                Personal Info
              </Text>
              <Text className={styles.fieldInfo}>
                Email: {visitorData.email ? visitorData.email : "N/A"}
              </Text>
              <Text className={styles.fieldInfo}>
                Phone:{" "}
                {visitorData.phoneNumber ? visitorData.phoneNumber : "N/A"}
              </Text>
              <Text className={styles.fieldInfo}>
                Zipcode: {" "}
                {visitorData.zipcode ? visitorData.zipcode : "N/A"}
              </Text>
            </Box>
            <Box className={styles.infoBox}>
              <Text className={styles.visitorInfoSmallHeader}>
                Events Attendeded
              </Text>
                {events.length > 0 ? (
                <div className={styles.tableContainer}>
                  <Table variant="striped">
                    <Thead>
                      <Tr>
                        <Th>Event Name</Th>
                        <Th>Duration</Th>
                        <Th>Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {events.map((event) => {
                        return (
                          <Tr key={event._id}>
                            <Td>{event.eventName}</Td>
                            <Td>{eventIndividualHours(event)}</Td>
                            <Td>{formatDate(event.startTime)}</Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </div>
              ) : (
                <Text className={styles.fieldInfo}>
                  No events attended
                </Text>
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}

export default SingleVisitorComponent;
