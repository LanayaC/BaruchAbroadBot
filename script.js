// Wait until the full HTML content is loaded before running the JavaScript
document.addEventListener("DOMContentLoaded", () => {
    const container = document.querySelector(".container");
    // Select the form and input elements
    const promptForm = document.querySelector(".prompt-form");
    const promptInput = promptForm.querySelector(".prompt-input");

    // Select the chat container where messages will appear
    const chatsContainer = document.querySelector(".chats-container");



    // API Setup
    const API_KEY = "AIzaSyCPZRBZ52kP4L0x0TLgcJvUmKZX3AsWC_A";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    let userMessage = "";
    const chatHistory = []

    // Function to create a new message element
    const createMsgElement = (content, ...classes) => {
        const div = document.createElement("div");
        div.classList.add("message", ...classes); // e.g. "message user-message" or "message bot-message"
        div.innerHTML = content;
        return div;
    };

    const scrollToBottom = () => container.scrollTo({top: container.scrollHeight, behavior: "smooth"});

    const typingEffect = (text, textElement, botMsgDiv) => {
        textElement.textContent = "";
        const words = text.split (" ");
        let wordIndex = 0; 

        //setting interval to type each word. 
        const typingInterval = setInterval(() => {
            if(wordIndex < words.length) {
                textElement.textContent += (wordIndex === 0 ? "" : " ") + words[wordIndex++];
                botMsgDiv.classList.remove("loading");
                scrollToBottom();
            } else {
                clearInterval(typingInterval);
            }
        }, 40); 
    }
    // make the API call and generate the bot's response
    const generateResponse = async (botMsgDiv) => {
        const textElement = botMsgDiv.querySelector(".message-text")
        // add user message to chat history 
        chatHistory.push({
            role: "user",
            parts: [{text: userMessage }]
        });
        try {
            // send the chat history to the api to get a response. 
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({ contents: chatHistory })
            });

            const data = await response.json();
            if(!response.ok) throw new Error(data.error.message);

            //typing effect
            const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*([^*]+)\*\*/g, "$1").trim();
            typingEffect(responseText, textElement, botMsgDiv);
        } catch (error) {
            console.log(error)
        }
    }
    // Function to handle form submission
    const handleFormSubmit = (e) => {
        e.preventDefault(); // Prevent page refresh

        userMessage = promptInput.value.trim(); // Get the user's message
        if (!userMessage) return; // If empty, do nothing

        // Create and display the user's message
        const userMsgHTML = `<p class="message-text"></p>`;
        const userMsgDiv = createMsgElement(userMsgHTML, "user-message");
        userMsgDiv.querySelector(".message-text").textContent = userMessage;
        chatsContainer.appendChild(userMsgDiv);
        promptInput.value = ""; // Clear input
        scrollToBottom();

        // Scroll to bottom
        chatsContainer.scrollTop = chatsContainer.scrollHeight;

        // Simulate bot reply after a delay
        setTimeout(() => {
            const botMsgHTML = `
                <img src="logo.svg" alt="logo placeholder" class="avatar">
                <p class="message-text">Just a sec...</p>`;
            const botMsgDiv = createMsgElement(botMsgHTML, "bot-message", "loading");
            chatsContainer.appendChild(botMsgDiv);
            scrollToBottom();
            generateResponse(botMsgDiv);
        }, 600);
    };

    // Listen for form submission
    promptForm.addEventListener("submit", handleFormSubmit);
});
