/* ======================================================
   DOM
====================================================== */
export function smartofficeGet(id){
    return document.getElementById(id);
}

export function smartofficeShow(id){
    const el=
        smartofficeGet(id);

    if(el){
        el.style.display="block";
    }
}

export function smartofficeHide(id){
    const el=
        smartofficeGet(id);

    if(el){
        el.style.display="none";
    }
}