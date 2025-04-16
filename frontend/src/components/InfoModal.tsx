import { useEffect, useState } from "react";
import styled from "styled-components";

interface InfoModalProps {
  isOpen: boolean;
  onSubmit: (form: { name: string; id: string; dept: string }) => void;
}

export default function InfoModal({ isOpen, onSubmit }: InfoModalProps) {
  const [form, setForm] = useState({ name: "", id: "", dept: "" });

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem("userForm");
      if (saved) {
        setForm(JSON.parse(saved));
      }
    }
  }, [isOpen]);

  const isValid = form.name.trim() && form.id.trim() && form.dept.trim();

  const handleSubmit = () => {
    if (!isValid) return;
    localStorage.setItem("userForm", JSON.stringify(form));
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalField>
          <label>이름</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </ModalField>
        <ModalField>
          <label>행번</label>
          <input
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
          />
        </ModalField>
        <ModalField>
          <label>부서명</label>
          <input
            value={form.dept}
            onChange={(e) => setForm({ ...form, dept: e.target.value })}
          />
        </ModalField>
        <SubmitButton disabled={!isValid} onClick={handleSubmit}>
          Submit
        </SubmitButton>
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
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: 300px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const ModalField = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;

  label {
    font-size: 14px;
    font-weight: 500;
    margin-bottom: 6px;
  }

  input {
    padding: 10px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 8px;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #222;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
`;
