import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    auth,
    db
} from "./firebase.js";


// ======================================================
// ELEMENTS
// ======================================================

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

const submitButton =
    form.querySelector('button[type="submit"]');


// ======================================================
// PHONE NORMALIZE
// ======================================================

function normalizePhone(phone) {

    return phone
        .replace(/\s+/g, "")
        .replace(/-/g, "");

}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(text) {
    message.textContent = text;
}


// ======================================================
// LOGIN
// ======================================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    showMessage("");


    // ==================================================
    // GET VALUES
    // ==================================================

    const phone =
        normalizePhone(
            document
            .getElementById("phone")
            .value
            .trim()
        );

    const password =
        document
        .getElementById("password")
        .value;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (!phone || !password) {

        showMessage(
            "ফোন নম্বর এবং পাসওয়ার্ড দিন।"
        );

        return;
    }


    if (!/^[0-9]{10,15}$/.test(phone)) {

        showMessage(
            "সঠিক ফোন নম্বর দিন।"
        );

        return;
    }


    // ==================================================
    // LOADING
    // ==================================================

    submitButton.disabled = true;
    submitButton.style.opacity = "0.6";

    submitButton.textContent = "Loading...";


    try {

        // ==================================================
        // FIND PHONE
        // ==================================================

        const phoneSnapshot =
            await get(
                ref(
                    db,
                    "phoneIndex/" + phone
                )
            );


        if (!phoneSnapshot.exists()) {

            showMessage(
                "এই ফোন নম্বর দিয়ে কোনো account পাওয়া যায়নি।"
            );

            return;
        }


        // ==================================================
        // ACCOUNT DATA
        // ==================================================

        const account =
            phoneSnapshot.val();


        if (
            !account.username ||
            !account.uid
        ) {

            showMessage(
                "Account data সঠিক নয়।"
            );

            return;
        }


        // ==================================================
        // INTERNAL EMAIL
        // ==================================================

        const internalEmail =
            `${account.username}@edu.pocketstudio.qzz.io`;


        // ==================================================
        // FIREBASE LOGIN
        // ==================================================

        await signInWithEmailAndPassword(
            auth,
            internalEmail,
            password
        );


        // ==================================================
        // SUCCESS
        // ==================================================

        showMessage(
            "লগইন সফল হয়েছে! 🎉"
        );


        localStorage.setItem(
            "loggedIn",
            "true"
        );


        // ==================================================
        // HOME
        // ==================================================

        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 700);


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        switch (error.code) {

            case "auth/invalid-credential":

                showMessage(
                    "ফোন নম্বর অথবা পাসওয়ার্ড ভুল।"
                );

                break;


            case "auth/user-disabled":

                showMessage(
                    "এই account নিষ্ক্রিয় করা হয়েছে।"
                );

                break;


            case "auth/too-many-requests":

                showMessage(
                    "অনেকবার চেষ্টা করা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
                );

                break;


            case "auth/network-request-failed":

                showMessage(
                    "Internet connection পরীক্ষা করুন।"
                );

                break;


            default:

                showMessage(
                    "Login করা যায়নি। আবার চেষ্টা করুন।"
                );

                console.error(error);

                break;

        }

    } finally {

        submitButton.disabled = false;
        submitButton.style.opacity = "1";

        submitButton.textContent = "লগইন";

    }

});