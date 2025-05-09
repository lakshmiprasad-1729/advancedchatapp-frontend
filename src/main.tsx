import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import { store } from './Store/store.ts'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from './react-components/Login.tsx'
import ChatForMob from './react-components/ChatForMob.tsx'
import VideoCall from './react-components/VideoCall.tsx'



const WrappedVideoCall = () => {
  return (
    <Provider store={store}>
      <VideoCall />
    </Provider>
  );
};

const router = createBrowserRouter([
  {
    path:'/',
    element:<App/>
  },
  {
    path:'/login',
    element:<LoginPage/>
  },
  {
    path:'/chat',
    element:<ChatForMob/>
  },{
    path:'/video-call',
    element:<WrappedVideoCall/>
  }
])

createRoot(document.getElementById('root')!).render(
  <Provider store={store}>
   <RouterProvider router={router}>

   </RouterProvider>
   </Provider>
)
