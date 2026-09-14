/* ======================================================
   SMART OFFICE V3
   FIRESTORE - CUTI
====================================================== */
import {
    collection,
    getDocs,
    query,
    where
} from "firebase/firestore";

import {
    smartofficeFirestore
} from "../core/firebase-firestore.js";


/* ======================================================
   GET RIWAYAT CUTI USER
====================================================== */
export async function smartofficeGetRiwayatCutiFirestore(nip) {

    const q = query(
        collection(smartofficeFirestore, "cuti"),
        where("nipNrp", "==", String(nip).trim())
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {

        const d = doc.data();

        return {
            ...d,

            // Mapping Firestore → format yang dipakai frontend
            tanggalSurat: d.tanggalSuratPermohonan,
            tanggalAwal: d.tanggalAwalCuti,
            tanggalAkhir: d.tanggalAkhirCuti,

            lampiran: d.fileLampiranUrl,

            delegasi: d.penerimaDelegasi,
            nipDelegasi: d.nipNrpDelegasi,
            tugasDelegasi: d.tugasYangDidelegasikan,

            approval1Tanggal: d.approval1Tgl,
            approval2Tanggal: d.approval2Tgl,

            pdfUrl: d.filePdfUrl
        };
    });
}