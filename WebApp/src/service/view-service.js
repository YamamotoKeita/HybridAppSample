let sharedInstance = new ViewService();

class ViewService {
    static get instance() {
        return sharedInstance
    }

    loadTemplateFiles(afterProcess) {

    }

    setScreen(viewControllerClass) {

    }
}

export default new ViewService();