const commentsList = document.querySelector('#commentsList');

// Add event listener to the comments list to listen for clicks on delete buttons
commentsList.addEventListener('click', (event) => {
    if (event.target.classList.contains('deleteCommentButton')) {
        const deleteButton = event.target;
        const commentId = deleteButton.getAttribute('data-comment-id');
        const listItem = deleteButton.parentElement;
        deleteComment(commentId, listItem);
    }
});

function deleteComment(commentId, listItem) {
    console.log('Deleting comment with ID:', commentId);
    const url = `/posts/${postId}/comments/${commentId}/delete`;

    fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId: commentId }) // Pass the comment ID to the server
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetch successful:', data);
            // Remove the corresponding list item from the DOM
            listItem.remove();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
