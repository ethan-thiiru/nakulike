import { useCloudinary } from '@/hooks/useImageCloudinary'
import { fileUtils, MAX_PHOTOS } from '@/lib/common-utils'
import { UserProfile } from '@/lib/types'
import { Camera, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { Button } from '../ui/button'


interface PhotosStepProps {
    profile:UserProfile
    updateProfile: (updates:Partial<UserProfile>) => void
}
const PhotosStep = ({profile,updateProfile}:PhotosStepProps) => {

  const [dragOver,setDragOver] = useState(false);
  const {uploadImage,uploading} = useCloudinary();

  const handleFileUpload = async(files:FileList | null) => {
    if(!files) return;
    const validFiles = fileUtils.validateFiles(files);
    if(profile.photos.length + validFiles.length > MAX_PHOTOS){
      toast.error(`you can upload maximum ${MAX_PHOTOS} photos`)
    }
    try{
      for (const file of validFiles){
        const url = await uploadImage(file)
        updateProfile({photos :[...profile.photos, url]})
      }
      toast.success(`Successfully uploaded ${validFiles.length} photo(s)`)
    } catch (error) {
      toast.error('Failed to upload photos. Please try again')
    }
  }

  const removePhoto = (index:number) => {
    const newPhotos = profile.photos.filter((_,i) => i !== index)
    updateProfile({photos:newPhotos})
  }

  const handleDrop = (e:React.DragEvent) => {
    e.preventDefault();
    setDragOver(false)
    handleFileUpload(e.dataTransfer.files);
  }

  const handleDragOver = (e:React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }

  const handleDragleave = (e:React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <Camera className='h-12 w-12 text-pink-500 mx-auto mb-4'/>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>
          Add your best photos
        </h3>
        <p className='text-gray-600'>
          Upload 2-6 photos to show your personality
        </p>
      </div>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
        {profile.photos.map((photo,index) => (
          <div key={index} className='relative group'>
            <img 
            src={photo}
            alt={`photo ${index + 1}`}
            className='h-48 object-cover rounded-lg shadow-md'
            />
            <Button
            variant='destructive'
            size='sm'
            className='absolute top-2 left-1 h-8 w-8 p-0 opacity-0 group-hover:opacity-100. transition-opacity'
            onClick={() => removePhoto(index)}
            >

              <X className='h-4 w-4'/>
            </Button>
            {index === 0 && (
              <div className='absolute bottom-2 left-2 bg-pink-500 text-white tet-xs px-2 py-1 rounded'>
                Main Photo
              </div>
            )}
          </div>
        ))}

        {profile.photos.length < 6 && (
          <div className={`border-2 border-dashed rounded-lg h-48 flex flex-col justify-center cursor-pointer transition-all ${dragOver ? 'border-pink-500 bg-pink-50' : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50'}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragleave}
          onClick={() => document.getElementById('photo-upload')?.click()}
          >
            {uploading? (
              <div className='text-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2'>

                </div>
                <span className='text-sm text-gray-500'>Uploading...</span>
              </div>
            ): (
              <>
              <Plus className='h-8 w-8 mx-auto text-gray-400 mb-2'/>
              <span className='text-xs text-gray-500 text-center'>
                Drag photos here or click to upload
              </span>
              </>
            )}
          </div>
        )}

      </div>
      <input 
      type='file'
      id='photo-upload'
      accept='image/*' 
      multiple
      className='hidden'
      onChange={(e) => handleFileUpload(e.target.files)}
      
      />

      {profile.photos.length < 2 && (
        <p className='text-amber-600 text-sm text-center'>
          Please upload at least 2 photos to continue
        </p>
      )}
    </div>
  )
}

export default PhotosStep