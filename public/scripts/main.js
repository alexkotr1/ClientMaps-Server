document.addEventListener('DOMContentLoaded', () => {
    const itemList = document.getElementById('item-list'), 
    HOST = window.location.protocol + "//" + window.location.host + '/', 
    PASSWORD = "6NaUPgrWuaZXVqYw2KQP",
    searchbar = document.getElementById('search-bar'),
    addbutton = document.getElementById('add-btn')

    addbutton.addEventListener('click', event => {
        window.location = HOST + 'addClient/' + PASSWORD + '/' + (searchbar.value.length ? searchbar.value : '')
    })
    itemList.addEventListener('click', (event) => {
        const target = event.target;

        if (target.classList.contains('edit-btn')) {
            editItem(target);
        } else if (target.classList.contains('delete-btn')) {
            deleteItem(target);
        }
    });

    searchbar.addEventListener('input', event => {
        const text = event.target.value.replace(/\s*/g, "").toUpperCase();
        const items = Array.from(document.getElementById('item-list').children)
        if (text.length == 0) {
            items.map(item => item.hidden = false)
            return undefined;
        }
        console.log(data)
        data.map(client => {
            const item = findItem(client.id, items)
            if (client.name.replace(/\s*/g, "").toUpperCase().includes(text) || client.names.filter(name => name.replace(/\s*/g, "").toUpperCase().includes(text)).length) item.hidden = false
            else item.hidden = true
        })
    })

    function editItem(button) {
        const listItem = button.closest('li');
        const id = listItem.getAttribute('data-id');
        console.log('Add item with ID:', id);
        window.location.pathname = '/edit/' + id + '/' + PASSWORD;
    }

    async function deleteItem(button) {
        const listItem = button.closest('li'),
        id = listItem.getAttribute('data-id'),
        response = await postData(HOST + "delete/" + id + '/' + PASSWORD)
        if (!response) return undefined;
        const code = response.status
        if (code == 200) {
            listItem.remove();
            showMessage('Επιτυχής Διαγραφή!')
        } else {
            showMessage('Κάτι πήγε στραβά!')
        }
        console.log('Delete item with ID:', response);
    }
});

async function postData(url, data) {
    const response = await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        credentials: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data)
    });

    return await response;
}

function showMessage(text) {
    const messageContainer = document.querySelector('.message-container'),
    messageText = document.getElementById('message-text');
    messageText.textContent = text;
    messageContainer.style.opacity = '1';

    setTimeout(() => {
        messageContainer.style.opacity = '0';
    }, 3000);
}

function findItem(id, items) {
    for (var x = 0; x < items.length; x++) {
        if (items[x].getAttribute('data-id') == id) return items[x]
    }
    return undefined;
}