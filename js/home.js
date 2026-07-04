// ==========================================
// Pocket Edu Web - home.js (FULL FIXED)
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
// USER AUTH CHECK
// ==========================================

const welcomeText = document.getElementById("welcomeText");
const miniPhoto = document.getElementById("miniPhoto");

onAuthStateChanged(auth, async (user) => {

if (!user) {
location.href = "index.html";
return;
}

try {

const snap = await get(ref(db, "users/" + user.uid));

if (snap.exists()) {

const data = snap.val();

welcomeText.innerHTML = `স্বাগতম, ${data.username || "User"}`;

miniPhoto.textContent = data.profileEmoji || "😀";

}

} catch (err) {
console.log(err);
}

});

// ==========================================
// SUBJECT LOAD (WITH LIVE CHAPTER COUNT)
// ==========================================

const container = document.getElementById("subjectContainer");

const subjectRef = ref(db, "subjects");

onValue(subjectRef, (snapshot) => {

container.innerHTML = "";

if (!snapshot.exists()) {

container.innerHTML = `
<div style="grid-column:1/-1;text-align:center;padding:40px;color:#aaa;">
<h3>কোন বিষয় পাওয়া যায়নি</h3>
</div>
`;

return;

}

snapshot.forEach(subject => {

const sid = subject.key;
const data = subject.val();

// LIVE CHAPTER COUNT
onValue(ref(db, "chapters/" + sid), (cSnap) => {

const count = cSnap.exists() ? cSnap.size : 0;

const card = document.createElement("div");
card.className = "subjectCard";

card.innerHTML = `

<div class="subjectIcon">
<div style="font-size:40px">${data.icon || "📘"}</div>
</div>

<div class="subjectName">
${data.name || "No Name"}
</div>

<div class="chapterCount">
মোট অধ্যায় : ${count}
</div>

`;

card.onclick = () => {
location.href = `chapter.html?id=${sid}`;
};

container.appendChild(card);

});

});

});

// ==========================================
// SEARCH SUBJECT
// ==========================================

const search = document.getElementById("searchSubject");

search.addEventListener("input", () => {

const value = search.value.toLowerCase();

const cards = document.querySelectorAll(".subjectCard");

cards.forEach(card => {

const text = card.querySelector(".subjectName").innerText.toLowerCase();

card.style.display = text.includes(value) ? "block" : "none";

});

});

// ==========================================
// PULL TO REFRESH
// ==========================================

let startY = 0;

window.addEventListener("touchstart", (e) => {
startY = e.touches[0].clientY;
});

window.addEventListener("touchend", (e) => {

const endY = e.changedTouches[0].clientY;

if (window.scrollY === 0 && endY - startY > 130) {
location.reload();
}

});

// ==========================================
// BOTTOM NAV ANIMATION
// ==========================================

const navItems = document.querySelectorAll(".navItem");
const indicator = document.querySelector(".navIndicator");

navItems.forEach((item, index) => {

item.addEventListener("click", () => {

navItems.forEach(btn => btn.classList.remove("active"));
item.classList.add("active");

indicator.style.left = (index * 25 + 2) + "%";

});

});

// ==========================================
// NETWORK STATUS
// ==========================================

window.addEventListener("offline", () => {
toast("ইন্টারনেট সংযোগ বিচ্ছিন্ন");
});

window.addEventListener("online", () => {
toast("ইন্টারনেট সংযোগ হয়েছে");
});