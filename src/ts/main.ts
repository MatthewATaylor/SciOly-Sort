//----LOAD TSV FILES----
let eventFile =
    document.getElementById("event-file") as HTMLInputElement;
let registrationFile =
    document.getElementById("registration-file") as HTMLInputElement;
let testFile =
    document.getElementById("test-file") as HTMLInputElement;

let eventData = "";
let registrationData = "";
let testData = "";

eventFile.addEventListener("change", function() {
    let reader = new FileReader();
    reader.onload = function() {
        eventData = reader.result.toString();
    }

    if (!(this.files[0] instanceof Blob)) {
        eventData = "";
        return;
    }

    reader.readAsText(this.files[0]);
});
registrationFile.addEventListener("change", function() {
    let reader = new FileReader();
    reader.onload = function() {
        registrationData = reader.result.toString();
    }

    if (!(this.files[0] instanceof Blob)) {
        registrationData = "";
        return;
    }

    reader.readAsText(this.files[0]);
});
testFile.addEventListener("change", function() {
    let reader = new FileReader();
    reader.onload = function() {
        testData = reader.result.toString();
    }

    if (!(this.files[0] instanceof Blob)) {
        testData = "";
        return;
    }

    reader.readAsText(this.files[0]);
});



//----VALIDATE INPUTS----
function filesAreLoaded(): boolean {
    if (eventData.length === 0 || registrationData.length === 0 || testData.length === 0) {
        displayMessage("Please provide required TSV files");
        return false;
    }
    return true;
}
function fileExtensionIsValid(fileInput: HTMLInputElement): boolean {
    let fileName = fileInput.files[0].name;
    let extensionIsValid =
        fileName.indexOf(".tsv", fileName.length - 4) !== -1;
    if (!extensionIsValid) {
        displayMessage("File \"" + fileName + "\" is not a TSV file");
        return false;
    }
    return true;
}



//----EVENTS----
class SOEvent {
    name: string;
    block: string;
    maxStudents: number;
    studentNames: string[];
    students: Student[]; //Only will contain new students

    constructor(name: string, block: string, maxStudents: number, studentNames: string[]) {
        this.name = name;
        this.block = block;
        this.maxStudents = maxStudents;
        this.studentNames = studentNames;
        this.students = [];
    }
}
let events: SOEvent[] = [];



//----STUDENTS----
class Student {
    email: string;
    firstName: string;
    lastName: string;
    grade: number;
    parentMentor: boolean;
    topEvents: SOEvent[];
    events: SOEvent[];
    numEvents: number;
    testScore: number;
    sortScore: number;

    constructor(email: string, firstName: string, lastName: string, grade: number,
        parentMentor: boolean, topEvents: SOEvent[], testScore: number, sortScore: number) {

        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.grade = grade;
        this.parentMentor = parentMentor;
        this.topEvents = topEvents;
        this.events = [];
        this.numEvents = 0;
        this.testScore = testScore;
        this.sortScore = sortScore;
    }
}
let students: Student[] = [];



//----PARSE EVENTS----
function parseEvents(): boolean {
    let eventLines = eventData.split("\n");
    for (let i = 1; i < eventLines.length; ++i) {
        let eventTokens = eventLines[i].split("\t");
        if (eventTokens.length < 3) {
            displayMessage("Event list line too short: " + eventLines[i]);
            return false;
        }

        let eventStudentNames: string[] = [];
        for (let j = 3; j < eventTokens.length; ++j) {
            if (eventTokens[j].trim().length > 0) {
                eventStudentNames.push(eventTokens[j]);
            }
        }

        let event = new SOEvent(
            eventTokens[0], eventTokens[1], parseInt(eventTokens[2]),
            eventStudentNames
        );
        events.push(event);
    }
    return true;
}



//----PARSE STUDENTS----
function parseStudents(): boolean {
    let registrationLines = registrationData.split("\n");
    if (registrationLines.length === 0) {
        displayMessage("No registration data found");
        return false;
    }
    let headingTokens = registrationLines[0].split("\t");

    for (let i = 1; i < registrationLines.length; ++i) {
        let registrationTokens = registrationLines[i].split("\t");
        if (registrationTokens.length < 5) {
            displayMessage("Registration data line too short: " + registrationLines[i]);
            return false;
        }

        if (registrationTokens.length !== headingTokens.length) {
            displayMessage("Invalid registration line: " + registrationLines[i]);
            return false;
        }

        let emailToken = registrationTokens[1];
        let firstNameToken = registrationTokens[2];
        let lastNameToken = registrationTokens[3];
        let gradeToken = registrationTokens[4];
        let parentMentorToken = registrationTokens[5];

        //Convert grade to number
        let grade = parseInt(gradeToken);
        if (isNaN(grade) || (grade !== 6 && grade !== 7 && grade !== 8)) {
            displayMessage(
                "Invalid grade \"" + gradeToken + "\" for student \"" +
                firstNameToken + " " + lastNameToken + "\""
            );
            return false;
        }

        //Convert parent mentor token (Yes/No) to boolean
        let parentMentor = false;
        if (parentMentorToken.toLowerCase() === "yes") {
            parentMentor = true;
        }
        else if (parentMentorToken.toLowerCase() !== "no") {
            displayMessage(
                "Invalid parent mentor response \"" + parentMentorToken +
                "\" for student \"" + firstNameToken + " " + lastNameToken + "\""
            );
            return false;
        }

        //Get test score for current student
        let testScore = -1.0;
        let testLines = testData.split("\n");
        for (let j = 1; j < testLines.length; ++j) {
            let testTokens = testLines[i].split("\t");
            if (testTokens.length < 5) {
                displayMessage("Placement test data line too short: " + testLines[j]);
                return false;
            }

            //If emails match
            if (testTokens[1].toLowerCase() === emailToken.toLowerCase()) {
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
            displayMessage(
                "No test score found for student \"" +
                firstNameToken + " " + lastNameToken + "\""
            );
            return false;
        }

        //Parse event preferences
        let numEvents = registrationTokens.length - 6;
        let topEvents: SOEvent[] = new Array(numEvents);
        if (numEvents !== events.length) {
            displayMessage("Event list event count does not match event preference choice count");
            return false;
        }
        for (let i = 6; i < registrationTokens.length; ++i) {
            let preferenceHeading = headingTokens[i];
            let eventNum = i - 6;

            //If preference heading doesn't contain event name
            if (preferenceHeading.toLowerCase().indexOf(events[eventNum].name.toLowerCase()) === -1) {
                displayMessage("Event list and event preference choices not in the same order");
                return false;
            }

            let eventRankToken = registrationTokens[i];
            let eventRank = parseInt(eventRankToken);
            if (isNaN(eventRank) || eventRank <= 0 || eventRank > numEvents) {
                displayMessage(
                    "Invalid event rank \"" + eventRankToken + "\" for student \"" +
                    firstNameToken + " " + lastNameToken + "\""
                );
                return false;
            }

            topEvents[eventRank - 1] = events[eventNum];
        }

        //Check for duplicate student name
        for (let j = 0; j < students.length; ++j) {
            if (students[j].firstName.toLowerCase() === firstNameToken.toLowerCase() &&
                students[j].lastName.toLowerCase() === lastNameToken.toLowerCase()) {

                displayMessage("Duplicate name: " + firstNameToken + " " + lastNameToken);
                return false;
            }
        }

        let student = new Student(
            emailToken, firstNameToken, lastNameToken, grade,
            parentMentor, topEvents, testScore, 0
        );
        students.push(student);
    }
    return true;
}



//----SORT STUDENTS----
function setSortScores() {
    let testSlider = document.getElementById("test-slider") as HTMLInputElement;
    let testWeight = parseInt(testSlider.value);

    let parentMentorSlider = document.getElementById("mentor-slider") as HTMLInputElement;
    let parentMentorWeight = parseInt(parentMentorSlider.value);

    for (let i = 0; i < students.length; ++i) {
        students[i].sortScore =
            testWeight * students[i].testScore +
            parentMentorWeight * (students[i].parentMentor ? 1 : 0);
    }
}
function sortStudents() {
    setSortScores();
    students.sort(function(student1: Student, student2: Student): number {
        return (student1.sortScore > student2.sortScore) ? -1 : 1;
    });
}



//----ASSIGN EVENTS----
function assignEvents() {
    let grade6Slider = document.getElementById("grade6-slider") as HTMLInputElement;
    let grade7Slider = document.getElementById("grade7-slider") as HTMLInputElement;
    let grade8Slider = document.getElementById("grade8-slider") as HTMLInputElement;

    var gradeProportions = {
        6: parseInt(grade6Slider.value) / 100.0,
        7: parseInt(grade7Slider.value) / 100.0,
        8: parseInt(grade8Slider.value) / 100.0
    };

    let maxEventsSlider = document.getElementById("event-slider") as HTMLInputElement;
    let maxEvents = parseInt(maxEventsSlider.value);

    for (let i = 0; i < students.length; ++i) {
        for (let j = 0; j < students[i].topEvents.length; ++j) {
            //Student in max number of events
            if (students[i].numEvents >= maxEvents) {
                break;
            }

            let currentEvent = students[i].topEvents[j];

            //Event has max number of students
            let numEventStudents =
                currentEvent.studentNames.length +
                currentEvent.students.length;
            if (numEventStudents >= currentEvent.maxStudents) {
                continue;
            }

            //Grade proportions
            let numStudentsInGrade = 0;
            for (let k = 0; k < currentEvent.students.length; ++k) {
                if (currentEvent.students[k].grade === students[i].grade) {
                    ++numStudentsInGrade;
                }
            }
            let gradeProportion = (numStudentsInGrade + 1) / currentEvent.maxStudents;
            let maxGradeProportion = gradeProportions[students[i].grade];
            if (gradeProportion > maxGradeProportion) {
                continue;
            }

            //Schedule conflicts
            for (let k = 0; k < students[i].events.length; ++k) {
                let assignedEvent = students[i].events[k];
                if (assignedEvent.block.indexOf(currentEvent.block) !== -1) {
                    //Overlap of currentEvent with already assigned event
                    continue;
                }
            }

            //Assign event
            currentEvent.students.push(students[i]); //Add student to event
            currentEvent.studentNames.push( //Add student name to event
                students[i].firstName + " " + students[i].lastName
            );
            students[i].events.push(currentEvent); //Add event to student
            ++students[i].numEvents;
        }
    }
}



//----DISPLAY RESULTS----
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
let eventAssignments: string = "";
function displayEventAssignments() {
    let table = document.getElementById("events-table");
    table.classList.remove("hidden");

    let exportButton = document.getElementById("export-events-button");
    exportButton.classList.remove("hidden");

    let tableHeadings = "<tr>";
    for (let i = 0; i < events.length; ++i) {
        tableHeadings += "<th>" + events[i].name + "</th>";
        eventAssignments += events[i].name;
        if (i != events.length - 1) {
            eventAssignments += "\t";
        }
    }
    tableHeadings += "</tr>";
    eventAssignments += "\n";

    let tableData = "";
    let rowNum = 0;
    while (true) {
        //Check if new row can be added
        let canAddRow = false;
        for (let i = 0; i < events.length; ++i) {
            if (events[i].studentNames.length > rowNum) {
                canAddRow = true;
                break;
            }
        }
        if (!canAddRow) {
            break;
        }

        //Add new row
        tableData += "<tr>";
        for (let i = 0; i < events.length; ++i) {
            if (events[i].studentNames.length > rowNum) {
                tableData += "<td>" + events[i].studentNames[rowNum] + "</td>";
                eventAssignments += events[i].studentNames[rowNum];
            }
            else {
                tableData += "<td></td>";
            }

            if (i != events.length - 1) {
                eventAssignments += "\t";
            }
        }
        tableData += "</tr>";
        eventAssignments += "\n";

        ++rowNum;
    }

    table.innerHTML = tableHeadings + tableData;
}



//----SORT ON BUTTON PRESS----
let sortButton =
    document.getElementById("sort-button") as HTMLButtonElement;
sortButton.onclick = function() {
    //Validation
    if (!filesAreLoaded()) {
        return;
    }
    if (!fileExtensionIsValid(eventFile) ||
        !fileExtensionIsValid(registrationFile) ||
        !fileExtensionIsValid(testFile)) {

        return;
    }

    //Read data
    events = [];
    students = [];
    eventAssignments = "";
    if (!parseEvents()) {
        return;
    }
    if (!parseStudents()) {
        return;
    }

    sortStudents();
    assignEvents();

    displaySortedStudents();
    displayEventAssignments();
}
