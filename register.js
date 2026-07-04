// ==========================================
// Pocket Edu Web
// register.js
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
set,
get
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Phone → Fake Email
// ==========================================

function phoneToEmail(phone){

phone = phone.replace(/\s+/g,"");

return `${phone}@pocketedu.web`;

}

// ==========================================
// Join Date
// ==========================================

function getJoinDate(){

const d = new Date();

const day = String(d.getDate()).padStart(2,"0");
const month = String(d.getMonth()+1).padStart(2,"0");
const year = d.getFullYear();

return `${day}/${month}/${year}`;

}

// ==========================================
// Register
// ==========================================

const form = document.getElementById("registerForm");

form?.addEventListener("submit", async(e)=>{

e.preventDefault();

const username = document.getElementById("username").value.trim();

const phone = document.getElementById("phone").value.trim();

const password = document.getElementById("password").value.trim();

const profileEmoji =
document.getElementById("profileEmoji").value;

// Validation

if(username.length < 3){

toast("কমপক্ষে ৩ অক্ষরের নাম লিখুন");
return;

}

if(phone.length < 10){

toast("সঠিক মোবাইল নম্বর লিখুন");
return;

}

if(password.length < 6){

toast("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
return;

}

try{

const email = phoneToEmail(phone);

const userCredential =
await createUserWithEmailAndPassword(

auth,
email,
password

);

const uid = userCredential.user.uid;

const userRef = ref(db,"users/"+uid);

const snap = await get(userRef);

if(!snap.exists()){

await set(userRef,{

uid:uid,

username:username,

phone:phone,

joinDate:getJoinDate(),

coins:0,

level:1,

role:"User",

profileEmoji:profileEmoji,

profilePhoto:"",

createdAt:Date.now()

});

}

toast("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে");

setTimeout(()=>{

location.href="home.html";

},1000);

}catch(error){

console.log(error);

switch(error.code){

case "auth/email-already-in-use":

toast("এই মোবাইল নম্বর দিয়ে ইতিমধ্যেই অ্যাকাউন্ট রয়েছে");

break;

case "auth/weak-password":

toast("আরও শক্তিশালী পাসওয়ার্ড ব্যবহার করুন");

break;

case "auth/network-request-failed":

toast("ইন্টারনেট সংযোগ নেই");

break;

default:

toast(error.message);

}

}

});