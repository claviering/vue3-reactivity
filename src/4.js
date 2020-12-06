// 3.js 解决了一个对象多个属性的effect
// Q: 多个对象怎么办？
// A: 引入一个变量: targetMap 保存多个对象的映射。targetMap -> depsMap -> dep (dep 是一个 set)

const targetMap = new WeakMap();

function track(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  dep.add(effect) // dep 是一个 set，相同的 effect 不会重复添加
}

function trigger(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    return;
  }
  let dep = depsMap.get(key)
  if (dep) {
    dep.forEach(effect => {
      effect()
    })
  }
}


let product = {
  price: 5,
  quantity: 2,
}
let total = 0
let effect = () => { total = product.price * product.quantity }


track(product, 'quantity') // 保存代码
effect() // 首先运行一次 effect

console.log(`total is ${total}`); // total is  10

product.quantity = 3

trigger(product, 'quantity') // 运行 storage 里的代码

console.log(`total is ${total}`); // total is 15