/* ======================================================
   NUMBER
====================================================== */
export function smartofficeToNumber(value){
    return Number(value) || 0;
}

export function smartofficeRandomNumber(
    min,
    max
){

    return Math.floor(
        Math.random()
        *
        (
            max-min+1
        )
    )+min;
}