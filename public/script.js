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
    // if the parsed values are both not NaN, return the floor of percentage
    var percentage;

    // always do smaller * 100.0 / larger
    if (num1 > num2) {
      percentage = Math.floor(num2 * 100.0 / num1);
    } else {
      percentage = Math.floor(num1 * 100.0 / num2);
    }

    return percentage;
  } else {
    // otherwise, return 0
    return 0;
  }
}


function showCalendarModal(){
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var modal = document.getElementById('calendarModal');
  var drop = document.getElementById('daySelectDropdown');
  var text = document.getElementById('content-text-input');
  var cal = document.getElementById('weekCalendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerHTML;

  modalBackdrop.classList.remove('hidden');
  modal.classList.remove('hidden');

  // default value for <option>: first element selected
  document.getElementById('daySelectDropdown')
          .getElementsByTagName('option')[0]
          .selected = true;
}

function updateTextArea(){
  var drop = document.getElementById('daySelectDropdown');
  var text = document.getElementById('content-text-input');
  var cal = document.getElementById('weekCalendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerHTML;
}

function hideModal(){
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var modal = document.getElementById('calendarModal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function acceptModal(){
  var request = new XMLHttpRequest();
  var requestURL = '/calendar/update';
  request.open('POST', requestURL);

  var drop = document.getElementById('daySelectDropdown');
  var text = document.getElementById('content-text-input');
  var cal = document.getElementById('weekCalendar');

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
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var homeModal = document.getElementById('homeModal');

  modalBackdrop.classList.remove('hidden');
  homeModal.classList.remove('hidden');

  // default value for <option>: first option selected
  document.getElementById('select-log-activity')
          .getElementsByTagName('option')[0]
          .selected = true;
  document.getElementById('select-remove-goal')
          .getElementsByTagName('option')[0]
          .selected = true;

  // default value for <textarea>: empty textbox
  var homeModalInputs = homeModal.getElementsByTagName('input');
  for (var i = 0; i < homeModalInputs.length; i++) {
    homeModalInputs[i].value = '';
  }
  var homeModalTextAreas = homeModal.getElementsByTagName('textarea');
  for (var i = 0; i < homeModalTextAreas.length; i++) {
    homeModalTextAreas[i].value = '';
  }

  var firstGraphGoal = document.querySelector('.graph-goal')
                               .innerText
                               .split(' ')[0];
  document.getElementById('log-activity-goal-input').value = firstGraphGoal;
}

function updateActivityGoal(event) {
  var selectDropDown = document.getElementById('select-log-activity');
  var selectedGraph = document.getElementsByClassName('graph')[
    selectDropDown.selectedIndex
  ];
  var selectedGraphGoal = Math.floor(parseInt(
    selectedGraph.querySelector('.graph-goal').innerText
  ));

  document.getElementById('log-activity-goal-input').value = selectedGraphGoal;
}

function hideModal2(){
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var modal = document.getElementById('homeModal');

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

  document.getElementById('select-log-activity').add(newGoalOption);
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
  document.getElementById('select-log-activity').remove(i);
  document.getElementById('select-remove-goal').remove(i);
}

function acceptModal2(){
  var request = new XMLHttpRequest();
  if (numberModalTab == 0) {
    var requestURL = '/activity/log';
    request.open('POST', requestURL);

    var selectDropDown = document.getElementById('select-log-activity');
    var description = selectDropDown.value;
    var progress = parseFloat(
      document.getElementById('log-activity-progress-input').value
    );
    var goal = parseFloat(
      document.getElementById('log-activity-goal-input').value
    );
    var percentage = percentageOf(goal, progress);
    var index = selectDropDown.selectedIndex;

    /* validate inputs */
    if (progress === '' || goal === '' || isNaN(progress) || isNaN(goal)) {
      alert('Required fields are missing');
      return;
    } else if (progress < 0 || goal < 0) {
      alert('Progress and goal must be positive');
      return;
    } else if (progress > goal) {
      alert('Progress must be smaller than goal. Try setting a new goal instead');
      return;
    }

    var requestBody = JSON.stringify({
      description: description,
      goal: goal,
      progress: progress,
      percentage: percentage
    });

    request.addEventListener('load', function(event) {
      if (event.target.status === 200) {
        var targetGraph = document.getElementsByClassName('graph')[index];
        var targetGraphBar = targetGraph.querySelector('.graph-bar');
        var targetGraphPercent = targetGraph.querySelector('.graph-percent');
        targetGraphBar.style.width = percentage + '%';
        targetGraphPercent.innerText = percentage + '%';
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

    var description = document.getElementById('text-input-create-goal').value;
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
    var modalBodies = document.getElementsByClassName('modal-body');
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
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var modal = document.getElementById('newUserModal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function addNewUser(){
    var modalBackdrop = document.getElementById('calendarModalBackdrop');
    var newUserModal = document.getElementById('newUserModal');
    modalBackdrop.classList.remove('hidden');
    newUserModal.classList.remove('hidden');
    console.log("showing");
}

function createNewUser(){
  var name = document.getElementById('username-text-input').value;
  var pic = document.getElementById('profimage-text-input').value;

  var request = new XMLHttpRequest();
  var requestURL = '/newUser';
  request.open('POST', requestURL);


  var requestBody = JSON.stringify(
    {
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
      console.log("added");
      //document.location.reload();
      changeUser(name);
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);
  hideModal3();
}

function changeUser(userName){
  var request = new XMLHttpRequest();
  var requestURL = '/changeUser';
  request.open('POST', requestURL);

  var requestBody = JSON.stringify({name: userName});
  request.addEventListener('load', function (event) {
    if (event.target.status === 200) {
      document.location.reload();
      console.log("changed?");
    } else {
      alert("Error adding new plan: " + event.target.response);
    }
  });
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(requestBody);


}


window.addEventListener('DOMContentLoaded', function () {
  var button = document.getElementById('changePlannerButton');
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

  var modalCloseButton = document.querySelector('#calendarModal .modal-close-button');
  if (modalCloseButton) {
    modalCloseButton.addEventListener('click', hideModal);
  }

  var modalCancelButton = document.querySelector('#calendarModal .modal-cancel-button');
  if (modalCancelButton) {
    modalCancelButton.addEventListener('click', hideModal);
  }

  var modalAcceptButton = document.querySelector('#calendarModal .modal-accept-button');
  if (modalAcceptButton) {
    modalAcceptButton.addEventListener('click', acceptModal);
  }

  var modalCloseButton2 = document.querySelector('#homeModal .modal-close-button');
  if (modalCloseButton2) {
    modalCloseButton2.addEventListener('click', hideModal2);
  }

  var modalCancelButton2 = document.querySelector('#homeModal .modal-cancel-button');
  if (modalCancelButton2) {
    modalCancelButton2.addEventListener('click', hideModal2);
  }

  var modalAcceptButton2 = document.querySelector('#homeModal .modal-accept-button');
  if (modalAcceptButton2) {
    modalAcceptButton2.addEventListener('click', acceptModal2);
  }

  var modalLogActivitySelect = document.getElementById('select-log-activity');
  if (modalLogActivitySelect) {
    modalLogActivitySelect.addEventListener('change', updateActivityGoal);
  }

  var modalCloseButton3 = document.querySelector('#newUserModal .modal-close-button');
  if (modalCloseButton3) {
    modalCloseButton3.addEventListener('click', hideModal3);
  }

  var modalCancelButton3 = document.querySelector('#newUserModal .modal-cancel-button');
  if (modalCancelButton3) {
    modalCancelButton3.addEventListener('click', hideModal3);
  }

  var modalAcceptButton3 = document.querySelector('#newUserModal .modal-accept-button');
  if (modalAcceptButton3) {
    modalAcceptButton3.addEventListener('click', createNewUser);
  }

  var modalSelect = document.getElementById('daySelectDropdown')
  if(modalSelect){
    modalSelect.addEventListener('change', updateTextArea);
  }


  var changeUserText = document.getElementById('changeUserDrop');
  if(changeUserText){
    changeUserText.addEventListener('click', function(event){
      if(event.target.innerHTML == "Add a new user..."){
        addNewUser();
      }
      else{
        changeUser(event.target.innerText);
        //try to change user
      }
    });;



  }

});
