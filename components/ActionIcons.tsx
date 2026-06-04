import { ACTION_ICONS } from "@/lib/common-utils";


export const DisLikeIcon = () => (
    <img 
    src={ACTION_ICONS.cancel}
    alt="Dislike"
    className="h-7 w-7 object-contain"
    draggable={false} 
    />
)

export const SuperLikeIcon = () => (
    <img 
    src={ACTION_ICONS.star}
    alt="Super Like"
    className="h-7 w-7 object-contain"
    draggable={false} 
    />
)

export const LikeIcon = () => (
    <img 
    src={ACTION_ICONS.heart}
    alt="Like"
    className="h-7 w-7 object-contain"
    draggable={false} 
    />
)

export const MessageIcon = () => (
    <img 
    src={ACTION_ICONS.message}
    alt="Like"
    className="h-7 w-7 object-contain"
    draggable={false} 
    />
)

export const RewindIcon = () => (
    <svg
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2.5'
    strokeLinecap='round'
    strokeLinejoin='round'
    className="h-6 w-6"
    >
        <polyline points='1 4 1 10 7 10'/>
        <path d='M3.51 15a9 9 0 1 0 2.13-9.36L1 10'/>
    </svg>
)