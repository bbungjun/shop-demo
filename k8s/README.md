# Kubernetes Deploy

이 프로젝트는 `web`과 `api`를 분리한 뒤 Kubernetes에 배포하는 구조다.

## 1. 이미지 빌드

```bash
docker build -t shopping-web:latest .
docker build -t shopping-api:latest ./mock-api
```

## 2. 레지스트리 푸시

예시:

```bash
docker tag shopping-web:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/shopping-demo-web:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/shopping-demo-web:latest

docker tag shopping-api:latest 123456789012.dkr.ecr.us-west-2.amazonaws.com/shopping-demo-api:latest
docker push 123456789012.dkr.ecr.us-west-2.amazonaws.com/shopping-demo-api:latest
```

## 3. 적용

```bash
kubectl apply -k k8s
```

## 포함 리소스

- `web Deployment / Service`
- `api Deployment / Service`
- `Ingress`
- `web HorizontalPodAutoscaler`
- `api HorizontalPodAutoscaler`

## 참고

- `Ingress` 는 `/` 는 `web`, `/api` 는 `api` 로 라우팅한다.
- `api` 프로브는 `/health` 기준이다.
- ALB Ingress annotations는 AWS Load Balancer Controller 기준 예시다.
- 현재 매니페스트는 `host` 제한을 제거해 ALB DNS 주소로 직접 접속 가능하게 되어 있다.
- 실제 도메인 사용 시 [`k8s/ingress.yaml`](/mnt/c/Users/PC/Desktop/shop_test-main/shop_test-main/k8s/ingress.yaml) 에 `host` 규칙을 다시 추가하면 된다.
