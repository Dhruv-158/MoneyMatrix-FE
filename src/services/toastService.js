import toast from 'react-hot-toast';
import { getUserMessage } from '@/utils/errors';

/**
 * Centralized Toast Service — always shows plain-language messages to users.
 */
class ToastService {
  success(message, options = {}) {
    return toast.success(message || 'Done', options);
  }

  error(message, options = {}) {
    const text =
      typeof message === 'string'
        ? getUserMessage(message)
        : getUserMessage(message) || 'Something went wrong. Please try again.';
    return toast.error(text, options);
  }

  loading(message = 'Please wait…', options = {}) {
    return toast.loading(message, options);
  }

  dismiss(id) {
    return toast.dismiss(id);
  }

  promise(promise, messages, options = {}) {
    return toast.promise(promise, messages, options);
  }
}

export const toastService = new ToastService();
export default toastService;
