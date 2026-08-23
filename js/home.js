// ======================================================
// POCKET EDU HOME
// js/home.js
// ======================================================

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";

import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.16.0/firebase-database.js";

import {
    auth,
    db
} from "./firebase.js";


// ======================================================
// ELEMENTS
// ======================================================

const loadingScreen =
    document.getElementById("loadingScreen");

const app =
    document.getElementById("app");

const welcomeName =
    document.getElementById("welcomeName");

const coinValue =
    document.getElementById("coinValue");

const levelValue =
    document.getElementById("levelValue");

const homeSubjects =
    document.getElementById("homeSubjects");

const subjectsList =
    document.getElementById("subjectsList");

const chaptersList =
    document.getElementById("chaptersList");

const questionsList =
    document.getElementById("questionsList");

const puzzlesList =
    document.getElementById("puzzlesList");

const homePuzzlePreview =
    document.getElementById("homePuzzlePreview");

const profileName =
    document.getElementById("profileName");

const profileUsername =
    document.getElementById("profileUsername");

const profileEmoji =
    document.getElementById("profileEmoji");

const profileCoins =
    document.getElementById("profileCoins");

const profileLevel =
    document.getElementById("profileLevel");

const profileButton =
    document.getElementById("profileButton");

const logoutButton =
    document.getElementById("logoutButton");

const toast =
    document.getElementById("toast");


// ======================================================
// DATA
// ======================================================

let currentUser = null;

let currentUserData = null;

let subjects = {};

let chapters = {};

let questions = {};

let puzzles = {};

let selectedSubjectId = null;

let selectedChapterId = null;


// ======================================================
// TOAST
// ======================================================

let toastTimer = null;


function showToast(text) {

    if (!toast) {
        return;
    }

    toast.textContent = text;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(
        value ?? ""
    )
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


// ======================================================
// SCREEN NAVIGATION
// ======================================================

function openScreen(name) {

    document
        .querySelectorAll(".screen")
        .forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

            }
        );


    const screen =
        document.getElementById(
            name + "Screen"
        );


    if (!screen) {
        return;
    }


    screen.classList.add("active");


    document
        .querySelectorAll(".nav-button")
        .forEach(
            button => {

                button.classList.remove(
                    "active"
                );


                if (
                    button.dataset.open ===
                    name
                ) {

                    button.classList.add(
                        "active"
                    );

                }

            }
        );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (name === "subjects") {

        renderSubjects();

    }


    if (name === "puzzles") {

        renderPuzzles();

    }


    if (name === "home") {

        renderHomeSubjects();

        renderHomePuzzle();

    }

}


// ======================================================
// NAV BUTTONS
// ======================================================

document
    .querySelectorAll("[data-open]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openScreen(
                        button.dataset.open
                    );

                }
            );

        }
    );


// ======================================================
// BACK BUTTONS
// ======================================================

document
    .querySelectorAll("[data-back]")
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    openScreen(
                        button.dataset.back
                    );

                }
            );

        }
    );


// ======================================================
// PROFILE BUTTON
// ======================================================

profileButton.addEventListener(
    "click",
    () => {

        openScreen("profile");

    }
);


// ======================================================
// LOAD USER
// ======================================================

async function loadUser(user) {

    const snapshot =
        await get(
            ref(
                db,
                "users/" + user.uid
            )
        );


    if (!snapshot.exists()) {

        throw new Error(
            "User profile not found"
        );

    }


    currentUserData =
        snapshot.val();


    const name =
        currentUserData.fullName ||
        currentUserData.username ||
        "Student";


    const username =
        currentUserData.username ||
        "username";


    const coins =
        Number(
            currentUserData.coins || 0
        );


    const level =
        Number(
            currentUserData.level || 1
        );


    const emoji =
        currentUserData.profileEmoji ||
        "👤";


    welcomeName.textContent =
        name;


    coinValue.textContent =
        coins;


    levelValue.textContent =
        level;


    profileName.textContent =
        name;


    profileUsername.textContent =
        "@" + username;


    profileEmoji.textContent =
        emoji;


    profileCoins.textContent =
        coins;


    profileLevel.textContent =
        level;


    profileButton.textContent =
        emoji;

}


// ======================================================
// LOAD SUBJECTS
// ======================================================

async function loadSubjects() {

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "subjects"
                )
            );


        if (snapshot.exists()) {

            subjects =
                snapshot.val();

        } else {

            subjects = {};

        }


        renderHomeSubjects();

        renderSubjects();


    } catch (error) {

        console.error(
            "Load subjects error:",
            error
        );


        showToast(
            "Subjects load করা যায়নি।"
        );


        if (homeSubjects) {

            homeSubjects.innerHTML = `
                <div class="empty-card">
                    Subjects load করা যায়নি।
                </div>
            `;

        }

    }

}


// ======================================================
// RENDER HOME SUBJECTS
// ======================================================

function renderHomeSubjects() {

    if (!homeSubjects) {
        return;
    }


    const entries =
        Object.entries(
            subjects
        ).slice(0, 4);


    if (entries.length === 0) {

        homeSubjects.innerHTML = `
            <div class="empty-card">
                এখনো কোনো Subject নেই।
            </div>
        `;

        return;

    }


    homeSubjects.innerHTML =
        entries.map(
            ([id, subject]) => {

                return `
                    <button
                        class="subject-card"
                        data-subject="${escapeHTML(id)}"
                    >

                        <div class="subject-icon">
                            ${escapeHTML(
                                subject.icon || "📚"
                            )}
                        </div>

                        <strong>
                            ${escapeHTML(
                                subject.nameBn ||
                                subject.name ||
                                "Subject"
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                subject.nameEn ||
                                subject.name ||
                                ""
                            )}
                        </small>

                    </button>
                `;

            }
        ).join("");


    attachSubjectEvents(
        homeSubjects
    );

}


// ======================================================
// RENDER ALL SUBJECTS
// ======================================================

function renderSubjects() {

    if (!subjectsList) {
        return;
    }


    const entries =
        Object.entries(
            subjects
        );


    if (entries.length === 0) {

        subjectsList.innerHTML = `
            <div class="empty-card">
                📚 এখনো কোনো Subject যোগ করা হয়নি।
            </div>
        `;

        return;

    }


    subjectsList.innerHTML =
        entries.map(
            ([id, subject]) => {

                return `
                    <button
                        class="subject-card"
                        data-subject="${escapeHTML(id)}"
                    >

                        <div class="subject-icon">
                            ${escapeHTML(
                                subject.icon || "📚"
                            )}
                        </div>

                        <strong>
                            ${escapeHTML(
                                subject.nameBn ||
                                subject.name ||
                                "Subject"
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                subject.nameEn ||
                                subject.name ||
                                ""
                            )}
                        </small>

                    </button>
                `;

            }
        ).join("");


    attachSubjectEvents(
        subjectsList
    );

}


// ======================================================
// SUBJECT EVENTS
// ======================================================

function attachSubjectEvents(container) {

    container
        .querySelectorAll(
            "[data-subject]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const id =
                            button.dataset.subject;

                        openSubject(
                            id
                        );

                    }
                );

            }
        );

}


// ======================================================
// OPEN SUBJECT
// ======================================================

async function openSubject(id) {

    selectedSubjectId =
        id;


    const subject =
        subjects[id];


    if (!subject) {
        return;
    }


    const title =
        document.getElementById(
            "chapterTitle"
        );


    title.textContent =
        `${subject.icon || "📚"} ${
            subject.nameBn ||
            subject.name ||
            "Subject"
        }`;


    openScreen("chapters");


    await loadChapters(
        id
    );

}


// ======================================================
// LOAD CHAPTERS
// ======================================================

async function loadChapters(
    subjectId
) {

    if (!chaptersList) {
        return;
    }


    chaptersList.innerHTML = `
        <div class="empty-card">
            Chapters লোড হচ্ছে...
        </div>
    `;


    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "chapters"
                )
            );


        chapters =
            snapshot.exists()
                ? snapshot.val()
                : {};


        const filtered =
            Object.entries(
                chapters
            )
            .filter(
                ([id, chapter]) =>
                    String(
                        chapter.subjectId
                    ) ===
                    String(
                        subjectId
                    )
            );


        if (filtered.length === 0) {

            chaptersList.innerHTML = `
                <div class="empty-card">
                    📖 এই Subject-এ এখনো কোনো Chapter নেই।
                </div>
            `;

            return;

        }


        chaptersList.innerHTML =
            filtered.map(
                ([id, chapter]) => {

                    return `
                        <button
                            class="chapter-card"
                            data-chapter="${escapeHTML(id)}"
                        >

                            <div class="chapter-icon">
                                📖
                            </div>

                            <div>

                                <strong>
                                    ${escapeHTML(
                                        chapter.nameBn ||
                                        chapter.name ||
                                        "Chapter"
                                    )}
                                </strong>

                                <small>
                                    ${escapeHTML(
                                        chapter.name ||
                                        ""
                                    )}
                                </small>

                            </div>

                        </button>
                    `;

                }
            ).join("");


        chaptersList
            .querySelectorAll(
                "[data-chapter]"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            openChapter(
                                button.dataset.chapter
                            );

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            "Load chapters error:",
            error
        );


        chaptersList.innerHTML = `
            <div class="empty-card">
                Chapters load করা যায়নি।
            </div>
        `;

    }

}


// ======================================================
// OPEN CHAPTER
// ======================================================

async function openChapter(
    chapterId
) {

    selectedChapterId =
        chapterId;


    const chapter =
        chapters[chapterId];


    if (!chapter) {
        return;
    }


    document.getElementById(
        "questionsTitle"
    ).textContent =
        `📝 ${
            chapter.nameBn ||
            chapter.name ||
            "Questions"
        }`;


    openScreen(
        "questions"
    );


    await loadQuestions(
        chapterId
    );

}


// ======================================================
// LOAD QUESTIONS
// ======================================================

async function loadQuestions(
    chapterId
) {

    questionsList.innerHTML = `
        <div class="empty-card">
            Questions লোড হচ্ছে...
        </div>
    `;


    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "questions"
                )
            );


        questions =
            snapshot.exists()
                ? snapshot.val()
                : {};


        const filtered =
            Object.entries(
                questions
            )
            .filter(
                ([id, question]) =>
                    String(
                        question.chapterId
                    ) ===
                    String(
                        chapterId
                    )
            );


        if (filtered.length === 0) {

            questionsList.innerHTML = `
                <div class="empty-card">
                    📝 এই Chapter-এ এখনো কোনো Question নেই।
                </div>
            `;

            return;

        }


        questionsList.innerHTML =
            filtered.map(
                ([id, question]) => {

                    const type =
                        String(
                            question.type ||
                            "short"
                        ).toLowerCase();


                    const isBig =
                        type === "big";


                    return `
                        <article
                            class="question-card"
                        >

                            <span class="question-type">

                                ${
                                    isBig
                                        ? "📄 Big Question"
                                        : "📝 Short Question"
                                }

                            </span>


                            <div class="question-text">

                                ${escapeHTML(
                                    question.questionBn ||
                                    question.question ||
                                    ""
                                )}

                            </div>


                            <div class="answer-box">

                                <div class="answer-label">
                                    উত্তর
                                </div>

                                <div class="answer-text">

                                    ${escapeHTML(
                                        question.answerBn ||
                                        question.answer ||
                                        ""
                                    )}

                                </div>

                            </div>


                            <div class="marks">

                                ${
                                    Number(
                                        question.coins ||
                                        question.marks ||
                                        0
                                    )
                                }
                                ${
                                    question.coins
                                        ? "🪙 Coins"
                                        : "Marks"
                                }

                            </div>

                        </article>
                    `;

                }
            ).join("");


    } catch (error) {

        console.error(
            "Load questions error:",
            error
        );


        questionsList.innerHTML = `
            <div class="empty-card">
                Questions load করা যায়নি।
            </div>
        `;

    }

}


// ======================================================
// LOAD PUZZLES
// ======================================================

async function loadPuzzles() {

    try {

        const snapshot =
            await get(
                ref(
                    db,
                    "puzzles"
                )
            );


        puzzles =
            snapshot.exists()
                ? snapshot.val()
                : {};


        renderPuzzles();

        renderHomePuzzle();


    } catch (error) {

        console.error(
            "Load puzzles error:",
            error
        );


        if (puzzlesList) {

            puzzlesList.innerHTML = `
                <div class="empty-card">
                    Puzzle load করা যায়নি।
                </div>
            `;

        }

    }

}


// ======================================================
// RENDER HOME PUZZLE
// ======================================================

function renderHomePuzzle() {

    if (!homePuzzlePreview) {
        return;
    }


    const entries =
        Object.entries(
            puzzles
        ).slice(0, 1);


    if (entries.length === 0) {

        homePuzzlePreview.innerHTML = `
            <div class="empty-card">
                🧩 এখনো কোনো Puzzle নেই।
            </div>
        `;

        return;

    }


    const [
        id,
        puzzle
    ] =
        entries[0];


    homePuzzlePreview.innerHTML = `

        <div class="puzzle-card-full">

            <div class="puzzle-top">

                <span class="puzzle-label">
                    🧩 Daily Puzzle
                </span>

                <span class="puzzle-reward">
                    🪙 ${Number(
                        puzzle.coins || 0
                    )}
                </span>

            </div>

            <div class="puzzle-question">

                ${escapeHTML(
                    puzzle.questionBn ||
                    puzzle.question ||
                    ""
                )}

            </div>

            <button
                class="puzzle-submit"
                id="homePuzzleButton"
            >
                Puzzle খুলুন
            </button>

        </div>
    `;


    document
        .getElementById(
            "homePuzzleButton"
        )
        .addEventListener(
            "click",
            () => {

                openScreen(
                    "puzzles"
                );

                renderPuzzles();

            }
        );

}


// ======================================================
// RENDER PUZZLES
// ======================================================

function renderPuzzles() {

    if (!puzzlesList) {
        return;
    }


    const entries =
        Object.entries(
            puzzles
        );


    if (entries.length === 0) {

        puzzlesList.innerHTML = `
            <div class="empty-card">
                🧩 এখনো কোনো Puzzle নেই।
            </div>
        `;

        return;

    }


    puzzlesList.innerHTML =
        entries.map(
            ([id, puzzle]) => {

                const options =
                    puzzle.options ||
                    {};


                return `

                    <article
                        class="puzzle-card-full"
                        data-puzzle="${escapeHTML(id)}"
                    >

                        <div class="puzzle-top">

                            <span class="puzzle-label">
                                🧩 Puzzle
                            </span>

                            <span class="puzzle-reward">
                                🪙 ${Number(
                                    puzzle.coins || 0
                                )}
                            </span>

                        </div>


                        <div class="puzzle-question">

                            ${escapeHTML(
                                puzzle.questionBn ||
                                puzzle.question ||
                                ""
                            )}

                        </div>


                        <div class="puzzle-options">

                            ${createPuzzleOption(
                                id,
                                "A",
                                options.A
                            )}

                            ${createPuzzleOption(
                                id,
                                "B",
                                options.B
                            )}

                            ${createPuzzleOption(
                                id,
                                "C",
                                options.C
                            )}

                            ${createPuzzleOption(
                                id,
                                "D",
                                options.D
                            )}

                        </div>


                        <button
                            class="puzzle-submit"
                            data-submit-puzzle="${escapeHTML(id)}"
                        >
                            উত্তর দিন
                        </button>


                        <div
                            class="puzzle-result"
                            id="result-${escapeHTML(id)}"
                        ></div>

                    </article>

                `;

            }
        ).join("");


    attachPuzzleEvents();

}


// ======================================================
// CREATE PUZZLE OPTION
// ======================================================

function createPuzzleOption(
    puzzleId,
    key,
    value
) {

    return `

        <button
            class="puzzle-option"
            data-option-puzzle="${escapeHTML(
                puzzleId
            )}"
            data-option="${key}"
        >

            <strong>
                ${key}.
            </strong>

            ${escapeHTML(
                value || ""
            )}

        </button>

    `;

}


// ======================================================
// PUZZLE EVENTS
// ======================================================

function attachPuzzleEvents() {


    // -----------------------------------------------
    // SELECT OPTION
    // -----------------------------------------------

    document
        .querySelectorAll(
            "[data-option-puzzle]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const puzzleId =
                            button.dataset
                                .optionPuzzle;


                        const parent =
                            button.closest(
                                ".puzzle-card-full"
                            );


                        parent
                            .querySelectorAll(
                                ".puzzle-option"
                            )
                            .forEach(
                                option => {

                                    option.classList.remove(
                                        "selected"
                                    );

                                }
                            );


                        button.classList.add(
                            "selected"
                        );

                    }
                );

            }
        );


    // -----------------------------------------------
    // SUBMIT
    // -----------------------------------------------

    document
        .querySelectorAll(
            "[data-submit-puzzle]"
        )
        .forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        submitPuzzle(
                            button.dataset
                                .submitPuzzle
                        );

                    }
                );

            }
        );

}


// ======================================================
// SUBMIT PUZZLE
// ======================================================

function submitPuzzle(
    puzzleId
) {

    const puzzle =
        puzzles[puzzleId];


    if (!puzzle) {
        return;
    }


    const card =
        document.querySelector(
            `[data-puzzle="${CSS.escape(
                puzzleId
            )}"]`
        );


    if (!card) {
        return;
    }


    const selected =
        card.querySelector(
            ".puzzle-option.selected"
        );


    if (!selected) {

        showToast(
            "একটি উত্তর নির্বাচন করুন।"
        );

        return;

    }


    const selectedAnswer =
        selected.dataset.option;


    /*
     * Your Firebase rules expect:
     *
     * puzzles/$puzzleId
     * └── answer
     *
     * But older admin.js may have used
     * correctAnswer.
     *
     * Support both here.
     */

    const correctAnswer =
        puzzle.answer ||
        puzzle.correctAnswer;


    const result =
        card.querySelector(
            ".puzzle-result"
        );


    if (!correctAnswer) {

        result.className =
            "puzzle-result wrong";

        result.textContent =
            "এই Puzzle-এর correct answer সেট করা নেই।";

        return;

    }


    if (
        String(
            selectedAnswer
        ).toUpperCase() ===
        String(
            correctAnswer
        ).toUpperCase()
    ) {

        const reward =
            Number(
                puzzle.coins || 0
            );


        result.className =
            "puzzle-result correct";


        result.textContent =
            `🎉 সঠিক উত্তর! আপনি ${reward} Coins জিতেছেন।`;


        /*
         * IMPORTANT:
         *
         * We are NOT writing coins to Firebase here.
         *
         * Your current Firebase rules intentionally
         * prevent normal users from changing:
         *
         * users/$uid/coins
         *
         * This protects the coin system.
         *
         * A trusted backend will be needed later
         * to actually award the coins.
         */


        card
            .querySelectorAll(
                ".puzzle-option"
            )
            .forEach(
                option => {

                    option.disabled =
                        true;

                }
            );


        buttonDisable(
            card
        );


    } else {

        result.className =
            "puzzle-result wrong";


        result.textContent =
            "❌ ভুল উত্তর। আবার চেষ্টা করুন।";

    }

}


// ======================================================
// DISABLE PUZZLE
// ======================================================

function buttonDisable(card) {

    const submit =
        card.querySelector(
            ".puzzle-submit"
        );


    if (submit) {

        submit.disabled =
            true;

        submit.textContent =
            "Completed ✓";

        submit.style.opacity =
            "0.6";

    }

}


// ======================================================
// LOGOUT
// ======================================================

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await signOut(
                auth
            );


            window.location.replace(
                "login.html"
            );


        } catch (error) {

            console.error(
                "Logout error:",
                error
            );


            showToast(
                "Logout করা যায়নি।"
            );

        }

    }
);


// ======================================================
// AUTH
// ======================================================

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            window.location.replace(
                "login.html"
            );

            return;

        }


        currentUser =
            user;


        try {

            await loadUser(
                user
            );


            await loadSubjects();


            await loadPuzzles();


            loadingScreen.classList.add(
                "hidden"
            );


            app.classList.remove(
                "hidden"
            );


            openScreen(
                "home"
            );


        } catch (error) {

            console.error(
                "Home initialization error:",
                error
            );


            loadingScreen.innerHTML = `

                <div style="
                    text-align:center;
                    padding:25px;
                ">

                    <h2>
                        ⚠️ Pocket Edu
                    </h2>

                    <p style="
                        color:#9da7bd;
                        margin-top:10px;
                    ">
                        Account data load করা যায়নি।
                    </p>

                </div>

            `;

        }

    }
);