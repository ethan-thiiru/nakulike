import { useCloudinary } from '@/hooks/useImageCloudinary';
import { UserProfile } from '@/lib/types';
import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Plus, X } from 'lucide-react';
import { DIET_OPTIONS, DRINKING_OPTIONS, fileUtils, generateHeightOptions, generateWeightOptions, INTERESTS_OPTIONS, LOOKING_FOR_OPTIONS, PETS_OPTIONS, SMOKING_OPTIONS, validationUtils, WORKOUT_OPTIONS } from '@/lib/common-utils';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    field: string;
    currentData: UserProfile;
    onUpdate: (updates: Partial<UserProfile>) => void;
}

const EditProfileModal = ({ isOpen, onClose, field, currentData, onUpdate }: EditProfileModalProps) => {
    const [formData, setFormData] = useState<UserProfile>(currentData);
    const [newInterest, setNewInterest] = useState('');
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadImage, uploading } = useCloudinary();

    useEffect(() => {
        setFormData(currentData);
    }, [currentData, field]);

    const handleSave = async () => {
        setSaving(true);
        try {
            onUpdate(formData);
            onClose();
        } catch (error) {
            console.error('Error saving profile', error);
        } finally {
            setSaving(false);
        }
    };

    const addInterest = () => {
        if (newInterest.trim() && !formData.interests.includes(newInterest.trim())) {
            setFormData({
                ...formData,
                interests: [...formData.interests, newInterest.trim()]
            });
            setNewInterest('')
        }
    };

    const removeInterest = (interest: string) => {
        setFormData({
            ...formData,
            interests: formData.interests.filter((i) => i !== interest)
        });
    };

    const addLookingFor = (value: string) => {
        if (!formData.lookingFor.includes(value)) {
            setFormData({
                ...formData,
                lookingFor: [...formData.lookingFor, value]
            });
        }
    };

    const removeLookingFor = (value: string) => {
        setFormData({
            ...formData,
            lookingFor: formData.lookingFor.filter((lf) => lf !== value)
        });
    };

    const renderFieldEditor = () => {
        switch (field) {
            case 'bio':
                return (
                    <div className='space-y-4'>
                        <label className='text-sm font-medium text-gray-300'>
                            About You
                        </label>
                        <Textarea
                            value={formData.additionalInfo?.bio || ''}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    additionalInfo: {
                                        ...formData.additionalInfo,
                                        bio: e.target.value
                                    }
                                })
                            }}

                            placeholder='Tell people about yourself...'
                            className='bg-gray-800 border-gray-700 text-white min-h-30'
                            maxLength={500}
                        />

                        <p className='text-xs text-gray-400 mt-1'>
                            {(formData.additionalInfo?.bio || '').length} /500 Characters
                        </p>

                    </div>
                );
            case 'work':
                return (
                    <div className='space-y-4'>
                        <div>
                            <label className='text-sm font-medium text-gray-300'>
                                Job Title
                            </label>
                            <Input
                                value={formData.additionalInfo?.jobTitle || ''}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        additionalInfo: {
                                            ...formData.additionalInfo,
                                            jobTitle: e.target.value
                                        }
                                    })
                                }}

                                placeholder='e.g. Software Engineer'
                                className='bg-gray-800 border-gray-700 text-white mt-1'
                            />
                        </div>

                        <div>
                            <label className='text-sm font-medium text-gray-300'>
                                Company
                            </label>
                            <Input
                                value={formData.additionalInfo?.company || ''}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        additionalInfo: {
                                            ...formData.additionalInfo,
                                            company: e.target.value
                                        }
                                    })
                                }}

                                placeholder='e.g. Safaricom'
                                className='bg-gray-800 border-gray-700 text-white mt-1'
                            />
                        </div>

                        <div>
                            <label className='text-sm font-medium text-gray-300'>
                                Education Level
                            </label>
                            <Input
                                value={formData.additionalInfo?.educationLevel || ''}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        additionalInfo: {
                                            ...formData.additionalInfo,
                                            educationLevel: e.target.value
                                        }
                                    })
                                }}

                                placeholder='e.g. Degree, Diploma, Highschool'
                                className='bg-gray-800 border-gray-700 text-white mt-1'
                            />
                        </div>

                        <div>
                            <label className='text-sm font-medium text-gray-300'>
                                University
                            </label>
                            <Input
                                value={formData.additionalInfo?.university || ''}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        additionalInfo: {
                                            ...formData.additionalInfo,
                                            university: e.target.value
                                        }
                                    })
                                }}

                                placeholder='e.g. JKUAT'
                                className='bg-gray-800 border-gray-700 text-white'
                            />
                        </div>

                    </div>
                );


            case 'interests':
                return (
                    <div className='space-y-4 '>
                        <label className='text-sm font-medium text-gray-300'>
                            Your Interests
                        </label>
                        <div className='flex flex-wrap gap-2 mb-3'>
                            {formData.interests.map((interest) => (
                                <Badge
                                    key={interest}
                                    className='bg-pink-500/20 text-pink-400 border border-pink-500/30 text-xs'
                                >
                                    {interest}
                                    <button className='ml-1 hover:bg-pink-500/30 rounded-full p-0.5'
                                        onClick={() => removeInterest(interest)}
                                    >
                                        <X className='w-3 h-3' />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className='mb-4'>
                            <p className='text-xs text-gray-400 mb-2'>
                                Popular interests
                            </p>
                            <div className='flex flex-wrap gap-2'>
                                {INTERESTS_OPTIONS.map((option) => (
                                    <button
                                        key={option.name}
                                        onClick={() => {
                                            if (!formData.interests.includes(option.name)) {
                                                setFormData({
                                                    ...formData,
                                                    interests: [...formData.interests, option.name]
                                                })
                                            }
                                        }}
                                        disabled={formData.interests.includes(option.name)}
                                        className='px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-full text-white flex items-center space-x-1'
                                    >
                                        <span>
                                            {option.icon}
                                        </span>
                                        <span>
                                            {option.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className='flex space-x-2'>
                            <Input
                                value={newInterest}
                                onChange={(e) => setNewInterest(e.target.value)}
                                placeholder='Add custom interest..'
                                className='bg-gray-800 border-gray-700 text-white'
                                onKeyDown={(e) => e.key === 'Enter' && addInterest}
                            />
                            <Button
                                onClick={addInterest}
                                size='sm'
                                className='bg-pink-500 hover:bg-pink-600'
                            >
                                <Plus className='w-4 h-4' />
                            </Button>
                        </div>
                    </div>
                );

            case 'lifestyle':
                return (
                    <div className='space-y-4'>
                        <label className='text-sm font-medium text-gray-300 mb-4 block'>
                            Lifestyle
                        </label>
                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Height
                                </span>
                            </Label>
                            <Select
                                value={formData.height || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        height: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select height' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {generateHeightOptions().map((height) => (
                                        <SelectItem key={height.value} value={height.value}>
                                            {height.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Weight
                                </span>
                            </Label>
                            <Select
                                value={formData.weight || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        weight: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select weight' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {generateWeightOptions().map((weight) => (
                                        <SelectItem key={weight.value} value={weight.value}>
                                            {weight.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Drinking
                                </span>
                            </Label>
                            <Select
                                value={formData.drinking || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        drinking: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select drinking preference' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {DRINKING_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Smoking
                                </span>
                            </Label>
                            <Select
                                value={formData.smoking || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        smoking: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select smoking preference' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {SMOKING_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Workout
                                </span>
                            </Label>
                            <Select
                                value={formData.workout || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        workout: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select workout frequency' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {WORKOUT_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Diet
                                </span>
                            </Label>
                            <Select
                                value={formData.diet || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        diet: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select diet preference' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {DIET_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label
                                className='flex items-center space-x-2 text-gray-300 mb-2'
                            >
                                <span>
                                    Pets
                                </span>
                            </Label>
                            <Select
                                value={formData.pets || ''}
                                onValueChange={(value) =>
                                    setFormData({
                                        ...formData,
                                        pets: value
                                    })
                                }

                            >
                                <SelectTrigger className='bg-gray-800 w-full border-gray-700 text-white'>
                                    <SelectValue placeholder='Select drinking preference' />
                                </SelectTrigger>
                                <SelectContent className='w-full bg-white'>
                                    {PETS_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.icon} {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                );

            case 'lookingFor':
                return (
                    <div className='space-y-4 '>
                        <label className='text-sm font-medium text-gray-300'>
                            Looking For
                        </label>
                        <div className='flex flex-wrap gap-2 mb-3'>
                            {formData.lookingFor.map((lf) => (
                                <Badge
                                    key={lf}
                                    className='bg-pink-500/20 text-pink-400 border border-pink-500/30 pr-1'
                                >
                                    {lf}
                                    <button className='ml-1 hover:bg-pink-500/30 rounded-full p-0.5'
                                        onClick={() => removeLookingFor(lf)}
                                    >
                                        <X className='w-3 h-3' />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className='mb-4'>
                            <p className='text-xs text-gray-400 mb-2'>
                                What are you looking for?
                            </p>
                            <div className='flex flex-wrap gap-2'>
                                {LOOKING_FOR_OPTIONS.map((option) => (
                                    <button
                                        key={typeof option === 'string' ? option : option.value}
                                        onClick={() => {
                                            addLookingFor(
                                                typeof option === 'string' ? option : option.value
                                            )
                                        }}
                                        disabled={formData.lookingFor.includes(typeof option === 'string' ? option : option.value)}
                                        className='px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:opacity-50 rounded-full text-white flex items-center space-x-1'
                                    >
                                        {typeof option === 'string' ? (
                                            <span>
                                                {option}
                                            </span>
                                        ) : (
                                            <>
                                                <span>
                                                    {option.icon}
                                                </span>
                                                <span>
                                                    {option.label}
                                                </span>
                                            </>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );

                case 'photos':
                    const handleAddPhotoClick = () => {
                        if(fileInputRef.current){
                            fileInputRef.current.click();
                        }
                    }

                    const handleFileInputChange = async(e:React.ChangeEvent<HTMLInputElement>) => {
                        const files = e.target.files;
                        if(!files) return;

                        const validFiles = fileUtils.validateFiles(files);
                        try {
                            const newPhotos = [...formData.photos];
                            for(const file of validFiles) {
                                if(uploadImage){
                                    const url = await uploadImage(file)
                                    newPhotos.push(url)
                                }
                            }
                            setFormData({...formData,photos:newPhotos})
                        } catch (error) {
                            console.error(error);
                        }
                        e.target.value = '';
                    };

                    return(
                        <div className='space-y-4 '>
                        <label className='text-sm font-medium text-gray-300 mb-2 block'>
                            Profile Photos
                        </label>
                        <div className='grid grid-cols-3 gap-3'>
                            {formData.photos.map((photo,index) => (
                                <div className='relative group' key={index}>
                                    <img 
                                    src={photo} 
                                    alt="photo" 
                                    className='h-40 object-contain rounded-lg shadow-lg'
                                    />
                                    <button
                                    onClick={() => {
                                        const newPhotos = formData.photos.filter((_, i) => i !== index);
                                        setFormData({...formData,photos:newPhotos})
                                    }}
                                    className='absolute bottom-1 left-1 bg-white hover:bg-gray-100 text-black rounded-full p-1 shadow-md'
                                    >
                                        <X className='w-3 h-3'/>
                                    </button>
                                </div>
                            ))}

                            {formData.photos.length < 6 && (
                                <div 
                                onClick={handleAddPhotoClick}
                                className='w-full h-40 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-pink-500 transition-colors'>
                                    <div className='text-center'>
                                        <Plus className='w-6 h-6 text-gray-400 mx-auto mb-1'/>
                                        <p className='text-xs text-gray-400'>
                                            {uploading ? 'Uploading...' : 'Add Photo'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <Input
                        type='file'
                        accept='image/*'
                        multiple
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        className='hidden'
                        />
                        <p className='text-xs text-gray-400'>
                            You can add up to 6 photos
                        </p>
                        </div>
                    );

                    case 'Profile' :
                    return (
                            <div className='space-y-4'>
                            <label className='text-sm font-medium text-gray-300 mb-2 block'>
                                Name
                            </label>
                            <Input
                                value={formData.name || ''}
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        name:e.target.value
                                    });
                                }}
                                placeholder='Enter your name'
                                className='bg-gray-800 border-gray-700 text-white'
                                maxLength={50}
                            />
                            <p className='text-xs text-gray-400'>
                                {(formData.name || '').length}/50 characters
                            </p>

                            {formData.name && !validationUtils.isValidName(formData.name) && (
                                <p className='text-xs text-red-500'>
                                    Name must be 2-50 characters
                                </p>
                            )}
                        </div>
                    )
                    default:
                        return null;
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='bg-gray-900 border-gray-700 text-white max-w-md max-h-[80vh] overflow-y-auto'>
                <DialogHeader>

                    <DialogTitle className='text-xl font-bold'>
                        Edit{''}
                        {field === 'bio'
                            ? 'About'
                            : field === 'work'
                                ? 'Job & Education'
                                : field === 'interests'
                                    ? 'Interests'
                                    : field === 'lifestyle'
                                        ? 'Lifestyle'
                                        : field === 'lookingFor'
                                            ? 'Looking For'
                                            : field === 'photos'
                                                ? 'Profile Photo'
                                                : field === 'Profile'
                                                    ? 'Profile'
                                                    : 'Profile'}

                    </DialogTitle>
                </DialogHeader>
                <div className='py-4'>
                    {renderFieldEditor()}
                </div>
                <div className='flex space-x-3 pt-4'>
                    <Button
                        className='flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent'
                        onClick={onClose}
                        variant='outline'
                        disabled={saving}
                    >
                        Cancel
                    </Button>

                    <Button
                        className='flex-1 bg-linear-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:bg-red-600'
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>

                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EditProfileModal;