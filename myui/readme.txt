지금 만든 프로젝트는 
**Next.js UI + FastAPI + vision backend** 구조라서 
**실행할 때 항상 서버 2개를 켜야 합니다.**
아래가 **실행 방법 총정리**입니다.

백엔드 서버 실행
cd C:\Users\[username]\Desktop\myui\backend
conda activate vision
C:\miniconda3\envs\vision\python.exe -m uvicorn main:app --reload
C:\miniconda3\envs\vision\python.exe -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

프론트엔드 서버 실행
cd C:\Users\[username]\Desktop\myui
npm run dev