$(document).ready(function() {
    makeTags('tr', 'td', 'button', 'input', 'form', 'select', 'option');
    renderTable();

    $('#add-button').on('click', addExercise);
    $('tbody').on('click', '.delete-button', removeExercise);
    $('tbody').on('click', '.edit-button', editExercise);

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
               tr({"id": "row-" + tableRows[i]["id"], "data-id": tableRows[i]["id"], "data-name": tableRows[i]["name"], "data-reps": tableRows[i]["reps"], 
               "data-weight": tableRows[i]["weight"], "data-lbs": tableRows[i]["lbs"], "data-date": tableRows[i]["date"]}, [
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
                        button({'class': 'edit-button u-full-width', 'data-exercise-id': tableRows[i]["id"]}, [
                            text("Edit"),
                        ])
                    ]),
                    td({}, [
                        button({'class': 'delete-button u-full-width', 'data-exercise-id': tableRows[i]["id"]}, [
                            text("Delete"),
                        ])
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
           $("#add-exercise-form").each(function(){ this.reset(); });
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
    tr({"id": "row-" + resID["id"], "data-id": resID["id"], "data-name": exercise["name"], "data-reps": exercise["reps"], 
    "data-weight": exercise["weight"], "data-lbs": exercise["lbs"], "data-date": exercise["date"]}, [
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
        td({}, [
            button({'class': 'edit-button u-full-width' , 'data-exercise-id': resID["id"]}, [
                text("Edit"),
            ])
        ]),
        td({}, [
            button({'class': 'delete-button u-full-width', 'data-exercise-id': resID["id"]}, [
                text("Delete"),
            ])
        ])
    ]);

    document.getElementById("exercise-list").appendChild(newRow);
}

function removeExercise(event, id) {

    var exID = $(this).parents('tr').attr('data-id');
    var reqContent = {
        "id": exID,
    };

    //create, initialize, and configure XMLHttpRequest object
    var req = new XMLHttpRequest();
    req.open('POST', 'http://localhost:56565/delete-exercise', true);
    req.setRequestHeader('Content-Type', 'application/json');

    // load event listener
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {
           $("#row-" + exID).remove();
		} else {
           // handle errors here
		}
    });

    // failure event listener
    req.addEventListener('error', function() {
        // handle failure errors somehow...
	})

    req.send(JSON.stringify(reqContent));
}

function editExercise(event) {
    
    var rowForm;
    var exercise = {
        "id": $(this).parents('tr').attr('data-id'),
        "name": $(this).parents('tr').attr('data-name'),
        "reps": $(this).parents('tr').attr('data-reps'),
        "weight": $(this).parents('tr').attr('data-weight'),
        "lbs": $(this).parents('tr').attr('data-lbs'),
        "date": $(this).parents('tr').attr('data-date')
    };

    if (exercise["lbs"] == "1") {
        rowForm =
        tr({}, [
            td({},[
                input({"class": "u-full-width", "type": "text", "name": "name", "id": "row-name", "value": exercise["name"]}, []),
            ]),
            td({},[
                input({"class": "u-full-width", "type": "number", "name": "reps", "id": "row-reps", "value": exercise["reps"]}, []),
            ]),
            td({},[
                input({"class": "u-full-width", "type": "number", "name": "weight", "id": "row-weight", "value": exercise["weight"]}, []),
            ]),
            td({},[
                select({"class": "u-full-width", "name": "lbs", "id": "row-lbs"}, [
                    option({"value": "1", "selected": "selected"}, [
                        text("Pounds")
                    ]),
                    option({"value": "0"}, [
                        text("Kilograms"),
                    ]),
                ]),
            ]),
            td({},[
                input({"type": "date", "name": "date", "id": "row-date", "value": exercise["date"]}, []),
            ]),
            td({},[
                input({"class": "u-full-width button", "type": "button", "value": "save", "id": "save-button"}, [])
            ]),
        ]);
    } else {
        rowForm =
        tr({}, [ 
            td({},[
                input({"class": "u-full-width", "type": "text", "name": "name", "id": "row-name", "value": exercise["name"]}, []),
            ]),
            td({},[
                input({"class": "u-full-width", "type": "number", "name": "reps", "id": "row-reps", "value": exercise["reps"]}, []),
            ]),
            td({},[
                input({"class": "u-full-width", "type": "number", "name": "weight", "id": "row-weight", "value": exercise["weight"]}, []),
            ]),
            td({},[
                select({"class": "u-full-width", "name": "lbs", "id": "row-lbs"}, [
                    option({"value": "1"}, [
                        text("Pounds")
                    ]),
                    option({"value": "0", "selected": "selected"}, [
                        text("Kilograms"),
                    ]),
                ]),
            ]),
            td({},[
                input({"type": "date", "name": "date", "id": "row-date", "value": exercise["date"]}, []),
            ]),
            td({},[
                input({"class": "u-full-width button", "type": "button", "value": "save", "id": "save-button"}, [])
            ]),
        ]);
    }

    $('button').prop('disabled', true).addClass("disabled-button");
    $('input[type="button"]').prop('disabled', true).addClass("disabled-button");
    $('#row-' + exercise["id"]).replaceWith(rowForm);

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