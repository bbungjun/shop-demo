# Container Guide

이 프로젝트는 팀원이 로컬 환경 차이 없이 바로 확인할 수 있도록 Docker 기반 개발 환경을 포함한다.

## 개발용 실행

```bash
docker compose up --build
```

- 앱은 `http://localhost:3000` 에서 확인할 수 있다.
- 소스는 호스트와 컨테이너 사이에 마운트되므로 수정 사항이 바로 반영된다.

## 운영용 이미지 빌드

```bash
docker build -t shopping-web:latest .
docker run --rm -p 3000:3000 shopping-web:latest
```

- 운영용 이미지는 Next.js standalone output을 사용한다.
- 컨테이너 내부에서 `node server.js` 로 실행된다.

## IDE 연동

- VS Code 또는 Cursor에서 저장소를 연 뒤 `Reopen in Container` 를 사용하면 된다.
- 설정 파일은 [`.devcontainer/devcontainer.json`](/mnt/c/shopping/.devcontainer/devcontainer.json) 에 있다.
