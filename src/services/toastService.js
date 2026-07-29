import toast from 'react-hot-toast';

/**
 * Centralized Toast Service wrapper around react-hot-toast.
 * Provides a single source of truth for all user-facing notification messages.
 */
class ToastService {
  /**
   * Display a success toast message
   * @param {string} message 
   * @param {object} options 
   */
  success(message, options = {}) {
    return toast.success(message || 'Operation successful', options);
  }

  /**
   * Display an error toast message
   * @param {string} message 
   * @param {object} options 
   */
  error(message, options = {}) {
    return toast.error(message || 'Something went wrong', options);
  }

  /**
   * Display a loading toast message
   * @param {string} message 
   * @param {object} options 
   */
  loading(message = 'Processing...', options = {}) {
    return toast.loading(message, options);
  }

  /**
   * Dismiss an active toast by ID or dismiss all active toasts
   * @param {string} [id] 
   */
  dismiss(id) {
    return toast.dismiss(id);
  }

  /**
   * Wrap an async promise with loading, success, and error toasts
   * @param {Promise} promise 
   * @param {object} messages - { loading, success, error }
   * @param {object} options 
   */
  promise(promise, messages, options = {}) {
    return toast.promise(promise, messages, options);
  }
}

export const toastService = new ToastService();
export default toastService;
