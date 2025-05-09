import { Message } from "@/axios/interfaces"
import { useAppSelector } from "@/Store/hooks"
import {useState} from "react"




const  ChatMessage=({msg}:{msg?:Message})=>{

  const [openImage,setOpenImage] = useState<Boolean>(false);
  const [Image,setImage] = useState<string>("");
  const [zoom,setZoom] = useState<string>("scale-100");
  const user = useAppSelector(state=>state.auth.user);
  


  function handleOpenImage(imageurl:string){
    setOpenImage(true);
    setImage(imageurl);
  }


  
  return (
    <div>
      <div
              className={`max-w-xs px-5 py-4 rounded-3xl shadow-xl animate-fade-in backdrop-blur-md flex flex-col ${
                msg?.ownerid === user?._id
                  ? "ml-auto bg-gradient-to-br from-indigo-600 to-purple-600 text-white"
                  : "mr-auto bg-[#292947] text-white"
              }`}
            >
              {msg?.imageurl && (
                <img
                onClick={()=>handleOpenImage(msg.imageurl)}
                  src={msg.imageurl}
                  alt="shared"
                  className="mt-3 rounded-xl max-h-48 object-cover shadow-md"
                />
              )}
              {msg?.content && <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>}
            </div>
            <div className={` ${openImage?"fixed":"hidden"} w-[100dvw] h-[100dvh] top-0 left-0 bg-neutral-600/60 z-50 `}>
            <div className="w-full  flex justify-end">
                  <button
                    onClick={() => setOpenImage(false)}
                    className=" font-bold text-3xl  text-white rounded-full p-2 mr-[4rem] w-[3rem] h-auto mt-[4rem] cursor-pointer"
                  >
                    X
                  </button>
                </div>
            <div className="flex justify-center items-center w-full h-full">
            <img
                  
                  src={Image}
                  alt="shared"
                  onClick={()=>setZoom(scale=>scale==="scale-100"?"scale-150":"scale-100")}
                  className={`${zoom} object-cover  ${zoom==="scale-100"?"cursor-zoom-in":"cursor-zoom-out"}   rounded-xl shadow-md transition-transform duration-300 ease-in-out`}
                />
                </div>
         </div>
    </div>
  )
}

export default ChatMessage