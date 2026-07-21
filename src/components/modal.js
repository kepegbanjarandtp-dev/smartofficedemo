/* ======================================================
   SMART OFFICE MODAL
====================================================== */
export function smartofficeOpenModal(id){
    const modal =
        document.getElementById(id);

    if(modal){
        modal.classList.add(
            "show"
        );
    }
}

export function smartofficeCloseModal(id){
    const modal =
        document.getElementById(id);

    if(modal){
        modal.classList.remove(
            "show"
        );
    }
}