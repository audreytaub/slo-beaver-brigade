'use client';
import React, { useEffect, useState } from 'react';
import style from '@styles/admin/events.module.css';
import EventPreviewComponent from '@components/EventCard';
import ExpandedTest from '@components/StandaloneExpandedViewComponent';
import { MagnifyingGlassIcon } from '@heroicons/react/16/solid';
import Link from 'next/link';
import { IEvent } from '@database/eventSchema';
import {
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  Input,
  useToast,
} from '@chakra-ui/react';
import Select from 'react-select';
import { useEventsAscending, useEventTypes } from 'app/lib/swrfunctions';
import '../../fonts/fonts.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { mutate } from 'swr';

const EventPreview = () => {
  //states
  const { events, isLoading } = useEventsAscending();
  const uniqueEventTypes = Array.from(
    new Set(events?.map((e) => e.eventType?.trim()).filter(Boolean))
  );
  const [groupNames, setGroupNames] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<{ value: string; label: string }>({
    value: 'earliest',
    label: 'From Earliest',
  });
  const [spanishSpeakingEvent, setspanishSpeakingEvent] = useState(true);
  const [englishSpeakingEvent, setenglishSpeakingEvent] = useState(true);
  const [wheelchairAccessible, setWheelchairAccessible] = useState(false);
  const [groupOnly, setGroupOnly] = useState(false);
  const [showPastEvents, setShowPastEvents] = useState(false);
  const [showFutureEvents, setShowFutureEvents] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);
  const [minHeadcount, setMinHeadcount] = useState<number | null>(null);
  const [maxHeadcount, setMaxHeadcount] = useState<number | null>(null);
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const toast = useToast();
  const { eventTypes: fetchedEventTypes, isLoading: eventTypesLoading } =
    useEventTypes();

// Get eventId from URL params
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  // Open modal if eventId is in the URL and events are loaded
  useEffect(() => {
    if (id && events && events.length > 0) {
      const eventToOpen = events.find((event) => event._id === id);
      if (eventToOpen) {
        setSelectedEvent(eventToOpen);
        setIsModalOpen(true);
      } else {
        toast({
          title: 'Event not found',
          description: 'The event you are looking for does not exist.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        router.push('/admin/events');
      }
    }
  }, [id, events]);

  useEffect(() => {
    if (fetchedEventTypes) {
      setEventTypes(fetchedEventTypes);
    }
  }, [fetchedEventTypes]);

  // get string for some group based on id
  const fetchGroupName = async (groupId: string): Promise<string> => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        return data.group_name;
      } else {
        console.error('Error fetching group name:', res.statusText);
        return 'SLO Beaver Brigade';
      }
    } catch (error) {
      console.error('Error fetching group name:', error);
      return 'SLO Beaver Brigade';
    }
  };

  // grab all events from route
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        if (!events) {
          return;
        }
        const names: { [key: string]: string } = {};
        setLoading(true);
        await Promise.all(
          events.map(async (event: IEvent) => {
            if (event.groupsAllowed && event.groupsAllowed.length > 0) {
              const groupName = await fetchGroupName(event.groupsAllowed[0]);
              names[event._id] = groupName;
            } else {
              names[event._id] = 'SLO Beaver Brigade';
            }
          })
        );
        setGroupNames(names);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };

    mutate(events);
    fetchEvents();
  }, []);

  // open standAloneComponent on click
  const handleEventClick = (event: IEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  // filtering events logic
  const filteredEvents =
    events
      ?.filter(
        (event) =>
          (spanishSpeakingEvent && event.spanishSpeakingAccommodation) ||
          (englishSpeakingEvent && !event.spanishSpeakingAccommodation)
      )
      .filter((event) =>
        wheelchairAccessible ? event.wheelchairAccessible : true
      )
      .filter((event) => (groupOnly ? event.groupsOnly : true))
      .filter((event) => {
        const headcount = event.registeredIds?.length || 0;
        if (minHeadcount !== null && headcount < minHeadcount) return false;
        if (maxHeadcount !== null && headcount > maxHeadcount) return false;
        return true;
      })
      .filter((event) => {
        if (selectedEventTypes.length === 0) return true;
        return selectedEventTypes.includes(event.eventType?.trim() || '');
      })
      .filter((event) => {
        const eventDate = new Date(event.startTime);
        const now = new Date();
        if (showFutureEvents && showPastEvents) {
          return true;
        } else if (showFutureEvents) {
          return eventDate >= now;
        } else if (showPastEvents) {
          return eventDate <= now;
        }
        return true;
      })
      .filter((event) =>
        event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) =>
        sortOrder.value === 'earliest' // Check This!
          ? new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          : new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      ) || [];
  const sortOptions = [
    { value: 'earliest', label: 'From Earliest' },
    { value: 'latest', label: 'From Latest' },
  ];

  return (
    <div className={style.mainContainer}>
      <aside className={style.sidebar}>
        <div className={style.createAndSearchContainer}>
          <Link href={'/admin/events/create'}>
            <button className={style.yellowButton}>Create Event</button>
          </Link>
          <div className={style.searchWrapper}>
            <Input
              type="text"
              placeholder="Search Events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={style.searchBar}
              focusBorderColor="#337774"
              borderColor="#337774"
              borderWidth="1.5px"
              _hover={{ borderColor: '#337774' }}
            />
            <MagnifyingGlassIcon
              style={{
                width: '20px',
                height: '20px',
                position: 'absolute',
                margin: 'auto',
                bottom: '10px',
                right: '10px',
                color: '#337774',
              }}
            />
          </div>
          <div className={style.searchWrapper}>
            <Select
              id="sort-select"
              value={sortOrder}
              options={sortOptions}
              onChange={(selectedOption) =>
                setSortOrder(
                  selectedOption || {
                    value: 'earliest',
                    label: 'From Earliest',
                  }
                )
              }
              className={style.sortSelect}
              isClearable={false}
              isSearchable={false}
              styles={{
                control: (provided) => ({
                  ...provided,
                  borderRadius: '12px',
                  height: '40px',
                  width: '200px',
                }),
                singleValue: (provided) => ({
                  ...provided,
                  color: 'black',
                }),
                option: (provided, state) => ({
                  ...provided,
                  color: state.isSelected ? 'white' : 'black',
                }),
                placeholder: (provided) => ({
                  ...provided,
                  color: 'black',
                }),
                menu: (provided) => ({
                  ...provided,
                  width: '150px',
                }),
              }}
            ></Select>
          </div>
        </div>

        <div className={style.filtersContainer}>
          <div className={style.simplefiltersContainer}>
            <div>
              <div className={style.filterHeader}>Event Timeframe</div>
              <CheckboxGroup colorScheme="green" defaultValue={['true']}>
                <Stack
                  spacing={[1, 5]}
                  direction={['column', 'column']}
                  ml="1.5"
                >
                  {/** isChecked property does not work inside of CheckBoxGroup. Instead, set defaultValue == value */}
                  <Checkbox
                    value="true"
                    colorScheme="blue"
                    onChange={() => setShowFutureEvents(!showFutureEvents)}
                  >
                    <div className={style.checkboxLabel}>Future Events</div>
                  </Checkbox>
                  <Checkbox
                    value="false"
                    colorScheme="blue"
                    onChange={() => setShowPastEvents(!showPastEvents)}
                  >
                    <div className={style.checkboxLabel}>Past Events</div>
                  </Checkbox>
                </Stack>
              </CheckboxGroup>
            </div>
            <div>
              <div className={style.filterHeader}>Event Language</div>
              <CheckboxGroup colorScheme="green">
                <Stack
                  spacing={[1, 5]}
                  direction={['column', 'column']}
                  ml="1.5"
                >
                  <Checkbox
                    isChecked={spanishSpeakingEvent}
                    colorScheme="blue"
                    onChange={() =>
                      setspanishSpeakingEvent(!spanishSpeakingEvent)
                    }
                  >
                    <div className={style.checkboxLabel}>Spanish</div>
                  </Checkbox>
                  <Checkbox
                    isChecked={englishSpeakingEvent}
                    colorScheme="blue"
                    onChange={() =>
                      setenglishSpeakingEvent(!englishSpeakingEvent)
                    }
                  >
                    <div className={style.checkboxLabel}>English</div>
                  </Checkbox>
                </Stack>
              </CheckboxGroup>
            </div>
            <div>
              <div className={style.filterHeader}>Other Filters</div>
              <CheckboxGroup colorScheme="green" defaultValue={[]}>
                <Stack
                  spacing={[1, 5]}
                  direction={['column', 'column']}
                  ml="1.5"
                >
                  <Checkbox
                    value="wheelchair accessible"
                    colorScheme="blue"
                    onChange={() =>
                      setWheelchairAccessible(!wheelchairAccessible)
                    }
                  >
                    <div className={style.checkboxLabel}>
                      Wheelchair Accessible
                    </div>
                  </Checkbox>
                  <Checkbox
                    value="group only"
                    colorScheme="blue"
                    onChange={() => setGroupOnly(!groupOnly)}
                  >
                    <div className={style.checkboxLabel}>Group Only</div>
                  </Checkbox>
                </Stack>
              </CheckboxGroup>
            </div>
          </div>
          <div>
            <div className={style.filterHeader}>Event Type</div>
            <CheckboxGroup
              colorScheme="green"
              value={selectedEventTypes}
              onChange={(values) => setSelectedEventTypes(values as string[])}
            >
              <div className={style.eventTypeCheckboxGrid}>
                {eventTypes.map((type) => (
                  <Checkbox key={type} value={type}>
                    <div className={style.checkboxLabel}>{type}</div>
                  </Checkbox>
                ))}
              </div>
            </CheckboxGroup>
          </div>
        </div>

        {/* headcount range filter
          <div className={style.filterContainer}>
            <div className={style.filterHeader}>Headcount Range</div>
            <Stack spacing={2} ml="1">
              <Input
                type="number"
                placeholder="Minimum Headcount"
                value={minHeadcount ?? ""}
                onChange={(e) =>
            setMinHeadcount(
              e.target.value ? parseInt(e.target.value) : null
            )
                }
                focusBorderColor="#337774"
                borderColor="#337774"
                borderWidth="1.5px"
                _hover={{ borderColor: "#337774" }}
              />
              <Input
                type="number"
                placeholder="Maximum Headcount"
                value={maxHeadcount ?? ""}
                onChange={(e) =>
            setMaxHeadcount(
              e.target.value ? parseInt(e.target.value) : null
            )
                }
                focusBorderColor="#337774"
                borderColor="#337774"
                borderWidth="1.5px"
                _hover={{ borderColor: "#337774" }}
              />
            </Stack>
          </div>
        */}
      </aside>
      {loading ? (
        <div className={style.cardContainer}>
          <Text fontFamily="Lato" fontSize="2xl" mt="5%" textAlign="center">
            Loading Events...
          </Text>
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className={style.cardContainer}>
          <ul className={style.eventsList}>
            {filteredEvents.map((event) => (
              <li key={event._id} className={style.eventItem}>
                <EventPreviewComponent
                  event={event}
                  groupName={groupNames[event._id]}
                  onClick={() => handleEventClick(event)}
                />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className={style.cardContainer}>
          <Text fontFamily="Lato" fontSize="2xl" mt="10%" textAlign="center">
            No Events Found
          </Text>
        </div>
      )}
      {selectedEvent && (
        <ExpandedTest
          eventDetails={selectedEvent}
          showModal={isModalOpen}
          setShowModal={setIsModalOpen}
          editUrl={selectedEvent._id}
        />
      )}
    </div>
  );
};

export default EventPreview;
