import express from 'express';
import { blockUser, deleteUser, followUser, getBlockedUsers, getUser, searchUser, unblockUser, unfollowUser, updateUser, uploadCoverPicture, uploadProfilePicture } from '../controllers/userController.js';
import upload from '../middleware/upload.js';


const router = express.Router();

// GET USER
router.get('/get', getUser)

// UPDATE USER
router.put("/update", updateUser)

// FOLLOW USER
router.post('/follow/:userId', followUser);

// UNFOLLOW USER
router.post('/unfollow/:userId', unfollowUser)

// BLOCK USER
router.post('/block/:userId', blockUser)

// UNBLOCK USER
router.post('/unblock/:userId', unblockUser)

// GET BLOCKED USERS
router.get('/blocked-users', getBlockedUsers)

// DELETE USER
router.delete('/delete', deleteUser) // :( a lot of study to be done here

// SEARCH USER
router.get('/search/:query', searchUser)

// UPLOAD PROFILE PICTURE
router.put('/upp', upload.single("profilePicture"), uploadProfilePicture );

// UPDATE COVER PICTURE
router.put('/ucp', upload.single("coverPicture"), uploadCoverPicture);

export default router;