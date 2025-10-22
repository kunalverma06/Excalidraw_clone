
import { Canvas } from "./Canvas";
export default   function CanvasPage({params}:{
    params:{
        roomId:string
    }
}) {
    const roomId=  params.roomId;
    console.log(roomId);
   
        return (
        <div >
            <Canvas roomId={roomId}/>
        </div>
    );
}
