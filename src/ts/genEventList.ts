function genEventList() {
    let generateListButton = document.getElementById("generate-event-list-button");
    let eventTable = document.getElementById("create-event-list-table") as HTMLTableElement;

    generateListButton.onclick = function() {
        let eventList = ""

        let rows = eventTable.rows;
        for (let i = 1; i < rows.length; ++i) {
            let row = rows[i];
            let eventName = (row.cells[0].children[0] as HTMLInputElement).value;
            let practiceBlock = (row.cells[1].children[0] as HTMLInputElement).value;
            let maxStudents = (row.cells[2].children[0] as HTMLInputElement).value;

            if (isNaN(parseInt(maxStudents))) {
                displayMessage("Invalid maximum student count: " + maxStudents);
                return;
            }

            eventList += eventName + "\t" + practiceBlock + "\t" + maxStudents + "\n";
        }

        let listData = new Blob([eventList], {type: "text/plain"});
        let listFile = window.URL.createObjectURL(listData);

        let listLink = document.createElement("a") as HTMLAnchorElement;
        listLink.setAttribute("download", "eventList.tsv");
        listLink.href = listFile;
        listLink.click();

        window.URL.revokeObjectURL(listFile);
    }
}
genEventList();
