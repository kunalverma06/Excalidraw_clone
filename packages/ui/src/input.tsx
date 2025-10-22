import React from "react"

interface Input_types{
    id:string,
  
    placeholder?:string,
    className?:string,
    onChange?:(e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input : React.FunctionComponent<Input_types>=({id , placeholder ,className,onChange})=>{
    return( 
    <div className="w-full max-w-sm">
    
      <input
      onChange={onChange}
        type="text"
        id={id}
       
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm ${className}`}
      />
  

        </div>
    )
}