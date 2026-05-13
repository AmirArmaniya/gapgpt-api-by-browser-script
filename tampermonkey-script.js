// ==UserScript==
// @name         ChatGPT API By Browser Script (Gapgpt.app)
// @namespace    http://tampermonkey.net/
// @version      1
// @match        https://gapgpt.app/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=openai.com
// @grant        GM_webRequest
// @license MIT
// ==/UserScript==

const log = (...args) => {
  console.log('chatgpt-api-by-browser-script', ...args);
}
log('starting');

const WS_URL = `ws://localhost:8765`;

function cleanText(inputText) {
  const invisibleCharsRegex =
    /[\u200B\u200C\u200D\uFEFF]|[\u0000-\u001F\u007F-\u009F]/g;
  const cleanedText = inputText.replace(invisibleCharsRegex, '');
  return cleanedText;
}
function getTextFromNode(node) {
  let result = '';
  if (!node) return result;

  // GAPGPT.SELECTOR.UPDATE.ME: Update these class names if gapgpt.app changes their styling
  // These are classes to skip (like system messages or metadata)
  const skipClasses = [
    'text-token-text-secondary',
    'bg-token-main-surface-secondary',
    'feedback-section',
    'action-buttons',
    'q-btn',
    'q-icon'
  ];
  
  // Check if node or any parent has skip classes
  let skip = false;
  let current = node;
  while (current && current !== document.body) {
    if (current.classList) {
      for (const cls of skipClasses) {
        if (current.classList.contains(cls)) {
          skip = true;
          break;
        }
      }
      if (skip) break;
    }
    current = current.parentElement;
  }
  
  if (skip) return result;

  const childNodes = node.childNodes;
  for (let i = 0; i < childNodes.length; i++) {
    let childNode = childNodes[i];
    if (childNode.nodeType === Node.TEXT_NODE) {
      result += childNode.textContent;
    } else if (childNode.nodeType === Node.ELEMENT_NODE) {
      // Skip script and style tags
      const tag = childNode.tagName.toLowerCase();
      if (tag === 'script' || tag === 'style') {
        continue;
      }
      result += getTextFromNode(childNode);
    }
  }
  return cleanText(result);
}
function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Main app class
class App {
  constructor() {
    this.socket = null;
    this.observer = null;
    this.stop = false;
    this.dom = null;
    this.lastText = null;
    this.lastMessageElement = null; // Track the last message element to avoid duplicates
  }

  async start({ text, model, newChat }) {
    this.stop = false;
    log('Starting to edit or send a message');

    // GAPGPT.SELECTOR.UPDATE.ME: Update the textarea selector for gapgpt.app
    // Based on HTML: <textarea id="f_7f6f4aba-2d21-4758-863e-9b5637eb6d91" ...>
    const textareaSelectors = [
      '#f_7f6f4aba-2d21-4758-863e-9b5637eb6d91', // Specific ID from HTML
      '.q-field__native.q-placeholder.bidi-textarea', // Class-based selector
      'textarea[placeholder="سوال خود را بپرسید..."]', // Placeholder-based
      'textarea[dir="rtl"]' // Direction-based
    ];
    
    let textarea = null;
    for (const selector of textareaSelectors) {
      textarea = document.querySelector(selector);
      if (textarea) {
        log(`Found textarea with selector: ${selector}`);
        break;
      }
    }

    if (!textarea) {
      log('Error: Textarea not found with any selector');
      return;
    }

    // Check if we want to edit an existing message or send a new one
    // For gapgpt.app, we'll always send a new message for simplicity
    // (Editing would require finding the last user message and checking for edit capability)
    log('No edit button found, sending a new message');
    
    // Clear and set the text
    textarea.value = text;
    
    // Trigger input event to notify the app of the change
    const event = new Event('input', { bubbles: true });
    textarea.dispatchEvent(event);
    
    // Wait a bit for the UI to update
    await sleep(500);
    
    // For gapgpt.app, sending happens when Enter is pressed in the textarea
    // We'll simulate pressing Enter
    const enterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      which: 13,
      keyCode: 13,
      bubbles: true
    });
    textarea.dispatchEvent(enterEvent);
    
    // Also try the Ctrl+Enter combination in case that's required
    const ctrlEnterEvent = new KeyboardEvent('keydown', {
      key: 'Enter',
      code: 'Enter',
      which: 13,
      keyCode: 13,
      ctrlKey: true,
      bubbles: true
    });
    textarea.dispatchEvent(ctrlEnterEvent);
    
    log('Message sent via Enter key simulation');

    this.observeMutations();
  }

  async observeMutations() {
    let isStart = false;
    this.observer = new MutationObserver(async (mutations) => {
      // Look for elements that indicate response generation has started
      // Common indicators: loading spinners, specific classes that appear during generation
      
      // GAPGPT.SELECTOR.UPDATE.ME: Update these selectors for gapgpt.app's loading indicators
      const startSelectors = [
        '.q-spinner', // Generic spinner class from Quasar framework
        '.loading',
        '[aria-label*="loading" i]',
        '[aria-label*="در حال تولید" i]', // Persian for "generating"
        '.bot-message:not([data-processed])' // New bot messages that haven't been processed
      ];
      
      let foundStartIndicator = false;
      for (const selector of startSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Check if any of these elements are newly added or visible
          for (const element of elements) {
            if (element.offsetParent !== null || 
                (element.getAttribute && element.getAttribute('data-processed') === null)) {
              foundStartIndicator = true;
              break;
            }
          }
          if (foundStartIndicator) break;
        }
      }
      
      if (!foundStartIndicator) {
        // Alternative approach: look for new bot messages
        const botMessages = document.querySelectorAll('.bot-message');
        if (botMessages.length > 0) {
          const lastBotMessage = botMessages[botMessages.length - 1];
          // If this is a new bot message we haven't seen before
          if (lastBotMessage !== this.lastMessageElement) {
            foundStartIndicator = true;
          }
        }
      }

      if (!foundStartIndicator) {
        return;
      }

      isStart = true;
      
      // Wait a bit for the response to start appearing
      await sleep(1000);
      
      // Now look for the actual response text
      // GAPGPT.SELECTOR.UPDATE.ME: Update these selectors for gapgpt.app's response containers
      const responseSelectors = [
        '.bot-message .markdown-container', // From HTML: <div class="markdown-container" data-block-id="...">
        '.bot-message [dir="rtl"]', // Right-to-left text in bot messages
        '.bot-message p', // Paragraphs in bot messages
        '.bot-message', // Fallback to entire bot message
        '.message-container.bot-message' // More specific
      ];
      
      let lastText = '';
      let responseElement = null;
      
      for (const selector of responseSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Get the last element (most recent response)
          responseElement = elements[elements.length - 1];
          if (responseElement) {
            lastText = getTextFromNode(responseElement);
            if (lastText.trim() !== '') {
              break;
            }
          }
        }
      }
      
      // If we still don't have text, try to get it from the bot message container directly
      if (!lastText || lastText.trim() === '') {
        const botMessages = document.querySelectorAll('.bot-message');
        if (botMessages.length > 0) {
          const lastBotMessage = botMessages[botMessages.length - 1];
          lastText = getTextFromNode(lastBotMessage);
          responseElement = lastBotMessage;
        }
      }
      
      // Avoid sending duplicate responses
      if ((!lastText || lastText === this.lastText) && responseElement === this.lastMessageElement) {
        log('Error: Last message text not found or unchanged');
        return;
      }
      
      this.lastText = lastText;
      this.lastMessageElement = responseElement;
      
      log('sending response', {
        text: lastText.substring(0, 100) + (lastText.length > 100 ? '...' : ''),
        element: responseElement ? responseElement.className : 'unknown'
      });
      
      this.socket.send(
        JSON.stringify({
          type: 'answer',
          text: lastText,
        })
      );

      // Check if generation is complete by looking for absence of loading indicators
      // GAPGPT.SELECTOR.UPDATE.ME: Update these selectors for gapgpt.app's completion indicators
      const completionSelectors = [
        '.q-spinner', // Spinner disappears when done
        '.loading',
        '[aria-label*="loading" i]',
        '[aria-label*="در حال تولید" i]',
        '.bot-message-generating', // If they add a specific class during generation
        '.message-container:not(.bot-message)' // If user message appears after bot response
      ];
      
      let isGenerating = false;
      for (const selector of completionSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          // Check if any loading indicators are still active/visible
          for (const element of elements) {
            const style = window.getComputedStyle(element);
            if (style.display !== 'none' && style.visibility !== 'hidden' && 
                style.opacity !== '0' && element.offsetParent !== null) {
              isGenerating = true;
              break;
            }
          }
          if (isGenerating) break;
        }
      }
      
      // Alternative: check if we have a new user message after our prompt
      // This would indicate the bot has finished and the user can type again
      if (!isGenerating) {
        const userMessages = document.querySelectorAll('.message-container.bg-user');
        if (userMessages.length > 0) {
          const lastUserMessage = userMessages[userMessages.length - 1];
          // If the last user message is after our last sent message, we're done
          // This is a heuristic - in practice we might need a better approach
          isGenerating = false; // Assume done if we can't detect generation
        }
      }
      
      if (!isGenerating) {
        this.observer.disconnect();

        if (this.stop) return;
        this.stop = true;
        log('sending stop signal');
        this.socket.send(
          JSON.stringify({
            type: 'stop',
          })
        );
      }
    });

    const observerConfig = {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true, // Watch for attribute changes (like class additions)
      attributeFilter: ['class', 'style', 'aria-label', 'data-processed']
    };
    this.observer.observe(document.body, observerConfig);
  }

  sendHeartbeat() {
    if (this.socket.readyState === WebSocket.OPEN) {
      log('Sending heartbeat');
      this.socket.send(JSON.stringify({ type: 'heartbeat' }));
    }
  }

  connect() {
    this.socket = new WebSocket(WS_URL);
    this.socket.onopen = () => {
      log('Server connected, can process requests now.');
      this.dom.innerHTML = '<div style="color: green;">API Connected!</div>';
    };
    this.socket.onclose = () => {
      log(
        'Error: The server connection has been disconnected, the request cannot be processed.'
      );
      this.dom.innerHTML = '<div style="color: red;">API Disconnected!</div>';

      setTimeout(() => {
        log('Attempting to reconnect...');
        this.connect();
      }, 2000);
    };
    this.socket.onerror = (error) => {
      log(
        'Error: Server connection error, please check the server.',
        error
      );
      this.dom.innerHTML = '<div style="color: red;">API Error!</div>';
    };
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        log('Received data from server', data);
        this.start(data);
      } catch (error) {
        log('Error: Failed to parse server message', error);
      }
    };
  }

  init() {
    window.addEventListener('load', () => {
      this.dom = document.createElement('div');
      this.dom.style =
        'position: fixed; top: 10px; right: 10px; z-index: 9999; display: flex; justify-content: center; align-items: center;';
      document.body.appendChild(this.dom);

      this.connect();

      setInterval(() => this.sendHeartbeat(), 30000);
    });
  }
}

(function () {
  'use strict';
  const app = new App();
  app.init();
})();