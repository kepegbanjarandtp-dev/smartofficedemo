/* ======================================================
   SMART OFFICE ROUTER
====================================================== */
import {
    smartofficeLoadLoginPage
}
from "../scripts/smartoffice_login_script.js";

import {
    smartofficeLoadDashboardPage
}
from "../scripts/smartoffice_dashboard_script.js";

import {
    smartofficeLoadCutiPage
} from "../scripts/smartoffice_cuti_script.js";

import {
    smartofficeLoadApprovalPage
} from "../scripts/smartoffice_approval_script.js";


/* ======================================================
   PAGE CACHE
====================================================== */
const smartofficePageCache = {};

/* ======================================================
   PAGE INITIALIZER
====================================================== */
const smartofficePageInitializer = {

    smartoffice_login:
        smartofficeLoadLoginPage,

    smartoffice_dashboard:
        smartofficeLoadDashboardPage,

    smartoffice_cuti:
        smartofficeLoadCutiPage,

    smartoffice_approval:
        smartofficeLoadApprovalPage

};

/* ======================================================
   LOAD PAGE
====================================================== */
export async function smartofficeLoadPage(page){

    let html;

    /* =========================
       CACHE
    ========================= */
    if(smartofficePageCache[page]){

        html = smartofficePageCache[page];

    }else{

        const response =
            await fetch(`/pages/${page}.html`);

        if(!response.ok){

            throw new Error(
                `Halaman ${page} tidak ditemukan`
            );

        }

        html = await response.text();

        smartofficePageCache[page] = html;

    }

    document
        .getElementById("app")
        .innerHTML = html;

    const initializer =
        smartofficePageInitializer[page];

    if(typeof initializer === "function"){

        await initializer();

    }

}

/* ======================================================
   GLOBAL FUNCTIONS
====================================================== */
window.smartofficeLoadPage =
    smartofficeLoadPage;
