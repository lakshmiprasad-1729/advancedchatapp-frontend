import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image } from "lucide-react"
import { Send } from "lucide-react"
import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/Store/hooks"
import { sendMessage } from "@/Store/chatSlice"
import { useRef } from "react"
import { imageData } from "@/axios/interfaces"



function InputComp() {

  const fileInputRef = useRef<HTMLInputElement>(null);

   const dispatch = useAppDispatch();

    const [input,setInput] = useState<string | undefined>();
    const [image, setImage] = useState<File | null>(null);

    const darkMode = useAppSelector(state=>state.auth.darkMode);
    const chatDetails = useAppSelector(state=>state.chat.chatdetails);

    const handleSend = () => {
        if (!input || !chatDetails) return;

         if(image && fileInputRef.current){
             const reader = new FileReader();

             reader.onload=()=>{
                 const arrayBuffer  = reader.result as ArrayBuffer;

                 const imageData:imageData = {
                  name:fileInputRef.current?.name,
                  type:fileInputRef.current?.type,
                  size:fileInputRef.current?.size,
                  buffer:arrayBuffer
                }

                dispatch(sendMessage({ chatid: chatDetails?._id, message: input ,imageDetails:imageData }));


             }

             reader.onerror=(err)=>{
              console.log("error while reading image",err);
             }

             reader.readAsArrayBuffer(image);
         }
         else{
          dispatch(sendMessage({ chatid: chatDetails?._id, message: input ,imageDetails:null }));

         }
         

         
        
        setInput("");
        setImage(null);
      };

      const handleTyping = (value: string) => {
        setInput(value);
        
      };

      const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const image = event.target.files;
         if(image && image.length >0){
            setImage(image[0])
         }
      }


  return (
    <div
          className={`flex items-center gap-3 px-6 py-4 ${
            darkMode
              ? "bg-[#1f1f2e] border-t border-transparent bg-clip-padding border-gradient-to-r from-indigo-600 to-purple-600"
              : "bg-[#1f1f2e] border-t border-transparent bg-clip-padding border-gradient-to-r from-indigo-600 to-purple-600"
          }`}
        >
          <Input
            placeholder="Type a message..."
            value={input}
            className="flex-1 border-none focus:ring-0 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white"
            onChange={(e) => handleTyping(e.target.value)}
          />
          <label className="cursor-pointer text-indigo-400 hover:text-indigo-600">
            <Image className="w-5 h-5" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg"
            onClick={handleSend}
          >
            <Send className="w-4 h-4 mr-1" />
            Send
          </Button>
        </div>
  )
}

export default InputComp