const chatBox = document.getElementById('thread');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const endBtn = document.getElementById('end-btn');
const modal = document.getElementById('analytics-modal');
const closeBtn = document.querySelector('.close-btn');
const analyticsData = document.getElementById('analytics-data');

const markSVG = '<svg viewBox="0 0 26 26"><circle class="ring" cx="13" cy="13" r="10.5"/><line class="tick" x1="13" y1="3.5" x2="13" y2="5.5"/><line class="tick" x1="13" y1="20.5" x2="13" y2="22.5"/><line class="tick" x1="3.5" y1="13" x2="5.5" y2="13"/><line class="tick" x1="20.5" y1="13" x2="22.5" y2="13"/><line class="needle" x1="13" y1="13" x2="13" y2="5"/><circle class="core" cx="13" cy="13" r="1.6"/></svg>';

// Generate a random conversation ID for the session
const sessionId = crypto.randomUUID();
const sessionStartTime = Date.now();

function getElapsedTimeString() {
    const elapsedSeconds = Math.floor((Date.now() - sessionStartTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function scrollToBottom(){
    chatBox.scrollTop = chatBox.scrollHeight;
}

function addDimline(text) {
    const dimline = document.createElement('div');
    dimline.classList.add('dimline');
    dimline.innerHTML = `
        <div class="tick"></div>
        <div class="bar"></div>
        <div class="t">${text}</div>
        <div class="bar"></div>
    `;
    chatBox.appendChild(dimline);
}

function addMessage(text, role) {
    const row = document.createElement('div');
    row.classList.add('row');
    if (role === 'user') {
        row.classList.add('right');
    }

    let innerHTML = '';
    if (role === 'agent') {
        innerHTML += `<div class="ria-mark">${markSVG}</div>`;
    }
    
    innerHTML += `<div class="msg ${role}"></div>`;
    row.innerHTML = innerHTML;
    row.querySelector('.msg').textContent = text;
    
    chatBox.appendChild(row);
    scrollToBottom();
}

function showTyping() {
    const row = document.createElement('div');
    row.className = 'row typing-row';
    row.id = 'typingRow';
    row.innerHTML =
        '<div class="ria-mark typing">' + markSVG + '</div>' +
        '<div class="msg agent"><div class="typing-dots"><span></span><span></span><span></span></div></div>';
    chatBox.appendChild(row);
    scrollToBottom();
}

function resolveTyping() {
    const row = document.getElementById('typingRow');
    if (row) {
        row.remove();
    }
}

function addBookingCard(booking) {
    const row = document.createElement('div');
    row.classList.add('row');
    
    const card = document.createElement('div');
    card.classList.add('booking-card');
    if (booking.status === 'failed') {
        card.classList.add('failed');
    }
    
    card.innerHTML = `
        <div class="h">Site Visit — ${booking.status === 'success' ? 'Confirmed' : 'Unavailable'}</div>
        <div class="row2"><span>Project</span><span>Northstar One</span></div>
        <div class="row2"><span>Date</span><span>${booking.date || 'TBD'}, ${booking.time || 'TBD'}</span></div>
        <div class="row2"><span>Location</span><span>Sector 79, Gurugram</span></div>
    `;
    
    row.appendChild(card);
    chatBox.appendChild(row);
    scrollToBottom();
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    addDimline(getElapsedTimeString());
    addMessage(text, 'user');
    
    userInput.value = '';
    userInput.disabled = true;
    sendBtn.disabled = true;

    addDimline(getElapsedTimeString());
    showTyping();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: text, sessionId }),
        });

        const data = await response.json();
        resolveTyping();
        
        if (data.reply) {
            if (data.reply.bookingCard) {
                addBookingCard(data.reply.bookingCard);
                addDimline(getElapsedTimeString());
            }
            addMessage(data.reply.text, 'agent');
        } else {
            addMessage('Error connecting to the server.', 'agent');
        }
    } catch (error) {
        console.error('Error:', error);
        resolveTyping();
        addMessage('Failed to send message. Please try again.', 'agent');
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        userInput.focus();
    }
}

async function endConversation() {
    userInput.disabled = true;
    sendBtn.disabled = true;
    endBtn.disabled = true;
    endBtn.textContent = 'Generating...';

    addDimline(getElapsedTimeString());
    showTyping();

    try {
        const response = await fetch('/api/end', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
        });

        const data = await response.json();
        resolveTyping();
        addMessage('Session ended. Compiling dossier...', 'agent');
        
        modal.style.display = 'flex';
        analyticsData.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
        console.error('Error:', error);
        resolveTyping();
        addMessage('Failed to load analytics.', 'agent');
    } finally {
        endBtn.textContent = 'Session Ended';
    }
}

sendBtn.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

endBtn.addEventListener('click', endConversation);

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});
