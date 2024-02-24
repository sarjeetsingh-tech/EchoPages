const commentsList = document.querySelector('#commentsList');

// Add event listener to the comments list to listen for clicks on delete buttons
commentsList.addEventListener('click', (event) => {

    if (event.target.classList.contains('deleteCommentButton')) {
        // console.log(event.target)
        const deleteButton = event.target;
        const commentId = deleteButton.getAttribute('data-comment-id');
        // console.log(commentId)
        const listItem = deleteButton.parentElement;
        // console.log(listItem)
        deleteComment(commentId, listItem);
    }
});

function deleteComment(commentId, listItem) {
    console.log('Deleting comment with ID:', commentId);

    fetch(`/posts/${postId}/comments/${commentId}/delete`, {
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
            if(data!='failed')
            listItem.remove();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
