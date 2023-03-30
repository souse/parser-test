import './test.jsx'
function square(a, b) {
  let n = a + b
  let m = a * b * 2

  n = m + n

  {
    console.log(m, n)
  }

  return m * n
}

function sub(a, b) {
  return a + b
}
