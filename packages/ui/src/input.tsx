import React from "react"

interface Input_types{
    id:string,
    name:string,
    placeholder?:string
}

export const Input : React.FunctionComponent<Input_types>=({id ,name , placeholder })=>{
    return( 
    <div className="w-full max-w-sm">
    
      <input
        type="text"
        id={id}
        name={name}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none shadow-sm"
      />
  

        </div>
    )
}