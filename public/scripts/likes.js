
const url = `/posts/${postId}/like`;
document.querySelector('#likeButton').addEventListener('click', () => {
    console.log('button clicked')
    fetch(url, {
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
    }).then(data => {
        document.querySelector('#displayLike').innerText = data;
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });

})