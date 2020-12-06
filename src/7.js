// Q: salePrice 改变的时候 total 不改变, salePrice 不是响应式的
// A: 建一个响应式的 salePrice, 使用 ref()

// 使用对象的计算属性
function ref(raw) {
  const r = {
    get value() {
      track(r, 'value')
      return raw
    },
    set value(newVal) {
      if (newVal != raw) {
        raw = newVal
        trigger(r, 'value')
      }
    },
  }
  return r
}

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
let salePrice = ref(0)
let total = 0

effect(() => { 
  total = salePrice.value * product.quantity
})
effect(() => { 
  salePrice.value = product.price * 0.9
})

console.log(`before update the total (should be 9 ) = ${total} salePrice (should be 4.5) = ${salePrice.value}`);

product.quantity = 3
console.log(`after update the total (should be 13.5 ) = ${total} salePrice (should be 4.5) = ${salePrice.value}`);

product.price = 10
// 会触发两个effect
console.log(`after update the total (should be 27 ) = ${total} salePrice (should be 9) = ${salePrice.value}`);
