// Q: console.log('Update the quantity to ' + product.quantity); // 尽管不在 effect 函数中，还是多余调用了 track(product, 'quantity')
// A: 引入一个 activeEffect 变量

let activeEffect = null

function effect(eff) {
  activeEffect = eff
  activeEffect() // run effect 然后触发 Proxy 的 get，进而触发 track, activeEffect 不为空
  activeEffect = null // 执行完 track, activeEffect 设置为空，保证 track 只在 effect 中执行
  
}

const targetMap = new WeakMap();

function track(target, key) {
  if (activeEffect) {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()))
    }
    let dep = depsMap.get(key)
    if (!dep) {
      depsMap.set(key, (dep = new Set()))
    }
    dep.add(activeEffect) // dep 是一个 set，相同的 effect 不会重复添加
  }
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
let salePrice = 0

effect(() => { 
  total = product.price * product.quantity
})
effect(() => { 
  salePrice = product.price * 0.9
})

console.log(`before update the total (should be 10 ) = ${total} salePrice (should be 4.5) = ${salePrice}`);

product.quantity = 3
console.log(`after update the total (should be 15 ) = ${total} salePrice (should be 4.5) = ${salePrice}`);

product.price = 10
// 会触发两个effect
console.log(`after update the total (should be 30 ) = ${total} salePrice (should be 9) = ${salePrice}`);
