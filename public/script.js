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

function percentageOf(num1, num2) {
  if (!isNaN(num1) && !isNaN(num2)) {
    // if num2 > num1, return 100. Otherwise, return floor(num2 * 100.0 / num1)
    if (num2 >= num1) {
      return 100;
    } else {
      return Math.floor(num2 * 100.0 / num1);
    }
  } else {
    // if either num1 or num2 is not a number, return 0
    return 0;
  }
}

function showCalendarModal(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('calendar-modal');
  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerText;

  modalBackdrop.classList.remove('hidden');
  modal.classList.remove('hidden');

  // default value for <option>: first element selected
  document.getElementById('calendar-day-select')
          .getElementsByTagName('option')[0]
          .selected = true;
}

function updateTextArea(){
  var drop = document.getElementById('calendar-day-select');
  var text = document.getElementById('calendar-goal-input');
  var cal = document.getElementById('week-calendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerText;
}

function hideModal(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('calendar-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function acceptModal(){
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

  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      cal.getElementsByTagName('p')[drop.value].innerText = text.value;
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });

  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);

  hideModal();
}

function showHomeModal(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var goalModal = document.getElementById('goal-modal');

  modalBackdrop.classList.remove('hidden');
  goalModal.classList.remove('hidden');

  // default value for <option>: first option selected
  document.getElementById('log-activity-select')
          .getElementsByTagName('option')[0]
          .selected = true;
  document.getElementById('remove-goal-select')
          .getElementsByTagName('option')[0]
          .selected = true;

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

function hideModal2(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('goal-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function appendGoalGraphContainer(description, goal, progress) {
  var goalTemplateHTML = Handlebars.templates.goal({
    description: description,
    goal: goal,
    progress: progress,
    percentage: percentageOf(goal, progress)
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

  document.getElementById('select-remove-goal').add(newGoalOption);
}

function removeIthGoalGraph(i) {
  document.getElementsByClassName('graph')[i].remove();
}

function removeIthGoalSidebar(i) {
  document.getElementsByClassName('goal-item')[i].remove();
}

function removeIthGoalHomeModal(i) {
  document.getElementById('log-activity-select').remove(i);
  document.getElementById('select-remove-goal').remove(i);
}

// function checkGraphAreaDone() {
//   var graphAreas = document.getElementsByClassName('graph-area');
//   var checkMark = document.createElement('i');
//   checkMark.classList.add('fas', 'fa-check');

//   for (var i = 0; i < graphAreas.length; i++) {
//     var graphBar = graphAreas[i].children[0];
//     var graphPercent = graphAreas[i].children[1];
//     if (parseInt(graphBar.style.width.replace('%', '')) >= 100) {
//       graphBar.style.width = '100%';
//       graphBar.style.backgroundColor = 'green';
//       graphPercent.innerText = '';
//       graphAreas[i].appendChild(checkMark);
//     }
//   }
// }

function acceptModal2(){
  var request = new XMLHttpRequest();
  if (numberModalTab == 0) {
    var requestURL = '/activity/log';
    request.open('POST', requestURL);

    // get index based on the option selected in the menu
    var selectDropDown = document.getElementById('log-activity-select');
    var index = selectDropDown.selectedIndex;

    // get the target '.graph' article in the graph container section
    var targetGraph = document.getElementsByClassName('graph')[index];

    // the graph's current goal can be found inside the '.graph' DOM
    var goal = parseFloat(targetGraph.querySelector('.graph-goal').innerText);
    // the graph's current progress can be found inside the '.graph' DOM
    var oldProgress = parseFloat(targetGraph.querySelector('.graph-progress').innerText);

    // the graph description is the selected value of the menu
    var description = selectDropDown.value;
    // the graph progress to add into the existing one is the value of <input>
    var progressInc = parseFloat(
      document.getElementById('log-activity-progress-input').value
    );

    /* validate inputs */
    if (progressInc === '' || isNaN(progressInc)) {
      alert('Required fields are missing');
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
    var percentageInc = percentageOf(goal, progressInc);
    var isActivityDone = false;

    var requestBody = JSON.stringify({
      description: description,
      progress: newProgress,
      percentage: percentage,
      activity: {
        content: activityFeedContent,
        percent: percentageInc
      }
    });

    request.addEventListener('load', function(event) {
      if (event.target.status === 200) {
        // update target graph's bar width, color, and percentage
        targetGraphBar.style.width = percentage + '%';
        // update the graph's bar's progress
        targetGraph.querySelector('.graph-progress').innerText = newProgress;

        // if the user has met his/her goal
        if (percentage >= 100) {
          // color the bar green
          targetGraphBar.style.backgroundColor = 'green';
          // replace percentage with a checkmark
          var checkMark = document.createElement('i');
          checkMark.classList.add('fas', 'fa-check');

          targetGraphPercent.innerText = '';
          targetGraphPercent.appendChild(checkMark);
          // mark activity as done
          isActivityDone = true;
        } else {
          targetGraphPercent.innerText = percentage + '%';
          isActivityDone = false;
        }

        // update activity feed
        var activityFeed = document.querySelector('.activity-feed');
        var activityHTML = Handlebars.templates.activity({
          content: activityFeedContent,
          percent: percentageInc,
          done: isActivityDone
        });
        activityFeed.insertAdjacentHTML('beforeend', activityHTML);
      } else {
        alert('Error logging activity: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(requestBody);
  }
  else if(numberModalTab == 1){
    var requestURL = '/goal/add';
    request.open('POST', requestURL);

    var description = document.getElementById('create-goal-text-input').value;
    var goal = parseFloat(
      document.getElementById('create-goal-goal-input').value
    );

    /* validate inputs */
    if (description === '' || goal === '' || isNaN(goal)) {
      alert('Required fields are missing');
      return;
    } else if (goal < 0) {
      alert('Goal must be positive');
      return;
    }

    var requestBody = JSON.stringify({
      description: description,
      goal: goal,
      progress: 0,
      percentage: 0
    });

    request.addEventListener('load', function (event) {
      if(event.target.status === 200){
        appendGoalGraphContainer(description, goal, 0);
        appendGoalSidebar(description);
        appendGoalLogActivityTab(description);
        appendGoalRemoveGoalTab(description);
      }else{
        alert('Error adding goal: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(requestBody);

  }else if(numberModalTab == 2){
    var requestURL = '/goal/remove';
    request.open('POST', requestURL);

    var selectDropDown = document.getElementById('select-remove-goal');
    var description = selectDropDown.value;
    var index = selectDropDown.selectedIndex;

    var requestBody = JSON.stringify({ description: description });

    request.addEventListener('load', function (event) {
      if (event.target.status === 200){
        removeIthGoalGraph(index);
        removeIthGoalSidebar(index);
        removeIthGoalHomeModal(index);
      } else{
        alert('Error removing goal: ' + event.target.response);
      }
    });

    request.setRequestHeader('Content-Type', 'application/json');
    request.send(requestBody);
  }

  hideModal2();
}

function changeModalBody(modalTabs, i) {
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
      for (var j = 0; j < modalBodies.length ; j++) {
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

function hideModal3(){
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var modal = document.getElementById('user-modal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function addNewUser() {
  var modalBackdrop = document.querySelector('.modal-backdrop');
  var userModal = document.getElementById('user-modal');
  modalBackdrop.classList.remove('hidden');
  userModal.classList.remove('hidden');
}

function createNewUser(){
  var name = document.getElementById('username-text-input').value;
  var pic = document.getElementById('profimage-text-input').value;

  var request = new XMLHttpRequest();
  var requestURL = '/user/add';
  request.open('POST', requestURL);

  var requestBody = JSON.stringify({
    "name": name,
    "profilePicUrl": pic,
    "totalProgress":[{
      "description": "Total Progress",
      "goal": "0 minutes",
      "progress": "0 minutes",
      "percentage": 0
    }],
    "goals": [],
    "days": [
      {
        "weekday": "Sunday",
        "content": ""
      },
      {
        "weekday": "Monday",
        "content": ""
      },
      {
        "weekday": "Tuesday",
        "content": ""
      },
      {
        "weekday": "Wednesday",
        "content": ""
      },
      {
        "weekday": "Thursday",
        "content": ""
      },
      {
        "weekday": "Friday",
        "content": ""
      },
      {
        "weekday": "Saturday",
        "content": ""
      }
    ],
    "activities": []
  });

  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      changeUser(name);
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);
  hideModal3();
}

function changeUser(userName) {
  var request = new XMLHttpRequest();
  var requestURL = '/user/change';
  request.open('POST', requestURL);

  var requestBody = JSON.stringify({name: userName});
  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      document.location.reload();
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);
}

window.addEventListener('DOMContentLoaded', function () {
  // checkGraphAreaDone();
  var button = document.getElementById('change-planner-button');
  if(button){
    button.addEventListener('click', showCalendarModal);
  }

  var homeButton = document.getElementById('create-goal-button');
  if(homeButton){
    homeButton.addEventListener('click', showHomeModal);
  }

  var modalTabs = document.getElementsByClassName('modal-tab');
  if (modalTabs) {
    for (var i = 0; i < modalTabs.length; i++) {
      modalTabs[i].addEventListener('click', changeModalBody(modalTabs, i));
    }
  }

  var modalCloseButton = document.querySelector('#calendar-modal .modal-close-button');
  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', hideModal);
  }

  var modalCancelButton = document.querySelector('#calendar-modal .modal-cancel-button');
  if (modalCancelButton) {
    modalCancelButton.addEventListener('click', hideModal);
  }

  var modalAcceptButton = document.querySelector('#calendar-modal .modal-accept-button');
  if (modalAcceptButton) {
    modalAcceptButton.addEventListener('click', acceptModal);
  }

  var modalCloseButton2 = document.querySelector('#goal-modal .modal-close-button');
  if (modalCloseButton2) {
    modalCloseButton2.addEventListener('click', hideModal2);
  }

  var modalCancelButton2 = document.querySelector('#goal-modal .modal-cancel-button');
  if (modalCancelButton2) {
    modalCancelButton2.addEventListener('click', hideModal2);
  }

  var modalAcceptButton2 = document.querySelector('#goal-modal .modal-accept-button');
  if (modalAcceptButton2) {
    modalAcceptButton2.addEventListener('click', acceptModal2);
  }

  var modalCloseButton3 = document.querySelector('#user-modal .modal-close-button');
  if (modalCloseButton3) {
    modalCloseButton3.addEventListener('click', hideModal3);
  }

  var modalCancelButton3 = document.querySelector('#user-modal .modal-cancel-button');
  if (modalCancelButton3) {
    modalCancelButton3.addEventListener('click', hideModal3);
  }

  var modalAcceptButton3 = document.querySelector('#user-modal .modal-accept-button');
  if (modalAcceptButton3) {
    modalAcceptButton3.addEventListener('click', createNewUser);
  }

  var modalSelect = document.getElementById('calendar-day-select')
  if(modalSelect){
    modalSelect.addEventListener('change', updateTextArea);
  }


  var changeUserText = document.getElementById('user-list');
  if (changeUserText) {
    changeUserText.addEventListener('click', function(event) {
      if (event.target.innerText == 'Add a new user...') {
        addNewUser();
      }
      else {
        changeUser(event.target.innerText);
      }
    });
  }
});
