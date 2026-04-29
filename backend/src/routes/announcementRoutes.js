const router = express.Router();
import express from "express";
import { createAnnouncement, getAnnouncement, updateAnnouncement, deleteAnnouncement,getAnnouncementById} from "../controllers/announcementController.js";
import { authenticateToken } from "../middleware/auth.js";
import { uploadSingle, handleUploadError } from "../middleware/upload.js";
import { uploadAny } from "../middleware/upload.js";

// import { uploadAnnouncementImage, uploadAnnouncementDocument } from "../controllers/announcementController.js";
router.post('/createAnnouncement', authenticateToken, createAnnouncement);
router.post('/', authenticateToken, createAnnouncement);
router.get('/', authenticateToken, getAnnouncement);
router.get('/getAnnouncement', authenticateToken, getAnnouncement);
router.get('/:id', authenticateToken, getAnnouncementById);
router.put('/updateAnnouncement/:id', authenticateToken, updateAnnouncement);
router.put('/:id', authenticateToken, updateAnnouncement);
router.delete('/deleteAnnouncement/:id', authenticateToken, deleteAnnouncement);
router.delete('/:id', authenticateToken, deleteAnnouncement);
router.get('/getannouncement/:id',authenticateToken,getAnnouncementById)

// router.post('/announcement/:id/image', authenticateToken, uploadSingle, handleUploadError, uploadAnnouncementImage);
// router.post('/announcement/:id/document', authenticateToken, uploadAny, handleUploadError, uploadAnnouncementDocument);
export default router;
