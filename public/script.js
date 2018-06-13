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
  //do something
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
    modalBackdrop.classList.remove('hidden');
    var newUserModal = document.getElementById('newUserModal');
    newUserModal.classList.remove('hidden');
}

function createNewUser(){
  var name = document.getElementById('username-text-input').value;
  var pic = document.getElementById('profimage-text-input').value;
  hideModal3();
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
      if(event.target.innerHTML == 'Phi' || event.target.innerHTML == "Gym Rat"){
        alert(event.target.innerHTML);
      }
      else if(event.target.innerHTML == "Add a new user..."){
        addNewUser();
      }
    });;



  }

});
