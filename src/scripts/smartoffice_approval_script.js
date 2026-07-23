import {
    smartofficeCheckSession,
    smartofficeGetSession
}
from "../session/smartoffice_session.js";

import {
    smartofficeApi
}
from "../services/smartoffice_api.js";

import {
    smartofficeRenderMobileNavbar
}
from "../components/navbar.js";

import { smartofficeLoadDashboardPage } from "./smartoffice_dashboard_script.js";

/* ==========================================================================
   SMART OFFICE GLOBAL VARIABLE
========================================================================== */

/* =========================
   APPROVAL STATE
========================= */
const smartofficeApprovalState = {

    idCuti : ''

};

/* =========================
   APPROVAL ACTION
========================= */
let smartofficeApprovalAction =
    'APPROVE';

/* =========================
   SUBMIT LOCK
========================= */
let smartofficeSubmittingApproval =
    false;


/* ==========================================================================
   SMART OFFICE INITIALIZATION
========================================================================== */
export async function smartofficeLoadApprovalPage(){

    console.log(
        "APPROVAL PAGE LOADED"
    );

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

    /* PRELOAD DETAIL MODAL */
    const modal =
        document.getElementById(
            "smartofficeApprovalDetailModal"
        );

    if(modal){

        modal.style.display =
            "flex";

        modal.style.opacity =
            "0";

        setTimeout(function(){

            modal.style.display =
                "none";

            modal.style.opacity =
                "";

        },50);

    }

    /* LOAD APPROVAL CUTI */
    await smartofficeLoadApprovalCuti();

    /* RENDER MOBILE NAVBAR */
    smartofficeRenderMobileNavbar(

        sessionData.role,

        "approval"

    );

}


/* ======================================================
   SMART OFFICE LOAD APPROVAL CUTI
====================================================== */

/* =========================
   LOAD APPROVAL CUTI

   FLOW:
   1. Ambil session login
   2. Request approval backend
   3. Render approval card
========================= */
async function smartofficeLoadApprovalCuti(){

  /* =========================
     SESSION
  ========================= */
  const sessionData =
    smartofficeGetSession();

  if(!sessionData){
    return;
  }

  /* =========================
     CONTAINER
  ========================= */
  const container =
    document.getElementById(
      'smartofficeApprovalCutiList'
    );

  if(
    !container
  ){

    console.log(
      'CONTAINER BELUM ADA'
    );

    return;

  }

  /* =========================
     LOADING
  ========================= */
  container.innerHTML = `

    <div class="
      smartoffice-approval-skeleton-card
    "></div>

    <div class="
      smartoffice-approval-skeleton-card
    "></div>

    <div class="
      smartoffice-approval-skeleton-card
    "></div>

  `;

  /* =========================
     REQUEST BACKEND
  ========================= */
 
  try{

        const response =
            await smartofficeApi(
                "smartofficeGetApprovalCuti",
                {
                    nip: sessionData.nip
                }
            );

        const data =
            response.data || [];


        /* =========================
          EMPTY DATA
        ========================= */
        if(
          !data ||
          data.length === 0
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
                Tidak ada approval
              </h3>

              <p>
                Belum ada pengajuan
                yang perlu diproses
              </p>
            </div>
          `;

          return;
        }

        /* =========================
          HTML
        ========================= */
        let html = '';

        /* =========================
          AVATAR COLORS
        ========================= */
        const avatarColors = [

          'linear-gradient(135deg,#2563eb,#1d4ed8)',
          'linear-gradient(135deg,#7c3aed,#6d28d9)',
          'linear-gradient(135deg,#059669,#047857)',
          'linear-gradient(135deg,#ea580c,#c2410c)',
          'linear-gradient(135deg,#db2777,#be185d)',
          'linear-gradient(135deg,#0891b2,#0e7490)',
          'linear-gradient(135deg,#dc2626,#b91c1c)'

        ];

        /* =========================
          LOOP DATA
        ========================= */
        data.forEach(
          function(item,index){
            
            const avatarColor =
              avatarColors[
                index % avatarColors.length
              ];

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
              
            html += `
              <div class="
                smartoffice-approval-card
              ">
                <div class="
                  smartoffice-approval-card-header
                ">

                  <!-- LEFT -->
                  <div class="
                    smartoffice-approval-card-user
                  ">

                    <!-- AVATAR -->
                    <div
                      class="
                        smartoffice-approval-avatar
                      "

                      style="
                        background:${avatarColor};
                      "
                    >
                      ${
                        item.nama
                        ? item.nama.charAt(0)
                        : 'A'
                      }
                    </div>

                    <!-- INFO -->
                    <div class="
                      smartoffice-approval-card-info
                    ">

                      <div class="
                        smartoffice-approval-card-title
                      ">
                        ${item.nama}
                      </div>

                      <div class="
                        smartoffice-approval-card-subtitle
                      ">
                        ${item.jabatan || '-'}
                      </div>

                    </div>

                  </div>

                  <!-- STATUS -->
                  <div class="
                    smartoffice-approval-status
                  ">
                    Pending
                  </div>

                </div>

                <div class="
                  smartoffice-approval-card-body
                ">
                  <div class="
                    smartoffice-approval-item
                  ">
                    <div class="
                      smartoffice-approval-label
                    ">
                      Jenis Cuti
                    </div>

                    <div class="
                      smartoffice-approval-value
                    ">
                      ${item.jenisCuti}
                    </div>
                  </div>

                  <div class="
                    smartoffice-approval-item
                  ">
                    <div class="
                      smartoffice-approval-label
                    ">
                      Tanggal Cuti
                    </div>

                    <div class="
                      smartoffice-approval-value
                    ">
                      ${periodeCuti}
                    </div>
                  </div>

                  <div class="
                    smartoffice-approval-item
                  ">
                    <div class="
                      smartoffice-approval-label
                    ">
                      Jumlah Hari
                    </div>

                    <div class="
                      smartoffice-approval-value
                    ">
                      ${item.jumlahCuti} Hari
                    </div>
                  </div>

                  <div class="
                    smartoffice-approval-item
                  ">
                    <div class="
                      smartoffice-approval-label
                    ">
                      Keperluan
                    </div>

                    <div class="
                      smartoffice-approval-value
                    ">
                      ${item.keperluan}
                    </div>
                  </div>
                </div>

                <!-- =========================
                    FOOTER ACTION
                ========================= -->
                <div class="
                  smartoffice-approval-card-footer
                ">

                  <!-- DETAIL & APPROVAL -->
                  <button
                    class="
                      smartoffice-approval-detail-button
                    "
                    onclick='
                      smartofficeOpenApprovalDetail(
                        ${JSON.stringify(item)}
                      )
                    '
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="
                        M1 12s4-8 11-8
                        11 8 11 8
                        -4 8-11 8
                        -11-8-11-8
                      "/>

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>

                    <span>
                      Detail & Approval
                    </span>
                  </button>
                </div>
              </div>
            `;
          }
        );

        /* =========================
          RENDER HTML
        ========================= */
        container.innerHTML =
          html;

    }

    catch(error){

        console.error(error);

        container.innerHTML = `
            <div class="
                smartoffice-empty-state
            ">
                Gagal memuat data approval.
            </div>
        `;

    }    
}


/* ======================================================
   REFRESH APPROVAL
====================================================== */
async function smartofficeRefreshApproval(){

    await smartofficeLoadApprovalCuti();

    smartofficeShowToast(
        "Data berhasil diperbarui",
        "success"
    );

}


/* ======================================================
   SMART OFFICE SWITCH APPROVAL TAB
====================================================== */
function smartofficeSwitchApprovalTab(tab){

    const cutiContent =
        document.getElementById(
            "smartofficeApprovalCutiContent"
        );

    const spdContent =
        document.getElementById(
            "smartofficeApprovalSpdContent"
        );

    const cutiButton =
        document.getElementById(
            "smartofficeTabApprovalCuti"
        );

    const spdButton =
        document.getElementById(
            "smartofficeTabApprovalSpd"
        );

    if(
        !cutiContent ||
        !spdContent ||
        !cutiButton ||
        !spdButton
    ){
        return;
    }

    cutiButton.classList.remove("active");
    spdButton.classList.remove("active");

    if(tab === "cuti"){

        cutiContent.style.display = "block";
        spdContent.style.display = "none";

        cutiButton.classList.add("active");

        return;

    }

    cutiContent.style.display = "none";
    spdContent.style.display = "block";

    spdButton.classList.add("active");

}


/* ======================================================
   SMART OFFICE PROCESS APPROVAL CUTI
====================================================== */

/* =========================
   PROCESS APPROVAL CUTI

   FLOW:
   1. Ambil session login
   2. Call backend approval
   3. Reload approval list
========================= */
async function smartofficeProcessApprovalCuti(
    idCuti,
    action
){

    /* =========================
       SESSION
    ========================= */
    const sessionData =
        smartofficeGetSession();

    if(!sessionData){
        return;
    }

    try{

        /* =========================
           REQUEST BACKEND
        ========================= */
        const response =
            await smartofficeApi(
                "smartofficeProcessApprovalCuti",
                {
                    idCuti,
                    action,
                    nip: sessionData.nip,
                    catatan: ""
                }
            );

        /* =========================
           FAILED
        ========================= */
        if(!response.success){

            smartofficeShowToast(
                response.message,
                "error"
            );

            return;

        }

        /* =========================
           SUCCESS
        ========================= */
        smartofficeShowToast(
            response.message,
            "success"
        );

        /* =========================
           RELOAD DATA
        ========================= */
        await smartofficeLoadApprovalCuti();

    }
    catch(error){

        console.error(error);

        smartofficeShowToast(
            error.message ||
            "Terjadi kesalahan.",
            "error"
        );

    }

}


/* ======================================================
   SMART OFFICE OPEN APPROVAL DETAIL
====================================================== */

/* =========================
   OPEN DETAIL MODAL
========================= */
function smartofficeOpenApprovalDetail(
  item
){

  /* =========================
     SAVE ACTIVE ID CUTI
  ========================= */
  smartofficeApprovalState.idCuti =
    item.idCuti;

  /* =========================
     MODAL
  ========================= */
  const modal =
    document.getElementById(
      'smartofficeApprovalDetailModal'
    );

  /* =========================
     BODY
  ========================= */
  const body =
    document.getElementById(
      'smartofficeApprovalDetailBody'
    );

  if(!modal || !body){
    return;
  }

  /* =========================
     SHOW MODAL
  ========================= */
  modal.style.display =
  'flex';

  setTimeout(function(){

    modal.classList.add(
      'show'
    );

  },10);

  /* =========================
    RESET ACTION
  ========================= */
  smartofficeApprovalAction =
    'APPROVE';

  /* =========================
    HELPER
  ========================= */
  const identitasLabel =
    item.statusKepegawaian === 'BLUD'
      ? 'NRP'
      : 'NIP';

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

  /* =========================
     RENDER DETAIL
  ========================= */
    body.innerHTML = `

      <!-- PROFILE HEADER -->
      <div class="
        smartoffice-approval-profile
      ">

        <!-- AVATAR -->
        <div class="
          smartoffice-approval-avatar
        ">
          ${item.nama
            ? item.nama.charAt(0)
            : 'A'
          }
        </div>

        <!-- INFO -->
        <div class="
          smartoffice-approval-profile-info
        ">
          <h4>
            ${item.nama || '-'}
          </h4>

          <p>
            ${item.jabatan || '-'}
          </p>
        </div>
      </div>

      <!-- DETAIL -->
      <div class="
        smartoffice-approval-detail-grid
      ">

        <!-- NIP -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>${identitasLabel}</label>
          <span>
            ${item.nip || '-'}
          </span>
        </div>

        <!-- STATUS -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>Status Kepegawaian</label>
          <span>
            ${item.statusKepegawaian || '-'}
          </span>
        </div>

        <!-- MASA KERJA -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>Masa Kerja</label>
          <span>
            ${item.masaKerja || '-'}
          </span>
        </div>

        <!-- JENIS CUTI -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>Jenis Cuti</label>
          <span>
            ${item.jenisCuti || '-'}
          </span>
        </div>

        <!-- TANGGAL SURAT -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>
            Tanggal Surat Permohonan
          </label>

          <span>
            ${item.tanggalSurat || '-'}
          </span>
        </div>

        <!-- TANGGAL CUTI -->
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

        <!-- JUMLAH -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>Jumlah Hari</label>
          <span>
            ${item.jumlahCuti || 0} Hari
          </span>
        </div>

        <!-- SISA CUTI -->
        <div class="
          smartoffice-approval-detail-item
        ">
          <label>Sisa Cuti Tahunan</label>
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
        <label>Keperluan</label>

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

      <!-- DELEGASI -->
      <div class="
        smartoffice-approval-detail-grid
      ">

        <div class="
          smartoffice-approval-detail-item
        ">
          <label>Penerima Delegasi</label>

          <span>
            ${item.delegasi || '-'}
          </span>
        </div>

        <div class="
          smartoffice-approval-detail-item
        ">
          <label>NIP / NRP</label>

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

      <!-- LAMPIRAN -->
      <div class="
        smartoffice-approval-lampiran
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

      <!-- INFO BOX -->
      <div class="
        smartoffice-approval-info-box
      ">

        <div class="
          smartoffice-approval-info-icon
        ">
          ℹ
        </div>

        <div class="
          smartoffice-approval-info-text
        ">

          Pastikan data pengajuan cuti
          sudah sesuai sebelum
          melakukan approval.

        </div>
      </div>

      <!-- APPROVAL ACTION -->
      <div class="
        smartoffice-approval-action
      ">

        <div class="
          smartoffice-approval-action-title
        ">
          Aksi Approval
        </div>

        <!-- ACTION BUTTONS -->
        <div class="
          smartoffice-approval-action-buttons
        ">

          <!-- APPROVE -->
          <button
            id="smartofficeApproveActionButton"
            class="
              smartoffice-approval-action-button
            "
            type="button"
            onclick="
              smartofficeSetApprovalAction(
                'APPROVE'
              )
            "
          >
            ✓ Approve
          </button>

          <!-- REJECT -->
          <button
            id="smartofficeRejectActionButton"
            class="
              smartoffice-approval-action-button
            "
            type="button"
            onclick="
              smartofficeSetApprovalAction(
                'REJECT'
              )
            "
          >
            ✕ Reject
          </button>
        </div>

        <!-- CATATAN -->
        <div
          id="smartofficeApprovalCatatanWrapper"
          style="
            display:none;
          "
        >

          <textarea
            id="smartofficeApprovalCatatan"
            class="
              smartoffice-approval-catatan
            "
            placeholder="
              Tulis alasan penolakan...
            "
          ></textarea>

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
              smartofficeCloseApprovalDetail()
            "
          >
            Batal
          </button>

          <button

            id="smartofficeApprovalSubmitButton"

            class="
              smartoffice-approval-submit-button
            "

            onclick="
              smartofficeSubmitApprovalAction()
            "
          >
            Submit
          </button>
        </div>
      </div>
    `;
  
}


/* ======================================================
   SMART OFFICE CLOSE APPROVAL DETAIL
====================================================== */
function smartofficeCloseApprovalDetail(){

    const modal =
        document.getElementById(
            "smartofficeApprovalDetailModal"
        );

    if(!modal){
        return;
    }

    /* REMOVE SHOW */
    modal.classList.remove(
        "show"
    );

    /* HIDE AFTER ANIMATION */
    setTimeout(function(){

        modal.style.display =
            "none";

    },250);

}


/* ======================================================
   SUBMIT APPROVAL ACTION
====================================================== */
async function smartofficeSubmitApprovalAction(){

    /* PREVENT DOUBLE CLICK */
    if(smartofficeSubmittingApproval){
        return;
    }

    /* =========================
       SESSION
    ========================= */
    const sessionData =
        smartofficeGetSession();

    if(!sessionData){
        return;
    }

    /* =========================
       ACTION
    ========================= */
    const action =
        smartofficeApprovalAction;

    /* =========================
       CATATAN
    ========================= */
    const textarea =
        document.getElementById(
            "smartofficeApprovalCatatan"
        );

    const catatan =
        textarea
            ? textarea.value.trim()
            : "";

    /* =========================
       VALIDASI REJECT
    ========================= */
    if(
        action === "REJECT" &&
        !catatan
    ){

        smartofficeShowToast(
            "Catatan reject wajib diisi",
            "error"
        );

        return;

    }

    /* =========================
       BUTTON
    ========================= */
    const submitButton =
        document.getElementById(
            "smartofficeApprovalSubmitButton"
        );

    if(!submitButton){
        return;
    }

    /* LOCK */
    smartofficeSubmittingApproval =
        true;

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
                ${
                    action === "REJECT"
                    ? "Menolak..."
                    : "Menyetujui..."
                }
            </span>

        </div>

    `;

    try{

        /* =========================
           REQUEST BACKEND
        ========================= */
        const response =
            await smartofficeApi(
                "smartofficeProcessApprovalCuti",
                {
                    idCuti:
                        smartofficeApprovalState.idCuti,
                    action,
                    nip:
                        sessionData.nip,
                    catatan
                }
            );

        /* RESET BUTTON */
        smartofficeSubmittingApproval =
            false;

        submitButton.disabled =
            false;

        submitButton.innerHTML =
            action === "REJECT"
            ? "Tolak"
            : "Setujui";

        if(!response.success){

            smartofficeShowToast(
                response.message,
                "error"
            );

            return;

        }

        smartofficeShowToast(
            response.message,
            "success"
        );

        smartofficeCloseApprovalDetail();

        await smartofficeLoadApprovalCuti();

    }
    catch(error){

        console.error(error);

        /* RESET BUTTON */
        smartofficeSubmittingApproval =
            false;

        submitButton.disabled =
            false;

        submitButton.innerHTML =
            action === "REJECT"
            ? "Tolak"
            : "Setujui";

        smartofficeShowToast(
            error.message ||
            "Terjadi kesalahan.",
            "error"
        );

    }

}


/* ======================================================
   SET APPROVAL ACTION
====================================================== */
function smartofficeSetApprovalAction(
    action
){

    /* =========================
       SAVE STATE
    ========================= */
    smartofficeApprovalAction =
        action;

    /* =========================
       BUTTON
    ========================= */
    const approveButton =
        document.getElementById(
            "smartofficeApproveActionButton"
        );

    const rejectButton =
        document.getElementById(
            "smartofficeRejectActionButton"
        );

    const textareaWrapper =
        document.getElementById(
            "smartofficeApprovalCatatanWrapper"
        );

    if(
        !approveButton ||
        !rejectButton
    ){
        return;
    }

    approveButton.classList.remove(
        "active"
    );

    rejectButton.classList.remove(
        "reject-active"
    );

    if(action === "APPROVE"){

        approveButton.classList.add(
            "active"
        );

        if(textareaWrapper){
            textareaWrapper.style.display =
                "none";
        }

        return;
    }

    rejectButton.classList.add(
        "reject-active"
    );

    if(textareaWrapper){
        textareaWrapper.style.display =
            "block";
    }

}