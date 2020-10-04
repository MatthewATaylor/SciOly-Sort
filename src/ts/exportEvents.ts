function exportEvents() {
    let exportEventsButton = document.getElementById("export-events-button");
    exportEventsButton.onclick = function() {
        let data = new Blob([eventAssignments], {type: "text/plain"});
        let fileURL = window.URL.createObjectURL(data);

        let link = document.createElement("a") as HTMLAnchorElement;
        link.setAttribute("download", "eventAssignments.tsv");
        link.href = fileURL;
        link.click();
    }
}
exportEvents();
