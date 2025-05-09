import axios from "axios";
import {userLogin,createUser} from './interfaces.ts'

const instance = axios.create({
    baseURL:'http://localhost:5500/',
    withCredentials:true
})


class apiRequests {
    async login(userdetails:userLogin){
        try {
            const user = await instance.post('/login-user',userdetails);
            return user;
       
        } catch (error:any) {
            console.log(error.message)
        }
    }

    async createUser(createUser:createUser){
        try {
            const user = await instance.post('/create-user',createUser);
            return user;
       
        } catch (error:any) {
            console.log(error.message)
        }
    }

    async logout(){
        try {
            const user = await instance.patch('/logout-user')
            return user;
        } catch (error:any) {
            console.log(error.message) 
        }
    }

    async userDetails(){
        try {
            const user = await instance.get('/user-details');
            return user;
        } catch (error) {
            console.log(error);
        }
    }

}


const ApiRequests = new apiRequests();

export default ApiRequests;