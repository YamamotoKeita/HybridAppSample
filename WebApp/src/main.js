import ViewService from "./service/view-service";
import MainViewController from "./view/main/main-view-controller";

// Base64のフォントデータをStyleSheetに設定する
window.setBase64FontData = (base64) => {

    let style = document.createElement('style');
    style.appendChild(document.createTextNode(`
        @font-face {
            font-family: 'Noto Sans JP';
            src: url('data:font/woff2;base64,${base64}') format('woff2');
            font-weight: normal;
        }
    `));
    document.head.appendChild(style);
};

postToNative('transferFontData');
waitFont();

// ネイティブアプリの処理を呼び出す
function postToNative(name, param) {

    let handler = undefined;
    if (window !== undefined &&  window.webkit !== undefined && window.webkit.messageHandlers !== undefined) {
        handler = window.webkit.messageHandlers;
    } else if (typeof Android !== "undefined") {
        handler = Android;
    }

    if (handler !== undefined && handler[name] !== undefined) {
        if (handler[name].postMessage !== undefined) {
            handler[name].postMessage(param);
        } else {
            handler[name](param);
        }
    }
}

// フォントデータが読み込まれるのを待つ
function waitFont() {
    let fontSet = document.fonts;
    if (fontSet !== undefined) {
        fontSet.load(`20px "Noto Sans JP"`);
        fontSet.ready.then((fontFaceSet) => {
            onFontLoaded();
        });
    } else {
        onFontLoaded();
    }
}

// フォントデータ読み込み完了時の処理
function onFontLoaded() {
    // 画面を表示
    ViewService.loadTemplateFiles(() => {
        ViewService.setScreen(MainViewController);
    });
}

