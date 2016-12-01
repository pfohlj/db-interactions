$(document).ready(function() {
    makeTags('tr', 'td', 'button', 'input', 'label', 'form', 'select', 'option', 'div');
    renderTable();

    $('#add-button').on('click', addExercise);
    $('tbody').on('click', '.delete-button', removeExercise);
    $('tbody').on('click', '.edit-button', editExercise);
    $(':input').date();
});

function renderTable() {
    // create, initialize, and configure XMLHttpRequest object
    var req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:56565/render-table', true);

    // load event listener
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {

            if (!("err" in JSON.parse(req.responseText))) {
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

                        $("#exercise-list").append(tempRow);
                }
            } else {
                $("#error-text").text("There was a problem accessing the databse.  Plese refresh the page or try again later.").addClass("reset-text");
            }

		} else {
          $("#error-text").text("Something went wrong.").addClass("reset-text");
		}
    });

    // failure event listener
    req.addEventListener('error', function() {
        $("#error-text").text("Something went seriously wrong!.").addClass("reset-text");
	})

    req.send();
}


function addExercise(event) {
     $('#error-text').empty();

    var newExercise = {
        "name": $('#exerciseName').val(),
        "reps": $('#repetitions').val(),
        "weight": $('#weight').val(),
        "unit": $('#unit').val(),
        "date": $('#date').val()
    };

    if (newExercise["name"] && newExercise["reps"] && newExercise["weight"] && newExercise["date"]) {
        // create, initialize, and configure XMLHttpRequest object
        var req = new XMLHttpRequest();
        req.open('POST', 'http://localhost:56565/add-exercise', true);
        req.setRequestHeader('Content-Type', 'application/json');

        // load event listener
        req.addEventListener('load', function() {
            if (req.status >= 200 && req.status < 400) {
                
                if (!("err" in JSON.parse(req.responseText))) {
                    $('#error-text').empty();
                    $("#add-exercise-form").each(function(){ this.reset(); });
                    addRow(req.responseText, newExercise);
                } else {
                    $('#error-text').text("Something went wrong.  "
                    + "Check your entries and try again please.").addClass("resetText");
                }

            } else {
                $('#error-text').text("Something went wrong, please try again!").addClass("resetText");
            }
        });

        // failure event listener
        req.addEventListener('error', function() {
            // handle failure errors somehow...
        })

        req.send(JSON.stringify(newExercise));
    } else {
        $('#error-text').text("All fields required!").addClass("reset-text");
    }

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

    $("#exercise-list").append(newRow);
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
          return;
		}
    });

    // failure event listener
    req.addEventListener('error', function() {
        return;
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

    var re = /(\d+-\d+-\d+)/g;


    rowForm =
    tr({"id": "rowForm"}, [
        td({},[
            label({}, [
                text("Name"),
                input({"class": "u-full-width", "type": "text", "name": "name", "id": "row-name", "value": exercise["name"]}, []),
            ]),
        ]),
        td({},[
            label({}, [
                text("Reps"),
                input({"class": "u-full-width", "type": "number", "name": "reps", "id": "row-reps", "value": exercise["reps"]}, []),
            ]),
        ]),
        td({},[
            label({}, [
                text("Weight"),
                input({"class": "u-full-width", "type": "number", "name": "weight", "id": "row-weight", "value": exercise["weight"]}, []),
            ]),
        ]),
        td({},[
            label({}, [
                text("Unit"),
                select({"class": "u-full-width", "name": "lbs", "id": "row-lbs"}, [
                    option({"value": "1"}, [
                        text("Pounds")
                    ]),
                    option({"value": "0"}, [
                        text("Kilograms"),
                    ]),
                ]),
            ]),
        ]),
        td({},[
            label({}, [
                text("Date"),
                input({"type": "date", "name": "date", "id": "row-date", "value": re[Symbol.match](exercise["date"])}, []),
            ]),
        ]),
        td({},[
            input({"class": "u-full-width button", "type": "button", "value": "save", "id": "save-button"}, [])
        ]),
    ]);

    var jRowForm = $(rowForm);

    if (exercise["lbs"] == "1") {
        jRowForm.find("#row-lbs option:first-child").attr("selected", "selected");
    } else {
        jRowForm.find("#row-lbs option:nth-child(2)").attr("selected", "selected");
    }


    $('button').prop('disabled', true).addClass("disabled-button");
    $('input[type="button"]').prop('disabled', true).addClass("disabled-button");
    $('td, .head-text').attr("style", "color: #BABABA;");
    $('#row-' + exercise["id"]).replaceWith(jRowForm);
    $(':input').date();

    $("#save-button").click(function() {
        
        $('#row-error').empty();

        exercise["name"] = $('#row-name').val();
        exercise["reps"] = $('#row-reps').val();
        exercise["weight"] = $('#row-weight').val();
        exercise["lbs"] = $('#row-lbs').val(),
        exercise["date"] = $('#row-date').val();

        if (exercise["name"] && exercise["reps"] && exercise["weight"] && exercise["lbs"] && exercise["date"]) {

            var req = new XMLHttpRequest();
            req.open('POST', 'http://localhost:56565/update-exercise', true);
            req.setRequestHeader('Content-Type', 'application/json');

            // load event listener
            req.addEventListener('load', function() {
                if (req.status >= 200 && req.status < 400) {
                    var updatedRow = JSON.parse(req.responseText);

                    var tempRow = 
                    tr({"id": "row-" + updatedRow["id"], "data-id": updatedRow["id"], "data-name": updatedRow["name"], "data-reps": updatedRow["reps"], 
                    "data-weight": updatedRow["weight"], "data-lbs": updatedRow["lbs"], "data-date": updatedRow["date"]}, [
                        td({}, [
                            text(updatedRow["name"]),
                        ]),
                        td({}, [
                            text(updatedRow["reps"]),
                        ]),
                        td({}, [
                            text(updatedRow["weight"] + (parseInt(updatedRow["lbs"]) ? " Lbs." : " Kg." )),
                        ]),
                        td({}, [
                            text(updatedRow["date"]),
                        ]),
                        td({}, [
                            button({'class': 'edit-button u-full-width', 'data-exercise-id': updatedRow["id"]}, [
                                text("Edit"),
                            ])
                        ]),
                        td({}, [
                            button({'class': 'delete-button u-full-width', 'data-exercise-id': updatedRow["id"]}, [
                                text("Delete"),
                            ])
                        ])
                    ]);

                    $('button').prop('disabled', false).removeClass("disabled-button");
                    $('input[type="button"]').prop('disabled', false).removeClass("disabled-button");
                    $('td, .head-text').removeAttr("style");
                    $('#rowForm').replaceWith(tempRow);
                    
                } else {
                    return;
                }
            });

            // failure event listener
            req.addEventListener('error', function() {
                return;
            })

            req.send(JSON.stringify(exercise));

        } else {
             $('#row-error').text("All fields required!").addClass("reset-text");
        }
    });
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