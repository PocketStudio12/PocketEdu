// ==========================================
// Pocket Edu Web
// auth.js
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
signInWithEmailAndPassword,
onAuthStateChanged,
signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// ফোন নম্বরকে Fake Email এ রূপান্তর
// উদাহরণ:
// 9876543210 -> 9876543210@pocketedu.web
// ==========================================

function usernameToEmail(username){

username = username.trim().toLowerCase();

return `${username}@edu.pocketstudio.qzz.io`;

}
// ==========================================
// Login
// ==========================================

const loginForm=document.getElementById("loginForm");

if(loginForm){

loginForm.addEventListener("submit",async(e)=>{

e.preventDefault();

const username =
document.getElementById("username").value.trim();

const password=document.getElementById("password").value.trim();
const email = usernameToEmail(username);
if(phone.length<10){

toast("সঠিক মোবাইল নম্বর লিখুন");

return;

}

if(password.length<6){

toast("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");

return;

}

try{

// Phone -> UID
const phoneSnap = await get(ref(db,"phones/"+phone));

if(!phoneSnap.exists()){

toast("এই ফোন নম্বরের কোন অ্যাকাউন্ট নেই");

return;

}

const uid = phoneSnap.val();

// UID -> User
const userSnap = await get(ref(db,"users/"+uid));

if(!userSnap.exists()){

toast("User Data পাওয়া যায়নি");

return;

}

const email = userSnap.val().email;
const userCredential=await signInWithEmailAndPassword(

auth,
email,
password

);

const uid=userCredential.user.uid;

const snapshot=await get(ref(db,"users/"+uid));

if(!snapshot.exists()){

toast("User Data পাওয়া যায়নি");

await signOut(auth);

return;

}

localStorage.setItem("uid",uid);

localStorage.setItem("username",snapshot.val().username);

localStorage.setItem("phone",snapshot.val().phone);

toast("সফলভাবে লগইন হয়েছে");

setTimeout(()=>{

location.href="home.html";

},1000);

}catch(error){

console.log(error);

switch(error.code){
case "auth/invalid-credential":

toast("ভুল Username অথবা Password");

break;
case "auth/user-not-found":

toast("অ্যাকাউন্ট পাওয়া যায়নি");

break;

case "auth/wrong-password":

toast("ভুল পাসওয়ার্ড");

break;

case "auth/invalid-credential":

toast("ভুল মোবাইল নম্বর অথবা পাসওয়ার্ড");

break;

case "auth/network-request-failed":

toast("ইন্টারনেট সংযোগ নেই");

break;

default:

toast(error.message);

}

}

});

}

// ==========================================
// Auto Login
// ==========================================

onAuthStateChanged(auth,(user)=>{

if(!user)return;

const page=location.pathname.split("/").pop();

if(page==="index.html"||page===""){

location.href="home.html";

}

});

// ==========================================
// Logout Helper
// ==========================================

window.logout=async()=>{

await signOut(auth);

localStorage.clear();

location.href="index.html";

};