import {
    createUserWithEmailAndPassword,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    ref,
    get,
    set
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

import {
    auth,
    db
} from "./firebase.js";

import {
    t
} from "./language.js";


// ======================================================
// ELEMENTS
// ======================================================

const form =
    document.getElementById("registerForm");

const message =
    document.getElementById("message");

const submitButton =
    form.querySelector(
        'button[type="submit"]'
    );


// ======================================================
// EMOJI
// ======================================================

let selectedEmoji = "😀";

const emojiButtons =
    document.querySelectorAll(
        ".emoji-container button"
    );

emojiButtons.forEach(button => {

    button.addEventListener("click", () => {

        selectedEmoji = button.textContent;

        emojiButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

    });

});


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
// REGISTER
// ======================================================

form.addEventListener("submit", async (e) => {

    e.preventDefault();

    showMessage("");


    // ==================================================
    // GET VALUES
    // ==================================================

    const fullName =
        document
        .getElementById("fullName")
        .value
        .trim();

    const username =
        document
        .getElementById("username")
        .value
        .trim()
        .toLowerCase();

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

    const confirmPassword =
        document
        .getElementById("confirmPassword")
        .value;


    // ==================================================
    // VALIDATION
    // ==================================================

    if (
        !fullName ||
        !username ||
        !phone ||
        !password ||
        !confirmPassword
    ) {

        showMessage(t("required"));

        return;
    }


    if (fullName.length < 2) {

        showMessage(
            "Full Name must be at least 2 characters."
        );

        return;
    }


    if (fullName.length > 60) {

        showMessage(
            "Full Name is too long."
        );

        return;
    }


    if (!/^[a-z0-9_]{3,20}$/.test(username)) {

        showMessage(
            "Username must contain only a-z, 0-9 and _"
        );

        return;
    }


    if (!/^[0-9]{10,15}$/.test(phone)) {

        showMessage(
            "Please enter a valid phone number."
        );

        return;
    }


    if (password.length < 6) {

        showMessage(
            "Password must be at least 6 characters."
        );

        return;
    }


    if (password !== confirmPassword) {

        showMessage(
            t("passwordMismatch")
        );

        return;
    }


    // ==================================================
    // DISABLE BUTTON
    // ==================================================

    submitButton.disabled = true;
    submitButton.style.opacity = "0.6";


    let createdUser = null;


    try {

        // ==================================================
        // INTERNAL EMAIL
        // ==================================================

        const internalEmail =
            `${username}@edu.pocketstudio.qzz.io`;


        // ==================================================
        // STEP 1
        // CREATE AUTH ACCOUNT FIRST
        // ==================================================

   

        const result =
            await createUserWithEmailAndPassword(
                auth,
                internalEmail,
                password
            );

        createdUser = result.user;

        // ==================================================
        // STEP 2
        // CHECK USERNAME
        // ==================================================


        const usernameSnapshot =
            await get(
                ref(
                    db,
                    "usernameIndex/" + username
                )
            );


        if (usernameSnapshot.exists()) {

            showMessage(
                "এই username ইতিমধ্যে ব্যবহার করা হয়েছে।"
            );

            await deleteUser(createdUser);

            return;
        }


        // ==================================================
        // STEP 3
        // CHECK PHONE
        // ==================================================

        const phoneSnapshot =
            await get(
                ref(
                    db,
                    "phoneIndex/" + phone
                )
            );


        if (phoneSnapshot.exists()) {

            showMessage(
                "এই phone number দিয়ে ইতিমধ্যে account আছে।"
            );

            await deleteUser(createdUser);

            return;
        }


        // ==================================================
        // STEP 4
        // SAVE USER PROFILE
        // ==================================================
        await set(
            ref(
                db,
                "users/" + createdUser.uid
            ), {

                fullName: fullName,

                username: username,

                phone: phone,

                profileEmoji: selectedEmoji,

                coins: 0,

                level: 1,

                role: "User",

                joinDate: new Date().toISOString()

            }
        );


        // ==================================================
        // STEP 5
        // SAVE PHONE INDEX
        // ==================================================

        await set(
            ref(
                db,
                "phoneIndex/" + phone
            ), {

                username: username,

                uid: createdUser.uid

            }
        );


        // ==================================================
        // STEP 6
        // SAVE USERNAME INDEX
        // ==================================================

        await set(
            ref(
                db,
                "usernameIndex/" + username
            ), {

                uid: createdUser.uid

            }
        );


        // ==================================================
        // SUCCESS
        // ==================================================
        showMessage(
            t("accountCreated")
        );


        form.reset();

        selectedEmoji = "😀";

        emojiButtons.forEach(btn => {
            btn.classList.remove("selected");
        });


        // ==================================================
        // LOGIN PAGE
        // ==================================================

        setTimeout(() => {

            window.location.href =
                "login.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Registration Error:",
            error
        );

        console.error(
            "Error Code:",
            error.code
        );

        console.error(
            "Error Message:",
            error.message
        );


        // ==================================================
        // ERROR
        // ==================================================

        switch (error.code) {

            case "auth/email-already-in-use":

                showMessage(
                    "এই username ইতিমধ্যে ব্যবহার করা হয়েছে।"
                );

                break;


            case "auth/weak-password":

                showMessage(
                    "Password আরও শক্তিশালী করুন।"
                );

                break;


            case "auth/network-request-failed":

                showMessage(
                    "Internet connection পরীক্ষা করুন।"
                );

                break;


            case "PERMISSION_DENIED":

                showMessage(
                    "Firebase Database permission denied."
                );

                break;


            default:

                showMessage(
                    `Error: ${error.code || error.message}`
                );

                break;

        }

    } finally {

        submitButton.disabled = false;
        submitButton.style.opacity = "1";

    }

});