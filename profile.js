// 語言切換功能
document.getElementById('language-toggle').addEventListener('change', function() {
  const isChinese = this.checked;
  document.documentElement.lang = isChinese ? 'zh' : 'en';
  updateTexts(isChinese ? zhText : enText);
});

// 表單驗證與提交
function validateForm() {
  let isValid = true;
  document.querySelectorAll('.required input').forEach(input => {
    if (!input.value.trim()) {
      input.classList.add('error');
      isValid = false;
    } else {
      input.classList.remove('error');
    }
  });
  return isValid;
}

async function submitForm() {
  if (!validateForm()) return;

  const formData = {
    timestamp: new Date().toISOString(),
    contractAddress: document.getElementById('contract-address').value,
    // 其他欄位...
    exclusiveLicense: document.getElementById('exclusive-license').checked
  };

  try {
    const response = await fetch('/.netlify/functions/handle-upload', {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    // 處理回應...
  } catch (error) {
    showErrorMessage('上傳失敗，請稍後再試');
  }
}

// 新增表單切換函數
let isFormExpanded = false;
function toggleUploadForm() {
  const form = document.getElementById('upload-form');
  const trigger = document.querySelector('.upload-trigger');
  
  isFormExpanded = !isFormExpanded;
  form.classList.toggle('expanded');
  trigger.style.borderStyle = isFormExpanded ? 'solid' : 'dashed';
  
  // 動畫控制
  form.style.maxHeight = isFormExpanded ? '1000px' : '0';
}

// 歷史紀錄加載函數
async function loadHistory() {
  try {
    const response = await fetch('/.netlify/functions/get-history');
    const data = await response.json();
    
    const container = document.getElementById('history-list');
    container.innerHTML = data.length > 0 
      ? data.map(item => `<div class="record">${item.date}: ${item.project}</div>`).join('')
      : '<div class="no-data">無上傳紀錄</div>';
      
    document.getElementById('show-all').classList.toggle('hidden', data.length <= 3);
    
  } catch (error) {
    document.getElementById('history-list').innerHTML = 
      '<div class="error-msg">查詢失敗，請稍後再試</div>';
  }
}

// 網頁載入時執行
window.addEventListener('load', () => {
  loadHistory();
  initLanguage(); // 確保語言初始化
});
