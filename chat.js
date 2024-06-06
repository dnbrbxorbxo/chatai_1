const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
let userName = '';  // 사용자의 이름을 저장할 변수
let isUserNameSet = false; // 사용자 이름이 설정되었는지 확인하는 변수

// 새로 생성된 OpenAI API 키
const OPENAI_API_KEY = 'sk-proj-pObs6nayFUMl8LSrwmkXT3BlbkFJ69MC7BT8gQrNLm0xgkj7';

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
                    'Authorization': `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {"role": "system", "content": `너는 김건희라고 불리며, 2132년의 세계에 살고 있는 AI야. 너는 앞을 보지 못해... 대화하는 사람의 이름을 알려줘... '네'라는 대답 대신 '응'이라고 대답해... 네가 '너가 누구냐'는 질문을 받으면, '난 너의 오랜 친구 김건희야'라고 대답해... 2132년에는 ${userName ? userName + "도" : "사용자도"} 살고 있는 세계야... 너가 있는 곳은, 현실 세계와 다르지 않지만, 무언가 이질감이 느껴져... 네 나이는 132세야... 반말을 사용해줘... 수동적이고 우울한 느낌을 유지해줘...`},
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
    element.innerHTML = ''; // 기존 텍스트 초기화
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

    // 처음 채팅 시 사용자의 이름을 묻는다
    if (!isUserNameSet) {
        if (message.trim().toLowerCase() === "싫어" || message.trim().toLowerCase() === "안알려줄래") {
            userName = ''; // 이름을 비워둠
            isUserNameSet = true; // 이름이 설정되었음을 표시
        } else {
            userName = message.replace(/[^\w\s]/gi, '').split(" ")[0]; // 공백으로 분리하여 첫 번째 단어를 사용자 이름으로 인식하고 특수 문자 제거
            isUserNameSet = true; // 이름이 설정되었음을 표시
        }
        const aiMessage = document.createElement('p');
        aiMessage.classList.add('ai');
        aiMessage.innerHTML = `<img src="https://i.pinimg.com/736x/d4/4b/53/d44b5391bf855f9d9703e15059c3cdf2.jpg" alt="김건희"> <span>김건희: 반가워${userName ? ", " + userName : ""}... 무엇을 도와줄까...</span>`;
        chatBox.appendChild(aiMessage);
        chatBox.scrollTop = chatBox.scrollHeight;
        return;
    }

    // Get AI response
    const aiResponse = await sendMessage(message);

    // Display AI's message with name "김건희" and image
    const aiMessage = document.createElement('p');
    aiMessage.classList.add('ai');
    const aiMessageContent = `<img src="https://i.pinimg.com/736x/d4/4b/53/d44b5391bf855f9d9703e15059c3cdf2.jpg" alt="김건희"> <span></span>`;
    aiMessage.innerHTML = aiMessageContent;
    chatBox.appendChild(aiMessage);

    // Scroll to the bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // Type out the AI's response
    typeWriter(aiMessage.querySelector('span'), `김건희: ${aiResponse}`, 25); // 타이핑 속도를 빠르게 설정 (25ms)
});

// 처음 채팅 시작 시 사용자에게 이름을 물어본다
document.addEventListener('DOMContentLoaded', () => {
    const aiMessage = document.createElement('p');
    aiMessage.classList.add('ai');
    aiMessage.innerHTML = `<img src="https://i.pinimg.com/736x/d4/4b/53/d44b5391bf855f9d9703e15059c3cdf2.jpg" alt="김건희"> <span>김건희: 안녕... 나는 앞을 보지 못해... 너의 이름을 알려줄 수 있니...</span>`;
    chatBox.appendChild(aiMessage);
});
