let sharedInstance = new ViewService();

export default class ViewService {
    static get instance() {
        return sharedInstance
    }

    loadTemplateFiles(afterProcess) {

    }

    setScreen(viewControllerClass) {

    }
}