$(document).ready(function() {
    makeTags('tr', 'td');
    renderTable();

    $('#add-button').on('click', addExercise);
    $('.tbody').on('click', '.remove-button', removeExercise);
    $('.tbody').on('click', '.edit-button', editExercise);

});

function renderTable() {
    // create, initialize, and configure XMLHttpRequest object
    var req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:56565/render-table', true);

    // load event listener
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {

           var tableRows = JSON.parse(req.responseText);
           var re = /(\d+-\d+-\d+)/g;

           for (var i = 0, l = tableRows.length; i < l; i++) {
               var tempRow = 
               tr({"id": tableRows[i]["id"]}, [
                    td({}, [
                        text(tableRows[i]["name"]),
                    ]),
                    td({}, [
                        text(tableRows[i]["reps"]),
                    ]),
                    td({}, [
                        text(tableRows[i]["weight"] + (parseInt(tableRows[i]["lbs"]) ? " Lbs." : " Kg." )),
                    ]),
                    td({}, [
                        text(re[Symbol.match](tableRows[i]["date"])),
                    ]),
                    td({}, [

                    ]),
                    td({}, [
                        
                    ])
                ]);

                document.getElementById("exercise-list").appendChild(tempRow);
           }

		} else {
           // handle errors here
		}
    });

    // failure event listener
    req.addEventListener('error', function() {
        // handle failure errors somehow...
	})

    req.send();
}


function addExercise(event) {
    var newExercise = {
        "name": $('#exerciseName').val(),
        "reps": $('#repetitions').val(),
        "weight": $('#weight').val(),
        "unit": $('#unit').val(),
        "date": $('#date').val()
    };

    console.log(newExercise);

    // create, initialize, and configure XMLHttpRequest object
    var req = new XMLHttpRequest();
    req.open('POST', 'http://localhost:56565/add-exercise', true);
    req.setRequestHeader('Content-Type', 'application/json');

    // load event listener
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
           addRow(req.responseText, newExercise);
		} else {
           // handle errors here
		}
    });

    // failure event listener
    req.addEventListener('error', function() {
        // handle failure errors somehow...
	})

    req.send(JSON.stringify(newExercise));
    event.preventDefault();
}

function addRow(response, exercise) {
    
    var resID = JSON.parse(response);
    var unit;

    if (exercise["unit"] == "1") {
        unit = " Lbs.";
    } else {
        unit = " Kg.";
    }

    var newRow = 
    tr({"id": String(resID["id"])}, [
        td({}, [
            text(exercise["name"]),
        ]),
        td({}, [
            text(exercise["reps"]),
        ]),
        td({}, [
            text(exercise["weight"] + unit),
        ]),
        td({}, [
            text(exercise["date"]),
        ]),
    ]);

    document.getElementById("exercise-list").appendChild(newRow);
}

function removeExercise(event) {
    alert("I'm removing an exercise.");
}

function editExercise(event) {
    alert("I'm editing an exercise");
}

/*****************************************************************************************
** FUNCTION: tagMaker()
** DESCRIPTION: creates a function for generating HTML element in the DOM
** PARAMETERS: name - a string for the name of element the returned function should create
*****************************************************************************************/

function tagMaker(name) {
	return function(props, children) {
		var tag = document.createElement(name);
		for (var prop in props) {
			tag.setAttribute(prop, props[prop]);
		}
		for (var i = 0; i < children.length; i++) {
			tag.appendChild(children[i]);
		}
		return tag;
	}
}

/*****************************************************************************************
** FUNCTION: makeTags()
** DESCRIPTION: Loops through the arguments it is passed, calling tagMaker for each one,
** attaching the returned function to the window object in order to make them globally 
** accessible.
** PARAMETERS: string names of the tags to be created
*****************************************************************************************/

function makeTags() {
	for(var i = 0, length1 = arguments.length; i < length1; i++){
		window[arguments[i]] = tagMaker(arguments[i]);
	}
}

/*****************************************************************************************
** FUNCTION: text()
** DESCRIPTION: creates a text node containing the text defined by content
** PARAMETERS: content - the text to be contained in the text node
*****************************************************************************************/

function text(content) {
	return document.createTextNode(content);
}