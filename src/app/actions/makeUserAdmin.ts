"use server"
import User from "@database/userSchema";
import connectDB from "database/db";
import Log from "@database/logSchema";

const makeUserAdmin = async (email: string) => {
  await connectDB();
  try {
    const user = await User.findOneAndUpdate(
      { email: email },
      { role: "admin" },
      { new: true }
    );

    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // add an audit log entry
    await Log.create({
      user: `${user.firstName} ${user.lastName}`,
      action: `changed ${user.firstName} ${user.lastName} to admin`,
      date: new Date(),
    });

    return user.toObject();
  } catch (error) {
    if (error instanceof Error) {
        throw new Error(`Error updating user role: ${error.message}`);
      } else {
        throw new Error('Unknown error occurred while updating user role');
      }
  }
};

export default makeUserAdmin;
