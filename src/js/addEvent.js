function addEvent() {
    let addEventButton = document.getElementById("add-event-button");
    let eventTable = document.getElementById("create-event-list-table");
    addEventButton.onclick = function () {
        let newRow = eventTable.insertRow();
        newRow.innerHTML =
            '<td><input type="text" name="event-name" class="event-name" /></td>' +
                '<td><input type="text" name="practice-block" class="practice-block" /></td>' +
                '<td><input type="text" name="max-students" class="max-students" /></td>';
    };
}
addEvent();
