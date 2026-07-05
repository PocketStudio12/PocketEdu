// ==========================================
// Pocket Edu Web
// broad.js
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get
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
// URL Parameters
// ==========================================

const params=new URLSearchParams(location.search);

const subject=params.get("subject");

const chapter=params.get("chapter");

// ==========================================
// Elements
// ==========================================

const content=document.getElementById("content");

const pageTitle=document.getElementById("pageTitle");

// ==========================================
// Load Broad Questions HTML
// ==========================================

async function loadHTML(){

try{

const chapterSnap=await get(
ref(db,`chapters/${subject}/${chapter}`)
);

if(chapterSnap.exists()){

const chapterData=chapterSnap.val();

pageTitle.innerHTML=`Broad - ${chapterData.chapterName}`;

}

const htmlSnap=await get(
ref(db,`broadQuestions/${subject}/${chapter}`)
);

if(!htmlSnap.exists()){

content.innerHTML=`

<div class="empty">

এখনও কোন Broad Question যোগ করা হয়নি।

</div>

`;

return;

}

const data=htmlSnap.val();

// Admin যে HTML লিখবে
// ঠিক সেটাই Render হবে

content.innerHTML=data.html;

}catch(err){

console.error(err);

toast("ডাটা লোড করা যায়নি");

content.innerHTML=`

<div class="empty">

লোড করতে সমস্যা হয়েছে।

</div>

`;

}

}

loadHTML();

// ==========================================
// External Links
// ==========================================

document.addEventListener("click",(e)=>{

const link=e.target.closest("a");

if(!link)return;

if(link.target==="_blank"){

return;

}

});

// ==========================================
// Image Zoom
// ==========================================

document.addEventListener("click",(e)=>{

if(e.target.tagName==="IMG"){

window.open(e.target.src,"_blank");

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