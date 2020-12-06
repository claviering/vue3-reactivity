// 在 1.js 基础上添加响应式
// Q: 改变 price 或者 quantity 的时候如何重新计算 total
// A: 保存 `total = price * quantity` 到 storage 里，当 price 或者 quantity 改变的时候，重新运行这代码

let price = 5
let quantity = 2
let total = 0

let dep = new Set() // 保存 effect

// 需要保存到 storage 的代码
let effect = () => { total = price * quantity }

// 保存代码
function track() {
  dep.add(effect)
}

// 运行 storage 里的代码
function trigger() {
  dep.forEach(effect => effect())
}

track() // 保存代码
effect() // 首先运行一次 effect

console.log(`total is ${total}`); // total is  10

quantity = 3

console.log(`total is ${total}`); // total is 10

trigger() // 运行 storage 里的代码

console.log(`total is ${total}`); // total is 15
