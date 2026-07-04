// ==========================================
// Pocket Edu Web
// content.js
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

const subjectId=params.get("subject");
const chapterId=params.get("chapter");

if(!subjectId || !chapterId){

toast("Invalid Chapter");

setTimeout(()=>{

history.back();

},1000);

}

// ==========================================
// Elements
// ==========================================

const title=document.getElementById("chapterTitle");
const shortBtn=document.getElementById("shortBtn");
const broadBtn=document.getElementById("broadBtn");

// ==========================================
// Load Chapter
// ==========================================

async function loadChapter(){

try{

const snap=await get(
ref(db,`chapters/${subjectId}/${chapterId}`)
);

if(snap.exists()){

const data=snap.val();

title.innerHTML=`অধ্যায় ${data.chapterNumber} : ${data.chapterName}`;

}else{

title.innerHTML="Chapter Not Found";

}

}catch(err){

console.log(err);

toast("লোড করতে সমস্যা হয়েছে");

}

}

loadChapter();

// ==========================================
// Open Short Question
// ==========================================

shortBtn.onclick=()=>{

location.href=
`short.html?subject=${subjectId}&chapter=${chapterId}`;

};

// ==========================================
// Open Broad Question
// ==========================================

broadBtn.onclick=()=>{

location.href=
`broad.html?subject=${subjectId}&chapter=${chapterId}`;

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