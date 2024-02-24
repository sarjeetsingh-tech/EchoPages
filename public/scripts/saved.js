const saveButton = document.querySelector('#saveButton');
const saveButtonText=document.querySelector('.saveButtonText')
    saveButton.addEventListener('click', () => {
        console.log('clicked');
        fetch(`/posts/${postId}/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Fetch successful:', data);
                if (data === 'saved') {
                    saveButtonText.innerHTML = 'unsave';
                } else if (data === 'unsaved') {
                    saveButtonText.innerHTML = 'save';
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    })