import { v2 as cloudinary, UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import fs from 'fs';



interface CloudinaryUploadResponse {
    url: string;
}

interface CloudinaryUploadResponse {
    url: string;
}

const uploadOnCloudinary = async (filePath: string): Promise<CloudinaryUploadResponse> => {
    if (!filePath) {
        throw new Error("File path is missing");
    }

    try {
        const result = await new Promise<UploadApiResponse>((resolve, reject) => {
            cloudinary.uploader.upload(filePath, { resource_type: 'image' }, (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result || !result.url) {
                    console.error("Cloudinary upload error:", error);
                    reject(new Error("Upload to Cloudinary failed"));
                } else {
                    console.log("File uploaded successfully to Cloudinary. URL:", result.url);
                    resolve(result);
                }
            });
        });

        // Delete the file after successful upload
        fs.unlinkSync(filePath);

        return { url: result.url };
    } catch (error) {
        // Delete the file in case of upload failure
        fs.unlinkSync(filePath);
        throw new Error("Upload to Cloudinary failed");
    }
};


const deleteOnCloudinary = async (publicId: any) => {
    try {
        if (!publicId) {
            return;
        }
        const res = await cloudinary.uploader.destroy(publicId);
        return res
    } catch (error) {
        return null
    }
}

export { uploadOnCloudinary, deleteOnCloudinary }