// ==========================================
// js/chats.js
// Part 1
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get,
onValue,
set
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Elements
// ==========================================

const friendList =
document.getElementById("friendList");

const modal =
document.getElementById("addFriendModal");

const addFriendBtn =
document.getElementById("addFriendBtn");

const closeModal =
document.getElementById("closeModal");

const searchInput =
document.getElementById("searchUsername");

const searchFriend =
document.getElementById("searchFriend");

const searchResult =
document.getElementById("searchResult");

let currentUser = null;

// ==========================================
// Login
// ==========================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="index.html";

return;

}

currentUser=user;

loadFriends();

});

// ==========================================
// Modal
// ==========================================

addFriendBtn.onclick=()=>{

modal.classList.add("active");

loadAllUsers();

};

closeModal.onclick=()=>{

modal.classList.remove("active");

};

window.onclick=(e)=>{

if(e.target===modal){

modal.classList.remove("active");

}

};
// ==========================================
// Load All Users
// ==========================================

async function loadAllUsers(){

searchResult.innerHTML="Loading...";

const snap = await get(ref(db,"users"));

searchResult.innerHTML="";

if(!snap.exists()){

searchResult.innerHTML="<p>No Users</p>";

return;

}

snap.forEach(async(child)=>{

const uid = child.key;

const user = child.val();

if(uid===currentUser.uid) return;

const friendSnap = await get(
ref(db,"friends/"+currentUser.uid+"/"+uid)
);

const requestSnap = await get(
ref(db,"friendRequests/"+uid+"/"+currentUser.uid)
);

let text="Add Friend";

let disabled=false;

if(friendSnap.exists()){

text="Friend";

disabled=true;

}else if(requestSnap.exists()){

text="Request Sent";

disabled=true;

}

const card=document.createElement("div");

card.className="friendCard";

card.innerHTML=`

<div class="friendLeft">

<div class="friendEmoji">

${user.profileEmoji || "😀"}

</div>

<div class="friendInfo">

<h3>${user.fullName}</h3>

<p>@${user.username}</p>

</div>

</div>

<div class="friendRight">

<button
class="sendBtn"
${disabled?"disabled":""}>

${text}

</button>

</div>

`;

if(!disabled){

card.querySelector(".sendBtn").onclick=()=>{

sendRequest(uid,user);

};

}

searchResult.appendChild(card);

});

}
// ==========================================
// Load Friends
// ==========================================

function loadFriends(){

onValue(

ref(db,"friends/"+currentUser.uid),

async(snapshot)=>{

friendList.innerHTML="";

if(!snapshot.exists()){

friendList.innerHTML=`

<div class="emptyFriends">

<div class="emptyIcon">

👥

</div>

<h2>

কোন বন্ধু নেই

</h2>

<p>

নতুন বন্ধু যোগ করতে
উপরের <b>Add Friend</b>
বাটনে চাপুন।

</p>

</div>

`;

return;

}

const friends=Object.keys(snapshot.val());

for(const uid of friends){

const userSnap=await get(

ref(db,"users/"+uid)

);

if(!userSnap.exists()){

continue;

}

const user=userSnap.val();

const chatId=

[currentUser.uid,uid]

.sort()

.join("_");

// Last Message

const chatSnap=await get(

ref(db,"chatList/"+chatId)

);

let lastMessage="";

let lastTime="";

if(chatSnap.exists()){

const chat=chatSnap.val();

lastMessage=

chat.lastMessage || "";

if(chat.lastTime){

lastTime=

new Date(chat.lastTime)

.toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

});

}

}

// Unread

let unread=0;

const msgSnap=await get(

ref(db,"messages/"+chatId+"/items")

);

if(msgSnap.exists()){

msgSnap.forEach(m=>{

const msg=m.val();

if(

msg.senderUid===uid &&

msg.seen===false

){

unread++;

}

});

}

// Online

const onlineSnap=await get(

ref(db,"users/"+uid+"/online")

);

const online=

onlineSnap.exists()

&&

onlineSnap.val()===true;

// Card

const card=

document.createElement("div");

card.className="friendCard";

card.innerHTML=`

<div class="friendLeft">

<div class="friendEmoji">

${user.profileEmoji || "😀"}

</div>

<div class="friendInfo">

<h3>

${user.fullName}

${online?

'<span class="onlineDot"></span>'

:''}

</h3>

<p class="lastMessage">

${lastMessage ||

"কোন মেসেজ নেই"}

</p>

</div>

</div>

<div class="friendRight">

<div class="friendTime">

${lastTime}

</div>

${
unread>0?

`<div class="unreadBadge">

${unread}

</div>`

:""

}

</div>

`;

card.onclick=()=>{

location.href=

"chat.html?uid="+uid;

};

friendList.appendChild(card);

}

});

}
// ==========================================
// Send Friend Request
// ==========================================

async function sendRequest(friendUid,user){

try{

const me=await get(
ref(db,"users/"+currentUser.uid)
);

if(!me.exists()) return;

const myData=me.val();

await set(

ref(
db,
"friendRequests/"+friendUid+"/"+currentUser.uid
),

{

senderUid:currentUser.uid,

senderName:myData.fullName,

senderUsername:myData.username,

senderEmoji:myData.profileEmoji || "😀",

status:"pending",

time:Date.now()

}

);

toast("Friend Request Sent");

loadAllUsers();

}catch(err){

console.log(err);

toast("Request Failed");

}

}

// ==========================================
// Search Users In Modal
// ==========================================

searchInput.addEventListener("input",()=>{

const value=

searchInput.value

.trim()

.toLowerCase();

document

.querySelectorAll("#searchResult .friendCard")

.forEach(card=>{

const txt=

card.innerText

.toLowerCase();

card.style.display=

txt.includes(value)

? "flex"

: "none";

});

});

// ==========================================
// Search Friend List
// ==========================================

searchFriend.addEventListener("input",()=>{

const value=

searchFriend.value

.trim()

.toLowerCase();

document

.querySelectorAll("#friendList .friendCard")

.forEach(card=>{

const txt=

card.innerText

.toLowerCase();

card.style.display=

txt.includes(value)

? "flex"

: "none";

});

});
// ==========================================
// Bottom Navigation
// ==========================================

const navItems =
document.querySelectorAll(".navItem");

const indicator =
document.querySelector(".navIndicator");

navItems.forEach((item,index)=>{

item.addEventListener("click",()=>{

navItems.forEach(i=>
i.classList.remove("active")
);

item.classList.add("active");

if(indicator){

indicator.style.left=
(index*25+2)+"%";

}

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

if(

window.scrollY===0 &&

(endY-startY)>120

){

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
// ESC / Outside Close Modal
// ==========================================

window.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

modal.classList.remove("active");

}

});

window.addEventListener("click",(e)=>{

if(e.target===modal){

modal.classList.remove("active");

}

});

// ==========================================
// End chats.js
// ==========================================