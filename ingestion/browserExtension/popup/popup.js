import { StorageManager } from '../utils/storage.js';

const storage = new StorageManager();
let isLoggedIn = false;

document.addEventListener('DOMContentLoaded', async () => {
  const token = await storage.getToken();
  
  if (token) {
    showDashboard(token);
  } else {
    showLoginForm();
  }
});

function showLoginForm() {
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('dashboard-section').style.display = 'none';
  isLoggedIn = false;

  document.getElementById('login-form').addEventListener('submit', handleLogin);
}

function showDashboard(token) {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  isLoggedIn = true;

  loadRiskProfile();
  loadAlerts();

  document.getElementById('logout-btn').addEventListener('click', handleLogout);
  document.getElementById('refresh-btn').addEventListener('click', loadAlerts);
  document.getElementById('settings-btn').addEventListener('click', openSettings);
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('error-message');

  errorDiv.innerHTML = '';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'LOGIN',
      email,
      password
    });

    if (response.error) {
      errorDiv.innerHTML = `<div class="error">${response.error}</div>`;
    } else if (response.token) {
      await storage.saveToken(response.token);
      await storage.saveEmail(email);
      showDashboard(response.token);
    }
  } catch (error) {
    errorDiv.innerHTML = `<div class="error">Login failed: ${error.message}</div>`;
  }
}

async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    await storage.removeToken();
    await storage.removeEmail();
    document.getElementById('login-form').reset();
    showLoginForm();
  }
}

async function loadRiskProfile() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_RISK_PROFILE'
    });

    if (response.error) {
      console.error('Error loading risk profile:', response.error);
      return;
    }

    const profile = response.profile;
    const email = await storage.getEmail();
    
    document.getElementById('user-email').textContent = email || 'User';
    
    const scoreElement = document.getElementById('risk-score');
    scoreElement.textContent = Math.round(profile.score) || 0;
    
    if (profile.score < 30) {
      scoreElement.classList.remove('high', 'medium');
    } else if (profile.score < 60) {
      scoreElement.classList.add('medium');
      scoreElement.classList.remove('high');
    } else {
      scoreElement.classList.add('high');
      scoreElement.classList.remove('medium');
    }

    const riskLevelText = profile.score < 30 ? 'Low Risk' : profile.score < 60 ? 'Medium Risk' : 'High Risk';
    document.getElementById('risk-description').innerHTML = `
      <strong>${riskLevelText}</strong><br>
      Based on ${profile.incident_count || 0} detected incidents<br>
      Last activity: ${new Date(profile.last_updated).toLocaleDateString()}
    `;
  } catch (error) {
    console.error('Error loading risk profile:', error);
  }
}

async function loadAlerts() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_ALERTS'
    });

    if (response.error) {
      console.error('Error loading alerts:', response.error);
      return;
    }

    const alertsList = document.getElementById('alerts-list');
    const alerts = response.alerts || [];

    if (alerts.length === 0) {
      alertsList.innerHTML = '<div class="empty-state">✅ No threats detected recently</div>';
      return;
    }

    alertsList.innerHTML = alerts.slice(0, 5).map(alert => {
      const severityClass = alert.risk_level > 80 ? 'critical' : alert.risk_level > 60 ? 'high' : 'medium';
      return `
        <div class="alert-item ${severityClass}">
          <div class="sender">📧 ${alert.sender || 'Unknown Sender'}</div>
          <div class="reason">
            🚨 ${alert.reason || 'Suspicious activity detected'}
          </div>
          <div class="reason" style="margin-top: 4px; opacity: 0.7;">
            ${new Date(alert.timestamp).toLocaleDateString()} 
            ${new Date(alert.timestamp).toLocaleTimeString()}
          </div>
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error loading alerts:', error);
    document.getElementById('alerts-list').innerHTML = 
      '<div class="empty-state">Error loading alerts</div>';
  }
}

function openSettings() {
  chrome.runtime.openOptionsPage();
}
