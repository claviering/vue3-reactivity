// 在 2.js 中，给一个属性添加了一个 dep
// 在 2.js 基础上，一个对象通常有多个属性，需要为多个属性添加多个 dep
// Q: 然后给多个属性添加多个 dep
// A: 使用 depsMap and Set

let product = {
  price: 5,
  quantity: 2, // 1. 每一个属性有一个 dep，dep 是一个 Set(), 里面保存 effect to re-run
}
// 2. a depsMap 保存对象的每一个 key -> dep

let total = 0;

// 需要保存到 storage 的代码
let effect = () => { total = product.price * product.quantity }


let depsMap = new Map()

// 保存代码
function track(key) {
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  dep.add(effect) // dep 是一个 set，相同的 effect 不会重复添加
}

// 运行 storage 里的代码
function trigger(key) {
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}


track('quantity') // 保存代码
effect() // 首先运行一次 effect

console.log(`total is ${total}`); // total is  10

product.quantity = 3

trigger('quantity') // 运行 storage 里的代码

console.log(`total is ${total}`); // total is 15
