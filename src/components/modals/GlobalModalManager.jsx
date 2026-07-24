import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeModal } from '@/redux/slices/modalSlice';
import AddTransactionModal from './AddTransactionModal';

export default function GlobalModalManager() {
  const dispatch = useDispatch();
  const { activeModal } = useSelector((state) => state.modal);

  const handleClose = () => {
    dispatch(closeModal());
  };

  return (
    <>
      <AddTransactionModal
        open={activeModal === 'addTransaction'}
        onClose={handleClose}
      />
    </>
  );
}
