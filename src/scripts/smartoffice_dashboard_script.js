import {
    smartofficeCheckSession,
    smartofficeGetSession
}
from "../session/smartoffice_session.js";

import {
    smartofficeClearSession
} from "../session/smartoffice_session.js";

import {
    smartofficeLoadPage
} from "../router/router.js";

import {
    smartofficeGetDashboardStats,
    smartofficeGetTotalPendingApproval
} from "../services/smartoffice_api.js";

import {
    smartofficeRenderMobileNavbar
} from "../components/navbar.js";

import "../styles/smartoffice_dashboard_style.css";


/* ==========================================================================
   SMART OFFICE LOAD DASHBOARD PAGE
========================================================================== */

/* ======================================================
   LOAD DASHBOARD
====================================================== */

/* =========================
   LOAD DASHBOARD PAGE

   FLOW:
   1. Validate session
   2. Show dashboard
   3. Hide other page
   4. Render user info
   5. Filter role menu
   6. Render navbar
========================= */
export async function smartofficeLoadDashboardPage(){

  /* =========================
     VALIDATE SESSION
  ========================= */
  if(
    !smartofficeCheckSession()
  ){
    return;
  }

  /* =========================
     SESSION
  ========================= */
  const sessionData =
    smartofficeGetSession();

  if(
    !sessionData
  ){
    smartofficeLogout(false);

    return;
  }

  /* =========================
     USER ROLE
  ========================= */
  const userRole =
    sessionData.role;

  /* =========================
     APPROVAL BADGE
  ========================= */
  const approvalBadge =
    document.getElementById(
      "smartofficeApprovalBadge"
    );

  if(
    approvalBadge
  ){

    approvalBadge.textContent = "0";
    approvalBadge.classList.remove(
      "show"
    );
  }

  /* =========================
     DASHBOARD AVATAR
  ========================= */
  const avatarElement =
    document.getElementById(
      "smartofficeDashboardAvatar"
    );

  if(
    avatarElement
  ){
    avatarElement.innerText =
      (sessionData.nama || "?")
          .charAt(0)
          .toUpperCase();
  }

  /* =========================
     USER NAME
  ========================= */
  const userNameElement =
    document.getElementById(
      "smartofficeDashboardUserName"
    );

  if(
    userNameElement
  ){
    userNameElement.innerText =
      `Halo, ${sessionData.nama || "User"}`;
  }

  /* =========================
     MENU
  ========================= */
  const approvalMenu =
    document.getElementById(
      "smartofficeApprovalMenuCard"
    );

  const managementCutiMenu =
    document.getElementById(
      "smartofficeManagementCutiMenuCard"
    );

  const arsipMenu =
    document.getElementById(
      "smartofficeArsipMenuCard"
    );

  document
    .querySelectorAll(
      ".smartoffice-dashboard-menu-card"
    )
    .forEach(function(menu){
      menu.style.display = "";
    });

  /* =========================
     ROLE USER
  ========================= */
  if(
    userRole === "USER"
  ){
    if(
      approvalMenu
    ){
      approvalMenu.style.display =
        "none";
    }

    if(
      managementCutiMenu
    ){
      managementCutiMenu.style.display =
        "none";
    }

    if(
      arsipMenu
    ){
      arsipMenu.style.display =
        "none";
    }

    if(
      approvalBadge
    ){
      approvalBadge.classList.add(
        "hidden"
      );
    }
  }

  /* =========================
     ROLE ADMIN
  ========================= */
  else if(
    userRole === "ADMIN"
  ){
    if(
      approvalMenu
    ){
      approvalMenu.style.display =
        "none";
    }

    if(
      approvalBadge
    ){
      approvalBadge.classList.add(
        "hidden"
      );
    }
  }

  /* =========================
     LOADER
  ========================= */
  const loaderIds = [

      "smartofficeTotalCuti",
      "smartofficeApprovedCuti",
      "smartofficeTotalSpd",
      "smartofficeApprovedSpd"

  ];

  loaderIds.forEach(function(id){

      const element =
          document.getElementById(id);

      if(element){

          element.innerHTML =
              '<span class="smartoffice-mini-loader"></span>';

      }

  });

  /* =========================
     APPROVAL BADGE
  ========================= */
  if(
    userRole !== "USER"
  ){
    try{
      const total =
        await smartofficeGetTotalPendingApproval(
          sessionData.nip
        );

      setTimeout(function(){
        smartofficeUpdateApprovalBadge(
          total
        );
      },300);
    }

    catch(error){
      console.error(error);
    }
  }

  /* =========================
    SET STAT
  ========================= */
  function setStat(
      id,
      value
  ){

      const element =
          document.getElementById(id);

      if(
          element
      ){
          element.innerText =
              value ?? 0;
      }

  }

  /* =========================
     DASHBOARD STATS
  ========================= */
  try{
    const stats =
      await smartofficeGetDashboardStats(
          sessionData.nip
      ) || {};

    setStat(
        "smartofficeTotalCuti",
        stats.totalCuti
    );

    setStat(
        "smartofficeApprovedCuti",
        stats.approvedCuti
    );

    setStat(
        "smartofficeTotalSpd",
        stats.totalSpd
    );

    setStat(
        "smartofficeApprovedSpd",
        stats.approvedSpd
    );
  }

  catch(error){
    console.error(error);
  }

  /* =========================
     MOBILE NAVBAR
  ========================= */
  smartofficeRenderMobileNavbar(
    userRole,
    "home"
  );

  /* =========================
    DASHBOARD MENU
  ========================= */
  smartofficeInitDashboardMenu();

}


/* ======================================================
   UPDATE APPROVAL BADGE
====================================================== */
export function smartofficeUpdateApprovalBadge(
  total
){
  const badge =
    document.getElementById(
      "smartofficeApprovalBadge"
    );

  if(
    !badge
  ){
    return;
  }

  total =
    Number(total) || 0;

  /* =========================
     HIDE BADGE
  ========================= */
  if(
    total <= 0
  ){

    badge.textContent =
      "0";
    badge.classList.remove(
      "show"
    );

    return;
  }

  /* =========================
     SHOW BADGE
  ========================= */
  badge.textContent =
    String(total);
  badge.classList.add(
    "show"
    );
}


/* ======================================================
   LOGOUT
====================================================== */
export async function smartofficeLogout(){

    if(
        !confirm(
            "Yakin ingin keluar?"
        )
    ){
        return;
    }

    smartofficeClearSession();

    await smartofficeLoadPage(
        "smartoffice_login"
    );

}


/* ======================================================
   INIT DASHBOARD MENU
====================================================== */

function smartofficeInitDashboardMenu(){

  /* CUTI */
  document
    .getElementById(
      "smartofficeCutiMenuCard"
    )
    ?.addEventListener(
      "click",
      async function(){

        console.log("CUTI DIKLIK");

        await smartofficeLoadPage(
          "smartoffice_cuti"
        );

      }
    );

}


/* ======================================================
   GLOBAL FUNCTIONS (UNTUK HTML ONCLICK)
====================================================== */
window.smartofficeLoadDashboardPage =
    smartofficeLoadDashboardPage;