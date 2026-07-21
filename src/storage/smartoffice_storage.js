/* ======================================================
   STORAGE
====================================================== */

export function smartofficeSetStorage(

    key,

    value

){

    localStorage.setItem(

        key,

        JSON.stringify(value)

    );

}

export function smartofficeGetStorage(key){

    const value =
        localStorage.getItem(key);

    if(!value){

        return null;

    }

    return JSON.parse(value);

}

export function smartofficeRemoveStorage(key){

    localStorage.removeItem(key);

}