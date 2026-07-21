/* ======================================================
   DEBOUNCE
====================================================== */
export function smartofficeDebounce(
    callback,
    delay=300
){
    let timeout;
    return function(...args){
        clearTimeout(timeout);
        timeout=setTimeout(
            ()=>{
                callback.apply(
                    this,
                    args
                );
            },
            delay
        );
    };
}