import {
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    auth
} from "./firebase.js";


// ======================================================
// ELEMENTS
// ======================================================

const phoneStep =
    document.getElementById("phoneStep");

const otpStep =
    document.getElementById("otpStep");

const passwordStep =
    document.getElementById("passwordStep");

const phoneInput =
    document.getElementById("phone");

const otpInput =
    document.getElementById("otp");

const newPasswordInput =
    document.getElementById("newPassword");

const confirmPasswordInput =
    document.getElementById("confirmNewPassword");

const message =
    document.getElementById("message");

const sendOtpButton =
    document.getElementById("sendOtpButton");

const verifyOtpButton =
    document.getElementById("verifyOtpButton");

const changePhoneButton =
    document.getElementById("changePhoneButton");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const bnButton =
    document.getElementById("bnButton");

const enButton =
    document.getElementById("enButton");


// ======================================================
// VARIABLES
// ======================================================

let recaptchaVerifier = null;

let confirmationResult = null;


// ======================================================
// LANGUAGE
// ======================================================

const languageData = {

    bn: {

        title:
            "পাসওয়ার্ড পরিবর্তন করুন",

        subtitle:
            "আপনার ফোন নম্বর দিয়ে শুরু করুন",

        phone:
            "📱 ফোন নম্বর",

        sendOtp:
            "OTP পাঠান",

        otp:
            "🔢 OTP",

        verifyOtp:
            "OTP যাচাই করুন",

        changePhone:
            "ফোন নম্বর পরিবর্তন",

        newPassword:
            "🔑 নতুন পাসওয়ার্ড",

        confirmPassword:
            "🔐 পাসওয়ার্ড নিশ্চিত করুন",

        resetPassword:
            "পাসওয়ার্ড পরিবর্তন করুন",

        backLogin:
            "লগইনে ফিরে যান"

    },


    en: {

        title:
            "Reset Password",

        subtitle:
            "Start with your phone number",

        phone:
            "📱 Phone Number",

        sendOtp:
            "Send OTP",

        otp:
            "🔢 OTP",

        verifyOtp:
            "Verify OTP",

        changePhone:
            "Change Phone Number",

        newPassword:
            "🔑 New Password",

        confirmPassword:
            "🔐 Confirm Password",

        resetPassword:
            "Reset Password",

        backLogin:
            "Back to Login"

    }

};


// ======================================================
// CHANGE LANGUAGE
// ======================================================

function changeLanguage(language) {

    const data =
        languageData[language];

    const forgotTitle =
        document.getElementById("forgotTitle");

    const forgotSubtitle =
        document.getElementById("forgotSubtitle");

    const phoneLabel =
        document.querySelector(
            'label[for="phone"]'
        );

    const otpLabel =
        document.querySelector(
            'label[for="otp"]'
        );

    const newPasswordLabel =
        document.querySelector(
            'label[for="newPassword"]'
        );

    const confirmPasswordLabel =
        document.querySelector(
            'label[for="confirmNewPassword"]'
        );

    const backLogin =
        document.querySelector(
            ".bottom-text a"
        );


    if (forgotTitle) {
        forgotTitle.textContent =
            data.title;
    }

    if (forgotSubtitle) {
        forgotSubtitle.textContent =
            data.subtitle;
    }

    if (phoneLabel) {
        phoneLabel.textContent =
            data.phone;
    }

    if (sendOtpButton) {
        sendOtpButton.textContent =
            data.sendOtp;
    }

    if (otpLabel) {
        otpLabel.textContent =
            data.otp;
    }

    if (verifyOtpButton) {
        verifyOtpButton.textContent =
            data.verifyOtp;
    }

    if (changePhoneButton) {
        changePhoneButton.textContent =
            data.changePhone;
    }

    if (newPasswordLabel) {
        newPasswordLabel.textContent =
            data.newPassword;
    }

    if (confirmPasswordLabel) {
        confirmPasswordLabel.textContent =
            data.confirmPassword;
    }

    if (resetPasswordButton) {
        resetPasswordButton.textContent =
            data.resetPassword;
    }

    if (backLogin) {
        backLogin.textContent =
            data.backLogin;
    }


    localStorage.setItem(
        "language",
        language
    );

}


// ======================================================
// LOAD LANGUAGE
// ======================================================

const savedLanguage =
    localStorage.getItem("language") || "bn";

changeLanguage(
    savedLanguage
);


// ======================================================
// LANGUAGE BUTTONS
// ======================================================

if (bnButton) {

    bnButton.addEventListener(
        "click",
        () => {
            changeLanguage("bn");
        }
    );

}

if (enButton) {

    enButton.addEventListener(
        "click",
        () => {
            changeLanguage("en");
        }
    );

}


// ======================================================
// MESSAGE
// ======================================================

function showMessage(text) {

    if (message) {
        message.textContent =
            text;
    }

}


// ======================================================
// PHONE NORMALIZE
// ======================================================

function getInternationalPhone(phone) {

    phone =
        phone
            .replace(/\s+/g, "")
            .replace(/-/g, "");


    // India 10 digit number

    if (
        phone.length === 10 &&
        /^[0-9]+$/.test(phone)
    ) {

        return "+91" + phone;

    }


    // Already international

    if (
        phone.startsWith("+")
    ) {

        return phone;

    }


    return "+" + phone;

}


// ======================================================
// CREATE RECAPTCHA
// ======================================================

function createRecaptcha() {

    if (recaptchaVerifier) {
        return recaptchaVerifier;
    }


    const container =
        document.getElementById(
            "recaptcha-container"
        );


    if (!container) {

        throw new Error(
            "recaptcha-container not found"
        );

    }


    // Container must be empty

    container.innerHTML = "";


    recaptchaVerifier =
        new RecaptchaVerifier(
            auth,
            "recaptcha-container",
            {

                size: "normal",

                callback: () => {

                    console.log(
                        "reCAPTCHA solved"
                    );

                },

                "expired-callback": () => {

                    showMessage(
                        "reCAPTCHA expired. আবার verify করুন।"
                    );

                }

            }
        );


    return recaptchaVerifier;

}


// ======================================================
// CLEAR RECAPTCHA
// ======================================================

function clearRecaptcha() {

    if (recaptchaVerifier) {

        try {

            recaptchaVerifier.clear();

        } catch (error) {

            console.error(
                "reCAPTCHA clear error:",
                error
            );

        }

        recaptchaVerifier =
            null;

    }


    const container =
        document.getElementById(
            "recaptcha-container"
        );


    if (container) {
        container.innerHTML = "";
    }

}


// ======================================================
// SEND OTP
// ======================================================

if (sendOtpButton) {

    sendOtpButton.addEventListener(
        "click",
        async () => {

            showMessage("");


            const phone =
                phoneInput.value.trim();


            // ------------------------------------------------
            // VALIDATE
            // ------------------------------------------------

            if (
                !/^[0-9]{10}$/.test(phone)
            ) {

                showMessage(
                    "সঠিক ১০ সংখ্যার ফোন নম্বর দিন।"
                );

                return;

            }


            const internationalPhone =
                getInternationalPhone(
                    phone
                );


            sendOtpButton.disabled =
                true;

            sendOtpButton.textContent =
                "Sending...";


            try {

                // --------------------------------------------
                // CREATE RECAPTCHA
                // --------------------------------------------

                const appVerifier =
                    createRecaptcha();

                // --------------------------------------------
                // SEND OTP
                // --------------------------------------------

                confirmationResult =
                    await signInWithPhoneNumber(
                        auth,
                        internationalPhone,
                        appVerifier
                    );


                showMessage(
                    "OTP পাঠানো হয়েছে। 📱"
                );


                phoneStep.style.display =
                    "none";

                otpStep.style.display =
                    "block";


                otpInput.focus();


            } catch (error) {

                console.error(
                    "OTP Error:",
                    error
                );

                console.error(
                    "Error code:",
                    error.code
                );

                console.error(
                    "Error message:",
                    error.message
                );


                clearRecaptcha();


                switch (error.code) {

                    case "auth/invalid-phone-number":

                        showMessage(
                            "Phone number সঠিক নয়।"
                        );

                        break;


                    case "auth/too-many-requests":

                        showMessage(
                            "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে আবার চেষ্টা করুন।"
                        );

                        break;


                    case "auth/quota-exceeded":

                        showMessage(
                            "SMS quota শেষ হয়েছে।"
                        );

                        break;


                    case "auth/captcha-check-failed":

                        showMessage(
                            "reCAPTCHA verification ব্যর্থ হয়েছে।"
                        );

                        break;


                    case "auth/operation-not-allowed":

                        showMessage(
                            "Firebase Console-এ Phone Authentication enable করুন।"
                        );

                        break;


                    case "auth/argument-error":

                        showMessage(
                            "Phone OTP configuration-এ সমস্যা হয়েছে।"
                        );

                        break;


                    case "auth/network-request-failed":

                        showMessage(
                            "Internet connection পরীক্ষা করুন।"
                        );

                        break;


                    default:

                        showMessage(
                            "Firebase Error: " +
                            (
                                error.code ||
                                error.message
                            )
                        );

                        break;

                }


                sendOtpButton.disabled =
                    false;

                sendOtpButton.textContent =
                    "OTP পাঠান";

            }

        }
    );

}


// ======================================================
// VERIFY OTP
// ======================================================

if (verifyOtpButton) {

    verifyOtpButton.addEventListener(
        "click",
        async () => {

            showMessage("");


            const otp =
                otpInput.value.trim();


            if (
                !/^[0-9]{6}$/.test(otp)
            ) {

                showMessage(
                    "৬ সংখ্যার OTP দিন।"
                );

                return;

            }


            if (!confirmationResult) {

                showMessage(
                    "আগে OTP পাঠান।"
                );

                return;

            }


            verifyOtpButton.disabled =
                true;

            verifyOtpButton.textContent =
                "Verifying...";


            try {

                const result =
                    await confirmationResult.confirm(
                        otp
                    );


                console.log(
                    "Phone verified:",
                    result.user.uid
                );


                showMessage(
                    "Phone verification সফল হয়েছে। ✅"
                );


                otpStep.style.display =
                    "none";

                passwordStep.style.display =
                    "block";


            } catch (error) {

                console.error(
                    "OTP Verification Error:",
                    error
                );


                switch (error.code) {

                    case "auth/invalid-verification-code":

                        showMessage(
                            "OTP ভুল। আবার চেষ্টা করুন।"
                        );

                        break;


                    case "auth/code-expired":

                        showMessage(
                            "OTP expired। নতুন OTP পাঠান।"
                        );

                        break;


                    default:

                        showMessage(
                            "Firebase Error: " +
                            (
                                error.code ||
                                error.message
                            )
                        );

                        break;

                }


                verifyOtpButton.disabled =
                    false;

                verifyOtpButton.textContent =
                    "OTP যাচাই করুন";

            }

        }
    );

}


// ======================================================
// CHANGE PHONE
// ======================================================

if (changePhoneButton) {

    changePhoneButton.addEventListener(
        "click",
        () => {

            clearRecaptcha();


            otpStep.style.display =
                "none";

            passwordStep.style.display =
                "none";

            phoneStep.style.display =
                "block";


            otpInput.value =
                "";

            confirmationResult =
                null;


            showMessage("");


            sendOtpButton.disabled =
                false;

            sendOtpButton.textContent =
                "OTP পাঠান";

        }
    );

}


// ======================================================
// RESET PASSWORD
// ======================================================

if (resetPasswordButton) {

    resetPasswordButton.addEventListener(
        "click",
        () => {

            const password =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            // --------------------------------------------
            // PASSWORD LENGTH
            // --------------------------------------------

            if (
                password.length < 6
            ) {

                showMessage(
                    "Password কমপক্ষে ৬ characters হতে হবে।"
                );

                return;

            }


            // --------------------------------------------
            // PASSWORD MATCH
            // --------------------------------------------

            if (
                password !== confirmPassword
            ) {

                showMessage(
                    "Password মিলছে না।"
                );

                return;

            }


            /*
             * IMPORTANT
             *
             * এই অংশে এখনো password update
             * করা হচ্ছে না।
             *
             * কারণ OTP দিয়ে তৈরি Phone Auth user
             * এবং তোমার existing
             *
             * username@edu.pocketstudio.qzz.io
             *
             * Email/Password account
             * একই Firebase user নাও হতে পারে।
             */


            showMessage(
                "OTP verification সফল হয়েছে। Password reset system-এর পরের ধাপ এখনো তৈরি করা হয়নি।"
            );

        }
    );

}