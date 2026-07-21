/* ======================================================
   SMART OFFICE API SERVICE
====================================================== */

import {
    SMARTOFFICE_CONFIG
}
from "../config/smartoffice_config";

/* ======================================================
   REQUEST API
====================================================== */
async function smartofficeRequest(
    action,
    data = {}
){

    const body = new URLSearchParams();

    body.append("action", action);

    Object.entries(data).forEach(([key, value]) => {
        body.append(key, value);
    });

    const response = await fetch(
        SMARTOFFICE_CONFIG.API_URL,
        {
            method: "POST",
            body
        }
    );

    console.log(
        "API",
        action,
        await response.clone().text()
    );

    return await response.json();

}

/* ======================================================
   GENERIC API
====================================================== */

export async function smartofficeApi(
    action,
    data = {}
){

    return await smartofficeRequest(
        action,
        data
    );

}

/* ======================================================
   LOGIN
====================================================== */
export async function smartofficeLogin(
    nip,
    password
){

    return smartofficeRequest(
        "login",
        {
            nip,
            password
        }
    );

}


/* ======================================================
   DASHBOARD STATS
====================================================== */
export async function smartofficeGetDashboardStats(
    nip
){

    return smartofficeRequest(
        "dashboardStats",
        {
            nip
        }
    );

}

/* ======================================================
   TOTAL PENDING APPROVAL
====================================================== */
export async function smartofficeGetTotalPendingApproval(
    nip
){

    return smartofficeRequest(
        "totalPendingApproval",
        {
            nip
        }
    );

}