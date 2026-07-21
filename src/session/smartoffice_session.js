/* ======================================================
   SMART OFFICE SESSION
====================================================== */
import {
    SMARTOFFICE_CONFIG
} from "../config/smartoffice_config.js";

/* ======================================================
   GET SESSION
====================================================== */
export function smartofficeGetSession(){
    const session =
        localStorage.getItem(
            SMARTOFFICE_CONFIG.SESSION_KEY
        );

    if(!session){
        return null;
    }

    try{
        return JSON.parse(session);
    }
    catch(error){
        return null;
    }
}

/* ======================================================
   CHECK SESSION
====================================================== */
export function smartofficeCheckSession(){

    const session =
        smartofficeGetSession();

    if(!session){
        return false;
    }

    const idleTime =
        Date.now() -
        session.lastActivity;

    const MAX_IDLE =
        30 * 60 * 1000;

    if(
        idleTime > MAX_IDLE
    ){
        smartofficeClearSession();
        return false;
    }

    return true;
}

/* ======================================================
   SAVE SESSION
====================================================== */
export function smartofficeSaveSession(data){
    const session = {
        ...data,
        loginTime: Date.now(),
        lastActivity: Date.now()
    };

    localStorage.setItem(
        SMARTOFFICE_CONFIG.SESSION_KEY,
        JSON.stringify(session)
    );
}

/* ======================================================
   UPDATE LAST ACTIVITY
====================================================== */
export function smartofficeUpdateLastActivity(){
    const session =
        smartofficeGetSession();

    if(!session){
        return;
    }

    session.lastActivity =
        Date.now();

    localStorage.setItem(
        SMARTOFFICE_CONFIG.SESSION_KEY,
        JSON.stringify(session)
    );
}

/* ======================================================
   MONITOR LAST ACTIVITY
====================================================== */

let smartofficeActivityMonitorStarted =
    false;

export function smartofficeStartActivityMonitor(){

    if(
        smartofficeActivityMonitorStarted
    ){
        return;
    }

    smartofficeActivityMonitorStarted =
        true;

    const events = [
        "click",
        "keydown",
        "touchstart",
        "scroll"
    ];

    events.forEach(function(eventName){
        window.addEventListener(
            eventName,
            smartofficeUpdateLastActivity,
            {
                passive:true
            }
        );
    });
}

/* ======================================================
   CLEAR SESSION
====================================================== */
export function smartofficeClearSession(){
    localStorage.removeItem(
        SMARTOFFICE_CONFIG.SESSION_KEY
    );
}