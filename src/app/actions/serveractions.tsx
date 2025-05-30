'use server';

import connectDB from '@database/db';
import Event from '@database/eventSchema';
import User from '@database/userSchema';
import SignedWaiver from 'database/signedWaiverSchema';
import mongoose from 'mongoose';
import { revalidateTag, revalidatePath } from 'next/cache';

export async function removeAttendee(userid: string, eventid: string) {
  try {
    await connectDB(); // connect to db

    // Validate inputs
    if (!userid || !eventid) {
      return false;
    }

    await Event.findOne({ _id: eventid }).orFail();

    await Event.updateOne(
      { _id: eventid },
      { $pull: { attendeeIds: userid } }
    ).orFail();
    await User.updateOne(
      { _id: userid },
      { $pull: { eventsAttended: {eventId: new mongoose.Types.ObjectId(eventid)} } }
    ).orFail();

    revalidateTag('events');

    return true;
  } catch (err) {
    return false;
  }
}

export async function removeRegistered(userid: string, eventid: string) {
  try {
    await connectDB(); // connect to db

    // Validate inputs
    if (!userid || !eventid) {
      return false;
    }

    await Event.findOne({ _id: eventid }).orFail();

    // Remove user from event
    await Event.updateOne(
      { _id: eventid },
      { $pull: { registeredIds: userid } }
    ).orFail();
    // Remove event from user
    await User.updateOne(
      { _id: userid },
      { $pull: { eventsRegistered: {eventId: new mongoose.Types.ObjectId(eventid)} } }
    ).orFail();
    //Remove waiver from user
    await SignedWaiver.deleteOne({ signeeId: userid, eventId: eventid }).orFail();

    revalidateTag('events');

    return true;
  } catch (err) {
    return false;
  }
}

export async function handleEventDeletion(eventid: string) {
  try {
    await connectDB(); // connect to db

    // Validate input
    if (!eventid) {
      return false;
    }

    await Event.findOne({ _id: eventid }).orFail();

    // Remove event from all users' eventsRegistered and eventsAttended arrays
    await User.updateMany(
      {},
      { $pull: { eventsRegistered: eventid, eventsAttended: eventid } }
    );

    // Remove the event itself
    await Event.deleteOne({ _id: eventid }).orFail();

    //update all waivers for the event
    await SignedWaiver.updateMany(
      { eventId: eventid },
      { $set: { eventId: null } }
    );

    revalidateTag('events');

    return true;
  } catch (err) {
    return false;
  }
}

export async function revalidatePathServer(path: string) {
  let BASE_URL = process.env.BASE_URL;
  if (process.env.DEV_MODE) {
    BASE_URL = process.env.DEV_BASE_URL;
  }
  revalidatePath(BASE_URL + path);
}
