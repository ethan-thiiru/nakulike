'use client'
import { useState } from "react"



export const useCloudinary = () => {
    const [uploading,setUploading] = useState(false)
    const [uploadProgress,setUploadProgress] = useState(0);

    const uploadImage = async(file:File):Promise<string>=>{
        setUploading(true)
        setUploadProgress(0)

        try{
            const formData = new FormData();
            formData.append('file',file)
            formData.append('upload_preset',process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nakulike_app')

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if(!cloudName) throw new Error('Missing cloud name')

                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,{
                    method:'POST',
                    body:formData
                });
                const data = await response.json();
                console.log(data);
                if(!response.ok){
                    console.error('Cloudinary error')
                    throw new Error(data.error?.message || 'upload failed')
                }

                return data.secure_url;
        } catch (error) {
            console.error('error uploading image',error)
            throw error;
        }finally{
            setUploadProgress(0)
            setUploading(false)
        }
    };
    const uploadMultipleImage = async(files:File[]):Promise<string[]> => {
        const uploadPromise = files.map((file) => uploadImage(file));
        return Promise.all(uploadPromise)
    }

    return {
        uploadMultipleImage,
        uploadImage,
        uploading,
        uploadProgress
    }
}