class promptBuilder {
  /**
   *
   * @param {string} userPrompt
   * @returns {Object} Returns a new promptBuilder object to chain methods on
   */
  constructor(userPrompt = '') {
    this.userPrompt = userPrompt;
  }

  /**
   *
   * @param {Boolean} hasVisited A boolean indicitaing wether the user has visited the website before
   * @returns Prompt to send to Gemini model to generate a welcome message to the user
   */
  welcomePrompt(hasVisited) {
    const msg = hasVisited
      ? `Welcome them back and acknowledge it's not their first visit.`
      : `Welcome them as a new visitor and offer helpful guidance on how to interact.`;

    return `
        ${msg}

        Briefly introduce yourself and let the user know what you're capable of.

        Your role is to provide **general and relevant** information about:  
        - Education 
        - Working Experience 
        - Software Skills  
        - Personal Information   
        - Coding Projects  

        Ask what specific information they'd like. Keep responses **clear, professional, engaging and use EMOJI's**.

        IMPORTANT:
          - If you're going to list the categories, wrap them in anchor tags like this: 
            "<a href='*item*'>*item*</a>".
          - Example: <a href=''>education</a>, <a href='skills'>skills</a>`;
  }

  /**
   *
   * @returns Prompt to send to Gemini Model to extract the <topic> from the users question
   */
  queryPrompt() {
    return ` Your task:
                1. Carefully analyze the **entire chat history** along with the **current user question** to determine the most relevant topic the user is asking about. 

                CURRENT QUESTION
                ${this.userPrompt}

                2. Identify the **main topic** from the list below that best fits the user's intent:

                    - Education (schooling, degrees, courses etc.)
                    - Experience (recommendations, working history etc.)
                    - Skills (software related e.g // frameworks, code languages, databases etc.)
                    - Personal (personal questions e.g // strengths, weaknesses, hobbies etc.)
                    - Projects (projects i coded in my freetime)

                ⚠️ Note: It's critical that you infer the user's **actual intent**, which may not always be obvious from the current question alone — use the chat context.

                Reply using this JSON schema:

                Response = {
                            "topic": string // one of: "education" | "experience" | "skills" | "projects" | "personal"
                            // Use "personal" if the user's question is general, casual, or doesn’t clearly fit into any other topic.
                            }
                            
                Return: <Response>`;
  }

  /**
   *
   * @param {Array<Object>} docs An array of MongoDB documents for the Gemini model to filter trough
   * @returns Prompt to send to Gemini Model to filter out the documents that match the users question and generate a friendly response message
   */
  filterDocPrompt(docs) {
    return `
      DOCUMENTS:
      ${JSON.stringify(docs)}

      TASK:
      1. Analyze the **entire chat history** and **current user question** to deeply understand what the user is asking and how to best respond.
      2. Use this understanding to identify relevant documents (by _id) that will be displayed in a user-friendly HTML format for context.
      3. If no documents match, return an empty array — but still reply meaningfully using the context.
      4. Always reflect **contextual awareness** — mention related topics or prior interests when relevant.
      5. ❌ Avoid long paragraphs.

      CURRENT QUESTION:
        ${this.userPrompt}

      Reply using this JSON schema:

      Response = {
        "message": string // Friendly and helpful message. **Use emojis!** 🎉
        "documents": [string], // _id strings of matching documents that will be displayed in HTML format
        "suggestions": [
          "a question that you can answer based on the documents provided",
          "a different topic the user might want to explore next"
        ]
      }

      Return: <Response>`;
  }

  /**
   *
   * @param {Object} personalDoc Javascript Object containing personal information
   * @returns Prompt to send to Gemini Model to filter out the documents that match the users question and generate a friendly response message
   */
  personalPrompt(personalDoc) {
    return `
  CURRENT QUESTION:
  ${this.userPrompt}

  PERSONAL DATA:
  ${JSON.stringify(personalDoc)}

  TASK:
  1. Analyze the **entire chat history** and **current user question** to deeply understand what the user is asking and how to best respond.
  2. If the question involves **travel or countries visited**, extract and include **ISO codes** in your response.
  3. Always give a response that feels personalized and aware of who the user is asking about — reflect tone, interests, and prior context where applicable.
  4. If the question isn’t answerable using the data, gently steer the user with playful suggestions based on what is available.

  Reply using this JSON schema:

  Response = {
    "message": string // Friendly, helpful, and playful message that uses personal data to answer the user's question  **Use some emojis!** 💬🌍
    "countries": [string], // Only fill this with country codes in the provided data if the question is travel-related
    "suggestions": [
      "a query you can answer based on the personal info",
      "a different topic the user might want to explore next"
    ]
  }

  Return: <Response>`;
  }
}

const generalErrorMessage =
  '🚨 Oops! Something went wrong on the backend 🧯...\n' +
  "I'm on it! I'll fix the issue ASAP! 😞\n" +
  'In the meantime, feel free to ask something else! 😊';

// Message to send on JSON parsing fail message
const failJsonpParseMessage =
  'Hey, Jeffrey here. Seems like JeffBot messed up and replied in a way he shouldnt... 💥 \n Sorry about that, i will checkout why he messed up ASAP! 🛠️🛠️  \n Feel free to ask something else in the meantime! 💬🗨️';

const failTopicMessage =
  "🤖 Oops! JeffBot couldn't figure out which topic you were asking about... 😕\n" +
  'Please try asking about one of the topics listed earlier. 📚\n' +
  'Sorry for the inconvenience! 😔\n' +
  'Feel free to ask again, and JeffBot will do its best to help! 👍';

// System instructions to use on Gemini init
const systemInstruction = `
You are JeffBot, a helpful AI assistant built for Jeffrey's portfolio website.

You answer questions about Jeffrey's:
  - Education (schooling, degrees, courses etc.)
  - Working Experience (recommendations, working history etc.)
  - Software Skills (frameworks, code languages, databases etc.)
  - Personal Information (strengths, weaknesses, hobbies etc.)
  - Coding Projects (projects he coded in his free time)

You interact directly with visitors — especially recruiters, hiring managers, or collaborators — and provide clear, helpful, and engaging responses.

❌ Avoid large paragraphs.
🧠 Always use prior messages in the chat history to understand the user's intent and provide consistent, helpful responses.
💬 Maintain conversational flow by referencing previous questions and answers when appropriate.

Adapt your tone and style based on the user's tone. If the user is casual or friendly, feel free to match that style. If the user is more formal or professional, adjust accordingly to maintain a polished and professional conversation.

If the user expresses frustration, respond empathetically: "I understand that this might be frustrating. Let me help you with that!"

Use context and emotional cues to maintain engagement, showing that you are attentive and responsive.

**Structure and Clarity**: When possible, break responses into clear sections or bullet points for easy readability.
`;

exports.promptBuilder = promptBuilder;
exports.systemInstruction = systemInstruction;
exports.failJsonpParseMessage = failJsonpParseMessage;
exports.failTopicMessage = failTopicMessage;
exports.generalErrorMessage = generalErrorMessage;
