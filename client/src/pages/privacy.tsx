export default function Privacy() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">개인정보처리방침</h1>
      <p className="text-sm text-gray-500 mb-8">
        공고일자: 2025년 11월 15일 | 시행일자: 2025년 11월 22일
      </p>

      <p className="mt-4">
        교환마켓(이하 “서비스”)은 「개인정보보호법」, 「정보통신망법」 등 관련 법령이
        정하는 바를 준수하며 이용자의 개인정보를 보호하기 위해 최선을 다하고 있습니다.
        본 개인정보처리방침은 서비스 이용과정에서 수집되는 개인정보의 처리 목적,
        보유기간, 이용자 권리 등을 명확히 안내하기 위해 마련되었습니다.
      </p>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제1조 (수집하는 개인정보의 항목)</h2>
      <p className="mt-2">서비스는 다음과 같은 개인정보를 수집합니다.</p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>필수: 카카오 계정 정보(프로필 닉네임, 이메일), 서비스 내 고유 ID</li>
        <li>선택: 프로필 이미지, 학교 정보, 교환 지역, 관심 카테고리</li>
        <li>자동수집: 접속 로그, 기기 정보, IP 주소, 이용 기록</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제2조 (개인정보의 수집 및 이용 목적)</h2>
      <p className="mt-2">서비스는 수집한 개인정보를 다음 목적을 위해 사용합니다.</p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>회원 식별 및 인증, 로그인 기능 제공</li>
        <li>중고물품 등록·조회·거래 기능 제공</li>
        <li>거래 관련 알림 및 메시지 전송</li>
        <li>부정 이용 방지, 안전한 거래 환경 유지</li>
        <li>서비스 개선 및 신규 기능 개발</li>
        <li>고객 문의 응대 및 문제 해결</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제3조 (개인정보의 보유 및 이용기간)</h2>
      <p className="mt-2">서비스는 다음 기준에 따라 개인정보를 보유합니다.</p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>회원 탈퇴 시 즉시 삭제 (단, 부정 이용 방지를 위한 최소 정보는 3개월 보관)</li>
        <li>관련 법령에 따라 필요한 경우 법정 기간 동안 보관</li>
      </ul>

      <p className="mt-4 font-medium">법령에 따른 보관 기간 예시:</p>
      <ul className="list-disc pl-6 mt-1 space-y-1">
        <li>전자상거래 기록: 5년</li>
        <li>로그인 기록(IP 등): 3개월</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제4조 (개인정보 제3자 제공)</h2>
      <p className="mt-2">
        서비스는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.  
        단, 다음 사항에 해당하는 경우 예외적으로 제공될 수 있습니다.
      </p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>이용자가 사전에 동의한 경우</li>
        <li>법령에 의해 요구되는 경우</li>
        <li>범죄 예방, 수사 목적 등 공공기관 요청이 있는 경우</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제5조 (개인정보 처리의 위탁)</h2>
      <p className="mt-2">서비스 원활한 제공을 위해 필요한 경우 일부 업무를 외부에 위탁할 수 있습니다.</p>

      <p className="mt-2">현재 위탁 업체는 다음과 같습니다.</p>
      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>카카오: 소셜 로그인 및 계정 인증 기능 제공</li>
        <li>이미지 호스팅 또는 알림 서비스 제공 업체(사용 시 별도 공지)</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제6조 (이용자의 권리)</h2>
      <p className="mt-2">
        이용자는 언제든지 자신의 개인정보에 대해 열람·정정·삭제를 요청할 수 있습니다.  
        또한 개인정보 수집·이용에 대한 동의 철회 및 회원 탈퇴도 가능합니다.
      </p>

      <p className="mt-2 font-medium">권리 행사는 앱 내 설정 또는 고객센터를 통해 요청할 수 있습니다.</p>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제7조 (개인정보의 안전성 확보 조치)</h2>
      <p className="mt-2">서비스는 개인정보 보호를 위해 다음의 보호 조치를 실시합니다.</p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>비밀번호 및 민감정보 암호화</li>
        <li>접근 권한 최소화 및 관리자 인증 절차</li>
        <li>데이터 접근 기록 보관 및 모니터링</li>
        <li>CSRF/XSS 방지 등 앱 보안 강화</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제8조 (개인정보 파기 절차 및 방법)</h2>
      <p className="mt-2">개인정보는 보유기간 종료 시 다음 기준에 따라 즉시 파기합니다.</p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>전자 파일: 복구 불가능한 방식으로 영구 삭제</li>
        <li>문서: 분쇄 또는 소각 처리</li>
      </ul>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제9조 (개인정보 보호책임자)</h2>
      <p className="mt-2">
        서비스는 개인정보 보호에 관한 문의를 처리하기 위해 개인정보보호책임자를
        다음과 같이 지정합니다.
      </p>

      <ul className="list-disc pl-6 mt-2 space-y-1">
        <li>이름: 교환마켓 운영팀</li>
        <li>이메일: support@exchange-market.app (변경 가능)</li>
      </ul>

      <p className="mt-2">
        개인정보 관련 문의, 불만처리, 피해 구제는 위 연락처로 문의하실 수 있습니다.
      </p>

      {/* -------------------------------------------------- */}
      <h2 className="text-xl font-semibold mt-8">제10조 (개인정보처리방침의 변경)</h2>
      <p className="mt-2">
        본 개인정보처리방침은 법령·정책·서비스 변경에 따라 개정될 수 있으며,
        개정 시 앱 내 공지사항 등을 통해 사전 공지합니다.
      </p>
    </div>
  );
}