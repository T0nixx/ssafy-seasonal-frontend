const chatContainer = document.getElementById("chat-container");
const messageForm = document.getElementById("message-form");
const userInput = document.getElementById("user-input");

// JSON 데이터 파일 경로
const datasetPath = "./qa_dataset_full.json"; 

let qaDataset = [];

// JSON 데이터 로드
async function loadDataset() {
  try {
    const response = await fetch(datasetPath);
    if (!response.ok) {
      throw new Error(`Failed to load dataset: ${response.statusText}`);
    }
    qaDataset = await response.json();
    console.log("Dataset loaded successfully:", qaDataset);
  } catch (error) {
    console.error("Error loading dataset:", error);
  }
}

// Create a message bubble
function createMessageBubble(content, sender = "user") {
  const wrapper = document.createElement("div");

  if (sender === "user") {
    wrapper.classList.add("mb-6", "flex", "items-start", "space-x-3", "flex-row-reverse");
  } else {
    wrapper.classList.add("mb-6", "flex", "items-start", "space-x-3");
  }

  const avatar = document.createElement("div");
  avatar.classList.add("w-10", "h-10", "rounded-full", "flex-shrink-0", "ml-3");

  const avatarImg = document.createElement("img");
  avatarImg.classList.add("w-full", "h-full", "rounded-full", "object-cover");

  if (sender === "assistant") {
    avatarImg.src = "./img/Assistant.png"; 
  } else {
    avatarImg.src = "./img/User.png"; 

  avatar.appendChild(avatarImg);

  const bubble = document.createElement("div");
  bubble.classList.add(
    "max-w-full",
    "md:max-w-2xl",
    "p-3",
    "rounded-lg",
    "whitespace-pre-wrap",
    "leading-relaxed",
    "shadow-sm"
  );

  if (sender === "assistant") {
    bubble.classList.add("bg-white", "text-gray-800", "border", "border-gray-300"); 
  } else {
    bubble.classList.add(
      "bg-purple-500", 
      "text-white", 
      "border", 
      "border-purple-600" 
    );
  }

  bubble.textContent = content;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  return wrapper;
}

// Scroll to bottom
function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 유사한 질문 찾기
function calculateSimilarity(input, target) {
  const inputWords = input.toLowerCase().split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  const commonWords = inputWords.filter(word => targetWords.includes(word));
  return commonWords.length / Math.max(inputWords.length, targetWords.length);
}

function findSimilarQuestion(userInput) {
  let bestMatch = null;
  let highestSimilarity = 0;

  for (let item of qaDataset) {
    const similarity = calculateSimilarity(userInput, item.question);
    if (similarity > highestSimilarity) {
      bestMatch = item;
      highestSimilarity = similarity;
    }
  }

  if (bestMatch && highestSimilarity >= 0.4) { // 유사도가 40% 이상인 경우에만 반환
    return bestMatch.answer; // 답변만 반환
  }
  return "질문과 관련된 답변을 찾을 수 없습니다.";
}

// Simulate assistant response
function getAssistantResponse(userMessage) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = findSimilarQuestion(userMessage);
      resolve(response);
    }, 1500);
  });
}

// Handle form submission
messageForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = userInput.value.trim();
  if (!message) return;

  chatContainer.appendChild(createMessageBubble(message, "user"));
  userInput.value = "";
  scrollToBottom();

  if (qaDataset.length === 0) {
    chatContainer.appendChild(createMessageBubble("조금 더 명확한 질문을 부탁드립니다.", "assistant"));
    scrollToBottom();
    return;
  }

  const response = await getAssistantResponse(message);
  chatContainer.appendChild(createMessageBubble(response, "assistant"));
  scrollToBottom();
});

// 페이지 로드 시 JSON 데이터 로드
loadDataset();