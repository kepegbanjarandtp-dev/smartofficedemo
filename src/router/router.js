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
} from "../scripts/smartoffice_cuti_script";


/* ======================================================
   PAGE INITIALIZER
====================================================== */
const smartofficePageInitializer = {

    smartoffice_login:
        smartofficeLoadLoginPage,

    smartoffice_dashboard:
        smartofficeLoadDashboardPage,

    smartoffice_cuti:
        smartofficeLoadCutiPage

};

/* ======================================================
   LOAD PAGE
====================================================== */
export async function smartofficeLoadPage(page){

    const response =
        await fetch(
            `/pages/${page}.html`
        );

    if(!response.ok){

        throw new Error(
            `Halaman ${page} tidak ditemukan`
        );

    }

    const html =
        await response.text();

    document
        .getElementById("app")
        .innerHTML =
        html;

    const initializer =
        smartofficePageInitializer[
            page
        ];

    if(typeof initializer === "function"){

        await initializer();

    }

}


/* ======================================================
   GLOBAL FUNCTIONS
====================================================== */
window.smartofficeLoadPage =
    smartofficeLoadPage;

