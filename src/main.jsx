import { StrictMode } from 'react' 
import { createRoot } from 'react-dom/client' 
import { RouterProvider } from 'react-router-dom' 
import { router } from './routes/index' 
import axios from 'axios' 

axios.interceptors.request.use( 
  function (config) { 
    const token = localStorage.getItem('access_token') 
    if (token) { 
      config.headers.Accept = 'application/json'
      config.headers.Authorization = `Bearer ${token}` 
    } 
    return config 
  }, 
  function (error) { 
    return Promise.reject(error) 
  } 
) 

createRoot(document.getElementById('root')).render( 
  <StrictMode> 
    <RouterProvider router={router} /> 
  </StrictMode> 
)