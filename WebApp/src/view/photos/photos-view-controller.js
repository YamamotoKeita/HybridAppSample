import ViewController from "../../corelib/view-controller";
import PhotosAPI from "../../api/photos-api";
import TableView from "../../corelib/table-view";

export default class PhotosViewController extends ViewController {

    constructor() {
        super();

        this.records = [];
        this.tableView = new TableView(this.dom('#table-view'));
        this.tableView.setDelegate({
            rowCount: this.rowCount,
            cellForRow: this.cellForRow
        });
    }

    viewWillAppear() {
        new PhotosAPI().connect(this.setResponse);
    }

    setResponse(response) {
        this.records = response.records;
        this.tableView.reload()
    }

    rowCount() {
        return this.records.length
    }

    cellForRow(rowIndex) {
        let cell = new PhotosCell();
        cell.data = this.records[rowIndex];
        return cell;
    }
}