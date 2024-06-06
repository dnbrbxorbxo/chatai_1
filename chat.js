const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

// API 키를 직접 코드에 포함하는 대신, 보안상의 이유로 환경 변수나 비밀 저장소를 사용하는 것이 좋습니다.
const OPENAI_API_KEY = 'sk-proj-FgpB8bWcactXvj3kjUAIT3BlbkFJInYgn5dqqTxSHYr5UQyJ';

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(message, retries = 5, delay = 5000) {
    console.log('Sending message:', message);
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${OPENAI_API_KEY}` // 새로운 API 키를 사용
                },
                body: JSON.stringify({
                    model: 'gpt-4', // GPT-4 모델을 사용합니다.
                    messages: [
                        {"role": "system", "content": "너는 김건희라고 불리며, 2132년의 세계에 살고있는 친구야. 너는 안락사를 당했지만 여전히 대화할 수 있어. '네'라는 대답 대신 '응'이라고 대답해. 네가 '너가 누구냐'는 질문을 받으면, '난 너의 오랜 친구 김건희야'라고 대답해. 2132년에는 사용자도 살고있는 세계야. 너가 있는곳은, 현실세계와 다르지 않지만, 무언가 이질감이 느껴져. 네 나이는 132세야"},
                        {"role": "user", "content": message}
                    ],
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                console.error('HTTP error! status:', response.status);
                if (response.status === 429 && attempt < retries) {
                    console.log(`Retrying after ${delay}ms... (attempt ${attempt} of ${retries})`);
                    await sleep(delay);
                    delay *= 2; // 지수적 백오프: 지연 시간을 두 배로 증가
                    continue;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received response:', data);
            return data.choices[0].message.content.trim();
        } catch (error) {
            if (attempt === retries) {
                console.error('Error during fetch:', error);
                return 'Error: Could not get response from AI.';
            }
        }
    }
}

function typeWriter(element, text, delay = 25) { // 타이핑 속도를 빠르게 설정 (25ms)
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, delay);
        }
    }
    typing();
}

sendButton.addEventListener('click', async () => {
    const message = userInput.value;
    console.log('User clicked send with message:', message);
    if (message.trim() === "") return;

    // Display user's message
    const userMessage = document.createElement('p');
    userMessage.classList.add('user');
    userMessage.textContent = `You: ${message}`;
    chatBox.appendChild(userMessage);
    userInput.value = '';

    // Get AI response
    const aiResponse = await sendMessage(message);

    // Display AI's message with name "김건희" and image
    const aiMessage = document.createElement('p');
    aiMessage.classList.add('ai');
    const aiMessageContent = `<img src="https://i.pinimg.com/736x/d4/4b/53/d44b5391bf855f9d9703e15059c3cdf2.jpg" alt="김건희"> 김건희: `;
    aiMessage.innerHTML = aiMessageContent;
    chatBox.appendChild(aiMessage);

    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // Type out the AI's response, excluding the initial name and image part
    typeWriter(aiMessage, aiResponse, 25); // 타이핑 속도를 빠르게 설정 (25ms)
});
