import React from "react";
import styled from "styled-components";

export default function EditModal({
  date,
  onClose,
}: {
  date: string;
  onClose: () => void;
}) {
  return (
    <ModalOverlay>
      <ModalBox>
        <h2>{date} 변경</h2>
        <select>
          <option>1</option>
          <option>2</option>
          <option>3</option>
        </select>
        <div>
          <button>예약 개수 변경</button>
          <button>예약 취소</button>
        </div>
        <button onClick={onClose}>닫기</button>
      </ModalBox>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalBox = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
