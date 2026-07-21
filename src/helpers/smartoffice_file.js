/* ======================================================
   CONVERT FILE TO BASE64
====================================================== */

/* =========================
   FILE TO BASE64

   FUNCTION:
   Mengubah file upload
   menjadi format Base64
   agar dapat dikirim ke
   backend Apps Script.
========================= */
export function smartofficeConvertFileToBase64(file){

  return new Promise(
    function(resolve,reject){

      /* FILE READER */
      const reader =
        new FileReader();

      /* SUCCESS READ */
      reader.onload =
        function(){
          resolve(
            reader.result
              .split(',')[1]
          );
        };

      /* ERROR READ */
      reader.onerror =
        reject;

      /* READ FILE */
      reader.readAsDataURL(
        file
      );
    }
  );
}