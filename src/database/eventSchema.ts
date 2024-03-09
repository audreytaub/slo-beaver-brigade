import mongoose, { Schema } from "mongoose";

export type IEvent = {
    _id: Schema.Types.ObjectId | string;
    eventName: string;
    location: string;
    description: string;
    wheelchairAccessible: boolean;
    spanishSpeakingAccommodation: boolean;
    startTime: Date;
    endTime: Date;
    volunteerEvent: boolean;
    groupsAllowed: Schema.Types.ObjectId[] | null;
    attendeeIds: Schema.Types.ObjectId[];
};

// Mongoose schema
const eventSchema = new Schema<IEvent>({
    _id: { type: String, required: true },
    eventName: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    wheelchairAccessible: { type: Boolean, required: true },
    spanishSpeakingAccommodation: { type: Boolean, required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    volunteerEvent: { type: Boolean, required: true },
    groupsAllowed: { type: [Schema.Types.ObjectId], required: false },
    attendeeIds: { type: [Schema.Types.ObjectId], required: true, default: [] },
});

const Event =
    mongoose.models["events"] || mongoose.model("events", eventSchema);

export default Event;
