import React from "react";
import styled from "styled-components";

export default function ReserveModal({
  date,
  onClose,
}: {
  date: string;
  onClose: () => void;
}) {
  return (
    <ModalOverlay>
      <ModalContent>
        <CloseIconButton onClick={onClose}>×</CloseIconButton>
        <ModalTitle>{date} 예약</ModalTitle>
        <StyledSelect>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </StyledSelect>
        <SubmitButton>샐러드 예약</SubmitButton>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  position: relative;
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: bold;
`;

const StyledSelect = styled.select`
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #222;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

const CloseIconButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
`;
