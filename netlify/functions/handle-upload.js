exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    
    // 驗證數據
    const requiredFields = ['contractAddress', 'projectName'];
    if (!requiredFields.every(field => data[field])) {
      return { statusCode: 400, body: 'Missing required fields' };
    }

    // 將數據附加到 GitHub 倉庫
    // 這裡需實現實際的 GitHub API 整合

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Upload successful' })
    };
  } catch (error) {
    return { statusCode: 500, body: 'Internal Server Error' };
  }
};
