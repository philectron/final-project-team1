const DAY_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
]

function showCalendarModal(){
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var modal = document.getElementById('calendarModal');
  var drop = document.getElementById('daySelectDropdown');
  var text = document.getElementById('content-text-input');
  var cal = document.getElementById('weekCalendar');

  text.value = cal.getElementsByTagName('p')[drop.value].innerHTML;

  modalBackdrop.classList.remove('hidden');
  modal.classList.remove('hidden');
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
      // var photoCardTemplate = Handlebars.templates.photoCard;
      // var newPhotoCardHTML = photoCardTemplate({
      //   photoURL: photoURL,
      //   caption: caption
      // });
      // var photoCardContainer = document.querySelector('.photo-card-container');
      // photoCardContainer.insertAdjacentHTML('beforeend', newPhotoCardHTML);
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

}

function hideModal2(){
  var modalBackdrop = document.getElementById('calendarModalBackdrop');
  var modal = document.getElementById('homeModal');

  modalBackdrop.classList.add('hidden');
  modal.classList.add('hidden');
}

function acceptModal2(){
  //do something
  hideModal2();

}

function changeModalBody(modalTabs, i) {
  return function() {
    // visually deselect the current selected modal tab
    var selectedModalTab = document.querySelector('.modal-tab-selected');
    selectedModalTab.classList.remove('modal-tab-selected');

    // visually select this new modal tab
    modalTabs[i].classList.add('modal-tab-selected');

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
