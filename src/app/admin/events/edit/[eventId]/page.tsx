'use client'
import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import styles from "./page.module.css";
import defaultBeaver from "/docs/images/DefaultBeaver.jpeg";
import "../../../../fonts/fonts.css";
import Image from "next/image";
import EditEventPrimaryInfo from "@components/EditEventPrimaryInfo";
import EditEventVisitorInfo from "@components/EditEventVisitorInfo";
import EditEventHeader from "@components/EditEventHeader";
import { useEffect, useState } from "react";
import { IUser } from "@database/userSchema";
import { IEvent } from "@database/eventSchema";

type IParams = {
  params: {
    eventId: string;
  };
};

export default function EditEventsPage({ params: { eventId } }: IParams) {
  const [eventData, setEventData] = useState<IEvent>({
    _id: "",
    eventName: "",
    location: "",
    description: "",
    wheelchairAccessible: false,
    spanishSpeakingAccommodation: false,
    startTime: new Date(0),
    endTime: new Date(0),
    volunteerEvent: false,
    groupsAllowed: [],
    attendeeIds: [],
  });

  const [visitorData, setVisitorData] = useState<IUser[]>([
    {
      _id: "",
      groupId: null,
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      age: -1,
      gender: "",
      role: "user",
      eventsAttended: [],
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error(`HTTP error, status: ${response.status}`);
        }
        const data = await response.json();
        data.startTime = new Date(data.startTime);
        data.endTime = new Date(data.endTime);
        setEventData(data);
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };
    fetchEventData();
  }, [eventId]);

  useEffect(() => {
    const fetchVisitorData = async () => {
      if (eventData.eventName !== "") {
        const visitorDataArray = await Promise.all(
          eventData.attendeeIds
            .filter((userId) => userId !== null)
            .map(async (userId) => {
              const response = await fetch(`/api/user/${userId}`);
              return response.json();
            })
        );
        setVisitorData(visitorDataArray);
        setLoading(false);
      }
    };
    fetchVisitorData();
  }, [eventData]);

  const emailLink = () => {
    const emails = visitorData.map((v) => v.email).filter((email) => !!email);
    const subject = encodeURIComponent(eventData.eventName + " Update");
    return `mailto:?cc=${emails.join(",")}&subject=${subject}`;
  };
  return (
    <Box className={styles.eventPage}>
      <EditEventHeader eventId={eventId} />
      <Flex
        className={styles.temp}
        direction={{ base: "column", md: "row" }}
        justify="space-between"
      >
        <Box className={styles.leftColumn} w={{ base: "100%", md: "38%" }}>
          <Box className={styles.imageContainer}>
            <Image src={defaultBeaver} alt="eventImage" />
          </Box>
          <a href={emailLink()} className={styles.emailAllVisitors}>
            Email All Visitors
          </a>
          <EditEventVisitorInfo visitorData={visitorData} loading={loading} />
        </Box>
        <Box className={styles.rightColumn} w={{ base: "100%", md: "58%" }}>
          <EditEventPrimaryInfo eventId={eventId} />
        </Box>
      </Flex>
    </Box>
  );
}
