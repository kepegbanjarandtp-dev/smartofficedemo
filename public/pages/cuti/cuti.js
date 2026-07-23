import {
    smartofficeGetPegawaiByNip,
    smartofficeSearchPegawai,
    smartofficeGetCutiStats,
    smartofficeGetRiwayatCuti,
    smartofficeGetJumlahCuti,
    smartofficeSubmitCuti
} from "../../services/cuti.service.js";


/* ================================================================================
   1. LOAD PAGE
================================================================================ */
export async function smartofficeLoadPage(){

    /* CHECK LOGIN SESSION */
    if(
        !smartofficeCheckSession()
    ){
        return;
    }

    /* GET SESSION */
    const sessionData =
        smartofficeGetSession();

    /* SESSION NOT FOUND */
    if(
        !sessionData
    ){
        await smartofficeLogout();
        return;
    }

    /* LOAD DATA PEGAWAI */
    await smartofficeLoadPegawai(
        sessionData.nip
    );

    /* LOAD CACHE PEGAWAI */
    await smartofficeLoadPegawaiCache();

    /* LOAD STATISTIK CUTI */
    await smartofficeLoadStats(
        sessionData.nip
    );

    /* LOAD RIWAYAT CUTI */
    await smartofficeLoadRiwayat(
        sessionData.nip
    );

    /* INIT EVENT */
    smartofficeBindEvents();

    /* DEFAULT TAB */
    smartofficeSwitchTab(
        "form"
    );

    /* MOBILE NAVBAR */
    smartofficeRenderMobileNavbar(
        sessionData.role,
        "cuti"
    );

}


/* ================================================================================
   2. DESTROY PAGE
================================================================================ */
export async function smartofficeDestroyPage(){

    /* RESET CACHE */
    smartofficePegawaiCache = [];

    smartofficeRiwayatCutiData = [];

    /* RESET SUBMIT LOCK */
    smartofficeSubmitting = false;

    /* FILE */
    smartofficeLampiranFile = null;

    /* AUTO HITUNG CUTI */
    document.getElementById(
        "smartofficeCutiJumlahHari"
    )?.value = "";

}

/* ================================================================================
   3. LOAD DATA
================================================================================ */
/* ======================================================
   LOAD DATA PEGAWAI
====================================================== */
async function smartofficeLoadPegawai(
    nip
){

    try{

        /* REQUEST DATA */
        const data =
            await smartofficeGetPegawaiByNip(
                nip
            );

        /* DATA TIDAK DITEMUKAN */
        if(
            !data
        ){
            return;
        }

        /* RENDER IDENTITAS */
        smartofficeRenderPegawai(
            data
        );

    }
    catch(error){

        console.error(
            "Load Pegawai Error:",
            error
        );

    }

}

/* ======================================================
   RENDER DATA PEGAWAI
====================================================== */
function smartofficeRenderPegawai(
    data
){

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

    document.getElementById(
        "smartofficeCutiStatusKepegawaian"
    ).value =
        data.statusKepegawaian || "";

    document.getElementById(
        "smartofficeCutiTmtAwal"
    ).value =
        data.tmtAwal || "";

    document.getElementById(
        "smartofficeCutiNoWa"
    ).value =
        data.noWa || "";

    document.getElementById(
        "smartofficeCutiSisaCuti"
    ).value =
        data.sisaCuti || 0;

}

/* ======================================================
   LOAD CUTI STATS
====================================================== */
async function smartofficeLoadStats(
    nip
){

    try{

        /* REQUEST DATA */
        const data =
            await smartofficeGetCutiStats(
                nip
            );

        /* DATA TIDAK DITEMUKAN */
        if(
            !data
        ){
            return;
        }

        /* RENDER */
        smartofficeRenderStats(
            data
        );

    }
    catch(error){

        console.error(
            "Load Cuti Stats Error:",
            error
        );

    }

}

/* ======================================================
   RENDER CUTI STATS
====================================================== */
function smartofficeRenderStats(
    data
){

    document.getElementById(
        "smartofficeStatSisaCuti"
    ).textContent =
        data.sisaCuti || 0;

    document.getElementById(
        "smartofficeStatMenungguCuti"
    ).textContent =
        data.menunggu || 0;

    document.getElementById(
        "smartofficeStatDisetujuiCuti"
    ).textContent =
        data.disetujui || 0;

}

/* ======================================================
   LOAD RIWAYAT CUTI
====================================================== */
async function smartofficeLoadRiwayat(
    nip
){

    try{

        /* REQUEST DATA */
        const data =
            await smartofficeGetRiwayatCuti(
                nip
            );

        /* SIMPAN CACHE */
        smartofficeRiwayatCutiData =
            data || [];

        /* RENDER */
        smartofficeRenderRiwayat(
            smartofficeRiwayatCutiData
        );

    }
    catch(error){

        console.error(
            "Load Riwayat Error:",
            error
        );

    }

}

/* ======================================================
   RENDER RIWAYAT CUTI
====================================================== */
function smartofficeRenderRiwayat(
    data
){

    /* CONTAINER */
    const container =
        document.getElementById(
            "smartofficeRiwayatCutiList"
        );

    if(
        !container
    ){
        return;
    }

    /* EMPTY */
    if(
        data.length === 0
    ){

        container.innerHTML = `
            <div class="smartoffice-empty-state">

                <div class="smartoffice-empty-icon">
                    📭
                </div>

                <h3>
                    Belum Ada Riwayat
                </h3>

                <p>
                    Riwayat cuti akan tampil di sini.
                </p>

            </div>
        `;

        return;

    }

    /* HTML */
    let html = "";

    data.forEach(item=>{

        html +=
            smartofficeCreateRiwayatCard(
                item
            );

    });

    container.innerHTML =
        html;

}


/* ======================================================
   CREATE RIWAYAT CARD
====================================================== */
function smartofficeCreateRiwayatCard(
    item
){

    return `

        <div
            class="smartoffice-riwayat-cuti-card"
        >

            <div
                class="smartoffice-riwayat-cuti-content"
            >

                <h3>
                    ${item.jenisCuti}
                </h3>

                <small>
                    ${item.jumlahCuti} Hari
                </small>

                <p>
                    ${item.tanggalAwal}
                    -
                    ${item.tanggalAkhir}
                </p>

            </div>

            <div
                class="smartoffice-riwayat-cuti-right"
            >

                <span
                    class="
                        smartoffice-riwayat-status
                    "
                >
                    ${item.status}
                </span>

            </div>

        </div>

    `;

}


/* ================================================================================
   4. EVENT
================================================================================ */
/* ======================================================
   BIND EVENTS
====================================================== */
function smartofficeBindEvents(){

    /* TAB FORM */
    document
    .getElementById(
        "smartofficeTabFormCuti"
    )
    ?.addEventListener(
        "click",
        ()=>{
            smartofficeSwitchTab(
                "form"
            );
        }
    );

    /* TAB RIWAYAT */
    document
    .getElementById(
        "smartofficeTabRiwayatCuti"
    )
    ?.addEventListener(
        "click",
        ()=>{
            smartofficeSwitchTab(
                "riwayat"
            );
        }
    );

    /* SUBMIT CUTI */
    document
    .getElementById(
        "smartofficeCutiSubmitButton"
    )
    ?.addEventListener(
        "click",
        smartofficeSubmitCuti
    );

    /* AUTOCOMPLETE */
    smartofficeInitAutocomplete();

    /* FILE UPLOAD */
    smartofficeInitFileUpload();

    /* AUTO HITUNG CUTI */
    smartofficeInitAutoHitungCuti();
}


/* ======================================================
   SWITCH TAB
====================================================== */
function smartofficeSwitchTab(
    tab
){

    /* CONTENT */
    const formContent =
        document.getElementById(
            "smartofficeFormCutiContent"
        );

    const riwayatContent =
        document.getElementById(
            "smartofficeRiwayatCutiContent"
        );

    /* BUTTON */
    const formButton =
        document.getElementById(
            "smartofficeTabFormCuti"
        );

    const riwayatButton =
        document.getElementById(
            "smartofficeTabRiwayatCuti"
        );

    if(
        !formContent ||
        !riwayatContent
    ){
        return;
    }

    /* RESET */
    formButton?.classList.remove(
        "active"
    );

    riwayatButton?.classList.remove(
        "active"
    );

    /* FORM */
    if(
        tab === "form"
    ){

        formContent.style.display =
            "block";

        riwayatContent.style.display =
            "none";

        formButton?.classList.add(
            "active"
        );

        return;

    }

    /* RIWAYAT */
    formContent.style.display =
        "none";

    riwayatContent.style.display =
        "block";

    riwayatButton?.classList.add(
        "active"
    );
}

/* ======================================================
   5. AUTOCOMPLETE
====================================================== */
/* ======================================================
   GLOBAL AUTOCOMPLETE
====================================================== */

let smartofficePegawaiCache = [];

let smartofficeAutocompleteInitialized =
    false;

/* ======================================================
   LOAD CACHE DATA PEGAWAI
====================================================== */

async function smartofficeLoadPegawaiCache(){

    try{

        /* REQUEST DATA */
        smartofficePegawaiCache =
            await smartofficeSearchPegawai();

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
   INIT AUTOCOMPLETE
====================================================== */

function smartofficeInitAutocomplete(){

    /* SUDAH DIINIT */
    if(
        smartofficeAutocompleteInitialized
    ){
        return;
    }

    smartofficeAutocompleteInitialized = true;

    /* INPUT */
    const input =
        document.getElementById(
            "smartofficeCutiDelegasi"
        );

    if(!input){
        return;
    }

    /* INPUT EVENT */
    input.addEventListener(
        "input",
        smartofficeAutocompleteDelegasi
    );

    /* FOCUS EVENT */
    input.addEventListener(
        "focus",
        smartofficeAutocompleteDelegasi
    );

    /* CLICK AUTOCOMPLETE */
    document.addEventListener(

        "click",

        function(event){

            /* ITEM AUTOCOMPLETE */
            const item =
                event.target.closest(
                    ".smartoffice-cuti-autocomplete-item"
                );

            /* CONTAINER */
            const container =
                document.getElementById(
                    "smartofficeCutiDelegasiAutocomplete"
                );

            /* INPUT */
            const input =
                document.getElementById(
                    "smartofficeCutiDelegasi"
                );

            /* NIP */
            const nip =
                document.getElementById(
                    "smartofficeCutiDelegasiNip"
                );

            /* VALIDASI */
            if(
                !container ||
                !input ||
                !nip
            ){
                return;
            }

            /* PILIH ITEM */
            if(item){

                input.value =
                    item.dataset.nama;

                nip.value =
                    item.dataset.nip;

                container.innerHTML = "";

                return;

            }

            /* CLICK DI LUAR */
            if(
                !event.target.closest(
                    "#smartofficeCutiDelegasi"
                ) &&
                !event.target.closest(
                    "#smartofficeCutiDelegasiAutocomplete"
                )
            ){

                container.innerHTML = "";

            }

        }

    );

}

/* ======================================================
   AUTOCOMPLETE DELEGASI
====================================================== */

function smartofficeAutocompleteDelegasi(){

    /* INPUT */
    const input =
        document.getElementById(
            "smartofficeCutiDelegasi"
        );

    /* RESULT */
    const result =
        document.getElementById(
            "smartofficeCutiDelegasiAutocomplete"
        );

    /* VALIDASI */
    if(
        !input ||
        !result
    ){
        return;
    }

    /* KEYWORD */
    const keyword =
        input.value
        .trim()
        .toLowerCase();

    /* RESET */
    result.innerHTML = "";

    /* EMPTY */
    if(
        keyword.length === 0
    ){
        return;
    }

    /* SESSION */
    const sessionData =
        smartofficeGetSession();

    /* FILTER */
    const filtered =
        smartofficePegawaiCache.filter(

            item=>{

                /* TIDAK BOLEH DIRI SENDIRI */
                if(
                    item.nip ===
                    sessionData.nip
                ){
                    return false;
                }

                return item.nama
                    .toLowerCase()
                    .includes(keyword);

            }

        );

    /* RENDER */
    smartofficeRenderAutocomplete(
        filtered
    );

}

/* ======================================================
   RENDER AUTOCOMPLETE
====================================================== */

function smartofficeRenderAutocomplete(
    data
){

    /* CONTAINER */
    const container =
        document.getElementById(
            "smartofficeCutiDelegasiAutocomplete"
        );

    /* VALIDASI */
    if(!container){
        return;
    }

    /* EMPTY */
    if(
        data.length === 0
    ){

        container.innerHTML = `

            <div class="
                smartoffice-cuti-autocomplete-empty
            ">

                Pegawai tidak ditemukan

            </div>

        `;

        return;

    }

    /* HTML */
    let html = "";

    data.forEach(item=>{

        html += `

            <div

                class="
                    smartoffice-cuti-autocomplete-item
                "

                data-nama="${item.nama}"

                data-nip="${item.nip}"

            >

                <strong>

                    ${item.nama}

                </strong>

                <span>

                    ${item.nip}

                </span>

            </div>

        `;

    });

    container.innerHTML =
        html;

}



/* ======================================================
   6. FILE UPLOAD
====================================================== */

/* ======================================================
   GLOBAL FILE
====================================================== */

let smartofficeLampiranFile = null;

/* ======================================================
   INIT FILE UPLOAD
====================================================== */

function smartofficeInitFileUpload(){

    /* INPUT FILE */
    const input =
        document.getElementById(
            "smartofficeCutiLampiran"
        );

    /* FILE NAME */
    const fileName =
        document.getElementById(
            "smartofficeCutiFileName"
        );

    /* VALIDASI */
    if(
        !input ||
        !fileName
    ){
        return;
    }

    /* CHANGE FILE */
    input.addEventListener(

        "change",

        smartofficeHandleFileUpload

    );

}

/* ======================================================
   HANDLE FILE UPLOAD
====================================================== */

function smartofficeHandleFileUpload(){

    /* INPUT */
    const input =
        document.getElementById(
            "smartofficeCutiLampiran"
        );

    /* FILE NAME */
    const fileName =
        document.getElementById(
            "smartofficeCutiFileName"
        );

    /* VALIDASI */
    if(
        !input ||
        !fileName
    ){
        return;
    }

    /* RESET */
    smartofficeLampiranFile = null;

    /* FILE */
    const file =
        input.files[0];

    /* BELUM ADA FILE */
    if(!file){

        fileName.textContent =
            "Belum ada file dipilih";

        return;

    }

    /* VALIDASI UKURAN (5 MB) */
    const maxSize =
        5 * 1024 * 1024;

    if(
        file.size > maxSize
    ){

        smartofficeShowToast(
            "Ukuran file maksimal 5 MB.",
            "warning"
        );

        input.value = "";

        fileName.textContent =
            "Belum ada file dipilih";

        return;

    }

    /* VALIDASI TIPE FILE */
    const allowedTypes = [

        "application/pdf",

        "image/jpeg",

        "image/png"

    ];

    if(
        !allowedTypes.includes(
            file.type
        )
    ){

        smartofficeShowToast(
            "File harus berupa PDF, JPG, atau PNG.",
            "warning"
        );

        input.value = "";

        fileName.textContent =
            "Belum ada file dipilih";

        return;

    }

    /* SIMPAN FILE */
    smartofficeLampiranFile =
        file;

    /* TAMPILKAN NAMA FILE */
    fileName.textContent =
        file.name;

}



/* ======================================================
   7. AUTO HITUNG CUTI
====================================================== */

/* ======================================================
   INIT AUTO HITUNG CUTI
====================================================== */

function smartofficeInitAutoHitungCuti(){

    /* TANGGAL MULAI */
    const tanggalAwal =
        document.getElementById(
            "smartofficeCutiTanggalAwal"
        );

    /* TANGGAL AKHIR */
    const tanggalAkhir =
        document.getElementById(
            "smartofficeCutiTanggalAkhir"
        );

    /* VALIDASI */
    if(
        !tanggalAwal ||
        !tanggalAkhir
    ){
        return;
    }

    /* CHANGE TANGGAL MULAI */
    tanggalAwal.addEventListener(
        "change",
        smartofficeHitungJumlahCuti
    );

    /* CHANGE TANGGAL AKHIR */
    tanggalAkhir.addEventListener(
        "change",
        smartofficeHitungJumlahCuti
    );

}

/* ======================================================
   HITUNG JUMLAH CUTI
====================================================== */

async function smartofficeHitungJumlahCuti(){

    try{

        /* TANGGAL MULAI */
        const tanggalAwal =
            document.getElementById(
                "smartofficeCutiTanggalAwal"
            );

        /* TANGGAL AKHIR */
        const tanggalAkhir =
            document.getElementById(
                "smartofficeCutiTanggalAkhir"
            );

        /* JUMLAH CUTI */
        const jumlahCuti =
            document.getElementById(
                "smartofficeCutiJumlahHari"
            );

        /* VALIDASI */
        if(
            !tanggalAwal ||
            !tanggalAkhir ||
            !jumlahCuti
        ){
            return;
        }

        /* RESET */
        jumlahCuti.value = "";

        /* BELUM LENGKAP */
        if(
            !tanggalAwal.value ||
            !tanggalAkhir.value
        ){
            return;
        }

        /* REQUEST BACKEND */
        const response =
            await smartofficeGetJumlahCuti(

                tanggalAwal.value,

                tanggalAkhir.value

            );

        /* TAMPILKAN HASIL */
        jumlahCuti.value =
            response.jumlahHari;

    }
    catch(error){

        console.error(error);

        smartofficeShowToast(

            error.message,

            "error"

        );

    }

}


/* ======================================================
   8. SUBMIT CUTI
====================================================== */
/* ======================================================
   GLOBAL SUBMIT
====================================================== */

let smartofficeSubmitting = false;

/* ======================================================
   VALIDASI FORM CUTI
====================================================== */

function smartofficeValidateForm(){

    /* FORM */
    const form = document.getElementById(
        "smartofficeFormCuti"
    );

    /* VALIDASI */
    if(!form){
        return false;
    }

    /* FIELD WAJIB */
    const requiredFields = [

        "smartofficeCutiJenis",

        "smartofficeCutiTanggalAwal",

        "smartofficeCutiTanggalAkhir",

        "smartofficeCutiJumlahHari",

        "smartofficeCutiKeperluan",

        "smartofficeCutiDelegasi",

        "smartofficeCutiTugasDelegasi"

    ];

    /* CEK SATU PER SATU */
    for(const id of requiredFields){

        const element =
            document.getElementById(id);

        if(
            !element ||
            !element.value.trim()
        ){

            smartofficeShowToast(
                "Lengkapi seluruh data terlebih dahulu.",
                "warning"
            );

            element?.focus();

            return false;

        }

    }

    return true;

}

/* ======================================================
   GET FORM DATA
====================================================== */

function smartofficeGetFormData(){

    return{

        jenisCuti:

            document.getElementById(
                "smartofficeCutiJenis"
            )?.value ?? "",

        tanggalAwal:

            document.getElementById(
                "smartofficeCutiTanggalAwal"
            )?.value ?? "",

        tanggalAkhir:

            document.getElementById(
                "smartofficeCutiTanggalAkhir"
            )?.value ?? "",

        jumlahHari:

            document.getElementById(
                "smartofficeCutiJumlahHari"
            )?.value ?? "",

        keperluan:

            document.getElementById(
                "smartofficeCutiKeperluan"
            )?.value ?? "",

        delegasi:

            document.getElementById(
                "smartofficeCutiDelegasi"
            )?.value ?? "",

        nipDelegasi:

            document.getElementById(
                "smartofficeCutiDelegasiNip"
            )?.value ?? "",

        tugasDelegasi:

            document.getElementById(
                "smartofficeCutiTugasDelegasi"
            )?.value ?? "",

        lampiran:

            smartofficeLampiranFile

    };

}

/* ======================================================
   RESET FORM CUTI
====================================================== */

function smartofficeResetForm(){

    /* FORM */
    const form =
        document.getElementById(
            "smartofficeFormCuti"
        );

    /* RESET FORM */
    form?.reset();

    /* RESET FILE */
    smartofficeLampiranFile =
        null;

    /* RESET FILE NAME */
    document.getElementById(
        "smartofficeCutiFileName"
    ).textContent =
        "Belum ada file dipilih";

    /* RESET AUTOCOMPLETE */
    document.getElementById(
        "smartofficeCutiDelegasiAutocomplete"
    ).innerHTML =
        "";

    /* RESET NIP DELEGASI */
    document.getElementById(
        "smartofficeCutiDelegasiNip"
    ).value =
        "";

    /* RESET JUMLAH CUTI */
    document.getElementById(
        "smartofficeCutiJumlahHari"
    ).value =
        "";

}

/* ======================================================
   SUBMIT CUTI
====================================================== */

async function smartofficeSubmitCuti(){

    try{

        /* CEGAH DOUBLE SUBMIT */
        if(
            smartofficeSubmitting
        ){
            return;
        }

        /* VALIDASI */
        if(
            !smartofficeValidateForm()
        ){
            return;
        }

        /* STATUS SUBMIT */
        smartofficeSubmitting =
            true;

        /* BUTTON */
        const button =
            document.getElementById(
                "smartofficeCutiSubmitButton"
            );

        /* LOADING BUTTON */
        button.disabled = true;

        button.innerHTML =
            `
                <i class="fa-solid fa-spinner fa-spin"></i>
                Mengirim...
            `;

        /* FORM DATA */
        const formData =
            smartofficeGetFormData();

        /* SUBMIT */
        await smartofficeSubmitCuti(
            formData
        );

        /* TOAST */
        smartofficeShowToast(

            "Pengajuan cuti berhasil dikirim.",

            "success"

        );

        /* RESET FORM */
        smartofficeResetForm();

        /* SESSION */
        const session =
            smartofficeGetSession();

        /* REFRESH DATA */
        await smartofficeLoadStats(
            session.nip
        );

        await smartofficeLoadRiwayat(
            session.nip
        );

    }
    catch(error){

        console.error(error);

        smartofficeShowToast(

            error.message,

            "error"

        );

    }
    finally{

        /* STATUS SUBMIT */
        smartofficeSubmitting =
            false;

        /* BUTTON */
        const button =
            document.getElementById(
                "smartofficeCutiSubmitButton"
            );

        if(button){

            button.disabled =
                false;

            button.innerHTML =
                `
                    <i class="fa-solid fa-paper-plane"></i>
                    Ajukan Cuti
                `;

        }

    }

}




/* ======================================================
   HELPER
====================================================== */

/* ======================================================
   9. FILTER RIWAYAT
====================================================== */



/* ======================================================
   10. MODAL DETAIL
====================================================== */





/* ======================================================
   1. HITUNG MASA KERJA
====================================================== */
export function smartofficeGetMasaKerja(
    tmtAwal
){

    if(!tmtAwal){
        return "-";
    }

    const parts =
        String(tmtAwal)
        .split("/");

    const startDate =
        new Date(
            parts[2],
            parts[0]-1,
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

    return `${tahun} Tahun ${bulan} Bulan`;

}


/* ======================================================
   2. VALIDASI HARI MINGGU
====================================================== */
export function smartofficeValidateSunday(
    inputId,
    message
){

    const input =
        document.getElementById(
            inputId
        );

    if(!input){
        return;
    }

    if(
        input.dataset.sundayValidation
    ){
        return;
    }

    input.dataset.sundayValidation =
        "true";

    input.addEventListener(
        "change",
        ()=>{

            if(
                !input.value
            ){
                return;
            }

            const date =
                new Date(
                    input.value +
                    "T00:00:00"
                );

            if(
                date.getDay() === 0
            ){

                smartofficeShowToast(
                    message,
                    "error"
                );

                input.value = "";

            }

        }
    );

}


/* ======================================================
   3. FORMAT STATUS CUTI
====================================================== */
export function smartofficeFormatStatusCuti(
    status
){

    if(
        status ===
        "MENUNGGU_APPROVAL_1"
    ){
        return "Menunggu";
    }

    if(
        status ===
        "DISETUJUI"
    ){
        return "Disetujui";
    }

    if(
        status ===
        "DITOLAK"
    ){
        return "Ditolak";
    }

    return status;

}


/* ======================================================
   4. APPROVAL BADGE
====================================================== */
export function smartofficeGetApprovalBadge(
    status
){

    if(
        status ===
        "DISETUJUI"
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
        status ===
        "DITOLAK"
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