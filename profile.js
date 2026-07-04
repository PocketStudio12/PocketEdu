// ==========================================
// Pocket Edu Web
// profile.js
// ==========================================

import {
    auth,
    db,
    storage,
    toast
} from "./firebase.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

import {
    ref,
    get,
    update
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js";

import {
    ref as storageRef,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// ==========================================
// Elements
// ==========================================

const photo = document.getElementById("profilePhoto");
const nameTxt = document.getElementById("profileName");
const phoneTxt = document.getElementById("profilePhone");
const joinDate = document.getElementById("joinDate");
const coins = document.getElementById("coins");
const level = document.getElementById("level");
const role = document.getElementById("role");
const editBtn = document.getElementById("editProfileBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ==========================================

let currentUser = null;

// ==========================================

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        location.href = "index.html";
        return;

    }

    currentUser = user;

    loadProfile();

});

// ==========================================

async function loadProfile() {

    try {

        const snap = await get(ref(db, "users/" + currentUser.uid));

        if (!snap.exists()) {

            toast("User পাওয়া যায়নি");
            return;

        }

        const data = snap.val();

        nameTxt.innerHTML = data.username;

        phoneTxt.innerHTML = data.phone;

        joinDate.innerHTML = data.joinDate;

        coins.innerHTML = data.coins ?? 0;

        level.innerHTML = data.level ?? 1;

        role.innerHTML = data.role ?? "User";

        photo.textContent = data.profileEmoji || "😀";

    } catch (e) {

        console.log(e);

        toast("Profile লোড করা যায়নি");

    }

}

// ==========================================
// Change Photo
// ==========================================

editBtn.onclick = () => {

    const input = document.createElement("input");

    input.type = "file";

    input.accept = "image/*";

    input.click();

    input.onchange = async () => {

        const file = input.files[0];

        if (!file) return;

        try {

            toast("ছবি আপলোড হচ্ছে...");

            const imgRef = storageRef(

                storage,

                "profile/" + currentUser.uid

            );

            await uploadBytes(imgRef, file);

            const url = await getDownloadURL(imgRef);

            await update(

                ref(db, "users/" + currentUser.uid),

                {

                    profilePhoto: url

                }

            );

            photo.src = url;

            toast("প্রোফাইল আপডেট হয়েছে");

        } catch (e) {

            console.log(e);

            toast("আপলোড ব্যর্থ");

        }

    };

};

// ==========================================
// Logout
// ==========================================

logoutBtn.onclick = async () => {

    await signOut(auth);

    localStorage.clear();

    location.href = "index.html";

};

// ==========================================

window.addEventListener("offline", () => {

    toast("ইন্টারনেট সংযোগ বিচ্ছিন্ন");

});

window.addEventListener("online", () => {

    toast("ইন্টারনেট সংযোগ হয়েছে");

});
editBtn.onclick = async () => {

    const emoji = prompt(
        "নতুন Emoji লিখুন\n\nউদাহরণ:\n😀 😎 😊 🤓 🐱 🐼 🦊 🐯"
    );

    if (!emoji) return;

    try {

        await update(
            ref(db, "users/" + currentUser.uid), {
                profileEmoji: emoji
            }
        );

        photo.textContent = emoji;

        toast("প্রোফাইল আপডেট হয়েছে");

    } catch (e) {

        console.log(e);

        toast("আপডেট ব্যর্থ");

    }

};