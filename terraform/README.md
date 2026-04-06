# Terraform Day 1

이 디렉토리는 3일 MVP 기준으로 `Day 1`에 필요한 최소 AWS 인프라를 Terraform으로 정의한다.

포함 범위:

- VPC
- Public Subnet 2개
- Private Subnet 2개
- Internet Gateway
- NAT Gateway 1개
- EKS Cluster
- EKS Managed Node Group
- ECR Repository 2개
  - `shopping-demo-web`
  - `shopping-demo-api`

## 왜 이 정도까지만 만드나

평가 기준상 중요한 것은 `재현 가능한 인프라`, `Kubernetes 배포 기반`, `오토스케일링 시연 준비`다.
3일 프로젝트에서 Day 1은 EKS에 애플리케이션을 올릴 수 있는 기반을 만드는 데 집중한다.

## 실행 순서

1. 예시 변수 파일 복사

```bash
cp terraform.tfvars.example terraform.tfvars
```

2. 초기화

```bash
terraform init
```

3. 계획 확인

```bash
terraform plan
```

4. 적용

```bash
terraform apply
```

## 적용 후 다음 단계

- `aws eks update-kubeconfig` 로 kubeconfig 연결
- `kubectl apply -k ../k8s` 로 앱 배포
- Day 2에서 `web/api` 분리 배포와 Ingress 연결
- Day 3에서 HPA와 k6 시나리오 적용

## 주의 사항

- 현재 NAT Gateway는 비용 절감을 위해 1개만 둔다.
- ALB Controller, Metrics Server, Prometheus/Grafana는 Day 2 또는 Day 3에서 붙인다.
- 실제 Route 53, ACM, RDS, Redis는 발표 설명 자산으로 남기고 MVP 구현 범위에서는 생략 가능하다.
