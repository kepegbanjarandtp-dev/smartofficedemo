import {
    smartofficeLoadPage
}
from "./router/router.js";

import {
    smartofficeCheckSession,
    smartofficeStartActivityMonitor
}
from "./session/smartoffice_session.js";

window.addEventListener(
    "DOMContentLoaded",
    async()=>{
        if(
            smartofficeCheckSession()
        ){
            smartofficeStartActivityMonitor();

            await smartofficeLoadPage(
                "smartoffice_dashboard"
            );
            return;
        }

        await smartofficeLoadPage(
            "smartoffice_login"
        );
    }
);