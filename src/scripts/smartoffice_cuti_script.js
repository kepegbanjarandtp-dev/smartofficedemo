/* ==========================================================================
   SMART OFFICE CUTI SCRIPT
========================================================================== */
import {
  smartofficeLoadPage
} from "../router/router.js";

import {
    smartofficeGetSession
} from "../session/smartoffice_session.js";

import {
    smartofficeApi
} from "../services/smartoffice_api.js";

import {
  formatTanggalIndonesia
} from "../helpers/smartoffice_date";

import {
  smartofficeConvertFileToBase64
} from "../helpers/smartoffice_file";

import {
  smartofficeGetDriveFileId
} from "../helpers/smartoffice_drive";

import {
    smartofficeShowToast
} from "../components/toast.js";

import {
    smartofficeRenderMobileNavbar
} from "../components/navbar.js";

import "../styles/smartoffice_cuti_style.css";
import "../styles/smartoffice_approval_style.css";
import "../styles/smartoffice_managementCuti_style.css";

import { smartofficeLoadDashboardPage } from "./smartoffice_dashboard_script.js";


/* ==========================================================================
   SMART OFFICE GLOBAL VARIABLE
========================================================================== */

/* =========================
   CACHE DATA PEGAWAI
========================= */
let smartofficePegawaiCache = [];

/* =========================
   SUBMIT LOCK
========================= */
let smartofficeSubmitting = false;

/* =========================
   CACHE RIWAYAT CUTI
========================= */
let smartofficeRiwayatCutiData = [];


/* ==========================================================================
   SMART OFFICE INITIALIZATION
========================================================================== */
export async function smartofficeLoadCutiPage(){

    console.log("CUTI PAGE LOADED");

    /* GET SESSION */
    const sessionData =
        smartofficeGetSession();

    /* VALIDASI SESSION */
    if(!sessionData){
        smartofficeLoadPage(
            "smartoffice_login"
        );
        return;
    }

    /* LOAD DATA PEGAWAI */
    await smartofficeLoadDataPegawaiCuti();

    /* LOAD CACHE PEGAWAI */
    await smartofficeLoadPegawaiCache();

    /* VALIDASI HARI MINGGU */
    smartofficeValidateSunday(
        "smartofficeCutiTanggalSurat",
        "Tanggal surat tidak boleh hari Minggu"
    );

    smartofficeValidateSunday(
        "smartofficeCutiTanggalAwal",
        "Tanggal awal cuti tidak boleh hari Minggu"
    );

    smartofficeValidateSunday(
        "smartofficeCutiTanggalAkhir",
        "Tanggal akhir cuti tidak boleh hari Minggu"
    );

    /* AUTO HITUNG CUTI */
    smartofficeInitAutoHitungCuti();

    /* FILE UPLOAD */
    smartofficeInitFileUpload();

    /* SUBMIT BUTTON */
    smartofficeInitSubmitButton();

    /* LOAD RIWAYAT CUTI */
    await smartofficeLoadRiwayatCuti();

    /* RENDER MOBILE NAVBAR */
    smartofficeRenderMobileNavbar(
        sessionData.role,
        "cuti"
    );

}


/* ======================================================
   SMART OFFICE SWITCH CUTI TAB
====================================================== */

/* =========================
   SWITCH TAB CUTI

   TAB:
   - form
   - riwayat

   FLOW:
   1. Reset active tab
   2. Tampilkan content
   3. Set active button
   4. Load riwayat jika dibuka
========================= */
async function smartofficeSwitchCutiTab(tab){

  /* CONTENT */
  const formContent =
    document.getElementById(
      'smartofficeFormCutiContent'
    );

  const riwayatContent =
    document.getElementById(
      'smartofficeRiwayatCutiContent'
    );

  /* BUTTON */
  const formButton =
    document.getElementById(
      'smartofficeTabFormCuti'
    );

  const riwayatButton =
    document.getElementById(
      'smartofficeTabRiwayatCuti'
    );

  /* VALIDASI ELEMENT */
  if(
    !formContent ||
    !riwayatContent ||
    !formButton ||
    !riwayatButton
  ){
    return;
  }

  /* RESET ACTIVE BUTTON */
  formButton.classList.remove(
    'active'
  );

  riwayatButton.classList.remove(
    'active'
  );

  /* FORM TAB */
  if(tab === 'form'){

    /* SHOW FORM */
    formContent.style.display =
      'block';

    /* HIDE RIWAYAT */
    riwayatContent.style.display =
      'none';

    /* ACTIVE BUTTON */
    formButton.classList.add(
      'active'
    );

  }

  /* RIWAYAT TAB */
  else{

    /* HIDE FORM */
    formContent.style.display =
      'none';

    /* SHOW RIWAYAT */
    riwayatContent.style.display =
      'block';

    /* ACTIVE BUTTON */
    riwayatButton.classList.add(
      'active'
    );

    /* LOAD RIWAYAT */
    await smartofficeLoadRiwayatCuti();

  }

}


/* ==========================================================================
   SMART OFFICE LOAD DATA
========================================================================== */

/* ======================================================
   LOAD DATA PEGAWAI CUTI
====================================================== */
async function smartofficeLoadDataPegawaiCuti(){

    /* SESSION LOGIN */
    const sessionData =
        smartofficeGetSession();

    /* VALIDASI SESSION */
    if(!sessionData){
        return;
    }

    /* INFO LOADING TEXT */
    document.getElementById(
        "smartofficeCutiInfoText"
    ).innerText =
        "Memuat data pegawai...";

    /* LOADING CLASS */
    document.getElementById(
        "smartofficeCutiInfoBox"
    ).classList.add(
        "smartoffice-cuti-info-loading"
    );

    try{
        /* GET DATA PEGAWAI */
        const response =
            await smartofficeApi(
                "smartofficeGetPegawaiByNip",
                {
                    nip: sessionData.nip
                }
            );

        /* VALIDASI RESPONSE */
        if(
            !response.success ||
            !response.data
        ){
            smartofficeShowToast(
                "Data pegawai tidak ditemukan",
                "error"
            );
            return;
        }

        /* DATA PEGAWAI */
        const data =
            response.data;

        /* IDENTITAS */
        document.getElementById(
            "smartofficeCutiNama"
        ).value =
            data.nama || "";

        document.getElementById(
            "smartofficeCutiNip"
        ).value =
            data.nip || "";

        document.getElementById(
            "smartofficeCutiPangkat"
        ).value =
            data.pangkat || "";

        document.getElementById(
            "smartofficeCutiJabatan"
        ).value =
            data.jabatan || "";

        /* STATUS KEPEGAWAIAN */
        document.getElementById(
            "smartofficeCutiStatusKepegawaian"
        ).value =
            data.statusKepegawaian || "";

        /* FORMAT TMT */
        let tmtDisplay = "";

        if(data.tmtAwal){
            const parts =
                String(data.tmtAwal)
                    .split("/");

            /* MM/dd/yyyy -> dd/MM/yyyy */
            tmtDisplay =
                `${parts[1]}/${parts[0]}/${parts[2]}`;
        }

        document.getElementById(
            "smartofficeCutiTmtAwal"
        ).value =
            tmtDisplay;

        document.getElementById(
            "smartofficeCutiNoWa"
        ).value =
            data.noWa || "";

        document.getElementById(
            "smartofficeCutiSisaCuti"
        ).value = "";

        document.getElementById(
            "smartofficeCutiSisaCuti"
        ).dataset.original =
            data.sisaCuti || 0;

        document.getElementById(
            "smartofficeCutiMasaKerja"
        ).value =
            smartofficeGetMasaKerja(
                data.tmtAwal
            );

        /* =========================
           MINI STATS
        ========================= */

        /* SISA CUTI */
        const sisaElement =
            document.getElementById(
                "smartofficeStatSisaCuti"
            );

        sisaElement.innerText =
            data.sisaCuti || 0;

        sisaElement.classList.remove(
            "smartoffice-skeleton-text"
        );

        /* MENUNGGU */
        const menungguElement =
            document.getElementById(
                "smartofficeStatMenungguCuti"
            );

        menungguElement.innerText =
            data.totalMenunggu || 0;

        menungguElement.classList.remove(
            "smartoffice-skeleton-text"
        );

        /* DISETUJUI */
        const disetujuiElement =
            document.getElementById(
                "smartofficeStatDisetujuiCuti"
            );

        disetujuiElement.innerText =
            data.totalDisetujui || 0;

        disetujuiElement.classList.remove(
            "smartoffice-skeleton-text"
        );

        /* LOAD JENIS CUTI */
        smartofficeLoadJenisCuti();

        /* LOAD SISA CUTI */
        document.getElementById(
            "smartofficeCutiSisaCuti"
        ).value =
            data.sisaCuti || "0";

        /* UPDATE INFO TEXT */
        document.getElementById(
            "smartofficeCutiInfoText"
        ).innerText =
            "Identitas pegawai terisi otomatis dari database";
    }
    catch(error){
        /* ERROR TOAST */
        smartofficeShowToast(
            "Gagal memuat data pegawai",
            "error"
        );
        console.error(error);
    }
    finally{
        /* REMOVE LOADING */
        document.getElementById(
            "smartofficeCutiInfoBox"
        ).classList.remove(
            "smartoffice-cuti-info-loading"
        );
    }
}


/* ======================================================
   LOAD PEGAWAI CACHE
====================================================== */
async function smartofficeLoadPegawaiCache(){

    try{

        /* GET DATA PEGAWAI */
        const response =
            await smartofficeApi(
                "smartofficeSearchPegawai",
                {
                    keyword: ""
                }
            );

        /* SAVE CACHE */
        smartofficePegawaiCache =
            response.data || [];

        console.log(
            "CACHE PEGAWAI:",
            smartofficePegawaiCache
        );

        /* INIT AUTOCOMPLETE */
        smartofficeInitCutiDelegasiAutocomplete();

    }
    catch(error){

        console.error(error);

        smartofficePegawaiCache = [];

        smartofficeShowToast(
            "Gagal memuat data pegawai.",
            "error"
        );

    }

}


/* ======================================================
   LOAD JENIS CUTI
====================================================== */
function smartofficeLoadJenisCuti(){

    /* STATUS KEPEGAWAIAN */
    const statusKepegawaian =
        document.getElementById(
            "smartofficeCutiStatusKepegawaian"
        )
        .value
        .toUpperCase()
        .trim();

    /* SELECT ELEMENT */
    const selectJenis =
        document.getElementById(
            "smartofficeCutiJenis"
        );

    /* VALIDASI ELEMENT */
    if(!selectJenis){
        return;
    }

    /* ARRAY OPTION */
    let options = [];

    /* =========================
       PNS
    ========================= */
    if(statusKepegawaian === "PNS"){
        options = [
            "CUTI TAHUNAN",
            "CUTI BESAR",
            "CUTI SAKIT",
            "CUTI MELAHIRKAN",
            "CUTI ALASAN PENTING",
            "CTLN"
        ];
    }

    /* =========================
       BLUD
    ========================= */
    else if(statusKepegawaian === "BLUD"){
        options = [
            "CUTI TAHUNAN",
            "CUTI SAKIT",
            "CUTI MELAHIRKAN",
            "CUTI ALASAN PENTING"
        ];
    }

    /* =========================
       PPPK
    ========================= */
    else if(
        [
            "PPPK",
            "PPPK PARUH WAKTU"
        ].includes(statusKepegawaian)
    ){
        options = [
            "CUTI TAHUNAN",
            "CUTI SAKIT",
            "CUTI MELAHIRKAN"
        ];
    }

    /* =========================
       DEFAULT
    ========================= */
    else{
        options = [
            "CUTI TAHUNAN",
            "CUTI SAKIT"
        ];
    }

    /* RESET OPTION */
    selectJenis.innerHTML = `
        <option value="">
            Pilih Jenis Cuti
        </option>
    `;

    /* RENDER OPTION */
    options.forEach((item)=>{
        selectJenis.innerHTML += `
            <option value="${item}">
                ${item}
            </option>
        `;
    });
}


/* ======================================================
   LOAD RIWAYAT CUTI
====================================================== */
async function smartofficeLoadRiwayatCuti(){

    /* SESSION LOGIN */
    const sessionData =
        smartofficeGetSession();

    /* VALIDASI SESSION */
    if(!sessionData){
        return;
    }

    try{

        /* LOAD RIWAYAT */
        const response =
            await smartofficeApi(
                "smartofficeGetRiwayatCuti",
                {
                    nip: sessionData.nip
                }
            );

        console.log("RESPONSE RIWAYAT :", response);

        /* CONTAINER */
        const container =
            document.getElementById(
                "smartofficeRiwayatCutiList"
            );

        /* VALIDASI CONTAINER */
        if(!container){
            return;
        }

        /* SIMPAN DATA GLOBAL */
        smartofficeRiwayatCutiData =
            response.data || [];

        /* EMPTY DATA */
        if(
            smartofficeRiwayatCutiData.length === 0
        ){

            container.innerHTML = `
                <div class="smartoffice-empty-state">

                    <div class="smartoffice-empty-icon">
                        📭
                    </div>

                    <h3>
                        Data tidak ditemukan
                    </h3>

                    <p>
                        Belum ada riwayat cuti
                    </p>

                </div>
            `;

            return;
        }

        /* HTML VARIABLE */
        let html = "";

        /* LOOP DATA */
        smartofficeRiwayatCutiData.forEach(function(item){

            /* STATUS DEFAULT */
            let statusClass =
                "waiting";

            let statusText =
                "Menunggu";

            /* APPROVED */
            if(item.status === "DISETUJUI"){

                statusClass =
                    "approved";

                statusText =
                    "Disetujui";

            }

            /* REJECTED */
            if(item.status === "DITOLAK"){

                statusClass =
                    "rejected";

                statusText =
                    "Ditolak";

            }

            /* DATE FORMAT */
            const startDate =
                new Date(
                    item.tanggalAwal
                );

            const day =
                startDate.getDate();

            const month =
                startDate
                    .toLocaleString(
                        "id-ID",
                        {
                            month:"short"
                        }
                    )
                    .toUpperCase();

            const periodeCuti =
                item.tanggalAwal === item.tanggalAkhir

                ?

                formatTanggalIndonesia(
                    item.tanggalAwal
                )

                :

                `${formatTanggalIndonesia(
                    item.tanggalAwal
                )} - ${formatTanggalIndonesia(
                    item.tanggalAkhir
                )}`;

            /* CARD HTML */
            html += `

                <div
                    class="smartoffice-riwayat-cuti-card"

                    onclick='
                        smartofficeOpenRiwayatCutiDetail(
                            ${JSON.stringify(item)}
                        )
                    '
                >

                    <div class="smartoffice-riwayat-date">

                        <small>
                            ${month}
                        </small>

                        <strong>
                            ${day}
                        </strong>

                    </div>

                    <div class="smartoffice-riwayat-cuti-content">

                        <h3>
                            ${item.jenisCuti}
                        </h3>

                        <small>
                            ${item.jumlahCuti} Hari
                        </small>

                        <p>
                            ${periodeCuti}
                        </p>

                    </div>

                    <div class="smartoffice-riwayat-cuti-right">

                        <span class="
                            smartoffice-riwayat-status
                            ${statusClass}
                        ">
                            ${statusText}
                        </span>

                        <div class="smartoffice-riwayat-arrow">

                            <svg viewBox="0 0 24 24">
                                <path d="
                                    M9 18l6-6-6-6
                                "/>
                            </svg>

                        </div>

                    </div>

                </div>

            `;

        });

        /* RENDER HTML */
        container.innerHTML =
            html;

    }
    catch(error){

        console.error(error);

        smartofficeShowToast(
            "Gagal memuat riwayat cuti.",
            "error"
        );

    }

}


/* ======================================================
   LOAD CUTI STATS
====================================================== */
async function smartofficeLoadCutiStats(){

    /* SESSION */
    const sessionData =
        smartofficeGetSession();

    /* VALIDASI SESSION */
    if(!sessionData){
        return;
    }

    /* =========================
       RESET MINI STATS
    ========================= */

    document.getElementById(
        "smartofficeStatSisaCuti"
    ).innerHTML =
        '<span class="smartoffice-mini-loader"></span>';

    document.getElementById(
        "smartofficeStatMenungguCuti"
    ).innerHTML =
        '<span class="smartoffice-mini-loader"></span>';

    document.getElementById(
        "smartofficeStatDisetujuiCuti"
    ).innerHTML =
        '<span class="smartoffice-mini-loader"></span>';

    try{

        /* REQUEST BACKEND */
        const response =
            await smartofficeApi(
                "smartofficeGetCutiStats",
                {
                    nip: sessionData.nip
                }
            );

        /* VALIDASI */
        if(
            !response.success ||
            !response.data
        ){
            return;
        }

        /* DATA */
        const data =
            response.data;

        /* SISA CUTI */
        const sisaElement =
            document.getElementById(
                "smartofficeStatSisaCuti"
            );

        if(sisaElement){

            sisaElement.innerText =
                data.sisaCuti || 0;

        }

        /* MENUNGGU */
        const menungguElement =
            document.getElementById(
                "smartofficeStatMenungguCuti"
            );

        if(menungguElement){

            menungguElement.innerText =
                data.menunggu || 0;

        }

        /* DISETUJUI */
        const disetujuiElement =
            document.getElementById(
                "smartofficeStatDisetujuiCuti"
            );

        if(disetujuiElement){

            disetujuiElement.innerText =
                data.disetujui || 0;

        }

    }
    catch(error){

        console.error(error);

        smartofficeShowToast(
            "Gagal memuat statistik cuti.",
            "error"
        );

    }

}


/* ======================================================
   REFRESH CUTI
====================================================== */
async function smartofficeRefreshCuti(){

  /* MINI STAT */
  document.getElementById(
    'smartofficeTotalCuti'
  ).innerHTML =
    '<span class="smartoffice-mini-loader"></span>';

  document.getElementById(
    'smartofficeApprovedCuti'
  ).innerHTML =
    '<span class="smartoffice-mini-loader"></span>';

  /* RIWAYAT LOADING */
  document.getElementById(
    'smartofficeRiwayatCutiList'
  ).innerHTML =
  `
  <div class="
    smartoffice-dokumen-loading
  ">
    <div class="
      smartoffice-dokumen-spinner
    "></div>
    <p>
      Memuat riwayat...
    </p>
  </div>
  `;

  /* RELOAD */
  await smartofficeLoadCutiStats();

  await smartofficeLoadRiwayatCuti();

  smartofficeShowToast(
    'Data berhasil diperbarui',
    'success'
  );

}


/* ==========================================================================
   SMART OFFICE SUBMIT
========================================================================== */

/* ======================================================
   SUBMIT CUTI
====================================================== */
async function smartofficeSubmitCutiForm(){

  /* PREVENT DOUBLE SUBMIT */
  if(smartofficeSubmitting){
    return;
  }

  /* SESSION DATA */
  const sessionData =
    smartofficeGetSession();

  if(!sessionData){
    return;
  }

  /* FILE INPUT */
  const fileInput =
    document.getElementById(
      'smartofficeCutiLampiran'
    );

  /* JENIS CUTI */
  const jenisCuti =
    document.getElementById(
      'smartofficeCutiJenis'
    )
    .value
    .toUpperCase()
    .trim();

  /* TANGGAL SURAT */
  const tanggalSurat =
    document.getElementById(
      'smartofficeCutiTanggalSurat'
    ).value;

  /* VALIDASI HARI MINGGU */
  if(tanggalSurat){

    const suratDate =
      new Date(
        tanggalSurat + 'T00:00:00'
      );

    /* HARI MINGGU */
    if(suratDate.getDay() === 0){

      smartofficeShowToast(
        'Tanggal surat tidak boleh hari Minggu',
        'error'
      );

      return;
    }
  }

  /* TANGGAL AWAL CUTI */
  const tanggalAwalCuti =
    document.getElementById(
      'smartofficeCutiTanggalAwal'
    ).value;

  /* VALIDASI TANGGAL SURAT */
  if(
    tanggalSurat &&
    tanggalAwalCuti
  ){

    const suratDate =
      new Date(
        tanggalSurat + 'T00:00:00'
      );

    const awalCutiDate =
      new Date(
        tanggalAwalCuti + 'T00:00:00'
      );

    /* SURAT > AWAL CUTI */
    if(suratDate > awalCutiDate){

      smartofficeShowToast(
        'Tanggal surat tidak boleh melebihi tanggal awal cuti',
        'error'
      );

      return;
    }
  }

  /* =========================
    VALIDASI MASA KERJA
  ========================= */
  if(
    jenisCuti ===
    'CUTI TAHUNAN'
  ){

    /* TMT */
    const tmtValue =
      document.getElementById(
        'smartofficeCutiTmtAwal'
      ).value;

    if(tmtValue){

      /* FORMAT MM/dd/yyyy */
      const parts =
        String(tmtValue)
          .split('/');

      const tmtDate =
        new Date(
          parts[2],
          parts[0] - 1,
          parts[1]
        );

      const today =
        new Date();

      /* SELISIH */
      const selisihTahun =
        (
          today - tmtDate
        )
        /
        (
          1000 * 60 * 60 * 24 * 365
        );

      /* VALIDASI */
      if(
        selisihTahun < 1
      ){

        smartofficeShowToast(
          'Cuti tahunan hanya dapat diajukan setelah masa kerja 1 tahun.',
          'error'
        );

        return;
      }
    }
  }

  /* =========================
    VALIDASI LAMPIRAN WAJIB
  ========================= */
  if(

    jenisCuti ===
    'CUTI SAKIT'

    ||

    jenisCuti ===
    'CUTI ALASAN PENTING'

  ){

    if(
      fileInput.files.length === 0
    ){

      smartofficeShowToast(

        'Lampiran wajib diunggah untuk jenis cuti tersebut.',

        'error'

      );

      return;
    }
  }

  const alamatSaatCutiElement =
    document.getElementById(
      'smartofficeCutiAlamatSaatCuti'
    );

  /* VALIDASI FIELD WAJIB */
  const requiredFields = [

    {
      value :
        document.getElementById(
          'smartofficeCutiTanggalSurat'
        ).value,

      message :
        'Tanggal surat wajib diisi.'
    },

    {
      value : jenisCuti,

      message :
        'Jenis cuti wajib dipilih.'
    },

    {
      value :
        document.getElementById(
          'smartofficeCutiTanggalAwal'
        ).value,

      message :
        'Tanggal awal cuti wajib diisi.'
    },

    {
      value :
        document.getElementById(
          'smartofficeCutiTanggalAkhir'
        ).value,

      message :
        'Tanggal akhir cuti wajib diisi.'
    },

    {
      value :
        document.getElementById(
          'smartofficeCutiKeperluan'
        ).value,

      message :
        'Keperluan wajib diisi.'
    },

    {
      value :
        alamatSaatCutiElement
        ? alamatSaatCutiElement.value
        : '',

      message :
        'Alamat saat cuti wajib diisi.'
    },

    {
      value :
        document.getElementById(
          'smartofficeCutiDelegasi'
        ).value,

      message :
        'Penerima delegasi wajib diisi.'
    },

    {
      value :
        document.getElementById(
          'smartofficeCutiDelegasiNip'
        ).value,

      message :
        'NIP delegasi wajib diisi.'
    },

    {
      value :
        document.getElementById(
          'smartofficeCutiTugasDelegasi'
        ).value,

      message :
        'Tugas delegasi wajib diisi.'
    }
  ];

  /* CHECK REQUIRED FIELD */
  for(
    let i = 0;
    i < requiredFields.length;
    i++
  ){

    if(
      !requiredFields[i]
        .value
        .toString()
        .trim()
    ){

      smartofficeShowToast(
        requiredFields[i].message,
        'error'
      );

      return;
    }
  }

  /* CONVERT FILE BASE64 */
  let base64File = '';
  let fileName = '';
  let fileType = '';

  if(fileInput.files.length > 0){

    const file =
      fileInput.files[0];

    fileName =
      file.name;

    fileType =
      file.type;

    base64File =
      await smartofficeConvertFileToBase64(
        file
      );
  }

  /* FORM DATA */
  const formData = {

    /* IDENTITAS */
    nama :
      document.getElementById(
        'smartofficeCutiNama'
      ).value,

    nip :
      document.getElementById(
        'smartofficeCutiNip'
      ).value,

    pangkat :
      document.getElementById(
        'smartofficeCutiPangkat'
      ).value,

    jabatan :
      document.getElementById(
        'smartofficeCutiJabatan'
      ).value,

    statusKepegawaian :
      document.getElementById(
        'smartofficeCutiStatusKepegawaian'
      ).value,

    tmtAwal :
      document.getElementById(
        'smartofficeCutiTmtAwal'
      ).value,

    masaKerja :
      document.getElementById(
        'smartofficeCutiMasaKerja'
      ).value,

    /* KONTAK */
    email :
      sessionData.email,

    noWa :
      sessionData.noWa,

    /* CUTI */
    tanggalSurat :
      document.getElementById(
        'smartofficeCutiTanggalSurat'
      ).value,

    jenisCuti :
      jenisCuti,

    tanggalAwalCuti :
      document.getElementById(
        'smartofficeCutiTanggalAwal'
      ).value,

    tanggalAkhirCuti :
      document.getElementById(
        'smartofficeCutiTanggalAkhir'
      ).value,

    sisaCuti :
      document.getElementById(
        'smartofficeCutiSisaCuti'
      ).value,

    keperluan :
      document.getElementById(
        'smartofficeCutiKeperluan'
      ).value,

    alamatSaatCuti :
      alamatSaatCutiElement
      ? alamatSaatCutiElement.value
      : '',

    /* FILE */
    base64File :
      base64File,

    fileName :
      fileName,

    fileType :
      fileType,

    /* DELEGASI */
    penerimaDelegasi :
      document.getElementById(
        'smartofficeCutiDelegasi'
      ).value,

    nipDelegasi :
      document.getElementById(
        'smartofficeCutiDelegasiNip'
      ).value,

    tugasDelegasi :
      document.getElementById(
        'smartofficeCutiTugasDelegasi'
      ).value,

    /* APPROVAL */
    approval1Nama : '',
    approval1Nip : '',

    approval2Nama : '',
    approval2Nip : ''
  };

  /* SUBMIT BUTTON */
  const submitButton =
    document.getElementById(
      'smartofficeCutiSubmitButton'
    );

  /* LOCK SUBMIT */
  smartofficeSubmitting =
    true;

  /* BUTTON LOADING */
  submitButton.disabled =
    true;

  submitButton.innerHTML = `
    <div class="
      smartoffice-cuti-form-button-loading
    ">
      <div class="
        smartoffice-cuti-form-button-spinner
      "></div>

      <span>
        Mengajukan...
      </span>
    </div>
  `;

  /* REQUEST BACKEND */
  try{

    const response =
        await smartofficeApi(
            "smartofficeSubmitCuti",
            formData
        );

    /* RESET LOCK */
    smartofficeSubmitting =
        false;

    /* RESET BUTTON */
    submitButton.disabled =
        false;

    submitButton.innerHTML =
        "Ajukan Cuti";

    if(response.success){

        smartofficeResetCutiForm();

        await smartofficeLoadRiwayatCuti();

        setTimeout(function(){

            smartofficeFilterRiwayatCuti(
                "SEMUA"
            );

        },300);

        await smartofficeLoadCutiStats();

        smartofficeShowToast(
            "Pengajuan berhasil: " +
            (response.data.idCuti || ""),
            "success"
        );

        setTimeout(function(){

            smartofficeSwitchCutiTab(
                "riwayat"
            );

        },700);

    }else{

        smartofficeShowToast(
            response.message,
            "error"
        );

    }

  }
  catch(error){

    submitButton.disabled =
        false;

    submitButton.innerHTML =
        "Ajukan Cuti";

    smartofficeSubmitting =
        false;

    smartofficeShowToast(
        "Terjadi kesalahan: " +
        error.message,
        "error"
    );

  }
}


/* ======================================================
   INIT SUBMIT BUTTON
====================================================== */

function smartofficeInitSubmitButton(){

    /* SUBMIT BUTTON */
    const submitButton =
        document.getElementById(
            "smartofficeCutiSubmitButton"
        );

    /* VALIDASI ELEMENT */
    if(!submitButton){
        return;
    }

    /* SUDAH DIINIT */
    if(
        submitButton.dataset.initialized
    ){
        return;
    }

    submitButton.dataset.initialized =
        "true";

    /* CLICK EVENT */
    submitButton.addEventListener(

        "click",

        function(){

            smartofficeSubmitCutiForm();

        }

    );

}


/* ==========================================================================
   SMART OFFICE RIWAYAT CUTI
========================================================================== */

/* ======================================================
   FILTER RIWAYAT CUTI
====================================================== */
function smartofficeFilterRiwayatCuti(
  status,
  element = null
){

  /* BUTTON */
  const buttons =
    document.querySelectorAll(
      '.smartoffice-riwayat-filter-item'
    );

  /* REMOVE ACTIVE */
  buttons.forEach(function(btn){

    btn.classList.remove(
      'active'
    );

  });

  /* ACTIVE CURRENT */
  if(element){

    element.classList.add(
      'active'
    );
  }

  /* CONTAINER */
  const container =
    document.getElementById(
      'smartofficeRiwayatCutiList'
    );

  /* FILTER DATA */
  let filteredData =
    smartofficeRiwayatCutiData;

  if(
    status !== 'SEMUA'
  ){

    filteredData =
      smartofficeRiwayatCutiData.filter(
        function(item){

          /* MENUNGGU */
          if(
            status === 'MENUNGGU'
          ){

            return (
              item.status ===
                'MENUNGGU_APPROVAL_1'
              ||
              item.status ===
                'MENUNGGU_APPROVAL_2'
            );
          }

          /* STATUS LAIN */
          return (
            item.status === status
          );

        }
      );
  }

  /* EMPTY */
  if(
    filteredData.length === 0
  ){

    container.innerHTML = `

      <div class="
        smartoffice-empty-state
      ">

        <div class="
          smartoffice-empty-icon
        ">
          📭
        </div>

        <h3>
          Data tidak ditemukan
        </h3>

        <p>
          Belum ada riwayat cuti
          dengan status ini
        </p>

      </div>
    `;

    return;
  }

  /* HTML */
  let html = '';

  filteredData.forEach(
    function(item){

      let statusClass =
        'waiting';

      let statusText =
        'Menunggu';

      if(
        item.status === 'DISETUJUI'
      ){

        statusClass =
          'approved';

        statusText =
          'Disetujui';
      }

      if(
        item.status === 'DITOLAK'
      ){

        statusClass =
          'rejected';

        statusText =
          'Ditolak';
      }

      const startDate =
        new Date(
          item.tanggalAwal
        );

      const day =
        startDate.getDate();

      const month =
        startDate
          .toLocaleString(
            'id-ID',
            {
              month : 'short'
            }
          )
          .toUpperCase();

      html += `
        <div class="
          smartoffice-riwayat-cuti-card
        "

        onclick='
          smartofficeOpenRiwayatCutiDetail(
            ${JSON.stringify(item)}
          )
        '
        >

          <div class="
            smartoffice-riwayat-date
          ">
            <small>
              ${month}
            </small>

            <strong>
              ${day}
            </strong>
          </div>

          <div class="
            smartoffice-riwayat-cuti-content
          ">
            <h3>
              ${item.jenisCuti}
            </h3>

            <small>
              ${item.jumlahCuti} Hari
            </small>

            <p>
              ${formatTanggalIndonesia(
                item.tanggalAwal
              )}
              -
              ${formatTanggalIndonesia(
                item.tanggalAkhir
              )}
            </p>
          </div>

          <div class="
            smartoffice-riwayat-cuti-right
          ">

            <span class="
              smartoffice-riwayat-status
              ${statusClass}
            ">
              ${statusText}
            </span>

            <div class="
              smartoffice-riwayat-arrow
            ">
              <svg viewBox="0 0 24 24">
                <path d="
                  M9 18l6-6-6-6
                "/>
              </svg>
            </div>
          </div>
        </div>
      `;
    }
  );

  container.innerHTML =
    html;
}


/* ======================================================
   OPEN RIWAYAT DETAIL
====================================================== */
function smartofficeOpenRiwayatCutiDetail(
  item
){

  /* MODAL */
  const modal =
    document.getElementById(
      'smartofficeRiwayatCutiDetailModal'
    );

  /* BODY */
  const body =
    document.getElementById(
      'smartofficeRiwayatCutiDetailBody'
    );

  /* SHOW */
  if(
    !modal ||
    !body
  ){
    return;
  }

  modal.style.display =
     "flex";

  requestAnimationFrame(function(){

     modal.classList.add(
        "show"
     );

  });

  /* STATUS */
  let statusText =
    'Menunggu';

  let statusClass =
    'waiting';

  if(
    item.status ===
    'DISETUJUI'
  ){

    statusText =
      'Disetujui';

    statusClass =
      'approved';
  }

  if(
    item.status ===
    'DITOLAK'
  ){

    statusText =
      'Ditolak';

    statusClass =
      'rejected';
  }

  const periodeCuti =
    item.tanggalAwal === item.tanggalAkhir

    ?

    formatTanggalIndonesia(
      item.tanggalAwal
    )

    :

    `${formatTanggalIndonesia(
      item.tanggalAwal
    )} - ${formatTanggalIndonesia(
      item.tanggalAkhir
    )}`;

  /* RENDER */
  body.scrollTop = 0;
  body.innerHTML = `

    <!-- PROFILE -->
    <div class="
      smartoffice-approval-profile
    ">
      
      <div class="
        smartoffice-approval-profile-info
        smartoffice-riwayat-detail-header-info
      ">
        <h4>
          ${item.jenisCuti || '-'}
        </h4>

        <span class="
          smartoffice-riwayat-status
          ${statusClass}
        ">
          ${statusText}
        </span>
      </div>

    </div>

    <!-- DETAIL -->
    <div class="
      smartoffice-approval-detail-grid
    ">

      <div class="
        smartoffice-approval-detail-item
      ">

        <label>
          Tanggal Permohonan
        </label>

        <span>
          ${formatTanggalIndonesia(
            item.tanggalSurat
          )}
        </span>

      </div>

      <div class="
        smartoffice-approval-detail-item
      ">
        <label>
          Tanggal Cuti
        </label>

        <span>
          ${periodeCuti}
        </span>
      </div>

      <div class="
        smartoffice-approval-detail-item
      ">
        <label>
          Jumlah Hari
        </label>

        <span>
          ${item.jumlahCuti || 0} Hari
        </span>
      </div>
      
      <div class="
        smartoffice-approval-detail-item
      ">
        <label>
          Sisa Cuti
        </label>

        <span>
          ${item.sisaCuti || 0} Hari
        </span>
      </div>

    </div>

    <!-- KEPERLUAN -->
    <div class="
      smartoffice-approval-detail-item
      full-width
    ">

      <label>
        Keperluan
      </label>

      <span>
        ${item.keperluan || '-'}
      </span>

    </div>

    <!-- ALAMAT -->
    <div class="
      smartoffice-approval-detail-item
      full-width
    ">

      <label>
        Alamat Selama Menjalani Cuti
      </label>

      <span>
        ${item.alamatSaatCuti || '-'}
      </span>

    </div>

    <!-- LAMPIRAN -->
    <div class="
      smartoffice-approval-lampiran
      smartoffice-riwayat-lampiran
    ">
      <div class="
        smartoffice-approval-lampiran-title
      ">
        Lampiran
      </div>

      <div class="
        smartoffice-approval-file-card
      ">
        <div class="
          smartoffice-approval-file-icon
        ">
          📄
        </div>

        <div class="
          smartoffice-approval-file-info
        ">
          <div class="
            smartoffice-approval-file-name
          ">
            ${
              item.lampiran
              ?
              `
              <button
                class="
                  smartoffice-dokumen-link
                "
                onclick="
                  smartofficeOpenPreviewDokumen(
                    '${smartofficeGetDriveFileId(item.lampiran)}',
                    'Lampiran Cuti'
                  )
                "
              >

                <svg
                  style="
                    flex-shrink:0;
                  "
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <line x1="10" y1="9" x2="8" y2="9"/>
                </svg>

                <span>
                  Lihat Lampiran
                </span>

              </button>
              `
              :
              'Tidak ada lampiran'
            }
          </div>
        </div>
      </div>
    </div>

    <!-- DELEGASI GRID -->
    <div class="
      smartoffice-approval-detail-grid
    ">

      <!-- PENERIMA -->
      <div class="
        smartoffice-approval-detail-item
      ">
        <label>
          Penerima Delegasi
        </label>

        <span>
          ${item.delegasi || '-'}
        </span>
      </div>

      <!-- NIP -->
      <div class="
        smartoffice-approval-detail-item
      ">
        <label>
          NIP / NRP Delegasi
        </label>

        <span>
          ${item.nipDelegasi || '-'}
        </span>
      </div>
    </div>

    <!-- TUGAS -->
    <div class="
      smartoffice-approval-detail-item
      full-width
    ">

      <label>
        Tugas Yang Didelegasikan
      </label>

      <span>
        ${item.tugasDelegasi || '-'}
      </span>

    </div>

    <!-- APPROVAL 1 -->
    <div class="
      smartoffice-approval-detail-item
      full-width
    ">

      <label>
        Approval 1
      </label>

      <div class="
        smartoffice-riwayat-approval-box
      ">

        <div>
          <small>Nama</small>
          <strong>
            ${item.approval1 || '-'}
          </strong>
        </div>

        <div>
          <small>Status</small>
          ${smartofficeGetApprovalBadge(
            item.approval1Status
          )}
        </div>

        <div>
          <small>Tanggal</small>
          <strong>
            ${item.approval1Tanggal || '-'}
          </strong>
        </div>

        <div>
          <small>Catatan</small>
          <strong>
            ${item.approval1Catatan || '-'}
          </strong>
        </div>

      </div>

    </div>

    <!-- APPROVAL 2 -->
    <div class="
      smartoffice-approval-detail-item
      full-width
    ">
      <label>
        Approval 2
      </label>

      <div class="
        smartoffice-riwayat-approval-box
      ">
        <div>
          <small>Nama</small>
          <strong>
            ${item.approval2 || '-'}
          </strong>
        </div>

        <div>
          <small>Status</small>
          ${smartofficeGetApprovalBadge(
            item.approval2Status
          )}
        </div>

        <div>
          <small>Tanggal</small>
          <strong>
            ${item.approval2Tanggal || '-'}
          </strong>
        </div>

        <div>
          <small>Catatan</small>
          <strong>
            ${item.approval2Catatan || '-'}
          </strong>
        </div>
      </div>
    </div>

    <!-- PDF -->
    <div class="
      smartoffice-approval-detail-item
      full-width
    ">

      <label>
        File PDF Surat Cuti
      </label>

      <span>
        ${
          item.pdfUrl
          ?
          `
          <button
            class="
              smartoffice-dokumen-link
            "
            onclick="
              smartofficeOpenPreviewDokumen(
                '${smartofficeGetDriveFileId(item.pdfUrl)}',
                'Surat Cuti.pdf'
              )
            "
          >

            <svg
              style="
                flex-shrink:0;
              "
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <line x1="10" y1="9" x2="8" y2="9"/>
            </svg>

            <span>
              Lihat PDF
            </span>

          </button>
          `
          :
          'PDF belum tersedia'
        }
      </span>
    </div>

    <!-- FOOTER -->
    <div class="
      smartoffice-approval-action-footer
    ">

      <button
        class="
          smartoffice-approval-cancel-button
        "
        onclick="
          smartofficeCloseRiwayatCutiDetail()
        "
      >
        Tutup
      </button>
    </div>
  `;
}


/* ======================================================
   CLOSE RIWAYAT DETAIL
====================================================== */
function smartofficeCloseRiwayatCutiDetail(){

    const modal =
        document.getElementById(
            "smartofficeRiwayatCutiDetailModal"
        );

    if(!modal){
        return;
    }

    modal.classList.remove(
        "show"
    );

    setTimeout(function(){
        modal.style.display =
            "none";
    },200);
}


/* ==========================================================================
   SMART OFFICE AUTOCOMPLETE
========================================================================== */

/* ======================================================
   INIT AUTOCOMPLETE DELEGASI
====================================================== */
function smartofficeInitCutiDelegasiAutocomplete(){

  /* INPUT ELEMENT */
  const input =
    document.getElementById(
      'smartofficeCutiDelegasi'
    );

  /* RESULT CONTAINER */
  const resultBox =
    document.getElementById(
      'smartofficeCutiDelegasiAutocomplete'
    );

  /* VALIDASI ELEMENT */
  if(
    !input ||
    !resultBox
  ){
    return;
  }

  /* SUDAH DIINIT */
 if(
    input.dataset.initialized
  ){
    return;
  }

  input.dataset.initialized = "true";

  /* INPUT LISTENER */
  input.addEventListener(

    'input',

    function(){

      /* KEYWORD */
      const keyword =
        input.value
          .trim()
          .toLowerCase();

      /* RESET RESULT */
      resultBox.innerHTML =
        '';

      /* EMPTY KEYWORD */
      if(keyword.length < 1){
        document.getElementById(
          'smartofficeCutiDelegasiNip'
        ).value =
          '';
        return;
      }

      /* SESSION */
      const sessionData =
        smartofficeGetSession();

      /* FILTER DATA */
      const filtered =
        smartofficePegawaiCache.filter(
          function(item){

            /* TIDAK BOLEH DIRI SENDIRI */
            if(
              item.nip === sessionData.nip
            ){
              return false;
            }

            return item.nama
              .toLowerCase()
              .includes(keyword);

          }
        );

      /* EMPTY RESULT */
      if(filtered.length === 0){
        resultBox.innerHTML = `
          <div class="
            smartoffice-cuti-autocomplete-empty
          ">
            Pegawai tidak ditemukan
          </div>
        `;
        return;
      }

      /* RENDER RESULT */
      filtered.forEach(
        function(item){
          resultBox.innerHTML += `
            <div
              class="
                smartoffice-cuti-autocomplete-item
              "
              onclick="
                smartofficeSelectDelegasi(
                  '${item.nama}',
                  '${item.nip}'
                )
              "
            >
              <strong>
                ${item.nama}
              </strong>

              <span>
                ${item.nip}
              </span>
            </div>
          `;
        }
      );
    }
  );
}


/* ======================================================
   SELECT DELEGASI
====================================================== */
function smartofficeSelectDelegasi(
    nama,
    nip
){

    const namaElement =
        document.getElementById(
            "smartofficeCutiDelegasi"
        );

    const nipElement =
        document.getElementById(
            "smartofficeCutiDelegasiNip"
        );

    const autocomplete =
        document.getElementById(
            "smartofficeCutiDelegasiAutocomplete"
        );

    if(namaElement){
        namaElement.value =
            nama;
    }

    if(nipElement){
        nipElement.value =
            nip;
    }

    if(autocomplete){
        autocomplete.innerHTML =
            "";
    }
}


/* ==========================================================================
   SMART OFFICE FORM
========================================================================== */

/* ======================================================
   RESET FORM CUTI
====================================================== */
function smartofficeResetCutiForm(){

    const fields = [
        "smartofficeCutiTanggalSurat",
        "smartofficeCutiJenis",
        "smartofficeCutiTanggalAwal",
        "smartofficeCutiTanggalAkhir",
        "smartofficeCutiJumlah",
        "smartofficeCutiSisaCuti",
        "smartofficeCutiKeperluan",
        "smartofficeCutiAlamatSaatCuti",
        "smartofficeCutiDelegasi",
        "smartofficeCutiDelegasiNip",
        "smartofficeCutiTugasDelegasi",
        "smartofficeCutiLampiran"
    ];

    fields.forEach(function(id){
        const element =
            document.getElementById(id);

        if(element){
            element.value = "";
        }
    });

    const fileName =
        document.getElementById(
            "smartofficeCutiFileName"
        );

    if(fileName){
        fileName.innerText =
            "Belum ada file dipilih";
    }
}


/* ==========================================================================
   SMART OFFICE AUTO CALCULATION
========================================================================== */

/* ======================================================
   AUTO HITUNG JUMLAH CUTI
====================================================== */
function smartofficeInitAutoHitungCuti(){

    /* FIELD */
    const tanggalAwal =
        document.getElementById(
            "smartofficeCutiTanggalAwal"
        );

    const tanggalAkhir =
        document.getElementById(
            "smartofficeCutiTanggalAkhir"
        );

    const jumlahField =
        document.getElementById(
            "smartofficeCutiJumlah"
        );

    /* VALIDASI ELEMENT */
    if(
        !tanggalAwal ||
        !tanggalAkhir ||
        !jumlahField
    ){
        return;
    }

    /* SUDAH DIINIT */
    if(
        tanggalAwal.dataset.autoCuti
    ){
        return;
    }

    tanggalAwal.dataset.autoCuti =
        "true";

    /* ==========================================
       HITUNG CUTI
    ========================================== */
    async function hitungCuti(){

        /* VALIDASI EMPTY */
        if(
            !tanggalAwal.value ||
            !tanggalAkhir.value
        ){
            jumlahField.value =
                "";

            return;
        }

        /* DATE OBJECT */
        const startDate =
            new Date(
                tanggalAwal.value
            );

        const endDate =
            new Date(
                tanggalAkhir.value
            );

        /* VALIDASI RANGE */
        if(
            endDate < startDate
        ){
            smartofficeShowToast(
                "Tanggal akhir tidak valid",
                "error"
            );

            jumlahField.value =
                "";

            return;
        }

        /* VALIDASI MINGGU */
        if(
            startDate.getDay() === 0
        ){
            smartofficeShowToast(
                "Tanggal awal tidak boleh hari Minggu",
                "error"
            );

            tanggalAwal.value =
                "";

            jumlahField.value =
                "";

            return;
        }

        if(
            endDate.getDay() === 0
        ){
            smartofficeShowToast(
                "Tanggal akhir tidak boleh hari Minggu",
                "error"
            );

            tanggalAkhir.value =
                "";

            jumlahField.value =
                "";

            return;
        }

        /* LOADING */
        jumlahField.placeholder =
            "Menghitung...";

        try{

            /* REQUEST BACKEND */
            const response =
                await smartofficeApi(
                    "smartofficeGetJumlahCuti",
                    {
                        tanggalAwal:
                            tanggalAwal.value,

                        tanggalAkhir:
                            tanggalAkhir.value
                    }
                );

            /* VALIDASI RESPONSE */
            if(
                !response.success
            ){

                jumlahField.value =
                    "";

                return;
            }

            /* JUMLAH HARI */
            const jumlahHari =
                response.jumlahHari;

            /* VALIDASI HASIL */
            if(
                jumlahHari <= 0
            ){
                smartofficeShowToast(
                    "Jumlah cuti tidak valid",
                    "error"
                );

                jumlahField.value =
                    "";

                return;

            }

            /* FIELD SISA */
            const sisaField =
                document.getElementById(
                    "smartofficeCutiSisaCuti"
                );

            /* JENIS CUTI */
            const jenisCuti =
                document.getElementById(
                    "smartofficeCutiJenis"
                )?.value || "";

            /* CUTI TAHUNAN */
            if(
                jenisCuti ===
                "CUTI TAHUNAN"
            ){

                const sisaAwal =
                    Number(
                        sisaField.dataset.original || 0
                    );

                /* VALIDASI SISA */
                if(
                    jumlahHari >
                    sisaAwal
                ){
                    smartofficeShowToast(
                        "Jumlah cuti melebihi sisa cuti tahunan.",
                        "error"
                    );

                    jumlahField.value =
                        "";

                    sisaField.value =
                        sisaAwal;

                    return;
                }

                /* UPDATE SISA */
                sisaField.value =
                    sisaAwal - jumlahHari;
            }

            /* SELAIN CUTI TAHUNAN */
            else{
                sisaField.value =
                    sisaField.dataset.original || 0;
            }

            /* SET JUMLAH */
            jumlahField.value =
                jumlahHari;
        }
        catch(error){
            console.error(error);

            jumlahField.value =
                "";

            smartofficeShowToast(
                "Gagal menghitung jumlah cuti",
                "error"
            );
        }
    }

    /* CHANGE LISTENER */
    tanggalAwal.addEventListener(
        "change",
        hitungCuti
    );

    tanggalAkhir.addEventListener(
        "change",
        hitungCuti
    );
}


/* ==========================================================================
   SMART OFFICE FILE UPLOAD
========================================================================== */

/* ======================================================
   INIT FILE UPLOAD
====================================================== */
function smartofficeInitFileUpload(){

    /* FILE INPUT */
    const fileInput =
        document.getElementById(
            "smartofficeCutiLampiran"
        );

    /* FILE NAME */
    const fileNameElement =
        document.getElementById(
            "smartofficeCutiFileName"
        );

    /* VALIDASI ELEMENT */
    if(
        !fileInput ||
        !fileNameElement
    ){
        return;
    }

    /* SUDAH DIINIT */
    if(
        fileInput.dataset.initialized
    ){
        return;
    }

    fileInput.dataset.initialized =
        "true";

    /* CHANGE LISTENER */
    fileInput.addEventListener(

        "change",

        function(){

            /* FILE */
            const file =
                fileInput.files[0];

            /* SHOW FILE NAME */
            if(file){
                fileNameElement.innerText =
                    file.name;
            }

            /* EMPTY FILE */
            else{
                fileNameElement.innerText =
                    "Belum ada file dipilih";
            }
        }
    );
}


/* ==========================================================================
   SMART OFFICE HELPER
========================================================================== */

/* ======================================================
   HITUNG MASA KERJA
====================================================== */

/* =========================
   HITUNG MASA KERJA

   FUNCTION:
   Menghitung masa kerja
   pegawai berdasarkan
   TMT Awal hingga
   tanggal saat ini.
========================= */
function smartofficeGetMasaKerja(
  tmtAwal
){

  if(
    !tmtAwal
  ){
    return '-';
  }

  /* FORMAT MM/dd/yyyy */
  const parts =
    String(tmtAwal)
      .split('/');

  const startDate =
    new Date(
      parts[2],
      parts[0] - 1,
      parts[1]
    );

  const today =
    new Date();

  let tahun =
    today.getFullYear()
    -
    startDate.getFullYear();

  let bulan =
    today.getMonth()
    -
    startDate.getMonth();

  if(
    today.getDate()
    <
    startDate.getDate()
  ){
    bulan--;
  }

  if(
    bulan < 0
  ){
    tahun--;
    bulan += 12;
  }

  return `

    ${tahun} Tahun
    ${bulan} Bulan

  `
  .replace(/\s+/g,' ')
  .trim();
}


/* ======================================================
   VALIDASI HARI MINGGU
====================================================== */

/* =========================
   VALIDASI HARI MINGGU

   FUNCTION:
   Mencegah pengguna
   memilih tanggal cuti
   yang jatuh pada
   hari Minggu.
========================= */
function smartofficeValidateSunday(
  inputId,
  message
){

  /* INPUT ELEMENT */
  const input =
    document.getElementById(
      inputId
    );

  /* VALIDASI ELEMENT */
  if(!input){
    return;
  }

  /* SUDAH DIINIT */
  if(input.dataset.sundayValidation){
    return;
  }

  input.dataset.sundayValidation =
    "true";

  /* CHANGE EVENT */
  input.addEventListener(

    'change',

    function(){

      /* EMPTY VALUE */
      if(!input.value){
        return;
      }

      /* DATE OBJECT */
      const selectedDate =
        new Date(
          input.value + 'T00:00:00'
        );

      /* HARI MINGGU */
      if(selectedDate.getDay() === 0){

        smartofficeShowToast(
          message,
          'error'
        );

        /* RESET VALUE */
        input.value =
          '';
      }
    }
  );
}


/* ======================================================
   FORMAT STATUS CUTI
====================================================== */

/* =========================
   FORMAT STATUS

   FUNCTION:
   Mengubah status cuti
   menjadi badge/status
   yang ditampilkan
   pada antarmuka.
========================= */
function smartofficeFormatStatusCuti(status){

  /* MENUNGGU */
  if(
    status ===
    'MENUNGGU_APPROVAL_1'
  ){
    return 'Menunggu';
  }

  /* DISETUJUI */
  if(status === 'DISETUJUI'){
    return 'Disetujui';
  }

  /* DITOLAK */
  if(status === 'DITOLAK'){
    return 'Ditolak';
  }

  /* DEFAULT */
  return status;
}


/* ======================================================
   APPROVAL BADGE
====================================================== */

/* =========================
   APPROVAL BADGE

   FUNCTION:
   Menghasilkan badge
   tampilan status
   approval cuti.
========================= */
/* ======================================================
   GET APPROVAL BADGE
====================================================== */
function smartofficeGetApprovalBadge(
  status
){

  if(
    status === 'DISETUJUI'
  ){

    return `
      <span class="
        smartoffice-riwayat-status
        approved
      ">
        Disetujui
      </span>
    `;
  }

  if(
    status === 'DITOLAK'
  ){

    return `
      <span class="
        smartoffice-riwayat-status
        rejected
      ">
        Ditolak
      </span>
    `;
  }

  return `
    <span class="
      smartoffice-riwayat-status
      waiting
    ">
      Menunggu
    </span>
  `;
}


/* ======================================================
   GLOBAL FUNCTIONS (UNTUK HTML ONCLICK)
====================================================== */

window.smartofficeRefreshCuti =
    smartofficeRefreshCuti;

window.smartofficeSwitchCutiTab =
    smartofficeSwitchCutiTab;

window.smartofficeFilterRiwayatCuti =
    smartofficeFilterRiwayatCuti;

window.smartofficeCloseRiwayatCutiDetail =
    smartofficeCloseRiwayatCutiDetail;

window.smartofficeSelectDelegasi =
    smartofficeSelectDelegasi;

window.smartofficeOpenRiwayatCutiDetail =
    smartofficeOpenRiwayatCutiDetail;


