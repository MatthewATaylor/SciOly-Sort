//----LOAD TSV FILES----
let eventFile = document.getElementById("event-file");
let registrationFile = document.getElementById("registration-file");
let testFile = document.getElementById("test-file");
let eventData = "";
let registrationData = "";
let testData = "";
eventFile.addEventListener("change", function () {
    let reader = new FileReader();
    reader.onload = function () {
        eventData = reader.result.toString();
    };
    if (!(this.files[0] instanceof Blob)) {
        eventData = "";
        return;
    }
    reader.readAsText(this.files[0]);
});
registrationFile.addEventListener("change", function () {
    let reader = new FileReader();
    reader.onload = function () {
        registrationData = reader.result.toString();
    };
    if (!(this.files[0] instanceof Blob)) {
        registrationData = "";
        return;
    }
    reader.readAsText(this.files[0]);
});
testFile.addEventListener("change", function () {
    let reader = new FileReader();
    reader.onload = function () {
        testData = reader.result.toString();
    };
    if (!(this.files[0] instanceof Blob)) {
        testData = "";
        return;
    }
    reader.readAsText(this.files[0]);
});
//----PARSE EVENTS----
class SOEvent {
}
let events = [];
function parseEvents() {
    events = [];
    let eventLines = eventData.split("\n");
    for (let i = 0; i < eventLines.length; ++i) {
        let eventTokens = eventLines[i].split("\t");
        let event = {
            name: eventTokens[0],
            block: eventTokens[1],
            maxStudents: parseInt(eventTokens[2]),
            students: []
        };
        events.push(event);
    }
    return true;
}
let students = [];
function parseStudents() {
    students = [];
    let registrationLines = registrationData.split("\n");
    for (let i = 1; i < registrationLines.length; ++i) {
        let registrationTokens = registrationLines[i].split("\t");
        let emailToken = registrationTokens[1];
        let firstNameToken = registrationTokens[2];
        let lastNameToken = registrationTokens[3];
        let gradeToken = registrationTokens[4];
        //Get test score for current student
        let testScore = -1.0;
        let testLines = testData.split("\n");
        for (let j = 1; j < testLines.length; ++j) {
            let testTokens = testLines[i].split("\t");
            //If emails match
            if (testTokens[1] == emailToken) {
                let scoreStr = testTokens[2];
                let scoreTokens = scoreStr.split("/");
                let numCorrect = parseInt(scoreTokens[0]);
                let numQuestions = parseInt(scoreTokens[1]);
                testScore = numCorrect / numQuestions;
                break;
            }
        }
        if (testScore < 0) {
            //No matching student found
            displayMessage("No test score found for student \"" +
                firstNameToken + " " + lastNameToken + "\"");
            return false;
        }
        let topEvents = [];
        for (let i = 5; i <= 9; ++i) {
            let eventName = registrationTokens[i];
            let eventMatchFound = false;
            for (let j = 0; j < events.length; ++j) {
                if (events[j].name == eventName) {
                    topEvents.push(events[j]);
                    eventMatchFound = true;
                    break;
                }
            }
            if (!eventMatchFound) {
                displayMessage("Event \"" + eventName + "\" not found in event list.");
                return;
            }
        }
        let student = {
            email: emailToken,
            firstName: firstNameToken,
            lastName: lastNameToken,
            grade: parseInt(gradeToken),
            topEvents: topEvents,
            testScore: testScore,
            sortScore: 0
        };
        students.push(student);
    }
    return true;
}
//----SORT STUDENTS----
function setSortScores() {
    let testSlider = document.getElementById("test-slider");
    let testWeight = parseInt(testSlider.value);
    for (let i = 0; i < students.length; ++i) {
        students[i].sortScore = testWeight * students[i].testScore;
    }
}
function sortStudents() {
    setSortScores();
    students.sort(function (student1, student2) {
        return (student1.sortScore > student2.sortScore) ? -1 : 1;
    });
}
//----VALIDATE INPUTS----
function filesAreLoaded() {
    if (eventData.length == 0 || registrationData.length == 0 || testData.length == 0) {
        displayMessage("Please provide registration and placement test data files.");
        return false;
    }
    return true;
}
function fileExtensionIsValid(fileInput) {
    let fileName = fileInput.files[0].name;
    let extensionIsValid = fileName.indexOf(".tsv", fileName.length - 4) !== -1;
    if (!extensionIsValid) {
        displayMessage("File \"" + fileName + "\" is not a TSV file.");
        return false;
    }
    return true;
}
//----DISPLAY SORTED DATA----
function displaySortedStudents() {
    let table = document.getElementById("sorted-students-table");
    table.classList.remove("hidden");
    let tableHTML = "<tr><th>Name</th><th>Score</th></tr>";
    for (let i = 0; i < students.length; ++i) {
        tableHTML += "<tr>";
        tableHTML += "<td>" + students[i].firstName + " " +
            students[i].lastName + "</td>";
        tableHTML += "<td>" + students[i].sortScore + "</td>";
        tableHTML += "</tr>";
    }
    table.innerHTML = tableHTML;
}
//----SORT ON BUTTON PRESS----
let sortButton = document.getElementById("sort-button");
sortButton.onclick = function () {
    if (!filesAreLoaded()) {
        return;
    }
    if (!fileExtensionIsValid(eventFile) ||
        !fileExtensionIsValid(registrationFile) ||
        !fileExtensionIsValid(testFile)) {
        return;
    }
    if (!parseStudents()) {
        return;
    }
    sortStudents();
    displaySortedStudents();
};
