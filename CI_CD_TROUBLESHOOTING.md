# CI/CD Troubleshooting Notes

이 문서는 이번 GitHub Actions 기반 CI/CD 구성 과정에서 실제로 발생한 문제와 원인, 해결 방법을 정리한 기록이다.

## 1. 결론 먼저

이번 이슈가 전부 `UTF` 문제이거나 `줄바꿈` 문제였던 것은 아니다.

실제 원인 범주는 아래 네 가지였다.

- GitHub Actions 변수 입력 방식 오류
- GitHub Variables 값의 줄바꿈/공백 포함
- IAM Role 권한 부족
- ESLint 설정과 프로젝트 파일 유형 간 충돌

즉, 일부는 text formatting 문제였지만, 일부는 권한과 설정 구조 문제였다.

## 2. Deploy workflow 쪽 문제

### 2.1 `aws-region` 값이 비어 있던 문제

증상:

```text
Error: Input required and not supplied: aws-region
```

원인:

- GitHub Actions가 `vars.AWS_REGION` 등을 읽도록 되어 있었음
- 그런데 GitHub Repository Variables를 개별 변수로 만들지 않고
  `DEMO`라는 변수 하나에 여러 줄로 몰아서 입력했음
- 결과적으로 아래 값들은 모두 빈 문자열로 평가됨
  - `AWS_REGION`
  - `EKS_CLUSTER_NAME`
  - `ECR_WEB_REPOSITORY`
  - `ECR_API_REPOSITORY`

잘못된 입력 예:

```text
Name: DEMO
Value:
AWS_REGION=us-west-2
EKS_CLUSTER_NAME=shopping-demo-dev-eks
...
```

올바른 입력 방식:

- `AWS_REGION` 변수 하나
- `EKS_CLUSTER_NAME` 변수 하나
- `ECR_WEB_REPOSITORY` 변수 하나
- `ECR_API_REPOSITORY` 변수 하나
- `K8S_NAMESPACE` 변수 하나

해결:

- GitHub Actions Variables를 5개로 개별 생성
- `AWS_ROLE_TO_ASSUME`는 Secret으로 분리

### 2.2 변수 값 끝에 줄바꿈이 들어간 문제

증상:

```text
Provided region_name 'us-west-2
' doesn't match a supported format.
```

원인:

- GitHub Variables 입력값 끝에 보이지 않는 줄바꿈 또는 공백이 포함됨
- `aws eks update-kubeconfig`가 `us-west-2\n` 값을 받아 실패

해결:

- workflow에 `Normalize workflow inputs` 스텝 추가
- `tr -d '\r\n' | xargs`로 값 정규화 후 `GITHUB_ENV`에 다시 주입

핵심:

- 이 문제는 text formatting 문제에 해당한다
- 다만 모든 배포 오류가 이 문제 때문이었던 것은 아니다

### 2.3 `aws-auth` 미등록으로 kubectl 접근이 안 될 수 있는 문제

상황:

- GitHub Actions Role이 AWS 인증에는 성공하더라도
- EKS `aws-auth` ConfigMap에 Role이 등록되지 않으면
- `kubectl apply`, `kubectl set image`는 실패한다

해결:

- `aws-auth` ConfigMap의 `mapRoles`에 아래 Role 추가

```yaml
- groups:
  - system:masters
  rolearn: arn:aws:iam::486053612615:role/github-actions-eks-deploy-role
  username: github-actions
```

이 문제는 text 문제가 아니라 EKS 인증/권한 구조 문제였다.

## 3. AWS IAM / 권한 문제

### 3.1 ECR 로그인 실패

증상:

```text
not authorized to perform: ecr:GetAuthorizationToken
```

원인:

- `github-actions-eks-deploy-role`이 Assume은 되었지만
- ECR 로그인에 필요한 권한이 붙어 있지 않았음

해결:

- `AmazonEC2ContainerRegistryPowerUser` 정책 부착

예:

```bash
aws iam attach-role-policy \
  --role-name github-actions-eks-deploy-role \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser
```

이 문제는 text 문제가 아니라 IAM policy 문제였다.

### 3.2 AWS Load Balancer Controller IRSA 문제

별도 운영 중 확인한 문제:

- Ingress 이벤트에 `AssumeRoleWithWebIdentity 403`
- 원인은 `AmazonEKSLoadBalancerControllerRole` trust policy가
  현재 클러스터 OIDC가 아니라 다른 리전 OIDC를 참조하고 있었기 때문

해결:

- trust policy를 현재 EKS OIDC로 수정
- controller 재시작
- `SuccessfullyReconciled` 확인

이 문제 역시 text 문제가 아니라 trust policy 문제였다.

## 4. CI workflow 쪽 문제

### 4.1 `eslint: not found`

증상:

```text
sh: 1: eslint: not found
```

원인:

- `package.json`에는 `lint` 스크립트가 있었지만
- `eslint` 패키지와 설정 파일이 없었음

해결:

- `eslint` 관련 devDependency 추가
- `eslint.config.mjs` 생성

이 문제는 text 문제가 아니라 의존성 누락 문제였다.

### 4.2 ESLint circular structure 오류

증상:

```text
TypeError: Converting circular structure to JSON
```

원인:

- `eslint-config-next`와 `FlatCompat` 조합이 ESLint 9 환경에서 충돌

해결:

- `typescript-eslint` 기반 flat config로 전환
- 일반 JS/TS, `k6`, `mock-api`를 분리해서 규칙 적용

이 문제도 text 문제가 아니라 lint config 구조 문제였다.

### 4.3 파일 성격이 다른데 같은 lint 규칙을 적용한 문제

증상:

- `k6` 스크립트의 `__ENV` 미정의 에러
- `mock-api/server.js`의 CommonJS `require()` 에러
- 타입 전용 상수 warning

원인:

- 하나의 lint 설정으로
  - Next.js/TypeScript
  - k6 스크립트
  - CommonJS mock API
  를 동시에 검사하면서 충돌 발생

해결:

- `k6/**/*.js`에는 `__ENV` 전역 허용
- `mock-api/**/*.js`에는 `no-require-imports` 해제
- `use-toast` 파일은 타입 구조 자체를 단순화

이 역시 text 문제는 아니었다.

## 5. 실제로 text 문제였던 부분만 따로 정리

이번 작업에서 text 입력/줄바꿈 때문에 생긴 문제는 아래였다.

### A. GitHub Variables를 하나의 `DEMO` 변수에 몰아서 넣은 것

- 시스템이 `vars.AWS_REGION`처럼 개별 이름으로 읽기 때문에 실패

### B. 변수 값 끝에 줄바꿈/공백이 들어간 것

- `us-west-2`가 아니라 `us-west-2\n`로 전달되어 AWS CLI가 실패

이 두 개는 확실히 text 입력 방식 문제였다.

## 6. 최종 정리

이번 CI/CD 트러블슈팅을 한 줄로 요약하면 다음과 같다.

> 초기 실패는 단순히 UTF 인코딩 문제라기보다, GitHub Actions 변수 입력 방식, 줄바꿈 포함, IAM 권한 누락, ESLint 설정 충돌이 복합적으로 섞여 있었고, 그중 일부만 text formatting 문제였다.

## 7. 재발 방지 체크리스트

### GitHub Actions Variables

- 변수는 한 개에 몰아넣지 말고 이름별로 개별 생성
- 값 앞뒤 공백/줄바꿈 제거
- workflow에서 참조 이름과 GitHub 변수 이름이 정확히 일치하는지 확인

### GitHub Secrets

- 민감한 값만 Secret으로 저장
- Role ARN은 Secret에 둔다

### IAM

- ECR push 권한 있는지 확인
- `eks:DescribeCluster` 권한 있는지 확인
- `aws-auth`에 GitHub Actions Role 등록 여부 확인

### Lint/CI

- 프로젝트에 섞여 있는 파일 유형별로 lint 규칙 분리
- Next.js, k6, CommonJS mock API를 같은 규칙으로 억지로 묶지 않기

### Workflow Debug

- 배포 초반에 변수 존재 여부를 출력하는 디버그 스텝 유지
- 입력값 정규화 스텝으로 줄바꿈 문제 방지
