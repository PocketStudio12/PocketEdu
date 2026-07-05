// ==========================================
// Pocket Edu Web
// chapter.js
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get,
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
// URL Subject ID
// ==========================================

const params=new URLSearchParams(location.search);

const subjectId=params.get("id");

if(!subjectId){

toast("Subject পাওয়া যায়নি");

setTimeout(()=>{

history.back();

},1000);

}

// ==========================================
// Elements
// ==========================================

const title=document.getElementById("subjectTitle");

const container=document.getElementById("chapterContainer");

const search=document.getElementById("searchChapter");

// ==========================================
// Subject Name
// ==========================================

async function loadSubject(){

try{

const snap=await get(ref(db,"subjects/"+subjectId));

if(snap.exists()){

title.innerHTML=snap.val().name;

}else{

title.innerHTML="Unknown Subject";

}

}catch(err){

console.log(err);

}

}

loadSubject();

// ==========================================
// Chapters
// ==========================================

const chapterRef=ref(db,"chapters/"+subjectId);

onValue(chapterRef,(snapshot)=>{

container.innerHTML="";

if(!snapshot.exists()){

container.innerHTML=`

<div style="text-align:center;padding:40px;color:#b8c3d8;">

<h3>কোন অধ্যায় পাওয়া যায়নি</h3>

</div>

`;

return;

}

snapshot.forEach(item=>{

const data=item.val();

const card=document.createElement("div");

card.className="chapterCard";

card.dataset.name=data.chapterName.toLowerCase();

card.innerHTML=`

<div class="chapterNumber">

অধ্যায় ${data.chapterNumber}

</div>

<div class="chapterName">

${data.chapterName}

</div>

`;

card.onclick=()=>{

location.href=`content.html?subject=${subjectId}&chapter=${item.key}`;

};

container.appendChild(card);

});

});

// ==========================================
// Search
// ==========================================

search.addEventListener("input",()=>{

const value=search.value.toLowerCase();

document.querySelectorAll(".chapterCard").forEach(card=>{

card.style.display=

card.dataset.name.includes(value)

?

"block"

:

"none";

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
// Network
// ==========================================

window.addEventListener("offline",()=>{

toast("ইন্টারনেট সংযোগ বিচ্ছিন্ন");

});

window.addEventListener("online",()=>{

toast("ইন্টারনেট সংযোগ হয়েছে");

});