// ==========================================
// Pocket Edu Web
// chat.js
// Part 1
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get,
push,
set,
onValue
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Elements
// ==========================================

const friendEmoji =
document.getElementById("friendEmoji");

const friendName =
document.getElementById("friendName");

const friendStatus =
document.getElementById("friendStatus");

const chatMessages =
document.getElementById("chatMessages");

const messageInput =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

// ==========================================

const params =
new URLSearchParams(location.search);

const friendUid =
params.get("uid");

let currentUid = "";

let chatId = "";

// ==========================================
// Create Chat ID
// ==========================================

function createChatId(a,b){

return [a,b].sort().join("_");

}

// ==========================================
// Login
// ==========================================

onAuthStateChanged(auth,async(user)=>{

if(!user){

location.href="index.html";

return;

}

currentUid=user.uid;

chatId=createChatId(
currentUid,
friendUid
);

loadFriend();

loadMessages();

});

// ==========================================
// Friend Info
// ==========================================

async function loadFriend(){

const snap =
await get(ref(db,"users/"+friendUid));

if(!snap.exists()) return;

const data=snap.val();

friendEmoji.textContent =
data.profileEmoji || "😀";

friendName.textContent =
data.fullName || data.username;

friendStatus.textContent =
"Friend";

}



// ==========================================
// Load Messages
// ==========================================

function loadMessages(){

onValue(

ref(
db,
"messages/"+chatId
),

(snapshot)=>{

chatMessages.innerHTML="";

if(!snapshot.exists()) return;

snapshot.forEach(child=>{

const msg=child.val();

const bubble=
document.createElement("div");

bubble.className=
msg.senderUid===currentUid
? "message me"
: "message other";

bubble.textContent=
msg.text;

chatMessages.appendChild(
bubble
);

});

chatMessages.scrollTop=
chatMessages.scrollHeight;

});

}
// ==========================================
// Pocket Edu Web
// chat.js
// Part 2 (Final)
// ==========================================

// ==========================================
// Send on Enter
// ==========================================

messageInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

e.preventDefault();

sendBtn.click();

}

});

// ==========================================
// Auto Seen
// ==========================================

onValue(

ref(db,"messages/"+chatId),

async(snapshot)=>{

if(!snapshot.exists()) return;

snapshot.forEach(async(child)=>{

const msg=child.val();

if(
msg.senderUid!==currentUid &&
msg.seen===false
){

await set(

ref(
db,
"messages/"+chatId+"/"+child.key+"/seen"
),

true

);

}

});

});

// ==========================================
// Last Message
// ==========================================

async function updateLastMessage(text){

await set(

ref(db,"chatList/"+chatId),

{

lastMessage:text,

lastTime:Date.now(),

users:{

[currentUid]:true,

[friendUid]:true

}

}

);

}

// ==========================================
// Replace Send Button
// ==========================================

sendBtn.onclick = async()=>{

const text = messageInput.value.trim();

if(text==="") return;

const msgRef = push(

ref(
db,
"messages/"+chatId)

);

await set(msgRef,{

senderUid:currentUid,

text:text,

time:Date.now(),

seen:false

});
await updateLastMessage(text);

messageInput.value="";

};

// ==========================================
// Network
// ==========================================

window.addEventListener("offline",()=>{

toast("ইন্টারনেট সংযোগ বিচ্ছিন্ন");

});

window.addEventListener("online",()=>{

toast("ইন্টারনেট সংযোগ হয়েছে");

});

// ==========================================
// Scroll Bottom
// ==========================================

function scrollBottom(){

chatMessages.scrollTop=
chatMessages.scrollHeight;

}

const observer=new MutationObserver(scrollBottom);

observer.observe(chatMessages,{

childList:true

});

// ==========================================
// End chat.js
// ==========================================