import express from "express";
import {
  borrowedBooks,
  recordBorrowedBook,
  getBorrowedBooksForAdmin,
  returnBorrowBook,
} from "../controllers/borrowController.js";
import { isAuthenticated, isAuthorized } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/my-borrowed-books", isAuthenticated, borrowedBooks);

router.post(
  "/record-borrow-book/:id",
  isAuthenticated,
  recordBorrowedBook,
);

router.get(
  "/borrowed-books-by-user",
  isAuthenticated,
  isAuthorized("admin"),
  getBorrowedBooksForAdmin,
);

router.put(
  "/return-borrowed-book/:bookId",
  isAuthenticated,
  returnBorrowBook,
);

export default router;