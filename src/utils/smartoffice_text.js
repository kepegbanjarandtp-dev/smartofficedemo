/* ======================================================
   TEXT
====================================================== */
export function smartofficeCapitalize(text){
    if(!text){
        return "";
    }

    return text
        .charAt(0)
        .toUpperCase()
        +
        text.slice(1);
}

export function smartofficeUpper(text){
    return String(text)
        .toUpperCase();
}

export function smartofficeLower(text){
    return String(text)
        .toLowerCase();
}