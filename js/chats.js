// ==========================================
// Pocket Edu Web
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
set,
onValue
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Elements
// ==========================================

const friendList = document.getElementById("friendList");

const addFriendBtn =
document.getElementById("addFriendBtn");

const modal =
document.getElementById("addFriendModal");

const closeModal =
document.getElementById("closeModal");

const searchBtn =
document.getElementById("searchUserBtn");

const searchInput =
document.getElementById("searchUsername");

const result =
document.getElementById("searchResult");

const searchFriend =
document.getElementById("searchFriend");

// ==========================================

let currentUser = null;

// ==========================================
// Login Check
// ==========================================

onAuthStateChanged(auth, async(user)=>{

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

addFriendBtn.onclick = ()=>{

modal.classList.add("active");

searchInput.value="";

loadAllUsers();

};
async function loadAllUsers(){

result.innerHTML="<p>Loading...</p>";

const snap = await get(ref(db,"users"));

result.innerHTML="";

if(!snap.exists()){

result.innerHTML="<p>No Users</p>";

return;

}

snap.forEach(child=>{

const uid = child.key;

const user = child.val();

if(uid===currentUser.uid){

return;

}

showUser(uid,user);

});

}

closeModal.onclick=()=>{

modal.classList.remove("active");

};

// ==========================================
// Search User
// ==========================================
searchInput.addEventListener("input",()=>{

const value=searchInput.value.trim().toLowerCase();

document.querySelectorAll("#searchResult .friendCard")
.forEach(card=>{

const text=card.innerText.toLowerCase();

card.style.display=
text.includes(value)
? "flex"
: "none";

});

});

// ==========================================
// Friend Status
// ==========================================

async function checkFriendStatus(friendUid,user){

const friendSnap =
await get(
ref(
db,
"friends/"+currentUser.uid+"/"+friendUid
)
);

const requestSnap =
await get(
ref(
db,
"friendRequests/"+friendUid+"/"+currentUser.uid
)
);

let buttonText="Add Friend";

let disabled=false;

if(friendSnap.exists()){

buttonText="Friend";

disabled=true;

}else if(requestSnap.exists()){

buttonText="Request Sent";

disabled=true;

}

result.innerHTML=`

<div class="friendCard">

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
id="sendRequestBtn"
${disabled?"disabled":""}>

${buttonText}

</button>

</div>

</div>

`;

if(!disabled){

document
.getElementById("sendRequestBtn")
.onclick=()=>{

sendRequest(friendUid,user);

};

}

}

// ==========================================
// Pocket Edu Web
// js/chats.js
// Part 2
// ==========================================

// ==========================================
// Send Friend Request
// ==========================================

async function sendRequest(friendUid,user){

try{

await set(

ref(
db,
"friendRequests/"+friendUid+"/"+currentUser.uid
),

{

senderUid:currentUser.uid,

senderName:"",

senderUsername:"",

senderEmoji:"😀",

status:"pending",

time:Date.now()

}

);

// নিজের তথ্য সংরক্ষণ

const me=await get(
ref(db,"users/"+currentUser.uid)
);

if(me.exists()){

const data=me.val();

await set(

ref(
db,
"friendRequests/"+friendUid+"/"+currentUser.uid
),

{

senderUid:currentUser.uid,

senderName:data.fullName,

senderUsername:data.username,

senderEmoji:data.profileEmoji || "😀",

status:"pending",

time:Date.now()

}

);

}

toast("Friend Request Sent");

document.getElementById(
"sendRequestBtn"
).innerHTML="Request Sent";

document.getElementById(
"sendRequestBtn"
).disabled=true;

}catch(err){

console.log(err);

toast("Request Failed");

}

}

// ==========================================
// Load Friends
// ==========================================

function loadFriends(){

onValue(

ref(
db,
"friends/"+currentUser.uid
),

async(snapshot)=>{

friendList.innerHTML="";

if(!snapshot.exists()){

friendList.innerHTML=`

<div style="
text-align:center;
padding:40px;
opacity:.7;
">

<h3>

কোন Friend নেই

</h3>

<p>

Add Friend চাপুন

</p>

</div>

`;

return;

}

for(const child of Object.keys(snapshot.val())){

const userSnap=await get(

ref(
db,
"users/"+child
)

);

if(!userSnap.exists()){

continue;

}

const user=userSnap.val();

const card=document.createElement("div");

card.className="friendCard";

card.innerHTML=`

<div class="friendLeft">

<div class="friendEmoji">

${user.profileEmoji || "😀"}

</div>

<div class="friendInfo">

<h3>

${user.fullName}

</h3>

<p>

@${user.username}

</p>

</div>

</div>

<div class="friendRight">

<div class="friendTime">

Chat

</div>

</div>

`;

card.onclick=()=>{

location.href=
"chat.html?uid="+child;

};

friendList.appendChild(card);

}

});

}

// ==========================================
// Friend Search
// ==========================================

searchFriend.addEventListener(

"input",

()=>{

const value=
searchFriend.value
.toLowerCase();

document
.querySelectorAll(".friendCard")
.forEach(card=>{

const txt=card
.innerText
.toLowerCase();

card.style.display=
txt.includes(value)
?"flex"
:"none";

});

}

);

// ==========================================
// Pocket Edu Web
// js/chats.js
// Part 3 (Final)
// ==========================================

// ==========================================
// Close Modal Outside Click
// ==========================================

window.addEventListener("click",(e)=>{

if(e.target===modal){

modal.classList.remove("active");

}

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

indicator.style.left=(index*25+2)+"%";

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

if(window.scrollY===0 && endY-startY>130){

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
// Escape Key
// ==========================================

window.addEventListener("keydown",(e)=>{

if(e.key==="Escape"){

modal.classList.remove("active");

}

});
async function showUser(uid,user){

const friendSnap=await get(

ref(db,"friends/"+currentUser.uid+"/"+uid)

);

const requestSnap=await get(

ref(db,"friendRequests/"+uid+"/"+currentUser.uid)

);

let text="Add Friend";

let disabled=false;

if(friendSnap.exists()){

text="Friend";

disabled=true;

}
else if(requestSnap.exists()){

text="Request Sent";

disabled=true;

}

const div=document.createElement("div");

div.className="friendCard";

div.innerHTML=`

<div class="friendLeft">

<div class="friendEmoji">

${user.profileEmoji||"😀"}

</div>

<div class="friendInfo">

<h3>${user.fullName}</h3>

<p>@${user.username}</p>

</div>

</div>

<div class="friendRight">

<button
${disabled?"disabled":""}
class="sendBtn">

${text}

</button>

</div>

`;

if(!disabled){

div.querySelector(".sendBtn").onclick=()=>{

sendRequest(uid,user);

};

}

result.appendChild(div);

}