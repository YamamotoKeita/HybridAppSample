import ViewService from "./service/view-service";
import MainViewController from "./view/main/main-view-controller";

ViewService.loadTemplateFiles(() => {
    ViewService.setScreen(MainViewController)
});
