// ==========================================
// ==========================================
// Pocket Edu Web
// chat.js
// Part 2A
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get,
set,
update,
push,
onValue
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Elements
// ==========================================

const friendName =
document.getElementById("friendName");

const friendEmoji =
document.getElementById("friendEmoji");

const friendStatus =
document.getElementById("friendStatus");

const chatBox =
document.getElementById("chatBox");

const messageInput =
document.getElementById("messageInput");

const sendBtn =
document.getElementById("sendBtn");

// ==========================================

let currentUid = "";

let friendUid = "";

let chatId = "";

// ==========================================
// Friend UID
// ==========================================

const params = new URLSearchParams(location.search);

friendUid = params.get("uid");

if(!friendUid){

history.back();

}

// ==========================================
// Login Check
// ==========================================

onAuthStateChanged(auth, async(user)=>{

if(!user){

location.href="index.html";

return;

}

currentUid = user.uid;

// ==========================================
// Create Chat ID
// Same for both users
// ==========================================

chatId =

[currentUid, friendUid]

.sort()

.join("_");

// ==========================================
// Create Participants
// ==========================================

const participantRef = ref(

db,

"messages/"+chatId+"/participants"

);

const participantSnap =

await get(participantRef);

if(!participantSnap.exists()){

await set(participantRef,{

[currentUid]:true,

[friendUid]:true

});

}

// ==========================================
// Load Friend Info
// ==========================================

const userSnap =

await get(

ref(

db,

"users/"+friendUid

)

);

if(userSnap.exists()){

const data = userSnap.val();

friendName.textContent =

data.fullName;

friendEmoji.textContent =

data.profileEmoji || "😀";

friendStatus.textContent =

"Offline";

}

// ==========================================
// Next Part
// loadMessages();
//

});
// ==========================================
// Load Messages (Realtime)
// ==========================================

function loadMessages(){

onValue(

ref(db,"messages/"+chatId+"/items"),

(snapshot)=>{

chatMessages.innerHTML="";

if(!snapshot.exists()){

chatMessages.innerHTML=`

<div class="emptyChat">

আজই প্রথম মেসেজ পাঠান 👋

</div>

`;

return;

}

snapshot.forEach(child=>{

const msgId=child.key;

const msg=child.val();

const bubble=document.createElement("div");

bubble.className=

msg.senderUid===currentUid

? "message me"

: "message other";

const time=new Date(

msg.time||Date.now()

).toLocaleTimeString([],{

hour:"2-digit",

minute:"2-digit"

});

bubble.innerHTML=`

<div class="messageText">

${msg.text}

</div>

<div class="messageTime">

${time}

</div>

`;

chatMessages.appendChild(bubble);

});

chatMessages.scrollTop=

chatMessages.scrollHeight;

});

}
// ==========================================
// Auto Seen
// ==========================================

onValue(

ref(db,"messages/"+chatId+"/items"),

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
"messages/"+chatId+"/items/"+child.key+"/seen"
),

true

);

}

});

});
// ==========================================
// Update Last Message
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
// Send Message
// ==========================================

sendBtn.onclick = async()=>{

const text = messageInput.value.trim();

if(text==="") return;

// Create participants if missing
await set(
ref(db,"messages/"+chatId+"/participants"),
{
[currentUid]: true,
[friendUid]: true
}
);

const msgRef = push(
ref(db,"messages/"+chatId+"/items")
);

await set(msgRef,{
senderUid: currentUid,
text: text,
time: Date.now(),
seen: false
});

await updateLastMessage(text);

messageInput.value = "";

};
// ==========================================
// Scroll Bottom
// ==========================================

function scrollBottom(){

chatMessages.scrollTop =
chatMessages.scrollHeight;

}

const observer = new MutationObserver(scrollBottom);

observer.observe(chatMessages,{

childList:true,

subtree:true

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
// Send on Enter
// ==========================================

messageInput.addEventListener("keydown",(e)=>{

if(e.key==="Enter"){

e.preventDefault();

sendBtn.click();

}

});
// ==========================================
// Online Status
// ==========================================

window.addEventListener("beforeunload",async()=>{

await set(
ref(db,"users/"+currentUid+"/online"),
false
);

});

window.addEventListener("load",async()=>{

await set(
ref(db,"users/"+currentUid+"/online"),
true
);

});
// ==========================================
// Friend Online Status
// ==========================================

onValue(

ref(db,"users/"+friendUid+"/online"),

(snapshot)=>{

if(snapshot.exists() && snapshot.val()===true){

friendStatus.textContent="Online";

}else{

friendStatus.textContent="Offline";

}

});
// ==========================================
// Friend Typing Status
// ==========================================

messageInput.addEventListener("input",()=>{

set(

ref(db,"typing/"+chatId+"/"+currentUid),

messageInput.value.trim().length>0

);

});

onValue(

ref(db,"typing/"+chatId+"/"+friendUid),

(snapshot)=>{

if(snapshot.exists() && snapshot.val()===true){

friendStatus.textContent="Typing...";

}else{

get(ref(db,"users/"+friendUid+"/online")).then(snap=>{

friendStatus.textContent=

snap.exists() && snap.val().online

? "Online"

: "Offline";

});

}

});
// ==========================================
// Cleanup Typing Status
// ==========================================

window.addEventListener("beforeunload",async()=>{

await set(

ref(db,"typing/"+chatId+"/"+currentUid),

false

);

await set(

ref(db,"users/"+currentUid+"/online"),

false

);

});
