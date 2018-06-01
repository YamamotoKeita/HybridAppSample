(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var connectionMap = {};

onmessage = function onmessage(event) {
    var param = event.data;

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

    var xhr = new XMLHttpRequest();
    xhr.withCredentials = param.withCredentials;
    connectionMap[param.id] = xhr;

    if (param.responseType) {
        xhr.responseType = param.responseType;
    }

    if (param.timeout) {
        xhr.timeout = param.timeout;
    }

    // 通信完了（成功、失敗どちらでも呼ばれる）
    xhr.onloadend = function () {
        postMessage({
            id: param.id,
            connectionStatus: 'complete'
        });
    };

    // 通信成功
    xhr.onload = function (event) {
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

    var httpMethod = param.method ? param.method : 'GET';
    xhr.open(httpMethod, param.url);
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    if (param.headers) {
        for (var key in param.headers) {
            xhr.setRequestHeader(key, param.headers[key]);
        }
    }

    // 送信
    xhr.send(param.data);
}

function onHttpFinished(id, xhr, connectionStatus) {

    var data = {
        id: id,
        connectionStatus: connectionStatus,
        httpStatus: xhr.status,
        response: xhr.response
    };

    postMessage(data);

    delete connectionMap[id];
}

function abortConnection(id) {
    var xhr = connectionMap[id];
    if (xhr) {
        xhr.abort();
        delete connectionMap[id];
    }
}

},{}]},{},[1]);
