// ==========================================
// Pocket Edu Web
// notification.js
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
query,
orderByChild,
onValue
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Login Check
// ==========================================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="index.html";

}

});

// ==========================================
// Elements
// ==========================================

const list=document.getElementById("notificationList");

// ==========================================
// Load Notifications
// ==========================================

const noticeQuery=query(

ref(db,"notifications"),

orderByChild("timestamp")

);

onValue(noticeQuery,(snapshot)=>{

list.innerHTML="";

if(!snapshot.exists()){

list.innerHTML=`

<div class="empty">

এখনও কোন নোটিফিকেশন নেই।

</div>

`;

return;

}

const items=[];

snapshot.forEach(item=>{

items.push({

id:item.key,

...item.val()

});

});

// সর্বশেষ নোটিফিকেশন আগে

items.reverse();

items.forEach(data=>{

const card=document.createElement("div");

card.className="noticeCard";

card.innerHTML=`

<div class="noticeTitle">

${data.title||"Untitled"}

</div>

<div class="noticeMessage">

${data.message||""}

</div>

<div class="noticeDate">

<i class="fa-solid fa-calendar-days"></i>

${data.date||""}

</div>

`;

list.appendChild(card);

});

});

// ==========================================
// Pull To Refresh
// ==========================================

let startY=0;

window.addEventListener("touchstart",(e)=>{

startY=e.touches[0].clientY;

});

window.addEventListener("touchend",(e)=>{

const endY=e.changedTouches[0].clientY;

if(window.scrollY===0 && endY-startY>120){

location.reload();

}

});

// ==========================================
// Network Status
// ==========================================

window.addEventListener("offline",()=>{

toast("ইন্টারনেট সংযোগ বিচ্ছিন্ন");

});

window.addEventListener("online",()=>{

toast("ইন্টারনেট সংযোগ হয়েছে");

});