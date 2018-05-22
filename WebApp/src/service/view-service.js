import HttpConnector from "../corelib/http-connector";

class ViewService {

    constructor() {
        this.htmlMap = {};
        this.viewControllers = {};
        this.mainScreen = document.getElementById('main-screen');
    }

    loadTemplateFiles(afterProcess) {

        HttpConnector.connect({
            url: 'main.html',
            success: (data) => {
                this.setTemplate(data.response);
                afterProcess()
            },
            error: (data) => {

            },
            complete: (data) => {

            }
        });
    }

    setTemplate(text) {
        let items = text.split('<!-- View Template [');

        items.forEach((element) => {
            let nameEnd = element.indexOf('] -->');
            let name = element.slice(0, nameEnd);
            let html = element.slice(nameEnd + 5).trim();
            this.htmlMap[name] = html;
        });
    }

    setScreen(viewControllerClass) {
        let viewController = this.getViewController(viewControllerClass);

        this.mainScreen.appendChild(viewController.element);

        console.log(viewController);
    }

    getViewController(constructor, key) {
        let name = constructor.name;
        if (key === undefined) {
            key = name;
        }
        let viewController = this.viewControllers[key];

        if (!viewController) {
            let html = this.getHTML(name);
            if (html) {
                let element = this.createElementFromHTML(html);
                viewController = new constructor(element, key);
                viewController.element = element;
                this.viewControllers[key] = viewController;
            } else {
                return null;
            }
        }
        return viewController;
    }

    getHTML(name) {
        let fileName = this.classNameToFileName(name);
        let html = this.htmlMap[fileName];
        if (!html) {
            alert(name + ".html は読み込まれていません。読込中または、通信エラーまたは、ファイル名が間違っています。");
            return null;
        }
        return html;
    }

    createElementFromHTML(htmlString) {
        let div = document.createElement('div');
        div.innerHTML = htmlString.trim();
        return div.firstChild;
    }

    classNameToFileName(name) {
        return name.replace(/[A-Z]/g, (s, offset)=>{
            let lower = s.charAt(0).toLowerCase();
            return (offset === 0) ? lower : "-" + lower;
        });
    }
}

export default new ViewService();