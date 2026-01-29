import cron from "node-cron";
import { Borrow } from "../models/borrowModel.js";
import { User } from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";
export const notifyUsers = () => {
  cron.schedule("*/30 * * * *", async () => {
    try {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const borrowers = await Borrow.find({
        dueDate: {
          $lt: oneDayAgo,
        },
        returnDate: null,
        notified: false,
      });

      for (const element of borrowers) {
        if (element.user && element.user.email) {
          await User.findById(element.user.id);
          sendEmail({
            email: element.user.email,
            subject: "Book return Reminder",
            message: `Dear ${element.user.name},\n\n this is a reminder that your borrowed book is due for return. Please return it as soon as possible.\n\n Thank You! \n\n Regards, \n Book Worm Team`,
          });
          element.notified = true;
          await element.save();
        }
      }
    } catch (error) {
      console.error("Some Error happened while notifying users.", error);
    }
  });
};
