// ==========================================
// Pocket Edu Web
// notification.js
// Part 1
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
query,
orderByChild,
onValue,
get,
set,
remove
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================

const notificationList =
document.getElementById("notificationList");

const friendRequestList =
document.getElementById("friendRequestList");

let currentUid = "";

// ==========================================
// Login
// ==========================================

onAuthStateChanged(auth,(user)=>{

if(!user){

location.href="index.html";
return;

}

currentUid = user.uid;

loadFriendRequests();
loadNotifications();

});

// ==========================================
// Friend Requests
// ==========================================

function loadFriendRequests(){

onValue(

ref(db,"friendRequests/"+currentUid),

(snapshot)=>{

friendRequestList.innerHTML="";

if(!snapshot.exists()){

friendRequestList.innerHTML=`

<div class="empty">

কোন Friend Request নেই

</div>

`;

return;

}

snapshot.forEach(child=>{

const uid = child.key;

const data = child.val();

const card = document.createElement("div");

card.className="requestCard";

card.innerHTML=`

<div class="requestLeft">

<div class="requestEmoji">

${data.senderEmoji || "😀"}

</div>

<div class="requestInfo">

<div class="requestName">

${data.senderName}

</div>

<div class="requestUsername">

@${data.senderUsername}

</div>

</div>

</div>

<div class="requestButtons">

<button
class="acceptBtn">

Accept

</button>

<button
class="rejectBtn">

Reject

</button>

</div>

`;

card.querySelector(".acceptBtn").onclick=()=>{

acceptFriend(uid);

};

card.querySelector(".rejectBtn").onclick=()=>{

rejectFriend(uid);

};

friendRequestList.appendChild(card);

});

});

}

// ==========================================
// Accept Friend
// ==========================================

async function acceptFriend(friendUid){

try{

await set(

ref(
db,
"friends/"+currentUid+"/"+friendUid
),

true

);

await set(

ref(
db,
"friends/"+friendUid+"/"+currentUid
),

true

);

await remove(

ref(
db,
"friendRequests/"+currentUid+"/"+friendUid
)

);

toast("Friend Added");

}catch(err){

console.log(err);

toast("Failed");

}

}
// ==========================================
// Pocket Edu Web
// notification.js
// Part 2
// ==========================================

// ==========================================
// Reject Friend
// ==========================================

async function rejectFriend(friendUid){

try{

await remove(

ref(
db,
"friendRequests/"+currentUid+"/"+friendUid
)

);

toast("Request Rejected");

}catch(err){

console.log(err);

toast("Failed");

}

}

// ==========================================
// Admin Notifications
// ==========================================

function loadNotifications(){

const noticeQuery=query(

ref(db,"notifications"),

orderByChild("timestamp")

);

onValue(noticeQuery,(snapshot)=>{

notificationList.innerHTML="";

if(!snapshot.exists()){

notificationList.innerHTML=`

<div class="empty">

এখনও কোন নোটিফিকেশন নেই

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

items.reverse();

items.forEach(data=>{

const card=document.createElement("div");

card.className="noticeCard";

card.innerHTML=`

<div class="noticeTitle">

${data.title || "Untitled"}

</div>

<div class="noticeMessage">

${data.message || ""}

</div>

<div class="noticeDate">

<i class="fa-solid fa-calendar-days"></i>

${data.date || ""}

</div>

`;

notificationList.appendChild(card);

});

});

}

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

// ==========================================
// Bottom Navigation Animation
// ==========================================

const navItems=document.querySelectorAll(".navItem");
const indicator=document.querySelector(".navIndicator");

navItems.forEach((item,index)=>{

item.addEventListener("click",()=>{

navItems.forEach(btn=>btn.classList.remove("active"));

item.classList.add("active");

if(indicator){

indicator.style.left=(index*25+2)+"%";

}

});

});

// ==========================================
// End notification.js
// ==========================================