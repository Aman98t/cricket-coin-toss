"use strict";

/*
=========================================================
CRICKET COIN TOSS
=========================================================

Logic:

1. Clicking the entire coin secretly prepares HEADS.
2. Nothing visible happens.
3. Clicking TOSS:
   - If HEADS was secretly prepared -> HEADS.
   - Otherwise -> random HEADS/TAILS.
4. Coin performs a 3D flip.
5. Animation ends on the correct face.
6. Secret state is immediately cleared.

=========================================================
*/


/* ========================================================
   DOM ELEMENTS
======================================================== */

const coinButton = document.getElementById("coinButton");
const coin = document.getElementById("coin");

const tossButton = document.getElementById("tossButton");

const resultText = document.getElementById("resultText");
const resultLabel = document.getElementById("resultLabel");
const statTotal = document.getElementById("statTotal");
const statHeads = document.getElementById("statHeads");
const statTails = document.getElementById("statTails");


/* ========================================================
   GAME STATE
======================================================== */

/*
    null  -> no secret result selected
    HEADS -> next toss is forced to HEADS
*/
let secretResult = null;


/*
    Prevent multiple interactions while
    the coin is currently flipping.
*/
let isFlipping = false;


/*
    Keep track of the coin's current Y rotation.

    0 degrees   = HEADS
    180 degrees = TAILS
    360 degrees = HEADS again
*/
let currentRotation = 0;


/* ========================================================
   CONFIGURATION
======================================================== */

const FLIP_DURATION = 3000;


/* ========================================================
   SECRET COIN CLICK
======================================================== */

/*
    The ENTIRE coin button is clickable.

    IMPORTANT:
    There is intentionally NO visible feedback here.

    The opponent should not see:
    - text
    - animation
    - glow
    - sound
    - color change
    - notification
*/
coinButton.addEventListener("click", () => {

    /*
        Don't allow secret selection during a toss.
    */
    if (isFlipping) {
        return;
    }

    /*
        Secretly prepare HEADS.
    */
    secretResult = "HEADS";

    /*
        Intentionally nothing else happens.
    */
});


/* ========================================================
   TOSS BUTTON
======================================================== */

tossButton.addEventListener("click", () => {

    /*
        Prevent double clicks.
    */
    if (isFlipping) {
        return;
    }

    startToss();
});


/* ========================================================
   START TOSS
======================================================== */

function startToss() {

    isFlipping = true;

    /*
        Disable both interaction paths while
        the animation is running.
    */
    tossButton.disabled = true;

    coinButton.classList.add("tossing");

    /*
        Hide previous result.
    */
    hideResult();

    /*
        Determine result BEFORE animation.

        If secretResult exists:
            use HEADS

        Otherwise:
            genuinely random result
    */
    const result = determineResult();


    /*
        Clear the secret immediately after consuming it.

        This is important.

        If the user secretly clicked the coin,
        only THIS toss should be forced to HEADS.

        The following toss goes random unless
        the coin is secretly clicked again.
    */
    secretResult = null;


    /*
        Animate coin to the correct face.
    */
    animateCoin(result);
}


/* ========================================================
   DETERMINE RESULT
======================================================== */

function determineResult() {

    /*
        SECRET MODE
    */
    if (secretResult !== null) {

        return secretResult;
    }


    /*
        NORMAL RANDOM MODE

        Math.random() gives:

        0 <= number < 1

        Less than 0.5 -> HEADS
        Otherwise     -> TAILS
    */
    return Math.random() < 0.49
        ? "HEADS"
        : "TAILS";
}


/* ========================================================
   COIN ANIMATION
======================================================== */

function animateCoin(result) {

    /*
        Remove previous transition.

        This allows us to establish a clean
        starting point before every toss.
    */
    coin.style.transition = "none";


    /*
        Remove landing animation.
    */
    coin.classList.remove("landed");


    /*
        Force browser reflow.

        Without this, some browsers may combine
        the reset and new transform into one operation.
    */
    void coin.offsetWidth;


    /*
        Number of full rotations.

        6 full spins = 2160 degrees.

        This gives a convincing flip without
        taking too long.
    */
    const fullSpins = 6;

    const spinDegrees = fullSpins * 360;


    /*
        Normalize current rotation.

        This prevents the number from becoming
        unnecessarily huge after many tosses.
    */
    currentRotation = currentRotation % 360;


    /*
        Calculate final rotation.

        HEADS:
            ends on 0-degree orientation

        TAILS:
            ends on 180-degree orientation
    */
    let targetRotation;

    if (result === "HEADS") {

        /*
            If current orientation is already near
            HEADS, still add a complete sequence of spins.
        */
        targetRotation =
            currentRotation +
            spinDegrees +
            getShortestFaceAdjustment(
                currentRotation,
                0
            );

    } else {

        targetRotation =
            currentRotation +
            spinDegrees +
            getShortestFaceAdjustment(
                currentRotation,
                180
            );
    }


    /*
        Store target as current rotation
        for the next toss.
    */
    currentRotation = targetRotation;


    /*
        Build a combined movement.

        The coin:
        - rises
        - rotates
        - tilts slightly
        - comes back down
    */
    const startTransform =
        "translateY(0px) rotateX(4deg) rotateY(" +
        (currentRotation - spinDegrees -
            getShortestFaceAdjustment(
                currentRotation - spinDegrees,
                result === "HEADS" ? 0 : 180
            )) +
        "deg)";


    /*
        Calculate tilt and vertical movement
        for a realistic toss.
    */

    /*
        We animate from the current rotation.

        CSS transition handles the rotation.
    */
    coin.style.transform = startTransform;


    /*
        Force the starting transform to render.
    */
    void coin.offsetWidth;


    /*
        Smooth deceleration.

        Cubic-bezier:
        fast initially -> gradually slows down.
    */
    coin.style.transition =
        `transform ${FLIP_DURATION}ms cubic-bezier(0.12, 0.72, 0.16, 1)`;


    /*
        Apply final position.

        rotateX adds a subtle 3D perspective.
    */
    coin.style.transform =
        `translateY(-8px)
         rotateX(4deg)
         rotateY(${targetRotation}deg)`;


    /*
        Add temporary shadow effect.
    */
    coin.classList.add("tossing");


    /*
        Finish after the animation.
    */
    window.setTimeout(() => {

        finishToss(result, targetRotation);

    }, FLIP_DURATION + 30);
}


/* ========================================================
   FACE ADJUSTMENT
======================================================== */

function getShortestFaceAdjustment(current, desiredFace) {

    /*
        Current orientation modulo 360.
    */
    const normalized =
        ((current % 360) + 360) % 360;


    /*
        Difference between desired face
        and current orientation.
    */
    let difference =
        desiredFace - normalized;


    /*
        Normalize to 0...360.

        We specifically want to continue
        FORWARD rather than reverse.
    */
    difference =
        ((difference % 360) + 360) % 360;


    return difference;
}


/* ========================================================
   FINISH TOSS
======================================================== */

function finishToss(result, targetRotation) {

    /*
        Make sure the coin is exactly at the
        mathematically correct final orientation.
    */
    currentRotation = targetRotation;

    coin.style.transition = "none";

    coin.style.transform =
        `translateY(0px)
         rotateX(4deg)
         rotateY(${targetRotation}deg)`;


    /*
        Add small landing bounce.
    */
    coin.classList.remove("landed");

    void coin.offsetWidth;

    coin.classList.add("landed");


    /*
        Remove toss state.
    */
    coin.classList.remove("tossing");

    coinButton.classList.remove("tossing");


    /*
        Display result.
    */
    showResult(result);
    /* --- NAYA CODE: STATS UPDATE KAREIN --- */
    stats.total += 1;
    if (result === "HEADS") {
        stats.heads += 1;
    } else {
        stats.tails += 1;
    }
    
    // Browser storage mein save karein
    localStorage.setItem("cricketTossStats", JSON.stringify(stats));
    
    // Screen par naye numbers update karein
    updateStatsUI();
    /* -------------------------------------- */

    /*
        Re-enable controls.
    */
    isFlipping = false;

    tossButton.disabled = false;


    


    /*
        Remove landing class after animation.
    */
    window.setTimeout(() => {

        coin.classList.remove("landed");

    }, 300);
}


/* ========================================================
   SHOW RESULT
======================================================== */

function showResult(result) {

    resultLabel.textContent = "TOSS RESULT";

    resultText.textContent = result;

    /*
        Trigger CSS reveal animation.
    */
    requestAnimationFrame(() => {

        resultText.classList.add("show");

    });
}


/* ========================================================
   HIDE RESULT
======================================================== */

function hideResult() {

    resultText.classList.remove("show");

    resultLabel.textContent = "TOSSING...";

    resultText.textContent = "—";
}


/* ========================================================
   STATS TRACKING
======================================================== */
let stats = JSON.parse(localStorage.getItem("cricketTossStats")) || {
    total: 0,
    heads: 0,
    tails: 0
};

// Page load hote hi purane stats UI par dikhayein
updateStatsUI();

function updateStatsUI() {
    statTotal.textContent = stats.total;
    statHeads.textContent = stats.heads;
    statTails.textContent = stats.tails;
}

