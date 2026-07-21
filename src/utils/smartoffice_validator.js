/* ======================================================
   VALIDATOR
====================================================== */
export function smartofficeIsEmpty(value){
    return (
        value === null ||
        value === undefined ||
        value === ""
    );
}

export function smartofficeIsNumber(value){
    return !isNaN(value);
}

export function smartofficeIsEmail(email){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);
}

export function smartofficeIsPhone(phone){
    return /^[0-9+\- ]+$/
        .test(phone);
}