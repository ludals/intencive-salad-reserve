import { useEffect, useState } from "react";
import Calendar from "@/components/Calendar";
import InfoModal from "@/components/InfoModal";
import styled from "styled-components";
import ReserveModal from "@/components/ReserveModal";
import EditModal from "@/components/EditModal";

export default function StartPage() {
  const [reservedMap, setReservedMap] = useState<{ [key: string]: number }>({});
  const [form, setForm] = useState<{
    name: string;
    id: string;
    dept: string;
    user_id?: number;
  }>({ name: "", id: "", dept: "" });
  const [submitted, setSubmitted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [adminReservations, setAdminReservations] = useState<any[]>([]);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [menuByDay, setMenuByDay] = useState<{ [day: number]: string }>({});
  const [showMenuModal, setShowMenuModal] = useState(false);

  const isAdmin = form.id === "999999";

  useEffect(() => {
    const saved = localStorage.getItem("userForm");
    if (saved) {
      const parsed = JSON.parse(saved);
      setForm(parsed);
      setSubmitted(true);
      fetch(`http://175.45.208:4000/api/reservations?user_id=${parsed.user_id}`)
        .then((res) => res.json())
        .then((data) => {
          const map: { [key: string]: number } = {};
          data.forEach((r: any) => {
            const key = r.reserve_date.slice(0, 10);
            map[key] = r.quantity;
          });
          setReservedMap(map);
        });
    } else {
      setIsModalOpen(true);
    }
    fetch("http://175.45.208:4000/api/admin/menu")
      .then((res) => res.json())
      .then((data) => {
        const menuMap: { [key: number]: string } = {};
        data.forEach((item: any) => {
          menuMap[item.weekday] = item.menu;
        });
        setMenuByDay(menuMap);
      });
  }, []);

  const handleSubmit = async (data: typeof form) => {
    const res = await fetch("http://175.45.208:4000/api/users", {
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
    window.location.reload();
  };

  const handleMenuSave = async () => {
    for (const day of [1, 2, 3, 4, 5]) {
      const menu = menuByDay[day];
      await fetch("http://175.45.208:4000/api/admin/menu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, menu }),
      });
    }
    alert("메뉴가 저장되었습니다.");
  };

  const handleDateClick = async (
    date: string,
    isReserved: boolean,
    isDeadlineVisible: boolean
  ) => {
    if (!isDeadlineVisible) return;
    setSelectedDate(date);
    if (isAdmin) {
      const res = await fetch(
        `http://175.45.208:4000/api/admin/reservations/${date}`
      );
      const data = await res.json();
      setAdminReservations(data);
      setShowAdminModal(true);
      return;
    }
    if (isReserved) setShowEditModal(true);
    else setShowReserveModal(true);
  };

  const handleReserve = async () => {
    if (!form.user_id || !selectedDate) return;
    const res = await fetch("http://175.45.208:4000/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: form.user_id,
        reserve_date: selectedDate,
        quantity: selectedQuantity,
      }),
    });
    if (res.ok) {
      setReservedMap((prev) => ({ ...prev, [selectedDate]: selectedQuantity }));
      setShowReserveModal(false);
    } else {
      alert(await res.text());
    }
  };

  const handleUpdate = async () => {
    if (!form.user_id || !selectedDate) return;
    const res = await fetch("http://175.45.208:4000/api/reservations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: form.user_id,
        reserve_date: selectedDate,
        quantity: selectedQuantity,
      }),
    });
    if (res.ok) {
      setReservedMap((prev) => ({ ...prev, [selectedDate]: selectedQuantity }));
      setShowEditModal(false);
    } else {
      alert(await res.text());
    }
  };

  const handleCancel = async () => {
    if (!form.user_id || !selectedDate) return;
    const res = await fetch("http://175.45.208:4000/api/reservations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: form.user_id,
        reserve_date: selectedDate,
      }),
    });
    if (res.ok) {
      setReservedMap((prev) => {
        const map = { ...prev };
        delete map[selectedDate];
        return map;
      });
      setShowEditModal(false);
    } else {
      alert(await res.text());
    }
  };

  return (
    <PageWrapper>
      <InfoModal isOpen={isModalOpen} onSubmit={handleSubmit} />
      {isAdmin && (
        <MenuEditButton onClick={() => setShowMenuModal(true)}>
          메뉴 수정
        </MenuEditButton>
      )}
      {showMenuModal && (
        <ModalOverlay>
          <ModalContent>
            <h3>요일별 메뉴 수정</h3>
            {([1, 2, 3, 4, 5] as const).map((day) => (
              <ModalField key={day}>
                <label>{"월화수목금"[day - 1]}요일</label>
                <input
                  value={menuByDay[day] || ""}
                  onChange={(e) =>
                    setMenuByDay((prev) => ({
                      ...prev,
                      [day]: e.target.value,
                    }))
                  }
                />
              </ModalField>
            ))}
            <SubmitButton
              onClick={async () => {
                for (const day of [1, 2, 3, 4, 5]) {
                  await fetch("http://175.45.208:4000/api/admin/menu", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ day, menu: menuByDay[day] }),
                  });
                }
                alert("메뉴가 저장되었습니다.");
                setShowMenuModal(false);
              }}
            >
              저장
            </SubmitButton>
            <CloseButton onClick={() => setShowMenuModal(false)}>
              닫기
            </CloseButton>
          </ModalContent>
        </ModalOverlay>
      )}
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
      {showAdminModal && (
        <ModalOverlay>
          <AdminModalBox>
            <AdminTitle>{selectedDate} 예약자 목록</AdminTitle>
            <ReservationList>
              {adminReservations.map((r, i) => (
                <ReservationItem key={i}>
                  <span>{r.name}</span>
                  <span>{r.emp_id}</span>
                  <span>{r.quantity}개</span>
                </ReservationItem>
              ))}
            </ReservationList>
            <TotalText>
              총 수량:{" "}
              {adminReservations.reduce((acc, curr) => acc + curr.quantity, 0)}
              개
            </TotalText>
            <CloseButton onClick={() => setShowAdminModal(false)}>
              닫기
            </CloseButton>
          </AdminModalBox>
        </ModalOverlay>
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
          <Calendar
            reservedMap={reservedMap}
            isAdmin={isAdmin}
            menuByDay={menuByDay}
            onDateClick={handleDateClick}
          />
        </LeftSide>
        <RightSide>
          <Card>
            <CardTitle>샐러드 예약 절차</CardTitle>
            <CardText>
              정보입력을 통해 이름과 행번 부서명을 남겨 주세요. 이후 원하시는
              날짜를 선택 후 예약 팝업을 통해 샐러드를 예약하시면 됩니다.
              <br />
              <br /> 샐러드 예약은 마감일 17시까지 입니다.
              <br /> <br /> 예약 후 변경 및 취소는 마감일 17시까지 가능합니다.
            </CardText>
          </Card>
          <Card>
            <CardTitle>미수령 샐러드 도시락 공지사항</CardTitle>
            <CardText>
              예약 후 미수령 하더라도 해당일에 샐러드를 이용한 것으로 간주하여
              이용 대금이 청구되오니 이용에 참고 바랍니다.
              <br /> <br /> 수령시간은 11시부터 17시까지이며, 17시 이후에는 폐기
              처리 되니 반드시 17시 이전에 수령해주시기 바랍니다.
            </CardText>
          </Card>
        </RightSide>
      </ContentGrid>
    </PageWrapper>
  );
}

const SubmitButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #222;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 8px;
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

const MenuEditButton = styled.button`
  background-color: #f59e0b;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 8px;
  font-weight: bold;
  width: 120px;
  cursor: pointer;
  margin-bottom: 16px;
`;

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
  height: 37%;
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

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AdminMenuEditor = styled.div`
  background: #fff7ea;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  label {
    width: 60px;
    font-weight: bold;
  }

  input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
`;

const SaveMenuButton = styled.button`
  background-color: #10b981;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 8px;
`;

const WelcomeText = styled.div`
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 8px;
`;

const AdminModalBox = styled.div`
  background: white;
  padding: 32px;
  border-radius: 16px;
  width: 360px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AdminTitle = styled.h3`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const ReservationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ReservationItem = styled.li`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
`;

const TotalText = styled.div`
  font-weight: bold;
  text-align: right;
  margin-top: 12px;
`;

const CloseButton = styled.button`
  margin-top: 12px;
  background: #222;
  color: white;
  border: none;
  padding: 10px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;
