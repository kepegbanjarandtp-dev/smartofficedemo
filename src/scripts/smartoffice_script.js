import { smartofficeLoadPage }
from "../router/router.js";

import {
    smartofficeCheckSession,
    smartofficeGetSession
}
from "../session/smartoffice_session.js";

import {
    smartofficeShowToast
}
from "../components/toast.js";

import {
    smartofficeRenderMobileNavbar
}
from "../components/navbar.js";

import {
    smartofficeFormatTanggalJamFrontend,
    smartofficeFormatTanggalSuratFrontend,
    smartofficeParseTanggalBukuTamu
}
from "../helpers/smartoffice_date.js";

/* ======================================================
   SMART OFFICE APP INIT
====================================================== */
window.addEventListener("DOMContentLoaded", async () => {

  /* =========================
     CEK SESSION
  ========================= */
  const session =
    JSON.parse(
      localStorage.getItem(
        "smartoffice_session"
      )
    );

  /* =========================
     SUDAH LOGIN
  ========================= */
  if(session){
    await smartofficeLoadPage(
      "smartoffice_dashboard"
    );

    if(
      typeof smartofficeLoadDashboardPage ===
      "function"
    ){
      smartofficeLoadDashboardPage();
    }

    return;
  }

  /* =========================
     BELUM LOGIN
  ========================= */
  await smartofficeLoadPage(
    "smartoffice_login"
  );

  if(
    typeof smartofficeLoadLoginPage ===
    "function"
  ){

    smartofficeLoadLoginPage();
  }
});






