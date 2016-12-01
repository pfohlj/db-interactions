/*****************************************************************************************
** Name: Joseph A Pfohl
** Date: 11/30/2016
** Assignment: db-interactions
** Description: This file contains the client side scripts for the workout tracker single
** page application.  Because this app is designed not to reload pages ever, all requests
** to and from the server are handled via AJAX from this page, including the initial table
** render.  For more details, plese see the inline comments.
*****************************************************************************************/

/* This contains the initial work of the table, setting up for work to be handled by the various
event handlers included in the app. */
$(document).ready(function() {
    // make tag creator functions and render the table body
    makeTags('tr', 'td', 'button', 'input', 'label', 'form', 'select', 'option', 'div');
    renderTable();

    // set up event handlers
    $('#add-button').on('click', addExercise);
    $('tbody').on('click', '.delete-button', removeExercise);
    $('tbody').on('click', '.edit-button', editExercise);

    // activate date polyfill
    $(':input').date();
});

/*****************************************************************************************
** FUNCTION: renderTable()
** DESCRIPTION: renders the table with the data stored on the database
*****************************************************************************************/

function renderTable() {
    // create, initialize, and configure XMLHttpRequest object
    var req = new XMLHttpRequest();
    req.open('GET', 'http://localhost:56565/render-table', true);

    // load event listener
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {

            if (!("err" in JSON.parse(req.responseText))) { // no errors requesting data from DB

                var tableRows = JSON.parse(req.responseText);
                var re = /(\d+-\d+-\d+)/g; // regex for selecting only what we want from returned Date object

                // create and append a row for each result returned from the server
                for (var i = 0, l = tableRows.length; i < l; i++) { 

                    var tempRow = 
                    tr({"id": "row-" + tableRows[i]["id"], "data-id": tableRows[i]["id"], "data-name": tableRows[i]["name"], 
                    "data-reps": tableRows[i]["reps"], "data-weight": tableRows[i]["weight"], "data-lbs": tableRows[i]["lbs"], 
                    "data-date": tableRows[i]["date"]}, [
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
                                text(re[Symbol.match](tableRows[i]["date"])), // get date from string matching format ####-##-##
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

/*****************************************************************************************
** FUNCTION: addExercise()
** DESCRIPTION: adds an exercise to the DB and on success, also adds it to the table on
** the page.
*****************************************************************************************/

function addExercise(event) {
    // by default clear the error text
    $('#error-text').empty();

    // create object with values from form
    var newExercise = {
        "name": $('#exerciseName').val(),
        "reps": $('#repetitions').val(),
        "weight": $('#weight').val(),
        "unit": $('#unit').val(),
        "date": $('#date').val()
    };

    // if the user entered something in each field
    if (newExercise["name"] && newExercise["reps"] && newExercise["weight"] && newExercise["date"]) {
        
        // create, initialize, and configure XMLHttpRequest object
        var req = new XMLHttpRequest();
        req.open('POST', 'http://localhost:56565/add-exercise', true);
        req.setRequestHeader('Content-Type', 'application/json');

        // load event listener
        req.addEventListener('load', function() {
            if (req.status >= 200 && req.status < 400) {
                // no errors making insertion into DB
                if (!("err" in JSON.parse(req.responseText))) {
                    $('#error-text').empty();
                    $("#add-exercise-form").each(function(){ this.reset(); }); // reset the form fields
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
            return;
        })

        req.send(JSON.stringify(newExercise));
    } else {
        $('#error-text').text("All fields required!").addClass("reset-text");
    }

    // prevent submit from actually submitting the form / reloading page
    event.preventDefault();
}

/*****************************************************************************************
** FUNCTION: addRow()
** DESCRIPTION: Adds a row to the end of the table containing the information in exercise
*****************************************************************************************/

function addRow(response, exercise) {
    
    var resID = JSON.parse(response);
    var unit;

    // determine unit
    if (exercise["unit"] == "1") {
        unit = " Lbs.";
    } else {
        unit = " Kg.";
    }

    // construct new row
    var newRow = 
    tr({"id": "row-" + resID["id"], "data-id": resID["id"], "data-name": exercise["name"], 
    "data-reps": exercise["reps"], "data-weight": exercise["weight"], "data-lbs": exercise["lbs"], 
    "data-date": exercise["date"]}, [
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

    // append row
    $("#exercise-list").append(newRow);
}

/*****************************************************************************************
** FUNCTION: removeExercise()
** DESCRIPTION: removes an exercise from the DB and table
*****************************************************************************************/

function removeExercise(event, id) {

    // get exercise ID and create object for request
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
           $("#row-" + exID).remove(); // remove the row
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

/*****************************************************************************************
** FUNCTION: editExercise()
** DESCRIPTION: Edit exercise allows you to edit an exercises parameters right in the 
** table row where it is displayed.  It replaces the row with a form containing the 
** information already in the exercuse and then allows you to submit the changes to the
** server before rerendering just that row with the new information
*****************************************************************************************/

function editExercise(event) {
    
    // build the request object
    var exercise = {
        "id": $(this).parents('tr').attr('data-id'),
        "name": $(this).parents('tr').attr('data-name'),
        "reps": $(this).parents('tr').attr('data-reps'),
        "weight": $(this).parents('tr').attr('data-weight'),
        "lbs": $(this).parents('tr').attr('data-lbs'),
        "date": $(this).parents('tr').attr('data-date')
    };

    var re = /(\d+-\d+-\d+)/g; // used for formatting date in the row / form

    // build our table row form(ish)
    var rowForm =
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

    // create a jQuery object from the DOM object
    var jRowForm = $(rowForm);

    // update the selected select input option
    if (exercise["lbs"] == "1") {
        jRowForm.find("#row-lbs option:first-child").attr("selected", "selected");
    } else {
        jRowForm.find("#row-lbs option:nth-child(2)").attr("selected", "selected");
    }

    // bring focus to the row by dimming and disabling buttons and text
    $('button').prop('disabled', true).addClass("disabled-button");
    $('input[type="button"]').prop('disabled', true).addClass("disabled-button");
    $('td, .head-text').attr("style", "color: #BABABA;");

    // insert the new form and set the date polyfill
    $('#row-' + exercise["id"]).replaceWith(jRowForm);
    $(':input').date();

    // event listener for sate button
    $("#save-button").click(function() {
        
        // automatically empty row error
        $('#row-error').empty();

        // update exercise fields with any new information
        exercise["name"] = $('#row-name').val();
        exercise["reps"] = $('#row-reps').val();
        exercise["weight"] = $('#row-weight').val();
        exercise["lbs"] = $('#row-lbs').val(),
        exercise["date"] = $('#row-date').val();

        // ensure user not submitting empty fields
        if (exercise["name"] && exercise["reps"] && exercise["weight"] && exercise["lbs"] && exercise["date"]) {

            // create and configure request
            var req = new XMLHttpRequest();
            req.open('POST', 'http://localhost:56565/update-exercise', true);
            req.setRequestHeader('Content-Type', 'application/json');

            // load event listener
            req.addEventListener('load', function() {
                if (req.status >= 200 && req.status < 400) {
                    var updatedRow = JSON.parse(req.responseText);

                    // rebuild the table row with the new information
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

                    // remove row focus styles
                    $('button').prop('disabled', false).removeClass("disabled-button");
                    $('input[type="button"]').prop('disabled', false).removeClass("disabled-button");
                    $('td, .head-text').removeAttr("style");

                    // reinsert new updated row
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