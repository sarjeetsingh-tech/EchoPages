const followButton = document.querySelector('#followButton')
followButton.addEventListener('click', () => {
    console.log('clicked');
    fetch(`/user/${owner}/follow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
            console.log('Fetch successful:', data);
            console.log(data);
            if (data === 'followed') {
                followButton.innerHTML = 'unfollow';
            } else if (data === 'unfollowed') {
                followButton.innerHTML = 'follow';
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
})
const followButtonLg = document.querySelector('#followButtonLg');
followButtonLg.addEventListener('click', () => {
    console.log('clicked');
    fetch(`/user/${owner}/follow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({})
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
        .then(data => {
            console.log('Fetch successful:', data);
            console.log(data);
            if (data === 'followed') {
                followButtonLg.innerHTML = 'unfollow';
            } else if (data === 'unfollowed') {
                followButtonLg.innerHTML = 'follow';
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
});

