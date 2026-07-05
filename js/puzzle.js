// ==========================================
// Pocket Edu Web
// puzzle.js
// ==========================================

import { auth, db, toast } from "./firebase.js";

import {
onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
ref,
get,
child,
update
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

// ==========================================
// Login Check
// ==========================================

let currentUser=null;

onAuthStateChanged(auth,user=>{

if(!user){

location.href="index.html";
return;

}

currentUser=user;

loadQuiz();

});

// ==========================================
// Elements
// ==========================================

const question=document.getElementById("question");
const options=document.getElementById("options");
const nextBtn=document.getElementById("nextBtn");
const timerText=document.getElementById("timer");
const scoreText=document.getElementById("score");

// ==========================================

let puzzles=[];
let index=0;
let score=0;
let timer=30;
let interval;

// ==========================================
// Load Puzzle
// ==========================================

async function loadQuiz(){

try{

const snap=await get(ref(db,"puzzles"));

if(!snap.exists()){

question.innerHTML="কোন Puzzle পাওয়া যায়নি।";

return;

}

puzzles=[];

snap.forEach(item=>{

puzzles.push(item.val());

});

showQuestion();

}catch(e){

console.log(e);

toast("Puzzle লোড করা যায়নি");

}

}

// ==========================================

function startTimer(){

clearInterval(interval);

timer=30;

timerText.innerHTML=timer;

interval=setInterval(()=>{

timer--;

timerText.innerHTML=timer;

if(timer<=0){

clearInterval(interval);

nextQuestion();

}

},1000);

}

// ==========================================

function showQuestion(){

if(index>=puzzles.length){

finishQuiz();

return;

}

nextBtn.style.display="none";

const q=puzzles[index];

question.innerHTML=q.question;

options.innerHTML="";

q.options.forEach((opt,i)=>{

const btn=document.createElement("button");

btn.className="option";

btn.innerHTML=opt;

btn.onclick=()=>checkAnswer(btn,i);

options.appendChild(btn);

});

startTimer();

}

// ==========================================

function checkAnswer(button,selected){

clearInterval(interval);

const q=puzzles[index];

document.querySelectorAll(".option").forEach(b=>{

b.disabled=true;

});

if(selected==q.answer){

button.classList.add("correct");

score++;

scoreText.innerHTML=score;

}else{

button.classList.add("wrong");

document.querySelectorAll(".option")[q.answer].classList.add("correct");

}

nextBtn.style.display="block";

}

// ==========================================

nextBtn.onclick=()=>{

nextQuestion();

};

function nextQuestion(){

index++;

showQuestion();

}

// ==========================================

async function finishQuiz(){

clearInterval(interval);

question.innerHTML=`

<div class="result">

<h2>অভিনন্দন 🎉</h2>

<p>আপনার স্কোর : ${score}/${puzzles.length}</p>

<p>আপনি ${score*5} Coins অর্জন করেছেন।</p>

</div>

`;

options.innerHTML="";

nextBtn.style.display="none";

if(currentUser){

try{

const userRef=ref(db,"users/"+currentUser.uid);

const snap=await get(userRef);

if(snap.exists()){

const data=snap.val();

await update(userRef,{

coins:(data.coins||0)+(score*5)

});

}

}catch(e){

console.log(e);

}

}

}

// ==========================================

window.addEventListener("offline",()=>{

toast("ইন্টারনেট সংযোগ বিচ্ছিন্ন");

});

window.addEventListener("online",()=>{

toast("ইন্টারনেট সংযোগ হয়েছে");

});