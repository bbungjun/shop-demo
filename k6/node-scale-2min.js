import http from "k6/http"
import { check } from "k6"

export const options = {
  stages: [
    { duration: "15s", target: 80 },
    { duration: "30s", target: 180 },
    { duration: "45s", target: 320 },
    { duration: "20s", target: 320 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.30"],
    http_req_duration: ["p(95)<3000"],
  },
  noConnectionReuse: true,
}

const baseUrl =
  __ENV.BASE_URL ||
  "http://k8s-shopping-shopping-705d306bfa-1791535342.us-west-2.elb.amazonaws.com"

function randomProductId() {
  return Math.floor(Math.random() * 4) + 1
}

export default function () {
  const productId = randomProductId()
  const orderPayload = JSON.stringify({
    productId,
    quantity: Math.floor(Math.random() * 3) + 1,
  })

  const responses = http.batch([
    ["GET", `${baseUrl}/`],
    ["GET", `${baseUrl}/icon.svg`],
    ["GET", `${baseUrl}/placeholder.jpg`],
    ["GET", `${baseUrl}/api/products`],
    ["GET", `${baseUrl}/api/products/${productId}`],
    [
      "POST",
      `${baseUrl}/api/orders`,
      orderPayload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    ],
  ])

  check(responses[0], {
    "home status is 200": (res) => res.status === 200,
  })
  check(responses[1], {
    "icon status is 200": (res) => res.status === 200,
  })
  check(responses[2], {
    "placeholder status is 200": (res) => res.status === 200,
  })
  check(responses[3], {
    "products status is 200": (res) => res.status === 200,
  })
  check(responses[4], {
    "product detail status is 200": (res) => res.status === 200,
  })
  check(responses[5], {
    "order status is 201": (res) => res.status === 201,
  })
}
