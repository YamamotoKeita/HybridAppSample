import ViewService from "./service/view-service";
import MainViewController from "./view/main-view-controller";

ViewService.loadTemplateFiles(() => {
    ViewService.setScreen(MainViewController)
});
