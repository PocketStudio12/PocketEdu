// ==========================================
// Pocket Edu Web
// register.js
// Part 1
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

function usernameToEmail(username){

username = username.trim().toLowerCase();

return `${username}@edu.pocketstudio.qzz.io`;

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

// ==========================================
// Get Input
// ==========================================

const fullName =
document.getElementById("fullName").value.trim();

const username =
document.getElementById("username").value.trim();

const phone =
document.getElementById("phone").value.trim();

const password =
document.getElementById("password").value.trim();

const profileEmoji =
document.getElementById("profileEmoji").value;

// ==========================================
// Validation
// ==========================================

if(fullName.length < 3){

toast("পূর্ণ নাম লিখুন");

return;

}

if(username.length < 3){

toast("কমপক্ষে ৩ অক্ষরের Username লিখুন");

return;

}

if(phone.length < 10){

toast("সঠিক Phone Number লিখুন");

return;

}

if(password.length < 6){

toast("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");

return;

}

// ==========================================
// Check Username & Phone Duplicate
// ==========================================

try{

const usersSnap = await get(ref(db,"users"));

if(usersSnap.exists()){

let usernameExists = false;

let phoneExists = false;

usersSnap.forEach(child=>{

const user = child.val();

if(
user.username &&
user.username.toLowerCase() ===
username.toLowerCase()
){

usernameExists = true;

}

if(
user.phone &&
user.phone === phone
){

phoneExists = true;

}

});

if(usernameExists){

toast("Username ইতিমধ্যে ব্যবহৃত হয়েছে");

return;

}

if(phoneExists){

toast("Phone Number ইতিমধ্যে ব্যবহৃত হয়েছে");

return;

}

}

// ==========================================
// Firebase Authentication
// ==========================================

const email = usernameToEmail(username);

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

fullName:fullName,

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

// ==========================================
// Registration Success
// ==========================================

toast("অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে");

setTimeout(()=>{

location.href="home.html";

},1000);

}catch(error){

console.log(error);

switch(error.code){

case "auth/email-already-in-use":

toast("এই Username ইতিমধ্যেই ব্যবহৃত হয়েছে");
break;

case "auth/weak-password":

toast("পাসওয়ার্ড আরও শক্তিশালী দিন");

break;

case "auth/network-request-failed":

toast("ইন্টারনেট সংযোগ নেই");

break;

case "auth/invalid-email":

toast("Phone Number সঠিক নয়");

break;

case "auth/too-many-requests":

toast("অনেকবার চেষ্টা করা হয়েছে, পরে আবার চেষ্টা করুন");

break;

default:

toast(error.message);

}

}

});

// ==========================================
// Auto Format Phone Number
// ==========================================

const phoneInput = document.getElementById("phone");

phoneInput?.addEventListener("input",()=>{

phoneInput.value = phoneInput.value
.replace(/[^0-9]/g,"")
.substring(0,15);

});

// ==========================================
// Username Format
// ==========================================

const usernameInput =
document.getElementById("username");

usernameInput?.addEventListener("input",()=>{

usernameInput.value = usernameInput.value
.toLowerCase()
.replace(/[^a-z0-9_]/g,"");

});

// ==========================================
// Password Strength
// ==========================================

const passwordInput =
document.getElementById("password");

passwordInput?.addEventListener("input",()=>{

if(passwordInput.value.length>=6){

passwordInput.style.borderColor="#22c55e";

}else{

passwordInput.style.borderColor="#ef4444";

}

});

// ==========================================
// Emoji Preview
// ==========================================

const emojiSelect =
document.getElementById("profileEmoji");

const emojiPreview =
document.getElementById("emojiPreview");

if(emojiSelect && emojiPreview){

emojiPreview.textContent = emojiSelect.value;

emojiSelect.addEventListener("change",()=>{

emojiPreview.textContent = emojiSelect.value;

});

}

// ==========================================
// End of register.js
// ==========================================