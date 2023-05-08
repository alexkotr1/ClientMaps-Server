  document.addEventListener('DOMContentLoaded', function() {
    const addNameBtn = document.getElementById('add-name-btn'),
    namesList = document.getElementById('names-list'),
    removeNameBtns = document.querySelectorAll('.remove-name-btn'),
    submit = document.getElementById('submit'),
    name = document.getElementById('name'),
    phone = document.getElementById('phone'),
    comments = document.getElementById('comments'),
    HOST = window.location.protocol + "//" + window.location.host + '/',
    PASSWORD = "6NaUPgrWuaZXVqYw2KQP";



    removeNameBtns.forEach(function(removeNameBtn) {
      removeNameBtn.addEventListener('click', function() {
        removeNameBtn.parentElement.remove();
      });
    });



    addNameBtn.addEventListener('click', function() {
      const newIndex = namesList.children.length;
      const newListItem = document.createElement('li');
      newListItem.setAttribute('data-index', newIndex);

      const newNameInput = document.createElement('input');
      newNameInput.setAttribute('type', 'text');
      newNameInput.setAttribute('name', 'names[]');
      newNameInput.value = '';

      const removeNameBtn = document.createElement('button');
      removeNameBtn.classList.add('remove-name-btn');
      removeNameBtn.setAttribute('type', 'button');
      removeNameBtn.textContent = 'Αφαίρεση';

      removeNameBtn.addEventListener('click', function() {
        newListItem.remove();
      });

      newListItem.appendChild(newNameInput);
      newListItem.appendChild(removeNameBtn);

      namesList.appendChild(newListItem);
    });


    
    submit.addEventListener('click', function(){
      const data = {}
      if (name.value.length === 0) {
        alert('Το πεδίο «Ονοματεπώνυμο» δεν μπορεί να είναι κενό!')
        return undefined;
      }
      else if (phone.value.length !== 0 && !phone.value.match(/^\d{10}$/)) {
        alert('Το πεδίο «Τηλέφωνο» δεν είναι έγκυρο!')
        return undefined;
      }
      data.name = name.value;
      data.phone = phone.value;
      data.comments = comments.value;
      if (point){
        data.latitude = point.lat
        data.longitude = point.lng
      }
      else {
        alert("Κάτι πήγε στραβά!")
        return undefined;
      }
      data.names = Array.from(document.querySelectorAll('#names-list li input')).filter(item => item.value.length).map(item => item.value)
      fetch(HOST + 'edit/'+ getEJSData().id + '/' + PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then(responseData => {
          if (responseData.status == 200){
            window.location = HOST + PASSWORD;
          }
          else if (responseData.status == 409){
            alert("Αυτό το ονοματεπώνυμο υπάρχει ήδη!")
          }
          else alert("Κάτι πήγε στραβά!")
        })
        .catch(error => {
          console.error('Error:', error);
        });
    })
  });
