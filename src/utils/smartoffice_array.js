/* ======================================================
   ARRAY
====================================================== */
export function smartofficeUnique(array){
    return [...new Set(array)];
}

export function smartofficeSortAsc(array){
    return [...array]
        .sort(
            (a,b)=>a-b
        );
}

export function smartofficeSortDesc(array){
    return [...array]
        .sort(
            (a,b)=>b-a
        );
}