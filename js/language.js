const translations = {
    en: {
        login: "Login",
        createAccount: "Create Account",
        welcome: "Welcome back!",
        subtitle: "Continue your learning journey",
        phone: "Phone Number",
        password: "Password",
        confirmPassword: "Confirm Password",
        fullName: "Full Name",
        username: "Username",
        selectEmoji: "Select Profile Emoji",
        forgot: "Forgot Password?",
        noAccount: "Don't have an account?",
        haveAccount: "Already have an account?",
        register: "Register",
        loginNow: "Login Now",
        create: "Create Account",
        passwordMismatch: "Passwords do not match",
        required: "Please fill all fields",
        loginSuccess: "Login successful!",
        accountCreated: "Account created successfully!",
        forgotTitle: "Reset Password",
        forgotSubtitle: "Start with your phone number",
        sendOtp: "Send OTP",
        otp: "OTP",
        verifyOtp: "Verify OTP",
        changePhone: "Change Phone Number",
        newPassword: "New Password",
        resetPassword: "Reset Password",
        backToLogin: "Back to Login"
    },

    bn: {
        login: "লগইন",
        createAccount: "অ্যাকাউন্ট তৈরি করুন",
        welcome: "আবার স্বাগতম!",
        subtitle: "তোমার পড়াশোনার যাত্রা চালিয়ে যাও",
        phone: "ফোন নম্বর",
        password: "পাসওয়ার্ড",
        confirmPassword: "পাসওয়ার্ড নিশ্চিত করুন",
        fullName: "পূর্ণ নাম",
        username: "ইউজারনেম",
        selectEmoji: "প্রোফাইল ইমোজি নির্বাচন করুন",
        forgot: "পাসওয়ার্ড ভুলে গেছো?",
        noAccount: "অ্যাকাউন্ট নেই?",
        haveAccount: "আগেই অ্যাকাউন্ট আছে?",
        register: "রেজিস্টার",
        loginNow: "লগইন করুন",
        create: "অ্যাকাউন্ট তৈরি করুন",
        passwordMismatch: "পাসওয়ার্ড মিলছে না",
        required: "সব ঘর পূরণ করুন",
        loginSuccess: "সফলভাবে লগইন হয়েছে!",
        accountCreated: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
        forgotTitle: "পাসওয়ার্ড পরিবর্তন করুন",
        forgotSubtitle: "আপনার ফোন নম্বর দিয়ে শুরু করুন",
        sendOtp: "OTP পাঠান",
        otp: "OTP",
        verifyOtp: "OTP যাচাই করুন",
        changePhone: "ফোন নম্বর পরিবর্তন করুন",
        newPassword: "নতুন পাসওয়ার্ড",
        resetPassword: "পাসওয়ার্ড পরিবর্তন করুন",
        backToLogin: "লগইনে ফিরে যান"
    }
};

let currentLanguage =
    localStorage.getItem("language") || "bn";

function setLanguage(lang) {
    currentLanguage = lang;

    localStorage.setItem("language", lang);

    document.querySelectorAll("[data-lang]").forEach(element => {

        const key = element.dataset.lang;

        if (translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });
}

function t(key) {
    return translations[currentLanguage][key] || key;
}

export {
    setLanguage,
    t,
    currentLanguage
};