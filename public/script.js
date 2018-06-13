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

function changeModalBody(modalTabs, i, modalBodyHTMLs) {
  return function() {
    // visually deselect the current selected modal tab
    var selectedModalTab = document.querySelector('.modal-tab-selected');
    selectedModalTab.classList.remove('modal-tab-selected');

    // visually select this new modal tab
    modalTabs[i].classList.add('modal-tab-selected');

    var modalBody = document.getElementById('modal-body');

    // remove the old content inside the modal's body
    while (modalBody.firstChild) {
      modalBody.removeChild(modalBody.firstChild);
    }

    console.log(modalBodyHTMLs[i]);

    // add the corresponding content of the new selected tab
    modalBody.insertAdjacentHTML('beforeend', modalBodyHTMLs[i]);
  };
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

  // contains Handlebars HTML strings of the modal body. The ordering of this
  // array is the same as the ordering of the modal tabs
  var modalBodyHTMLs = [
    Handlebars.templates.modalLogActivity(),
    Handlebars.templates.modalCreateGoal()
  ];

  console.log(modalBodyHTMLs[0]);
  console.log(modalBodyHTMLs[1]);
  var modalTabs = document.getElementsByClassName('modal-tab');
  if (modalTabs) {
    for (var i = 0; i < modalTabs.length; i++) {
      modalTabs[i].addEventListener('click', changeModalBody(
        modalTabs, i, modalBodyHTMLs));
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
    });;
  }

});
