"use server"

import connectDB from "@database/db";
import Event from "@database/eventSchema";

export async function removeAttendee(userid : String, eventid : String) {
    try{
        await connectDB(); // connect to db

        const event = Event.findOne({eventid}).orFail();

        // validate inputs
        if (!userid || !eventid) {
            return Response.json("Invalid Comment.", { status: 400 });
        }

        await Event.updateOne({eventid},{$pull: {attendeeIds : userid} }).orFail();
        //await event.save();

        return Response.json("ID Deleted", { status: 200 });
    }
    catch(err){
        Response.json(err, { status: 400});
    }
}
