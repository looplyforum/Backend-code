import express from "express";
import {
    ChangeApplicationStatus,
    DeleteApplication,
    NewApplication,
    UpdateApplication,
    GetAllApplications,
    GetApplicationById,
    GetAllApplicants
} from "../controllers/applicant.controller";

const router = express.Router();

router.get('/health' , (_, res) => {
    res.status(200).json({ message: "Application service is running" });
})

router.get('/', GetAllApplications)

router.get('/all/:id', GetAllApplicants);  
router.get('/:id', GetApplicationById);

router.post('/new/:id', NewApplication);  

router.post('/delete/:id', DeleteApplication);  

router.post('/update/:id', UpdateApplication);

router.post('/status/:id', ChangeApplicationStatus);

export default router