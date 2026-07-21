/* ======================================================
   FORMAT RUPIAH
====================================================== */
export function smartofficeFormatRupiah(
    value
){

    return new Intl.NumberFormat(
        "id-ID",
        {
            style:"currency",
            currency:"IDR",
            minimumFractionDigits:0
        }
    ).format(value);
}