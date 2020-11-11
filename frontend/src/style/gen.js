const cols = 16

for (let i = 1; i <= cols; i++) {
  console.log(`
.col-${i}-${cols} {
  width: ${(i * 100) / cols}%
}
  `)
}
