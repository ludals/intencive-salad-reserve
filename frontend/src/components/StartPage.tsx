import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import InfoModal from "@/components/InfoModal";
import styled from "styled-components";
import ReserveModal from "@/components/ReserveModal";
import EditModal from "@/components/EditModal";

export default function StartPage() {
  const [reservedMap, setReservedMap] = useState<{ [date: string]: number }>(
    {}
  );
  const [form, setForm] = useState<{
    name: string;
    id: string;
    dept: string;
    user_id?: number;
  }>({
    name: "",
    id: "",
    dept: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem("userForm");
    if (saved) {
      const parsed = JSON.parse(saved);
      setForm(parsed);
      setSubmitted(true);

      fetch(`http://localhost:4000/api/reservations?user_id=${parsed.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          const map: { [date: string]: number } = {};
          data.forEach((item: any) => {
            const date = item.reserve_date.slice(0, 10);
            map[date] = item.quantity;
          });
          console.log("✅ 예약 map:", map);
          setReservedMap(map);
        });
    } else {
      setIsModalOpen(true);
    }
  }, []);

  const handleSubmit = async (data: typeof form) => {
    try {
      const res = await fetch("http://localhost:4000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          emp_id: data.id,
          department: data.dept,
        }),
      });

      const user = await res.json();
      const fullForm = { ...data, user_id: user.id };
      localStorage.setItem("userForm", JSON.stringify(fullForm));
      setForm(fullForm);
      setSubmitted(true);
      setIsModalOpen(false);

      const reservationsRes = await fetch(
        `http://localhost:4000/api/reservations?user_id=${user.id}`
      );
      const reservations = await reservationsRes.json();
      const map: { [date: string]: number } = {};
      reservations.forEach((item: any) => {
        const date = item.reserve_date.slice(0, 10);
        map[date] = item.quantity;
      });
      setReservedMap(map);
    } catch (e) {
      console.error("사용자 등록 실패", e);
    }
  };

  const handleDateClick = (date: string, isReserved: boolean) => {
    setSelectedDate(date);
    if (isReserved) {
      setShowEditModal(true);
    } else {
      setShowReserveModal(true);
    }
  };

  const handleReserve = async () => {
    if (!form.user_id || !selectedDate) return;
    try {
      const res = await fetch("http://localhost:4000/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: form.user_id,
          reserve_date: selectedDate,
          quantity: selectedQuantity,
        }),
      });
      if (res.ok) {
        setReservedMap((prev) => ({
          ...prev,
          [selectedDate]: selectedQuantity,
        }));
        setShowReserveModal(false);
      } else {
        alert(await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    if (!form.user_id || !selectedDate) return;
    try {
      const res = await fetch("http://localhost:4000/api/reservations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: form.user_id,
          reserve_date: selectedDate,
          quantity: selectedQuantity,
        }),
      });
      if (res.ok) {
        setReservedMap((prev) => ({
          ...prev,
          [selectedDate]: selectedQuantity,
        }));
        setShowEditModal(false);
      } else {
        alert(await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async () => {
    if (!form.user_id || !selectedDate) return;
    try {
      const res = await fetch("http://localhost:4000/api/reservations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: form.user_id,
          reserve_date: selectedDate,
        }),
      });
      if (res.ok) {
        setReservedMap((prev) => {
          const updated = { ...prev };
          delete updated[selectedDate];
          return updated;
        });
        setShowEditModal(false);
      } else {
        alert(await res.text());
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PageWrapper>
      <InfoModal isOpen={isModalOpen} onSubmit={handleSubmit} />
      {showReserveModal && selectedDate && (
        <ReserveModal
          date={selectedDate}
          onClose={() => setShowReserveModal(false)}
          onReserve={handleReserve}
          quantity={selectedQuantity}
          setQuantity={setSelectedQuantity}
        />
      )}
      {showEditModal && selectedDate && (
        <EditModal
          date={selectedDate}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleUpdate}
          onCancel={handleCancel}
          quantity={selectedQuantity}
          setQuantity={setSelectedQuantity}
        />
      )}
      <ContentGrid>
        <LeftSide>
          {!submitted && (
            <InfoButton onClick={() => setIsModalOpen(true)}>
              정보입력
            </InfoButton>
          )}
          {submitted && <WelcomeText>{form.name}님 😊</WelcomeText>}
          <Title>샐러드 간편 예약</Title>
          <Calendar reservedMap={reservedMap} onDateClick={handleDateClick} />
        </LeftSide>
        <RightSide>
          <Card>
            <CardTitle>샐러드 예약 절차</CardTitle>
            <CardText>
              정보입력을 통해 이름과 행번 부서명을 남겨 주세요. 이후 원하시는
              날짜를 선택 후 예약 팝업을 통해 샐러드를 예약하시면 됩니다.
              <br />
              <br /> 샐러드 예약은 마감일 17시까지 입니다.
              <br />
              <br /> 예약 후 변경 및 취소는 마감일 17시까지 가능합니다.
            </CardText>
          </Card>
          <Card>
            <CardTitle>미수령 샐러드 도시락 공지사항</CardTitle>
            <CardText>
              예약 후 미수령 하더라도 해당일에 샐러드를 이용한 것으로 간주하여
              이용 대금이 청구되오니 이용에 참고 바랍니다.
              <br />
              <br /> 수령시간은 11시부터 17시까지이며, 17시 이후에는 폐기 처리
              되니 반드시 17시 이전에 수령해주시기 바랍니다.
            </CardText>
          </Card>
        </RightSide>
      </ContentGrid>
    </PageWrapper>
  );
}

const PageWrapper = styled.div`
  width: 100vw;
  height: 100vh;
  padding: 32px;
  box-sizing: border-box;
  background-color: #f9f9f9;
`;

const ContentGrid = styled.div`
  display: flex;
  height: 100%;
`;

const LeftSide = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
`;

const RightSide = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 16px;
  margin-top: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin: 24px 0;
`;

const Card = styled.div`
  background-color: white;
  padding: 20px;
  height: 45%;
  border-radius: 16px;
  align-items: center;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const CardTitle = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 30px;
`;

const CardText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-line;
  margin-bottom: 30px;
`;

const InfoButton = styled.button`
  background-color: #000000;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: bold;
  width: 120px;
  cursor: pointer;
`;

const SubmitButton = styled.button`
  background-color: #10b981;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
`;

const WelcomeText = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
`;
