import connectDB from "@database/db";
import User, { IUser } from "@database/userSchema";
import Group from "@database/groupSchema";
import Event from "@database/eventSchema";
import { NextResponse, NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { clerkClient } from '@clerk/nextjs/server';
import Log from "@database/logSchema";



type IParams = {
    params: {
        userId: string;
    };
};
// Dynamic GET request to get user by ID
export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        await connectDB();

        // grab id from param
        const id = params.userId;

        // search for user in db
        const user = await User.findById(id);

        // check if user exists
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function POST(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        await connectDB();

        // grab id from param
        const id = params.userId;

        // search for user in db
        const user = await User.findById(id);

        // check if user exists
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function PATCH(req: NextRequest, { params }: IParams) {
    await connectDB(); // Connect to the database

    const { userId } = params; // Destructure the userId from params

    try {
        const user = await User.findById(userId).orFail();
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const { eventsAttended, role, targetUserId}: { eventsAttended?: string[], role?: string, targetUserId?: string } = await req.json();

        // Handle permission updates (Only allow admins to change permissions)
        const allowedRoles = ["user", "admin", "super-admin"]; // list of allowed roles
        if (role && targetUserId) {
            if (!allowedRoles.includes(role)) {
                return NextResponse.json({ error: `Invalid role: ${role}` }, { status: 400 });
            }
            if (!user.role.includes("admin")) {
                return NextResponse.json({ error: "Must be admin to change permissions." }, { status: 403 });
            }

            // find target user
            const targetUser = await User.findById(targetUserId).orFail();
            if (!targetUser) {
                return NextResponse.json(
                    { error: "Target user not found" },
                    { status: 404 }
                );
            }

            if (targetUser.role === role) {
                return NextResponse.json({ error: "User already has that role." }, { status: 400 });
            }

            // update role
            targetUser.role = role;
            await targetUser.save();
            
            // action for audit log
            let action;
            if (role === "admin") {
                action = `changed ${targetUser.firstName} ${targetUser.lastName}'s role to admin`;
            } else if (role === "super-admin") {
                action = `changed ${targetUser.firstName} ${targetUser.lastName}'s role to super-admin`
            } else if (role === "user") {
                action = `reverted ${targetUser.firstName} ${targetUser.lastName}'s role to user`;
            } else {
                action = `changed ${targetUser.firstName} ${targetUser.lastName}'s role to ${role}`;
            }

            await Log.create({
                user: `${user.firstName} ${user.lastName}`,
                action: action,
                date: new Date(),
                link: targetUser._id,
            });

            return NextResponse.json("User updated: " + targetUserId, { status: 200 });
        }

        if (eventsAttended) {
            user.eventsAttended = eventsAttended;
        }
        await user.save();
        revalidateTag("users");
        return NextResponse.json("User updated: " + userId, { status: 200 });
    } catch (err) {
        console.error("Error updating user (UserId = " + userId + "):", err);
        return NextResponse.json(
            "User not updated (UserId = " + userId + ") " + err,
            { status: 400 }
        );
    }
}

export async function DELETE(req: NextRequest, {params}: IParams) {

    await connectDB(); // Connect to the database

    const { userId } = params; // Destructure the userId from params

    const bodyText = await new Response(req.body).text();
    const email = JSON.parse(bodyText);

    try {

        const clerkUser = await clerkClient.users.getUserList({emailAddress: [email]});
        await clerkClient.users.deleteUser(clerkUser.data[0].id);

        const user = await User.findByIdAndDelete(userId).orFail();


        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // Remove user from groups
        await Group.updateMany({groupees: userId}, 
            {$pull: {groupees: userId}});
        
        // Remove userId from attendeeIds and registeredIds arrays in events
        await Event.updateMany(
            { attendeeIds: userId },
            { $pull: { attendeeIds: userId } }
        );
        await Event.updateMany(
            { registeredIds: userId },
            { $pull: { registeredIds: userId } }
        );

        // Log deletion to admin log
        await Log.create({
            user: `${user.firstName} ${user.lastName}`,
            action: "deleted account",
            date: new Date(),
            link: null
          });

        return NextResponse.json("User deleted: " + userId, { status: 200 });


    } catch (err) {
        console.error("Error deleting user (UserId = " + userId + "):", err);
        return NextResponse.json(
            "User not deleted (UserId = " + userId + ") " + err,
            { status: 400 }
        );
    }
}