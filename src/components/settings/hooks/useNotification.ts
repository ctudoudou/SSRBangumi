import { useState } from 'react';

export function useNotification() {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showError = (message: string) => {
    setError(message);
    setSuccess('');
    // 自动清除错误消息
    setTimeout(() => setError(''), 5000);
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setError('');
    // 自动清除成功消息
    setTimeout(() => setSuccess(''), 3000);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  return {
    error,
    success,
    showError,
    showSuccess,
    clearMessages
  };
}