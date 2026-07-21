import {
    smartofficeLogin
}
from "../services/smartoffice_api.js";

import {
    smartofficeLoadPage
}
from "../router/router.js";

import {
    smartofficeSaveSession,
    smartofficeStartActivityMonitor
}
from "../session/smartoffice_session.js";

import {
    smartofficeShowToast
}
from "../components/toast.js";

import "../styles/smartoffice_style.css";
import "../styles/smartoffice_login_style.css";

/* ======================================================
   LOAD LOGIN PAGE
====================================================== */

export function smartofficeLoadLoginPage(){

    /* =========================
       REMOVE MOBILE NAVBAR
    ========================= */
    const navbar =
        document.getElementById(
            "smartofficeMobileNavbarFixed"
        );

    if(
        navbar
    ){
        navbar.remove();
    }

    /* =========================
       GET ELEMENT
    ========================= */
    const nipInput =
        document.getElementById(
            "smartofficeLoginNipInput"
        );

    const passwordInput =
        document.getElementById(
            "smartofficeLoginPasswordInput"
        );

    const loginButton =
        document.getElementById(
            "smartofficeLoginButton"
        );

    const togglePasswordButton =
        document.getElementById(
            "smartofficeTogglePasswordButton"
        );

    const rememberCheckbox =
        document.querySelector(
            ".smartoffice-login-checkbox input"
        );

    /* =========================
       VALIDASI ELEMENT
    ========================= */
    if(
        !nipInput ||
        !passwordInput ||
        !loginButton
    ){
        return;
    }

    /* =========================
       AUTO FOCUS
    ========================= */
    nipInput.focus();

    /* =========================
       RESTORE REMEMBER ME
    ========================= */
    const savedNip =
        localStorage.getItem(
            "smartoffice_saved_nip"
        );

    const savedPassword =
        localStorage.getItem(
            "smartoffice_saved_password"
        );

    nipInput.value =
        savedNip || "";

    passwordInput.value =
        savedPassword || "";

    if(
        rememberCheckbox
    ){
        rememberCheckbox.checked =
            !!savedPassword;
    }

    /* =========================
       RESET LOGIN BUTTON
    ========================= */
    loginButton.disabled =
        false;

    loginButton.innerHTML =
        "Masuk ke Smart Office";

    /* =========================
       LOGIN BUTTON
    ========================= */
    loginButton.onclick =
        smartofficeHandleLogin;

    /* =========================
       PASSWORD TOGGLE
    ========================= */
    if(
        togglePasswordButton
    ){
        togglePasswordButton.onclick =
            smartofficeTogglePassword;
    }

    /* =========================
       ENTER LOGIN
    ========================= */
    const handleEnter =
        function(event){

            if(
                event.key === "Enter"
            ){
                smartofficeHandleLogin();
            }

        };

    nipInput.onkeydown =
        handleEnter;

    passwordInput.onkeydown =
        handleEnter;

}



/* ==========================================================================
   SMART OFFICE TOGGLE PASSWORD
========================================================================== */

/* =========================
   TOGGLE PASSWORD VISIBILITY

   FUNCTION:
   Menampilkan / menyembunyikan
   password login user.
========================= */
function smartofficeTogglePassword(){

    /* =========================
       INPUT PASSWORD
    ========================= */
    const passwordInput =
        document.getElementById(
            "smartofficeLoginPasswordInput"
        );

    /* =========================
       EYE ICON
    ========================= */
    const eyeIcon =
        document.getElementById(
            "smartofficePasswordEyeIcon"
        );

    /* =========================
       VALIDASI ELEMENT
    ========================= */
    if(
        !passwordInput ||
        !eyeIcon
    ){
        return;
    }

    /* =========================
       SHOW PASSWORD
    ========================= */
    if(
        passwordInput.type ===
        "password"
    ){

        passwordInput.type =
            "text";

        eyeIcon.innerHTML = `
            <path d="m3 3 18 18"/>
            <path d="M10.58 10.58A2 2 0 0 0 12 14a2 2 0 0 0 1.42-.58"/>
            <path d="M9.88 5.09A9.77 9.77 0 0 1 12 5c6.5 0 10 7 10 7a17.73 17.73 0 0 1-2.16 3.19"/>
            <path d="M6.61 6.61A17.9 17.9 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
        `;

        return;
    }

    /* =========================
       HIDE PASSWORD
    ========================= */
    passwordInput.type =
        "password";

    eyeIcon.innerHTML = `
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/>
        <circle
            cx="12"
            cy="12"
            r="3"
        />
    `;

}



/* ==========================================================================
   SMART OFFICE LOGIN HANDLER
========================================================================== */

/* ======================================================
   LOGIN PROCESS
====================================================== */

/* =========================
   HANDLE LOGIN

   FLOW:
   1. Ambil input
   2. Validasi form
   3. Loading button
   4. Request login
   5. Save session
   6. Redirect dashboard
========================= */
async function smartofficeHandleLogin(){

    /* =========================
       INPUT NIP
    ========================= */
    const inputNip =
        document.getElementById(
            "smartofficeLoginNipInput"
        );

    /* =========================
       INPUT PASSWORD
    ========================= */
    const inputPassword =
        document.getElementById(
            "smartofficeLoginPasswordInput"
        );

    /* =========================
       LOGIN BUTTON
    ========================= */
    const loginButton =
        document.getElementById(
            "smartofficeLoginButton"
        );

    /* =========================
       VALIDASI ELEMENT
    ========================= */
    if(
        !inputNip ||
        !inputPassword ||
        !loginButton
    ){
        return;
    }

    /* =========================
       VALUE
    ========================= */
    const nip =
        inputNip.value.trim();

    const password =
        inputPassword.value.trim();

    /* =========================
       REMEMBER ME
    ========================= */
    const rememberCheckbox =
        document.querySelector(
            ".smartoffice-login-checkbox input"
        );

    const rememberMe =
        rememberCheckbox
            ? rememberCheckbox.checked
            : false;

    /* =========================
       VALIDASI FORM
    ========================= */
    if(
        !nip ||
        !password
    ){

        smartofficeShowToast(
            "Lengkapi login terlebih dahulu",
            "error"
        );

        return;
    }

    /* =========================
       PREVENT DOUBLE CLICK
    ========================= */
    if(
        loginButton.disabled
    ){
        return;
    }

    /* =========================
       RESET BUTTON
    ========================= */
    const resetButton =
        function(){

            loginButton.disabled =
                false;

            loginButton.innerHTML =
                "Masuk ke Smart Office";

        };

    /* =========================
       BUTTON LOADING
    ========================= */
    loginButton.disabled =
        true;

    loginButton.innerHTML = `
        <div
            style="
                display:flex;
                align-items:center;
                justify-content:center;
                gap:10px;
            "
        >
            <div
                class="
                    smartoffice-button-spinner
                "
            ></div>

            <span>
                Memproses...
            </span>
        </div>
    `;

    try{

        /* =========================
           LOGIN REQUEST
        ========================= */
        const response =
            await smartofficeLogin(
                nip,
                password
            );

        /* =========================
           VALIDASI RESPONSE
        ========================= */
        if(
            !response ||
            !response.success
        ){

            resetButton();

            smartofficeShowToast(
                response?.message ||
                "Login gagal",
                "error"
            );

            return;
        }

        /* =========================
           SAVE SESSION
        ========================= */
        smartofficeSaveSession(
            response.data
        );

        /* =========================
          START ACTIVITY MONITOR
        ========================= */
        smartofficeStartActivityMonitor();

        /* =========================
           REMEMBER ME
        ========================= */
        if(
            rememberMe
        ){

            localStorage.setItem(
                "smartoffice_saved_nip",
                nip
            );

            localStorage.setItem(
                "smartoffice_saved_password",
                password
            );

        }

        else{

            localStorage.removeItem(
                "smartoffice_saved_nip"
            );

            localStorage.removeItem(
                "smartoffice_saved_password"
            );

        }

        /* =========================
           LOGIN SUCCESS
        ========================= */
        smartofficeShowToast(
            "Login berhasil",
            "success"
        );

        /* =========================
           LOAD DASHBOARD
        ========================= */
        await smartofficeLoadPage(
            "smartoffice_dashboard"
        );

    }

    catch(error){

        console.error(error);

        resetButton();

        smartofficeShowToast(
            "Terjadi kesalahan koneksi",
            "error"
        );

    }

}



