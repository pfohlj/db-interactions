function renderTable() {
    return;
}

function addExercise(event) {
    var newExerise = {
        "name": $('#exerciseName').val(),
        "reps": $('#repetitions').val(),
        "weight": $('#weight').val(),
        "unit": $('#unit').val(),
        "date": $('#date').val()
    };

    console.log(newExerise);

    // create, initialize, and configure XMLHttpRequest object
    var req = new XMLHttpRequest();
    req.open('POST', 'http://localhost:56565/add-exercise', true);
    req.setRequestHeader('Content-Type', 'application/json');

    // load event listener
    req.addEventListener('load', function() {
        if (req.status >= 200 && req.status < 400) {

           return;

		} else {
			
           return;

		}
    });

    // failure event listener
    req.addEventListener('error', function() {
		
        return;

	})

    req.send(JSON.stringify(newExerise));
    event.preventDefault();
}

function removeExercise(event) {
    alert("I'm removing an exercise.");
}

function editExercise(event) {
    alert("I'm editing an exercise");
}

$(document).ready(function() {

    renderTable();

    $('#add-button').on('click', addExercise);
    $('.tbody').on('click', '.remove-button', removeExercise);
    $('.tbody').on('click', '.edit-button', editExercise);
});