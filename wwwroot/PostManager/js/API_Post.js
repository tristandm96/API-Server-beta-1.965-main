const API_URL = "https://apitristan.glitch.me/api/posts";

function API_getcurrentHttpError () {
    return currentHttpError; 
}
function API_SavePost(post, create) {
    return new Promise(resolve => {
        $.ajax({
            url: create ? API_URL :  API_URL + "/" + post.Id,
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(post),
            success: (/*data*/) => { currentHttpError = ""; resolve(true); },
            error: (xhr) => {currentHttpError = xhr.responseJSON.error_description; resolve(false /*xhr.status*/); }
        });
    });
}
function API_DeletePost(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + '/' + id,
            type: 'DELETE',
            success: () => { currentHttpError = ""; resolve(true); },
            error: (xhr) => { currentHttpError = xhr.responseJSON.error_description; resolve(false /*xhr.status*/); }
        });
    })
}
function API_GETPosts(queryString) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + queryString,
            type: 'GET',
            contentType: 'text/plain',
            data: {},
            success: posts => {
                resolve(posts)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("webAPI_GET_ALL - error", jqXHR.status);
                resolve(null);
            }
        });
    })
}
function API_GETCategory() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "?fields=Category",
            type: 'GET',
            contentType: 'text/plain',
            data: {},
            success: posts => {
                resolve(posts)
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("webAPI_GET_ALL - error", jqXHR.status);
                resolve(null);
            }
        });
    })
}
function API_GETHead(queryString) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + queryString, 
            type: 'HEAD',  
            success: (data, textStatus, jqXHR) => {
                const etag = jqXHR.getResponseHeader('ETag');
                resolve(etag);  
            },
            error: (jqXHR, textStatus, errorThrown) => {
                console.log("webAPI_GET_ALL - error", jqXHR.status);
                resolve(null);  
            }
        });
    });
}
function API_GetPost(Id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + Id,
            success: post => { currentHttpError = ""; resolve(post); },
            error: (xhr) => { currentHttpError = xhr.responseJSON.error_description; resolve(null); }
        });
    });
}