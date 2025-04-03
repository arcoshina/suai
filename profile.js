// 語言切換功能
document.getElementById('language-toggle').addEventListener('change', function() {
  const isChinese = this.checked;
  document.documentElement.lang = isChinese ? 'zh' : 'en';
  updateTexts(isChinese ? zhText : enText);
});

// 程式碼分析工具函數
const codeAnalyzer = {
  // 排除規則 (可自行擴充)
  patterns: {
    emptyLine: /^\s*$/,
    singleLineComment: /^\s*\/\/.*/,
    multiLineComment: {
      start: /^\s*\/\*/,
      end: /\*\/\s*$/
    },
    symbolsOnly: /^[{};[\](),]*$/
  },

  // 主要分析函數
  analyze(code) {
    let effectiveLines = 0;
    let inCommentBlock = false;

    code.split('\n').forEach(line => {
      const trimmed = line.trim();
      
      // 處理多行註解區塊
      if (inCommentBlock) {
        if (this.patterns.multiLineComment.end.test(trimmed)) {
          inCommentBlock = false;
        }
        return;
      }

      // 檢查各種排除條件
      if (this.patterns.emptyLine.test(trimmed)) return;
      if (this.patterns.singleLineComment.test(trimmed)) return;
      if (this.patterns.symbolsOnly.test(trimmed)) return;
      if (this.patterns.multiLineComment.start.test(trimmed)) {
        inCommentBlock = true;
        return;
      }

      effectiveLines++;
    });

    return effectiveLines;
  }
};

// 即時更新統計數據 (加入防抖機制)
let updateTimeout;
function updateCodeStats(code) {
  clearTimeout(updateTimeout);
  updateTimeout = setTimeout(() => {
    const lines = codeAnalyzer.analyze(code);
    document.getElementById('effective-lines').textContent = lines;
  }, 300); // 300ms 防抖延遲
}


// 表單驗證與提交
function validateForm() {
  let isValid = true;
  
  // 檢查每個必填欄位
  document.querySelectorAll('.required input, .required textarea').forEach(input => {
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
    projectName: document.getElementById('project-name').value,
    contractDescription: document.getElementById('contract-description').value,
    codeSnippet: document.getElementById('code-snippet').value,
    exclusiveLicense: document.getElementById('exclusive-license').checked
  };

  // 新增行數驗證
  const codeLines = codeAnalyzer.analyze(formData.codeSnippet);
  if (codeLines < 1) {
    alert('程式碼內容不可為空');
    return;
  }

  try {
    const response = await fetch('/.netlify/functions/handle-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) throw new Error('Upload failed');
    
    alert('上傳成功！');
    
    // 清空表單
    document.getElementById('upload-form').reset();
    
  } catch (error) {
    alert('上傳失敗，請稍後再試');
    console.error(error);
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
