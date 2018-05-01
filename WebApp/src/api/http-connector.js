/**
 * HTTP通信を行う。
 * web workerを使用してバックグラウンドスレッドにて処理を行う
 */
class HttpConnector {

    constructor() {
        this.idPool = 0;
        this.callbackMap = {};

        this.worker = new Worker('worker/worker-connector.js');

        // 通信完了処理
        this.worker.onmessage = (event) => {
            let data = event.data;
            let callbacks = this.callbackMap[data.id];

            switch (data.connectionStatus) {
                case 'complete':
                    callbacks['complete'](data);
                    break;
                case 'success':
                    callbacks['success'](data);
                    break;
                default:
                    callbacks['error'](data);
                    break;
            }
        };
    }

    connect(param) {
        param.id = ++this.idPool;
        param.method = 'connect';

        let callbacks = {};
        this.callbackMap[param.id] = callbacks;

        for (let key in param) {
            let property = param[key];

            if (typeof property === 'function') {
                // functionをコールバックとして保持
                callbacks[key] = property;
                // functionはworkerに渡せないので削除する
                delete param[key];
            }
        }

        this.worker.postMessage(param);

        return param.id;
    }

    abort(connectionId) {
        let param = {
            method: 'abort',
            id: connectionId
        };
        this.worker.postMessage(param);
    }
}

export default new HttpConnector();