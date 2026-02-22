import AsyncHandler from '../utils/AsyncHandler';
import ApiError from '../utils/ApiError';
import ApiResponse from '../utils/ApiResponse';
import { uploadOnCloudinary ,deleteOnCloudinary} from '../utils/cloudinary';



const UploadImageToCloudinary = AsyncHandler(async (req, res) => {
    
});

const DeleteImageToCloudinary = AsyncHandler(async (req, res) => {
    
});

export {
    UploadImageToCloudinary,
    DeleteImageToCloudinary
}