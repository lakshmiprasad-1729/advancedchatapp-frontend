export interface userLogin{
    phoneno:string,
    password:string,
}

export interface User{
    _id:string,
    phoneno:string,
    name:string,
    createdAt:string,
    updatedAt:string
}

export interface createUser{
    phoneno:string,
    name:string,
    password:string,
}


export interface Chat{
    _id:string,
   participants:string[],
    createdAt:string,
    updatedAt:string
}

export interface Message{
    _id:string,
    chatid:string,
    content:string,
    ownerid:string,
    createdAt:string,
    updatedAt:string,
    imageurl:string
}

export interface imageData {
    name:string | undefined,
    type:string | undefined,
    size:number | undefined,
    buffer:ArrayBuffer
}

