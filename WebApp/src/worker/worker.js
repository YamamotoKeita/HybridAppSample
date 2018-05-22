let connectionMap = {};

onmessage = function(event) {
    let param = event.data;

    switch (param.action) {
        case "connect":
            startConnection(param);
            break;
        case "abort":
            abortConnection(param.id);
            break;
    }
};

/**
 * param.url: 通信先URL
 * param.id: 通信を識別する一意なid
 * param.method: HTTPメソッド
 * param.headers: リクエストヘッダー
 *
 * @param param
 */
function startConnection(param) {

    let xhr = new XMLHttpRequest();
    xhr.withCredentials = param.withCredentials;
    connectionMap[param.id] = xhr;

    if (param.responseType) {
        xhr.responseType = param.responseType;
    }

    if (param.timeout) {
        xhr.timeout = param.timeout;
    }

    // 通信完了（成功、失敗どちらでも呼ばれる）
    xhr.onloadend = function() {
        postMessage({
            id: param.id,
            connectionStatus: 'complete'
        });
    };

    // 通信成功
    xhr.onload = (event)=>{
        onHttpFinished(param.id, xhr, 'success');
    };

    // 通信エラー
    xhr.onerror = function (event) {
        onHttpFinished(param.id, xhr, 'error');
    };

    // タイムアウト
    xhr.ontimeout = function (event) {
        onHttpFinished(param.id, xhr, 'timeout');
    };

    // 中断
    xhr.onabort = function (event) {
        onHttpFinished(param.id, xhr, 'aborted');
    };

    let httpMethod = param.method ? param.method : 'GET';
    xhr.open(httpMethod, param.url);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    if (param.headers) {
        for (let key in param.headers) {
            xhr.setRequestHeader(key, param.headers[key]);
        }
    }

    // 送信
    xhr.send(param.data);
}

function onHttpFinished(id, xhr, connectionStatus) {

    let data = {
        id: id,
        connectionStatus: connectionStatus,
        httpStatus: xhr.status,
        response: xhr.response
    };

    postMessage(data);

    delete connectionMap[id];
}

function abortConnection(id) {
    let xhr = connectionMap[id];
    if (xhr) {
        xhr.abort();
        delete connectionMap[id];
    }
}
