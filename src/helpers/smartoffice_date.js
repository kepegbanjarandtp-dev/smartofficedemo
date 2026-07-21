/* ======================================================
   FORMAT TANGGAL SURAT FRONTEND
   OUTPUT :
   Arjasari, 14 Juli 2026
====================================================== */
export function smartofficeFormatTanggalSuratFrontend(
  value
){

  if(
    !value
  ){
    return '-';
  }

  const date =
    new Date(
      value
    );

  if(
    isNaN(date)
  ){
    return '-';
  }

  const bulanIndonesia = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  const tanggal =
    date.getDate();

  const bulan =
    bulanIndonesia[
      date.getMonth()
    ];

  const tahun =
    date.getFullYear();

  return `
    Arjasari,
    ${tanggal}
    ${bulan}
    ${tahun}
  `
  .replace(/\s+/g,' ')
  .trim();
}

/* ======================================================
   FORMAT TANGGAL JAM FRONTEND
   OUTPUT :
   22 Mei 2026 08:47
====================================================== */
export function smartofficeFormatTanggalJamFrontend(
  value
){

  if(!value){
    return '-';
  }

  const date =
    smartofficeParseTanggalBukuTamu(
      value
    );

  if(isNaN(date.getTime())){
    return '-';
  }

  const bulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  return (
    date.getDate() +
    ' ' +
    bulan[date.getMonth()] +
    ' ' +
    date.getFullYear() +
    ' ' +
    String(date.getHours()).padStart(2,'0') +
    ':' +
    String(date.getMinutes()).padStart(2,'0')
  );
}

/* ======================================================
   FORMAT TANGGAL JAM BUKU TAMU
====================================================== */
export function smartofficeParseTanggalBukuTamu(value){

  if(!value){
    return null;
  }

  const part =
    value.split(' ');

  const tanggal =
    part[0].split('/');

  const waktu =
    (part[1] || '00:00:00')
      .split(':');

  return new Date(
    Number(tanggal[2]),
    Number(tanggal[1]) - 1,
    Number(tanggal[0]),
    Number(waktu[0]),
    Number(waktu[1]),
    Number(waktu[2])
  );
}


/* ======================================================
   FORMAT TANGGAL INDONESIA
====================================================== */

/* =========================
   FORMAT TANGGAL

   FUNCTION:
   Mengubah format tanggal
   menjadi format Indonesia
   (dd/MM/yyyy).
========================= */
export function formatTanggalIndonesia(tanggal){

  /* VALIDASI EMPTY DATE */
  if(!tanggal){
    return '-';
  }

  /* DATE OBJECT */
  const date =
    new Date(
      tanggal
    );

  /* VALIDASI INVALID DATE */
  if(isNaN(date)){
    return '-';
  }

  /* FORMAT DATE */
  return date.toLocaleDateString(

    'id-ID',

    {
      day   : '2-digit',
      month : '2-digit',
      year  : 'numeric'
    }
  );
}