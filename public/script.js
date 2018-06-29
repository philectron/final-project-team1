const DAY_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

var numberModalTab = 0;

function percentageOf(big, small) {
  if (!isNaN(big) && !isNaN(small) && big !== 0) {
    return Math.round(small * 100.0 / big);
  } else {
    return 0;
  }
}

function showCalendarModal() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('calendar-modal');
  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerText;

  modalBackdrop.classList.remove('hidden');
  modal.classList.remove('hidden');

  // default value for <option>: first element selected
  var calendarDayOptions = document.getElementById('calendar-day-select')
                                   .getElementsByTagName('option');
  if (calendarDayOptions.length > 0) calendarDayOptions[0].selected = true;
}

function updateCalendarTextInput() {
  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerText;
}

function hideCalendarModal() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('calendar-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function handleCalendarModalAccept() {
  var request = new XMLHttpRequest();
  var requestURL = '/calendar/update';
  request.open('POST', requestURL);

  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  var requestBody = JSON.stringify({
    weekday: DAY_OF_WEEK[drop.value],
    content: text.value
  });

  request.addEventListener('load', function(event) {
    if (event.target.status === 200) {
      cal.getElementsByTagName('p')[drop.value].innerText = text.value;
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });

  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);

  hideCalendarModal();
}

function showGoalModal() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var goalModal = document.getElementById('goal-modal');

  modalBackdrop.classList.remove('hidden');
  goalModal.classList.remove('hidden');

  // default value for <option>: first option selected
  var logActivityOptions = document.getElementById('log-activity-select')
                                   .getElementsByTagName('option');
  if (logActivityOptions.length > 0) logActivityOptions[0].selected = true;

  var removeGoalOptions = document.getElementById('remove-goal-select')
                                  .getElementsByTagName('option');
  if (removeGoalOptions.length > 0) removeGoalOptions[0].selected = true;

  // default value for <textarea>: empty textbox
  var goalModalInputs = goalModal.getElementsByTagName('input');
  for (var i = 0; i < goalModalInputs.length; i++) {
    goalModalInputs[i].value = '';
  }
  var goalModalTextAreas = goalModal.getElementsByTagName('textarea');
  for (var i = 0; i < goalModalTextAreas.length; i++) {
    goalModalTextAreas[i].value = '';
  }
}

function hideGoalModal() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('goal-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function appendGoalGraphContainer(description, goal, progress) {
  var isGoalComplete = percentageOf(goal, progress) >= 100;
  var goalTemplateHTML = Handlebars.templates.goal({
    description: description,
    goal: goal,
    progress: progress,
    percentage: percentageOf(goal, progress),
    isGoalComplete: isGoalComplete
  });
  var graphContainer = document.querySelector('.graph-container');
  graphContainer.insertAdjacentHTML('beforeend', goalTemplateHTML);
}

function appendGoalSidebar(goalDescription) {
  var newGoalItem = document.createElement('li');
  newGoalItem.classList.add('goal-item');
  newGoalItem.innerText = goalDescription;

  document.querySelector('.goal-list').appendChild(newGoalItem);
}

function appendGoalLogActivityTab(goalDescription) {
  var newGoalOption = document.createElement('option');
  newGoalOption.text = goalDescription;

  document.getElementById('log-activity-select').add(newGoalOption);
}

function appendGoalRemoveGoalTab(goalDescription) {
  var newGoalOption = document.createElement('option');
  newGoalOption.text = goalDescription;

  document.getElementById('remove-goal-select').add(newGoalOption);
}

function removeIthGoalGraph(i) {
  document.getElementsByClassName('graph')[i].remove();
}

function removeIthGoalSidebar(i) {
  document.getElementsByClassName('goal-item')[i].remove();
}

function removeIthGoalHomeModal(i) {
  document.getElementById('log-activity-select').remove(i);
  document.getElementById('remove-goal-select').remove(i);
}

function faCheckmark() {
  var checkmark = document.createElement('i');
  checkmark.classList.add('fas', 'fa-check');
  return checkmark;
}

function handleGoalModalAccept() {
  var request = new XMLHttpRequest();
  if (numberModalTab === 0) {
    var requestURL = '/activity/log';
    request.open('POST', requestURL);

    // get index based on the option selected in the menu
    var selectDropDown = document.getElementById('log-activity-select');
    var index = selectDropDown.selectedIndex;
    var numGoals = document.getElementsByClassName('graph').length;

    // ensure selected index is non-negative (for empty-list case)
    if (index < 0 || index >= numGoals) {
      alert('You must select a goal in the list. If there is no goal, you must create one');
      return;
    }

    // get the target '.graph' article in the graph container section
    var targetGraph = document.getElementsByClassName('graph')[index];

    // the graph's current goal can be found inside the '.graph' DOM
    var goal = parseFloat(targetGraph.querySelector('.graph-goal').innerText);
    // the graph's current progress can be found inside the '.graph' DOM
    var oldProgress = parseFloat(
      targetGraph.querySelector('.graph-progress').innerText);

    // the graph description is the selected value of the menu
    var description = selectDropDown.value;
    // the graph progress to add into the existing one is the value of <input>
    var progressInc = parseFloat(
      document.getElementById('log-activity-progress-input').value);

    /* validate inputs */
    if (isNaN(progressInc)) {
      alert('The progress you made must be a number');
      return;
    } else if (progressInc < 0) {
      alert('The progress you made must be positive');
      return;
    }

    var newProgress = oldProgress + progressInc;
    var percentage = percentageOf(goal, newProgress);
    var percentageInc = percentageOf(goal, progressInc);

    var targetGraphBar = targetGraph.querySelector('.graph-bar');
    var targetGraphPercent = targetGraph.querySelector('.graph-percent');
    var activityFeedContent = description + ' for ' + progressInc + ' minutes';

    request.addEventListener('load', function(event) {
      if (event.target.status === 200) {
        // update the graph bar's progress
        targetGraph.querySelector('.graph-progress').innerText = newProgress;

        // if the user has met his/her goal
        if (percentage >= 100) {
          // keep the width at 100%
          targetGraphBar.style.width = '100%';
          // color the bar green
          targetGraphBar.style.backgroundColor = '#1ccc5a';
          // replace percentage with a checkmark
          targetGraphPercent.innerText = '';
          targetGraphPercent.appendChild(faCheckmark());
        } else {
          // otherwise, display normal graph bar with percentage
          targetGraphBar.style.width = percentage.toString() + '%';
          targetGraphPercent.innerText = percentage.toString() + '%';
        }

        // update activity feed
        var activityFeed = document.querySelector('.activity-feed');
        var activityHTML = Handlebars.templates.activity({
          content: activityFeedContent,
          percent: percentageInc
        });
        activityFeed.insertAdjacentHTML('beforeend', activityHTML);
      } else {
        alert('Error logging activity: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
      description: description,
      index: index,
      progressInc: progressInc,
      activity: {
        content: activityFeedContent,
        percent: percentageInc
      }
    }));
  } else if (numberModalTab === 1) {
    var requestURL = '/goal/add';
    request.open('POST', requestURL);

    var description = document.getElementById('create-goal-text-input').value;
    var goal = parseFloat(
      document.getElementById('create-goal-goal-input').value);

    /* validate inputs */
    if (!description || isNaN(goal)) {
      alert('Required fields are missing');
      return;
    } else if (goal <= 0) {
      alert('Goal must be positive');
      return;
    }

    request.addEventListener('load', function(event) {
      if (event.target.status === 200) {
        appendGoalGraphContainer(description, goal, 0);
        appendGoalSidebar(description);
        appendGoalLogActivityTab(description);
        appendGoalRemoveGoalTab(description);
      } else {
        alert('Error adding new goal: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(JSON.stringify({
      description: description,
      goal: goal,
    }));
  } else if (numberModalTab === 2) {
    var requestURL = '/goal/remove';
    request.open('POST', requestURL);

    var selectDropDown = document.getElementById('remove-goal-select');
    var description = selectDropDown.value;
    var index = selectDropDown.selectedIndex;

    // ensure selected index is non-negative (for empty-list case)
    if (index < 0) {
      alert('Activity list must not be empty '
            + '& Must select an activity from the list');
      return;
    }

    request.addEventListener('load', function(event) {
      if (event.target.status === 200) {
        removeIthGoalGraph(index);
        removeIthGoalSidebar(index);
        removeIthGoalHomeModal(index);
      } else {
        alert('Error removing selected goal: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    // request.send(JSON.stringify({ description: selectDropDown.value }));
    request.send(JSON.stringify({ index: index }));
  }

  hideGoalModal();
}

function updateGoalModalBody(modalTabs, i) {
  return function() {
    // visually deselect the current selected modal tab
    var selectedModalTab = document.querySelector('.modal-tab-selected');
    selectedModalTab.classList.remove('modal-tab-selected');

    // visually select this new modal tab
    modalTabs[i].classList.add('modal-tab-selected');
    numberModalTab = i;

    // select modal bodies
    var modalBodies = document.getElementsByClassName('modal-body-section');
    if (modalBodies) {
      // hide the previously selected modal body
      for (var j = 0; j < modalBodies.length; j++) {
        if (!modalBodies[j].classList.contains('hidden')) {
          modalBodies[j].classList.add('hidden');
          break;
        }
      }
      // show the newly selected modal body
      modalBodies[i].classList.remove('hidden');
    }
  };
}

function hideUserModal() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('user-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function showUserModal() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var userModal = document.getElementById('user-modal');
  document.getElementById('username-text-input').value = '';
  document.getElementById('profimage-text-input').value = '';
  modalBackdrop.classList.remove('hidden');
  userModal.classList.remove('hidden');
}

function handleUserModalAccept() {
  var name = document.getElementById('username-text-input').value;
  var pic = document.getElementById('profimage-text-input').value;

  // validate input
  if (!name) {
    alert('Name must not be empty');
    return;
  }

  var request = new XMLHttpRequest();
  var requestURL = '/user/add';
  request.open('POST', requestURL);

  request.addEventListener('load', function(event) {
    if (event.target.status === 200) {
      handleUserChange(name);
    } else {
      alert('Error adding new user: ' + event.target.response);
    }
  });

  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({
    name: name,
    profilePicUrl: pic
  }));
  hideUserModal();
}

function handleUserChange(userName) {
  var request = new XMLHttpRequest();
  var requestURL = '/user/change';
  request.open('POST', requestURL);

  request.addEventListener('load', function(event) {
    if (event.target.status === 200) {
      document.location.reload();
    } else {
      alert("Error changing user: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({ name: userName }));
}

window.addEventListener('DOMContentLoaded', function() {
  var button = document.getElementById('change-planner-button');
  if (button) {
    button.addEventListener('click', showCalendarModal);
  }

  var homeButton = document.getElementById('create-goal-button');
  if (homeButton) {
    homeButton.addEventListener('click', showGoalModal);
  }

  var modalTabs = document.getElementsByClassName('modal-tab');
  if (modalTabs) {
    for (var i = 0; i < modalTabs.length; i++) {
      modalTabs[i].addEventListener('click', updateGoalModalBody(modalTabs, i));
    }
  }

  var calendarModalCloseButton = document.querySelector(
    '#calendar-modal .modal-close-button');
  if (calendarModalCloseButton) {
    calendarModalCloseButton.addEventListener('click', hideCalendarModal);
  }

  var calendarModalCancelButton = document.querySelector(
    '#calendar-modal .modal-cancel-button');
  if (calendarModalCancelButton) {
    calendarModalCancelButton.addEventListener('click', hideCalendarModal);
  }

  var calendarModalAcceptButton = document.querySelector(
    '#calendar-modal .modal-accept-button');
  if (calendarModalAcceptButton) {
    calendarModalAcceptButton.addEventListener(
      'click', handleCalendarModalAccept);
  }

  var goalModalCloseButton = document.querySelector(
    '#goal-modal .modal-close-button');
  if (goalModalCloseButton) {
    goalModalCloseButton.addEventListener('click', hideGoalModal);
  }

  var goalModalCancelButton = document.querySelector(
    '#goal-modal .modal-cancel-button');
  if (goalModalCancelButton) {
    goalModalCancelButton.addEventListener('click', hideGoalModal);
  }

  var goalModalAcceptButton = document.querySelector(
    '#goal-modal .modal-accept-button');
  if (goalModalAcceptButton) {
    goalModalAcceptButton.addEventListener('click', handleGoalModalAccept);
  }

  var userModalCloseButton = document.querySelector(
    '#user-modal .modal-close-button');
  if (userModalCloseButton) {
    userModalCloseButton.addEventListener('click', hideUserModal);
  }

  var userModalCancelButton = document.querySelector(
    '#user-modal .modal-cancel-button');
  if (userModalCancelButton) {
    userModalCancelButton.addEventListener('click', hideUserModal);
  }

  var userModalAcceptButton = document.querySelector(
    '#user-modal .modal-accept-button');
  if (userModalAcceptButton) {
    userModalAcceptButton.addEventListener('click', handleUserModalAccept);
  }

  var calendarModalSelection = document.getElementById('calendar-day-select')
  if (calendarModalSelection) {
    calendarModalSelection.addEventListener('change', updateCalendarTextInput);
  }

  var changeUserText = document.getElementById('user-list');
  if (changeUserText) {
    changeUserText.addEventListener('click', function(event) {
      if (event.target.innerText === 'Add a new user...') {
        showUserModal();
      } else {
        handleUserChange(event.target.innerText);
      }
    });
  }
});
