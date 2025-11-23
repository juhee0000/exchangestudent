import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  const handleClose = () => {
    window.history.back();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4"
        onClick={handleClose}
        data-testid="button-close-privacy"
      >
        <X className="h-5 w-5" />
      </Button>

      <h1 className="text-2xl font-bold mb-4">개인정보 처리방침</h1>
      <p className="text-sm text-gray-500 mb-8">
        공고일자: 2025년 11월 15일 | 시행일자: 2025년 11월 16일
      </p>

      <h2 className="text-xl font-semibold mt-8">제1조 (개인정보의 수집 항목)</h2>
      <p className="mt-2">회사는 서비스 제공을 위해 최소한의 개인정보를 수집합니다. 수집 항목은 다음과 같습니다:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>필수: 이름, 이메일, 사용자명, 비밀번호</li>
        <li>선택: 전화번호, 프로필 사진, 주소</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제2조 (개인정보의 수집 방법)</h2>
      <p className="mt-2">회사는 회원가입, 서비스 이용, 이벤트 응모, 고객센터 문의 등을 통해 개인정보를 수집합니다.</p>

      <h2 className="text-xl font-semibold mt-8">제3조 (개인정보의 이용 목적)</h2>
      <p className="mt-2">수집된 개인정보는 다음 목적을 위해 사용됩니다:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>서비스 제공 및 회원 관리</li>
        <li>고객 문의 응대 및 불만 처리</li>
        <li>서비스 개선 및 맞춤형 정보 제공</li>
        <li>법령상 의무 준수</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제4조 (개인정보의 보유 및 이용 기간)</h2>
      <p className="mt-2">
        회사는 개인정보 수집 및 이용 목적이 달성되면 해당 정보를 지체 없이 파기합니다. 
        단, 법령에 따라 일정 기간 보관해야 하는 경우에는 그 기간 동안 보관합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제5조 (개인정보 제공 및 공유)</h2>
      <p className="mt-2">
        회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 
        다만, 다음의 경우는 예외로 합니다:
      </p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>이용자가 사전에 동의한 경우</li>
        <li>법령에 따라 제출 요구가 있는 경우</li>
        <li>서비스 제공을 위해 필요한 경우</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제6조 (개인정보의 안전성 확보 조치)</h2>
      <p className="mt-2">회사는 개인정보 보호를 위해 다음과 같은 조치를 취하고 있습니다:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>개인정보 접근 권한 제한 및 관리</li>
        <li>개인정보 암호화 및 보안 프로토콜 적용</li>
        <li>해킹 등 외부 침입에 대비한 보안 시스템 운영</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제7조 (이용자의 권리와 행사 방법)</h2>
      <p className="mt-2">
        이용자는 언제든지 자신의 개인정보 조회, 수정, 삭제, 처리 정지 등을 요구할 수 있습니다. 
        요청 방법은 고객센터 또는 앱 내 설정 메뉴를 통해 가능합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제8조 (개인정보 처리방침 변경)</h2>
      <p className="mt-2">
        본 개인정보 처리방침은 법령, 정책 변경 또는 회사 내부 방침에 따라 변경될 수 있으며, 
        변경 시 사전에 공지합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8 mb-8">제9조 (문의)</h2>
      <p className="mt-2 mb-16">개인정보 관련 문의는 고객센터를 통해 가능합니다.</p>
    </div>
  );
}
