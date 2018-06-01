(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HttpConnector = function () {
    function HttpConnector() {
        var _this = this;

        _classCallCheck(this, HttpConnector);

        this.idPool = 0;
        this.callbackMap = {};
        this.worker = new Worker('worker.js');

        // 通信完了処理
        this.worker.onmessage = function (event) {
            var data = event.data;
            var callbacks = _this.callbackMap[data.id];

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

    _createClass(HttpConnector, [{
        key: 'connect',
        value: function connect(param) {
            param.id = ++this.idPool;
            param.action = 'connect';

            var callbacks = {};
            this.callbackMap[param.id] = callbacks;

            for (var key in param) {
                var property = param[key];

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
    }, {
        key: 'abort',
        value: function abort(connectionId) {
            var param = {
                action: 'abort',
                id: connectionId
            };
            this.worker.postMessage(param);
        }
    }]);

    return HttpConnector;
}();

exports.default = new HttpConnector();

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewController = function () {
    function ViewController() {
        _classCallCheck(this, ViewController);

        this.element = undefined;
        this.key = undefined;
    }

    _createClass(ViewController, [{
        key: "viewWillAppear",
        value: function viewWillAppear() {}
    }, {
        key: "getElement",
        value: function getElement(selector) {}
    }]);

    return ViewController;
}();

exports.default = ViewController;

},{}],3:[function(require,module,exports){
"use strict";

var _viewService = require("./service/view-service");

var _viewService2 = _interopRequireDefault(_viewService);

var _mainViewController = require("./view/main/main-view-controller");

var _mainViewController2 = _interopRequireDefault(_mainViewController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_viewService2.default.loadTemplateFiles(function () {
    _viewService2.default.setScreen(_mainViewController2.default);
});

},{"./service/view-service":4,"./view/main/main-view-controller":5}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _httpConnector = require('../corelib/http-connector');

var _httpConnector2 = _interopRequireDefault(_httpConnector);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ViewService = function () {
    function ViewService() {
        _classCallCheck(this, ViewService);

        this.htmlMap = {};
        this.viewControllers = {};
        this.mainScreen = document.getElementById('main-screen');
    }

    _createClass(ViewService, [{
        key: 'loadTemplateFiles',
        value: function loadTemplateFiles(afterProcess) {
            var _this = this;

            _httpConnector2.default.connect({
                url: 'main.html',
                success: function success(data) {
                    _this.setTemplate(data.response);
                    afterProcess();
                },
                error: function error(data) {},
                complete: function complete(data) {}
            });
        }
    }, {
        key: 'setTemplate',
        value: function setTemplate(text) {
            var _this2 = this;

            var items = text.split('<!-- View Template [');

            items.forEach(function (element) {
                var nameEnd = element.indexOf('] -->');
                var name = element.slice(0, nameEnd);
                var html = element.slice(nameEnd + 5).trim();
                _this2.htmlMap[name] = html;
            });
        }
    }, {
        key: 'setScreen',
        value: function setScreen(viewControllerClass) {
            var viewController = this.getViewController(viewControllerClass);

            this.mainScreen.appendChild(viewController.element);

            console.log(viewController);
        }
    }, {
        key: 'getViewController',
        value: function getViewController(constructor, key) {
            var name = constructor.name;
            if (key === undefined) {
                key = name;
            }
            var viewController = this.viewControllers[key];

            if (!viewController) {
                var html = this.getHTML(name);
                if (html) {
                    var element = this.createElementFromHTML(html);
                    viewController = new constructor(element, key);
                    viewController.element = element;
                    this.viewControllers[key] = viewController;
                } else {
                    return null;
                }
            }
            return viewController;
        }
    }, {
        key: 'getHTML',
        value: function getHTML(name) {
            var fileName = this.classNameToFileName(name);
            var html = this.htmlMap[fileName];
            if (!html) {
                alert(name + ".html は読み込まれていません。読込中または、通信エラーまたは、ファイル名が間違っています。");
                return null;
            }
            return html;
        }
    }, {
        key: 'createElementFromHTML',
        value: function createElementFromHTML(htmlString) {
            var div = document.createElement('div');
            div.innerHTML = htmlString.trim();
            return div.firstChild;
        }
    }, {
        key: 'classNameToFileName',
        value: function classNameToFileName(name) {
            return name.replace(/[A-Z]/g, function (s, offset) {
                var lower = s.charAt(0).toLowerCase();
                return offset === 0 ? lower : "-" + lower;
            });
        }
    }]);

    return ViewService;
}();

exports.default = new ViewService();

},{"../corelib/http-connector":1}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _viewController = require("../../corelib/view-controller");

var _viewController2 = _interopRequireDefault(_viewController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MainViewController = function (_ViewController) {
    _inherits(MainViewController, _ViewController);

    function MainViewController() {
        _classCallCheck(this, MainViewController);

        return _possibleConstructorReturn(this, (MainViewController.__proto__ || Object.getPrototypeOf(MainViewController)).call(this));
    }

    return MainViewController;
}(_viewController2.default);

exports.default = MainViewController;

},{"../../corelib/view-controller":2}]},{},[3]);
