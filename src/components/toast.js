/* ==========================================================================
   SMART OFFICE TOAST
========================================================================== */

/* ======================================================
   GLOBAL TOAST TIMER
====================================================== */

/* =========================
   TOAST TIMER CACHE

   FUNCTION:
   Menyimpan timeout toast
   supaya tidak tabrakan.
========================= */
let smartofficeToastTimer =
  null;

/* ======================================================
   SHOW TOAST
====================================================== */

/* =========================
   GLOBAL TOAST SYSTEM

   PARAM:
   - message
   - type

   TYPE:
   - success
   - error
   - info
========================= */
export function smartofficeShowToast(
  message,
  type = 'info'
){

  /* =========================
     TOAST ELEMENT
  ========================= */
  const toast =
    document.getElementById(
      'smartofficeToast'
    );

  /* =========================
     MESSAGE ELEMENT
  ========================= */
  const toastMessage =
    document.getElementById(
      'smartofficeToastMessage'
    );

  /* =========================
     VALIDASI ELEMENT
  ========================= */
  if(
    !toast ||
    !toastMessage
  ){
    return;
  }

  /* =========================
     CLEAR OLD TIMER
  ========================= */
  if(
    smartofficeToastTimer
  ){
    clearTimeout(
      smartofficeToastTimer
    );
  }

  /* =========================
     RESET CLASS
  ========================= */
  toast.className =
    'smartoffice-toast';

  /* =========================
     ADD TYPE CLASS
  ========================= */
  toast.classList.add(
    type
  );

  /* =========================
     SET MESSAGE
  ========================= */
  toastMessage.innerText =
    message;

  /* =========================
     FORCE REFLOW

     Supaya animasi toast
     selalu restart.
  ========================= */
  void toast.offsetWidth;

  /* =========================
     SHOW TOAST
  ========================= */
  requestAnimationFrame(
    function(){
      toast.classList.add(
        'show'
      );
    }
  );

  /* =========================
     AUTO HIDE
  ========================= */
  smartofficeToastTimer =
    setTimeout(
      function(){
        toast.classList.remove(
          'show'
        );
      },
      2500
    );
}