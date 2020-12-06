// 4.js 中 track 和 trigger 是手动触发的
// Q: 如何自动触发
// A: 使用 Proxy 在get中粗发 track, 在 set 中触发 trigger

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

function reactive(target) {
  const handler = {
    get(target, key, receiver) {
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      let oldValue = target[key]
      let result = Reflect.set(target, key, value, receiver)
      if (oldValue != result) {
        trigger(target, key)
      }
      return result
    }
  }
  return new Proxy(target, handler)
}

let product = reactive({ price: 5, quantity: 2})


let total = 0

let effect = () => { total = product.price * product.quantity }
// 调用 track(product, 'price') 和 track(product, 'quantity')

effect() // 首先运行一次 effect

console.log(`total is ${total}`); // total is  10

product.quantity = 3 // 调用 trigger(product, 'quantity')

console.log('Update the quantity to ' + product.quantity); // 尽管不在 effect 函数中，还是多余调用了 track(product, 'quantity')

console.log(`total is ${total}`); // total is 15
