// this connects our client to server
const socket = io();

// VARIABLE DECLARATION
const messageComingAudio = new Audio('../sounds/ting.mp3');

// DOM OBJECTS

const form = document.getElementById('send-container');
const inputMsg = document.getElementById('inputMsg');
const messageContainer = document.querySelector('.container');
const scrollLastImage = document.getElementById('scrollLastImage');


// METHOD DECLARATION 'APPEND' FOR ADDING NEW MESSAGES TO CHAT
const append = (message, position) => {
    let messageElement = document.createElement("div");
    messageElement.innerText = message;
    // adding multiple classes to messageElement
    messageElement.classList.add('messages', position);
    messageContainer.append(messageElement);
    // if position is left, it means audio from other side, so play it
    if(position ==='left'){
        messageComingAudio.play();
    }
}

// HANDLING CLIENT BASED EVENTS ONLY

// when the user clicks this img , he will go to bottom of the chat
scrollLastImage.addEventListener('click', ()=> {
    messageContainer.scrollTop = messageContainer.scrollHeight;
});

// when user scrolls the message container, then the arrow down will only be visible if he is slightly above bottom most position
messageContainer.addEventListener('scroll', ()=> {
    let heightFromBottom = messageContainer.scrollHeight - messageContainer.scrollTop;
    if(heightFromBottom >350){
        scrollLastImage.style.display = "block";
    }
    else{
        scrollLastImage.style.display = "none";
    }
});

// EMITTING EVENTS HERE FOR SERVER

// ask user when the page loads
const userName = prompt('Enter your name');
// trigger the 'new-user-joined' event to socket.io
socket.emit('new-user-joined', userName);

// this will handle the submit of form which will get triggered on sending the click button
form.addEventListener('submit', (e)=> {
    // will not let the page to load
    e.preventDefault();
    let message = inputMsg.value;
    message = message.toString().trimStart();
    message = message.trimEnd();
    // we should also know what message we are sending
    if(message!==""){
        append(`You: ${message}`, "right");
        socket.emit('send', message);
    }
    inputMsg.value = '';
});

// HANDLING THE EVENTS WHICH ARE EMITTED BY SERVER

// this will be pushed by server (index.js) where we are broadcasting the name of the person joined to all the chats except to the person who joined.
socket.on('user-joined', name => {
    append(`${name.toUpperCase()} joined the chat`, 'left');
});

// this will be pushed by server(index.js) where we are broadcasting the message sent by a user to all the users
socket.on('receive', data => {
    append(`${data.name.toUpperCase()} : ${data.message}`, "left");
});

// if someone left the chat space, then this will handle the event which is thrown due to 'disconnect' event by server.
socket.on('someoneLeft', name => {
    append(`${name.toUpperCase()} left the chat`, "left");
});

