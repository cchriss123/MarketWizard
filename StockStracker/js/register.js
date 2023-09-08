const elForm = document.querySelector('form');
const elUsername = document.querySelector('#name');
const elEmail = document.querySelector('#email');
const elSubmittedData = document.querySelector('#submitted-data');



elForm.addEventListener('submit', function(event) {
    event.preventDefault();
    let submittedName = elUsername.value;    
    elSubmittedData.textContent = `Thank you ${submittedName} for registering!`;
});
