document.addEventListener('DOMContentLoaded', function() {
  const addbtn = document.getElementById('add-btn'),
  name = document.getElementById('name'),
  phone = document.getElementById('phone'),
  comments = document.getElementById('comments'),
  HOST =  window.location.protocol + "//" + window.location.host + '/',
  PASSWORD = "6NaUPgrWuaZXVqYw2KQP"

  
  addbtn.addEventListener('click', () => {
      if (name.value.length === 0) {
          alert('Το πεδίο «Ονοματεπώνυμο» δεν μπορεί να είναι κενό!')
          return undefined;
      } else if (phone.value.length !== 0 && !phone.value.match(/^\d{10}$/)) {
          alert('Το πεδίο «Τηλέφωνο» δεν είναι έγκυρο!')
          return undefined;
      }
      var data = {}
      data.name = name.value;
      data.phone = phone.value;
      data.comments = comments.value;
      data.names = [];
      if (point) {
          data.latitude = point.lat
          data.longitude = point.lng
      } else {
          alert("Κάτι πήγε στραβά!")
          return undefined;
      }
      fetch(HOST + 'add/' + PASSWORD, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(data),
          })
          .then(responseData => {
              if (responseData.status == 200) {
                  window.location = HOST  + PASSWORD;
              } else if (responseData.status == 409) {
                  alert("Αυτό το ονοματεπώνυμο υπάρχει ήδη!")
              } else alert("Κάτι πήγε στραβά!")
          })
          .catch(error => {
              console.error('Error:', error);
          });
  })
})