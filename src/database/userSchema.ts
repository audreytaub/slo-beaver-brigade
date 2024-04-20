/*
Things to include in the schema

    user role : user or admin : String

    events user went to : id attached to the event : List

    volunteer events users went to : id's of the volunteer event : List

    age : Integer

    gender: String

    Acceptance Criteria
    Exactly as above
*/

import mongoose, { Schema } from "mongoose";

enum Role {
    "user",
    "supervisor",
    "admin",
}

export type EventInfo = {
    eventId: Schema.Types.ObjectId;
    digitalWaiver: Schema.Types.ObjectId | null;
    isRegistered: boolean;
};

export type IUser = {
    _id: string;
    email: string;
    phoneNumber: string;
    firstName: string;
    lastName: string;
    age: number;
    gender: string;
    role: "user" | "supervisor" | "admin";
    eventsAttended: EventInfo[];
    groupId: Schema.Types.ObjectId | null;
    recieveNewsletter: boolean;
};

//groupId and digitalWaiver seem to require a schema
//currently there is no schema for them so I am leaving them as null for now
//can groupId just be a string and digitalWaiver be a boolean?
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    role: {
        type: String,
        enum: Role,
        default: "user",
        required: true,
    },
    eventsRegistered: {
        type: [
            {
                eventId: { type: Schema.Types.ObjectId, required: true },
                digitalWaiver: { type: Schema.Types.ObjectId, required: false },
                isRegistered: {
                    type: Boolean,
                    required: false,
                    default: false,
                },
            },
        ],
        default: [],
        required: false,
    },
    eventsAttended: {
        type: [
            {
                eventId: { type: Schema.Types.ObjectId, required: true },
            },
        ],
        default: [],
        required: false,
    },
    groupId: { type: Schema.Types.ObjectId, required: false },
    recieveNewsletter: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const User =
    mongoose.models["userTest"] || mongoose.model("userTest", UserSchema);

export default User;
