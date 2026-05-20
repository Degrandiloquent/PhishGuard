import { browserExtensionAPI, setAuthToken } from '../browserExtension/services/api.js';

export class EmailPluginManager {
  constructor(authToken) {
    this.authToken = authToken;
    setAuthToken(authToken);
  }

  /**
   * Gmail Plugin Integration
   * Scans emails in Gmail web interface
   */
  async initGmailPlugin() {
    console.log('Initializing Gmail plugin...');
    
    // Monitor Gmail API calls
    this.observeGmailMessages();
    this.setupGmailHandlers();
  }

  /**
   * Outlook Plugin Integration
   * Scans emails in Outlook web interface
   */
  async initOutlookPlugin() {
    console.log('Initializing Outlook plugin...');
    
    // Monitor Outlook API calls
    this.observeOutlookMessages();
    this.setupOutlookHandlers();
  }

  /**
   * Observe Gmail messages via Gmail API
   */
  observeGmailMessages() {
    // Hook into Gmail's message view
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const messageElements = document.querySelectorAll('[role="main"] [data-message-id]');
        messageElements.forEach((element) => {
          if (!element.dataset.phishguardProcessed) {
            this.scanGmailMessage(element);
            element.dataset.phishguardProcessed = 'true';
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  /**
   * Scan individual Gmail message
   */
  async scanGmailMessage(element) {
    try {
      const messageData = this.extractGmailMessageData(element);
      
      const result = await browserExtensionAPI.scanEmail({
        from: messageData.from,
        subject: messageData.subject,
        body: messageData.body,
        links: messageData.links,
        source: 'gmail_plugin'
      });

      if (result.flagged) {
        this.highlightGmailThreat(element, result);
      }
    } catch (error) {
      console.error('Error scanning Gmail message:', error);
    }
  }

  /**
   * Extract message data from Gmail DOM
   */
  extractGmailMessageData(element) {
    const headerRow = element.querySelector('[role="row"]');
    const from = headerRow?.querySelector('span[email]')?.getAttribute('email') || 'unknown@unknown.com';
    const subject = element.querySelector('h1')?.textContent || 'No Subject';
    const body = element.textContent || '';
    const links = Array.from(element.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href && href.startsWith('http'));

    return { from, subject, body, links };
  }

  /**
   * Highlight Gmail threat
   */
  highlightGmailThreat(element, result) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      background-color: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 12px;
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-family: 'Roboto', sans-serif;
      font-size: 13px;
    `;
    banner.innerHTML = `
      <span style="font-size: 18px;">⚠️</span>
      <div>
        <strong>PhishGuard Alert:</strong> This email shows signs of phishing.
        <br><small>${result.reasons[0]}</small>
      </div>
      <button onclick="this.parentElement.remove()" style="margin-left: auto; border: none; background: none; cursor: pointer;">✕</button>
    `;

    const messageContent = element.querySelector('[role="main"]');
    if (messageContent) {
      messageContent.insertBefore(banner, messageContent.firstChild);
    }
  }

  /**
   * Observe Outlook messages
   */
  observeOutlookMessages() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const messageElements = document.querySelectorAll('[role="article"][data-item-id]');
        messageElements.forEach((element) => {
          if (!element.dataset.phishguardProcessed) {
            this.scanOutlookMessage(element);
            element.dataset.phishguardProcessed = 'true';
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  /**
   * Scan individual Outlook message
   */
  async scanOutlookMessage(element) {
    try {
      const messageData = this.extractOutlookMessageData(element);
      
      const result = await browserExtensionAPI.scanEmail({
        from: messageData.from,
        subject: messageData.subject,
        body: messageData.body,
        links: messageData.links,
        source: 'outlook_plugin'
      });

      if (result.flagged) {
        this.highlightOutlookThreat(element, result);
      }
    } catch (error) {
      console.error('Error scanning Outlook message:', error);
    }
  }

  /**
   * Extract message data from Outlook DOM
   */
  extractOutlookMessageData(element) {
    const from = element.querySelector('[data-sj-name]')?.getAttribute('data-sj-name') || 'unknown@unknown.com';
    const subject = element.querySelector('h2')?.textContent || 'No Subject';
    const body = element.textContent || '';
    const links = Array.from(element.querySelectorAll('a'))
      .map(a => a.href)
      .filter(href => href && href.startsWith('http'));

    return { from, subject, body, links };
  }

  /**
   * Highlight Outlook threat
   */
  highlightOutlookThreat(element, result) {
    const banner = document.createElement('div');
    banner.style.cssText = `
      background-color: #fff4ce;
      border-left: 4px solid #ff8b00;
      padding: 12px;
      margin-bottom: 12px;
      font-family: 'Segoe UI', sans-serif;
      font-size: 13px;
    `;
    banner.innerHTML = `
      <strong style="color: #ff8b00;">⚠️ PhishGuard Security Alert</strong>
      <br><small style="color: #666;">${result.reasons[0]}</small>
    `;

    const messageContent = element.querySelector('[role="article"]');
    if (messageContent) {
      messageContent.insertBefore(banner, messageContent.firstChild);
    }
  }

  /**
   * Setup Gmail event handlers
   */
  setupGmailHandlers() {
    // Handle link clicks in Gmail
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href) {
        const link = e.target.href;
        if (link.includes('gmail.com/ui/2')) {
          // This is a Gmail safe link proxy - extract original URL
          this.checkLink(link);
        }
      }
    }, true);
  }

  /**
   * Setup Outlook event handlers
   */
  setupOutlookHandlers() {
    // Handle link clicks in Outlook
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'A' && e.target.href) {
        const link = e.target.href;
        if (link.includes('eur01.safelinks.protection.outlook.com')) {
          // Extract URL from Outlook safe links
          this.checkLink(link);
        }
      }
    }, true);
  }

  /**
   * Check link safety before navigation
   */
  async checkLink(url) {
    try {
      const result = await browserExtensionAPI.checkLink(url);
      
      if (result.flagged) {
        // Show warning before allowing navigation
        const confirmed = confirm(
          `⚠️ WARNING: This link may be malicious.\n\n` +
          `Reason: ${result.reasons[0]}\n\n` +
          `Risk Score: ${result.score}/100\n\n` +
          `Are you sure you want to continue?`
        );
        
        if (!confirmed) {
          event.preventDefault();
          event.stopPropagation();
        }
      }
    } catch (error) {
      console.error('Error checking link:', error);
    }
  }

  /**
   * Report email as phishing
   */
  async reportAsPhishing(emailData) {
    try {
      const result = await browserExtensionAPI.reportPhishing({
        from: emailData.from,
        subject: emailData.subject,
        body: emailData.body,
        links: emailData.links,
        reason: 'User reported as phishing'
      });
      
      console.log('Phishing report submitted:', result);
      return result;
    } catch (error) {
      console.error('Error reporting phishing:', error);
      throw error;
    }
  }

  /**
   * Add sender to whitelist
   */
  async whitelistSender(email) {
    try {
      await chrome.storage.local.get(['whitelisted_senders'], (data) => {
        const whitelist = data.whitelisted_senders || [];
        if (!whitelist.includes(email)) {
          whitelist.push(email);
          chrome.storage.local.set({ whitelisted_senders: whitelist });
        }
      });
      console.log(`Sender ${email} whitelisted`);
    } catch (error) {
      console.error('Error whitelisting sender:', error);
    }
  }

  /**
   * Check if sender is whitelisted
   */
  async isSenderWhitelisted(email) {
    return new Promise((resolve) => {
      chrome.storage.local.get(['whitelisted_senders'], (data) => {
        const whitelist = data.whitelisted_senders || [];
        resolve(whitelist.includes(email));
      });
    });
  }
}
