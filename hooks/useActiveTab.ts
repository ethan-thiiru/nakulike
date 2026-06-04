import { useEffect, useState } from "react";

export function useActiveTab(key:string,defaltValue:string){
    const [tab,setTab] = useState<string>(() => {
        if(typeof window !== 'undefined'){
            const saved = localStorage.getItem(key);
            return saved ?? defaltValue;
   }
   return defaltValue
})

useEffect(() => {
    localStorage.setItem(key,tab);
}, [key,tab])

return [tab,setTab] as const;
}