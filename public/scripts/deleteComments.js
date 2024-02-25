const commentsList = document.querySelector('#commentsList');

commentsList.addEventListener('click', (event) => {

    if (event.target.classList.contains('deleteCommentButton')) {
        const deleteButton = event.target;
        const commentId = deleteButton.getAttribute('data-comment-id');
        const listItem = deleteButton.parentElement;
        deleteComment(commentId, listItem);
    }
});

function deleteComment(commentId, listItem) {
    fetch(`/posts/${postId}/comments/${commentId}/delete`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ commentId: commentId })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if(data!='failed')
            listItem.remove();
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}
