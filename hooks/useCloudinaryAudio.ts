'use-client'
import { useState } from "react"



export const useCloudinaryAudio = () => {
    const [uploading,setUploading] = useState(false)
    const [uploadProgress,setUploadProgress] = useState(0);

    const uploadAudio = async(audioBlob:Blob):Promise<string>=>{
        setUploading(true)
        setUploadProgress(0)

        try{
            const formData = new FormData();

            //converts blob to file with proper extension
            const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`)
            
            formData.append('file',audioFile)
            formData.append('upload_preset',process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'nakulike_app')
            formData.append('resource_type','video')// cloudinary uses 'video for audio files

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            if(!cloudName) throw new Error('Missing cloud name')

                const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,{
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

    return {
        uploadAudio,
        uploading,
        uploadProgress
    }
}