import {
    smartofficeApi
} from "../core/api.js";


/* ======================================================
   1. GET PEGAWAI BY NIP
====================================================== */
export async function smartofficeGetPegawaiByNip(
    nip
){

    const response =
        await smartofficeApi(
            "smartofficeGetPegawaiByNip",
            {
                nip
            }
        );

    if(
        !response.success
    ){
        throw new Error(
            response.message
        );
    }

    return response.data;

}


/* ======================================================
   2. SEARCH PEGAWAI
====================================================== */
export async function smartofficeSearchPegawai(
    keyword = ""
){

    const response =
        await smartofficeApi(
            "smartofficeSearchPegawai",
            {
                keyword
            }
        );

    if(
        !response.success
    ){
        throw new Error(
            response.message
        );
    }

    return response.data;

}


/* ======================================================
   3. GET CUTI STATS
====================================================== */
export async function smartofficeGetCutiStats(
    nip
){

    const response =
        await smartofficeApi(
            "smartofficeGetCutiStats",
            {
                nip
            }
        );

    if(
        !response.success
    ){
        throw new Error(
            response.message
        );
    }

    return response.data;

}


/* ======================================================
   4. GET RIWAYAT CUTI
====================================================== */
export async function smartofficeGetRiwayatCuti(
    nip
){

    const response =
        await smartofficeApi(
            "smartofficeGetRiwayatCuti",
            {
                nip
            }
        );

    if(
        !response.success
    ){
        throw new Error(
            response.message
        );
    }

    return response.data;

}


/* ======================================================
   5. GET JUMLAH CUTI
====================================================== */
export async function smartofficeGetJumlahCuti(
    tanggalAwal,
    tanggalAkhir
){

    const response =
        await smartofficeApi(
            "smartofficeGetJumlahCuti",
            {
                tanggalAwal,
                tanggalAkhir
            }
        );

    if(
        !response.success
    ){
        throw new Error(
            response.message
        );
    }

    return response;

}


/* ======================================================
   6. SUBMIT CUTI
====================================================== */
export async function smartofficeSubmitCuti(
    formData
){

    const response =
        await smartofficeApi(
            "smartofficeSubmitCuti",
            formData
        );

    if(
        !response.success
    ){
        throw new Error(
            response.message
        );
    }

    return response.data;

}