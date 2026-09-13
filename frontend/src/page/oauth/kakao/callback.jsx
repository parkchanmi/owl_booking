import React, { useEffect, useRef } from "react";
import { Flex, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = () => {
    const navigate = useNavigate();
    const requested = useRef(false);

    useEffect(() => {
        if (requested.current) return;
        requested.current = true;

        const code = new URLSearchParams(window.location.search).get('code');

        if (!code) {
            message.error('카카오 로그인에 실패했습니다.');
            navigate('/login', { replace: true });
            return;
        }

        const loginWithKakao = async () => {
            try {
                const response = await fetch('/api/member/oauth/kakao', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                    credentials: 'include',
                });

                if (response.ok) {
                    const loginResult = await response.json();
                    const nextPath = loginResult.typeCode === 1 ? '/admin' : '/user/booking';

                    message.success('카카오 계정으로 로그인되었습니다.');
                    navigate(nextPath, { replace: true });
                    return;
                }

                message.error('카카오 로그인에 실패했습니다.');
                navigate('/login', { replace: true });
            } catch (error) {
                console.error('Kakao login error:', error);
                message.error('서버와 통신 중 오류가 발생했습니다.');
                navigate('/login', { replace: true });
            }
        };

        loginWithKakao();
    }, [navigate]);

    return (
        <Flex justify="center" align="center" style={{ minHeight: '100vh' }}>
            <Spin size="large" tip="카카오 로그인 처리 중..." />
        </Flex>
    );
};

export default KakaoCallback;
