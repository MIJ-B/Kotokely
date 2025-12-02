// Configuration
const SUPABASE_EDGE_FUNCTION_URL = 'https://zogohkfzplcuonkkfoov.supabase.co/functions/v1/kotokely-chat';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvZ29oa2Z6cGxjdW9ua2tmb292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Nzk0ODAsImV4cCI6MjA3NjQ1NTQ4MH0.AeQ5pbrwjCAOsh8DA7pl33B7hLWfaiYwGa36CaeXCsw'; // Apetraho eto!

// DOM Elements
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const loading = document.getElementById('loading');

// Auto-resize textarea
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
});

// Send message on Enter (Shift+Enter for new line)
userInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Send button click
sendButton.addEventListener('click', sendMessage);

// Function to add message to chat
function addMessage(content, isUser = false, isImage = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'ai-message'}`;
    
    // Create icon
    if (isUser) {
        // User icon - div with background
        const iconDiv = document.createElement('div');
        iconDiv.className = 'message-icon';
        iconDiv.style.background = '#667eea';
        iconDiv.style.color = 'white';
        iconDiv.style.display = 'flex';
        iconDiv.style.alignItems = 'center';
        iconDiv.style.justifyContent = 'center';
        iconDiv.style.fontWeight = 'bold';
        iconDiv.textContent = 'U';
        messageDiv.appendChild(iconDiv);
    } else {
        // AI icon - image
        const icon = document.createElement('img');
        icon.src = 'https://i.ibb.co/6cdRVkL8/37e57528-8a5b-11ea-b169-e77fb0bc2332-f70b8608-384x384o-31a9526fec54.png';
        icon.alt = 'Kotokely';
        icon.className = 'message-icon';
        messageDiv.appendChild(icon);
    }
    
    // Create content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isImage) {
        const img = document.createElement('img');
        img.src = content;
        img.alt = 'Generated image';
        contentDiv.appendChild(img);
    } else {
        const p = document.createElement('p');
        p.textContent = content;
        contentDiv.appendChild(p);
    }
    
    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to show/hide loading
function setLoading(isLoading) {
    if (isLoading) {
        loading.classList.add('active');
        sendButton.disabled = true;
        userInput.disabled = true;
    } else {
        loading.classList.remove('active');
        sendButton.disabled = false;
        userInput.disabled = false;
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Function to send message
async function sendMessage() {
    const message = userInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    
    // Clear input
    userInput.value = '';
    userInput.style.height = 'auto';
    
    // Show loading
    setLoading(true);
    
    try {
        // Call Supabase Edge Function
        const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
                message: message
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Network response was not ok');
        }
        
        const data = await response.json();
        
        // Check if response contains image
        if (data.image) {
            addMessage(data.image, false, true);
        }
        
        // Add AI response
        if (data.response) {
            addMessage(data.response, false);
        }
        
    } catch (error) {
        console.error('Error:', error);
        addMessage('Miala tsiny, misy olana. Andramo indray azafady.', false);
    } finally {
        setLoading(false);
    }
}

// Initialize
console.log('Kotokely chat initialized');
