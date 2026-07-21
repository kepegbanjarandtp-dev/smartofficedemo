/* ======================================================
   GET DRIVE FILE ID
====================================================== */

/* =========================
   GET DRIVE FILE ID

   FUNCTION:
   Mengambil ID file
   Google Drive dari
   URL lampiran.
========================= */
export function smartofficeGetDriveFileId(
  url
){

  if(!url){
    return '';
  }

  const match =
    String(url)
      .match(
        /\/d\/([^\/]+)/
      );

  return match
    ? match[1]
    : '';
}