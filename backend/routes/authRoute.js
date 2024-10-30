import express from "express";
import {loginUser, logoutUser, refetchUser, registerUser} from "../controllers/authController.js";
import { protect } from "../middleware/protect.js";

const router = express.Router();

// REGISTER USER
router.post('/register', registerUser)

// LOGIN USER
router.post('/login', loginUser)

// LOGOUT USER
router.post('/logout', logoutUser)

// FETCH CURRENT USER
router.get('/refetch',protect, refetchUser)

export default router;