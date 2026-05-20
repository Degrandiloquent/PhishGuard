// Content script for email scanning in Gmail/Outlook
console.log('PhishGuard Content Script Loaded');

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_WARNING') {
    showLinkWarning(message.url, message.reason);
    sendResponse({ received: true });
  } else if (message.type === 'SHOW_ALERT') {
    showThreatAlert(message);
    sendResponse({ received: true });
  } else if (message.type === 'INJECT_SCANNER') {
    injectScanner();
    sendResponse({ injected: true });
  }
  return true;
});

function injectScanner() {
  // Detect if we're in Gmail or Outlook
  const isGmail = window.location.hostname.includes('gmail.com');
  const isOutlook = window.location.hostname.includes('outlook.com');

  if (isGmail) {
    injectGmailScanner();
  } else if (isOutlook) {
    injectOutlookScanner();
  }
}

function injectGmailScanner() {
  // Monitor for new emails opened
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        // Check for email body content
        const emailBodies = document.querySelectorAll('[role="main"]');
        emailBodies.forEach(emailBody => {
          if (!emailBody.dataset.phishguardScanned) {
            scanEmailElement(emailBody);
            emailBody.dataset.phishguardScanned = 'true';
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function injectOutlookScanner() {
  // Monitor for emails in Outlook
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        const emails = document.querySelectorAll('[role="article"]');
        emails.forEach(email => {
          if (!email.dataset.phishguardScanned) {
            scanEmailElement(email);
            email.dataset.phishguardScanned = 'true';
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function scanEmailElement(element) {
  // Extract email data from DOM
  const emailData = extractEmailData(element);
  
  if (emailData.body) {
    // Send to background script for scanning
    chrome.runtime.sendMessage({
      type: 'SCAN_EMAIL',
      data: emailData
    }, (response) => {
      if (response.error) {
        console.error('Scan error:', response.error);
      } else if (response.result?.flagged) {
        highlightSuspiciousLinks(element, response.result.reasons);
      }
    });
  }
}

function extractEmailData(element) {
  // Extract sender info
  const fromElement = element.querySelector('[email]') || 
                     element.querySelector('[data-email-from]');
  const from = fromElement?.getAttribute('email') || 
               fromElement?.getAttribute('data-email-from') ||
               fromElement?.textContent?.trim() ||
               'unknown@unknown.com';

  // Extract subject
  const subject = element.querySelector('h1')?.textContent || 
                 element.querySelector('[role="heading"]')?.textContent ||
                 'No Subject';

  // Extract body text
  const body = element.textContent || '';

  // Extract links
  const links = Array.from(element.querySelectorAll('a'))
    .map(a => a.href)
    .filter(href => href && href.startsWith('http'));

  return {
    from,
    subject,
    body: body.substring(0, 5000), // Limit body size
    links
  };
}

function highlightSuspiciousLinks(element, reasons) {
  const links = element.querySelectorAll('a');
  links.forEach(link => {
    // Check if this link matches threat indicators
    link.style.outline = '2px solid orange';
    link.style.backgroundColor = 'rgba(255, 165, 0, 0.1)';
    
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showLinkWarning(link.href, reasons[0]);
    });

    // Add warning title
    link.title = '⚠️ Suspicious link detected. Click to see details.';
  });
}

function showLinkWarning(url, reason) {
  const warning = document.createElement('div');
  warning.id = 'phishguard-warning';
  warning.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff6b6b;
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 400px;
      font-family: Arial, sans-serif;
    ">
      <div style="font-weight: bold; margin-bottom: 10px;">⚠️ Suspicious Link Detected</div>
      <div style="font-size: 12px; margin-bottom: 10px; word-break: break-all;">
        ${url}
      </div>
      <div style="font-size: 12px; margin-bottom: 15px; opacity: 0.9;">
        Reason: ${reason}
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="document.getElementById('phishguard-warning').remove()" 
          style="padding: 8px 15px; background: white; color: #ff6b6b; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
          OK
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(warning);

  setTimeout(() => warning.remove(), 5000);
}

function showThreatAlert(alert) {
  const alertDiv = document.createElement('div');
  alertDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${alert.severity === 'critical' ? '#dc2626' : alert.severity === 'high' ? '#ea580c' : '#f59e0b'};
      color: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 350px;
      font-family: Arial, sans-serif;
    ">
      <div style="font-weight: bold; margin-bottom: 10px;">
        ${alert.title}
      </div>
      <div style="font-size: 13px; margin-bottom: 15px;">
        ${alert.reason}
      </div>
      <button onclick="this.parentElement.remove()" 
        style="padding: 8px 15px; background: white; color: inherit; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
        Dismiss
      </button>
    </div>
  `;
  document.body.appendChild(alertDiv);
  
  setTimeout(() => alertDiv.remove(), 6000);
}

// Auto-inject on page load if Gmail/Outlook
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectScanner);
} else {
  injectScanner();
}
