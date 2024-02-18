const commentInput = document.querySelector('#commentInput');
const commentSubmit = document.querySelector('#commentSubmit');
// console.log(commentInput.value);
// console.log(postId);

commentSubmit.addEventListener('click', () => {
    console.log('button clicked');
    fetch(`/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentInput.value })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json(); // Parse JSON response
    }).then(data => {
        console.log('Fetch successful:', data);
        const list = document.querySelector('#commentsList');
        const newListItem = document.createElement('li');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.setAttribute('class', 'deleteCommentButton');
        deleteButton.setAttribute('data-comment-id', data[0]._id);

        // Set the text content of newListItem
        newListItem.textContent = data[0].comment + ' - ' + data[1];

        // Append deleteButton as a child of newListItem
        newListItem.appendChild(deleteButton);

        // Append newListItem as a child of the list
        list.appendChild(newListItem);
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
});
