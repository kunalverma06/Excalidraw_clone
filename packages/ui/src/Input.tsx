interface Inputval{
    className:string,
    id:string,
    placeholder:string,
}

const Input =({className,id , placeholder} : Inputval)=>{
    return(
        <div className={className}>
            <input placeholder={placeholder} id={id}></input>
        </div>
    )
}
export default Input 