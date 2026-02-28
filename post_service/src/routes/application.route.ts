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

router.get('/',GetAllApplications)

/*
applicationId param
*/
router.get('/:id' , GetApplicationById)


/*
    postId param
    limitParam optional query
    pageParam optional query
*/
router.get('/all' , GetAllApplicants)

router.post('/new' , NewApplication);

router.post('/delete' , DeleteApplication)

router.post('/update' , UpdateApplication)

router.post('/status', ChangeApplicationStatus)

export default router