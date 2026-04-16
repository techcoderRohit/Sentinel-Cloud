// import axios from "axios";

// const API = axios.create({
//     baseURL : 'http://localhost:5000/api',//Aapka backend URL
//     //headers : { 'Content-Type' : 'application/json'}
// });

// //Har request ke saath Token apne aap jayega

// API.interceptors.request.use((req) => {
//     const token = localStorage.getItem('token');
//     if(token){
//         req.headers.Authorization = `Bearer ${token}`;
//     }
//     return req;
// })

// export default API;

import axios from "axios";

const API = axios.create({
    baseURL : 'http://localhost:5000/api',//Aapka backend URL
    //headers : { 'Content-Type' : 'application/json'}
});

//Har request ke saath Token apne aap jayega

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if(token){
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
})

export default API;