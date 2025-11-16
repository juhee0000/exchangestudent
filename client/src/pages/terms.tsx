export default function Terms() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">교환마켓 이용약관</h1>
      <p className="text-sm text-gray-500 mb-8">
        공고일자: 2025년 11월 15일 | 시행일자: 2025년 11월 22일
      </p>

      <h2 className="text-xl font-semibold mt-8">제1조 (목적)</h2>
      <p className="mt-2">
        본 약관은 교환학생들의 중고물품 거래 서비스 "교환마켓"(이하 "서비스")의 이용과 관련하여 
        회사와 이용자의 권리·의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제2조 (정의)</h2>
      <ul className="list-decimal pl-6 mt-2 space-y-1">
        <li>"서비스"란 회사가 제공하는 웹·모바일 기반 중고거래, 자유게시판, 모임방, 채팅 등 교환학생 커뮤니티 서비스를 의미합니다.</li>
        <li>"이용자"란 본 약관에 동의하고 서비스를 이용하는 개인을 의미합니다.</li>
        <li>"게시물"이란 이용자가 서비스 내에 게시한 글, 사진, 영상 등 일체의 정보를 의미합니다.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제3조 (계정 및 이용)</h2>
      <ul className="list-decimal pl-6 mt-2 space-y-1">
        <li>이용자는 본인인증 절차를 통해 계정을 생성할 수 있습니다.</li>
        <li>계정은 본인만 사용할 수 있으며 타인에게 양도, 대여, 공유할 수 없습니다.</li>
        <li>허위 정보 입력 등 부정가입 시 서비스 이용이 제한될 수 있습니다.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제4조 (서비스 이용 시 주의사항)</h2>
      <p className="mt-2">이용자는 다음 행위를 해서는 안 됩니다:</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>타인의 개인정보 무단 수집 및 도용</li>
        <li>운영을 방해하는 목적의 비정상적 서비스 접근</li>
        <li>불법·음란·저작권 침해 콘텐츠 게시</li>
        <li>서비스 프로그램의 무단 복제·수정·배포</li>
        <li>기타 법령 및 회사 정책 위반 행위</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제5조 (개인정보 보호)</h2>
      <p className="mt-2">
        회사는 이용자의 개인정보를 관련 법령과 개인정보처리방침에 따라 보호하며, 동의 범위 내에서만 이용합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제6조 (거래 및 게시물 관련)</h2>
      <p className="mt-2 font-medium">1. 중고물품 거래</p>
      <ul className="list-disc pl-6 mt-1 space-y-1">
        <li>이용자는 서비스 내에서 자유롭게 중고 거래를 진행할 수 있습니다.</li>
        <li>거래 분쟁 발생 시 회사는 직접적인 책임을 부담하지 않습니다.</li>
      </ul>

      <p className="mt-4 font-medium">2. 자유게시판·모임방</p>
      <ul className="list-disc pl-6 mt-1 space-y-1">
        <li>이용자는 자유롭게 글을 게시하고 오픈채팅 링크를 공유할 수 있습니다.</li>
        <li>게시물의 저작권은 작성자에게 귀속됩니다.</li>
        <li>법령 또는 약관 위반 게시물은 삭제·차단될 수 있습니다.</li>
      </ul>

      <h2 className="text-xl font-semibold mt-8">제7조 (서비스 제공 및 변경·중단)</h2>
      <p className="mt-2">
        시스템 점검, 장애 등 부득이한 경우 서비스가 일시 중단될 수 있으며, 
        회사는 사전에 공지하거나 불가피한 경우 사후 통지합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제8조 (책임의 한계)</h2>
      <p className="mt-2">
        회사는 서비스 내 거래 당사자 간 분쟁에 관여하지 않으며, 이용자가 게시한 정보의 정확성·신뢰성에 
        대해 책임을 지지 않습니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제9조 (약관의 개정)</h2>
      <p className="mt-2">
        회사는 필요 시 약관을 개정할 수 있으며, 중요 변경 사항은 사전에 서비스 내 공지합니다.
      </p>

      <h2 className="text-xl font-semibold mt-8">제10조 (분쟁 해결)</h2>
      <p className="mt-2">
        서비스 이용 관련 분쟁 발생 시 대한민국 법률을 적용하며, 관할 법원은 회사 소재지 법원으로 합니다.
      </p>

      <p className="mt-8 pt-4 border-t text-sm text-gray-500">
        본 약관은 2025년 11월 22일부터 시행됩니다.
      </p>
    </div>
  );
}
