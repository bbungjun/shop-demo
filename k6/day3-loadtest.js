import http from "k6/http"
import { check, sleep } from "k6"

export const options = {
  stages: [
    { duration: "20s", target: 40 },
    { duration: "40s", target: 100 },
    { duration: "40s", target: 160 },
    { duration: "20s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<1500"],
  },
}

const baseUrl =
  __ENV.BASE_URL ||
  "http://k8s-shopping-shopping-705d306bfa-1791535342.us-west-2.elb.amazonaws.com"

function randomProductId() {
  return Math.floor(Math.random() * 4) + 1
}

export default function () {
  const productId = randomProductId()

  const webRes = http.batch([
    ["GET", `${baseUrl}/`],
    ["GET", `${baseUrl}/icon.svg`],
    ["GET", `${baseUrl}/placeholder.jpg`],
  ])
  check(webRes[0], {
    "home status is 200": (res) => res.status === 200,
  })
  check(webRes[1], {
    "icon status is 200": (res) => res.status === 200,
  })
  check(webRes[2], {
    "placeholder status is 200": (res) => res.status === 200,
  })

  sleep(0.1)

  const productsRes = http.get(`${baseUrl}/api/products`)
  check(productsRes, {
    "products status is 200": (res) => res.status === 200,
  })

  sleep(0.1)

  const productRes = http.get(`${baseUrl}/api/products/${productId}`)
  check(productRes, {
    "product detail status is 200": (res) => res.status === 200,
  })

  sleep(0.1)

  if (Math.random() < 0.35) {
    const orderPayload = JSON.stringify({
      productId,
      quantity: Math.floor(Math.random() * 3) + 1,
    })

    const orderRes = http.post(`${baseUrl}/api/orders`, orderPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    check(orderRes, {
      "order status is 201": (res) => res.status === 201,
    })
  }

  sleep(0.2)
}
