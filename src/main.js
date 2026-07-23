/* ======================================================
   SMARTOFFICE V2
====================================================== */
import {
    smartofficeInitializeRouter
}
from "./core/router.js";

import "./styles/global.css";
import "./styles/variables.css";
import "./styles/animation.css";
import "./styles/responsive.css";

document.addEventListener(

    "DOMContentLoaded",

    async ()=>{

        console.log(
            "SmartOffice V2 Started"
        );

        await smartofficeInitializeRouter();

    }

);