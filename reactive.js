let activeEffect = null;

//事件中心Dep类
class Dep {
  constructor() {
    //使用Set数据结构记录订阅者
    this.subscribers = new Set();
  }
  //收集依赖、订阅者
  depend() {
    //只有函数才能被添加到订阅者集合
    if (typeof activeEffect === "function") {
      this.subscribers.add(activeEffect);
    }
  }
  //通知函数。调用所有effect
  notify() {
    this.subscribers.forEach((effect) => effect());
  }
}

//每个属性都有自己的Dep类
//使用WeakMap、Map关联属性和Dep类
const weakMap = new WeakMap();
function getDep(target, key) {
  let targetMap = weakMap.get(target);
  //对象一开始没有对应的Map，需要new Map()
  if (!targetMap) {
    targetMap = new Map();
    //注意。还要给原来的weakMap添加上对应的键值对。
    weakMap.set(target, targetMap);
  }
  let keyDep = targetMap.get(key);
  //属性一开始没有对应的Dep，需要new Dep()
  if (!keyDep) {
    keyDep = new Dep();
    //注意。还要给原来的targetMap添加上对应的键值对。
    targetMap.set(key, keyDep);
  }
  return keyDep;
}

//创建响应式数据
function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      //获取属性对应的dep
      const dep = getDep(target, key);
      //调用depend()，收集依赖
      dep.depend();
      //在捕获器中使用target、obj，都不会循环触发。但还是建议使用Reflect操作对象。
      return target[key];
    },
    set(target, key, newValue) {
      //获取属性对应的dep
      const dep = getDep(target, key);
      //调用notify()，调用所有effect，从而实现响应式
      dep.notify();
      //在捕获器中使用target、obj，都不会循环触发。但还是建议使用Reflect操作对象。
      target[key] = newValue;
    },
  });
}

//创建watchEffect()，让函数加入到响应式系统中。
function watchEffect(effect) {
  //记录effect的引用，调用effect()时，dep可以收集effect。
  activeEffect = effect;
  //调用effect，触发getter，从而使得dep收集依赖。
  effect();
  //需要置空，方便下次使用。
  activeEffect = null;
}

//测试代码
// const obj = reactive({ name: "feng", age: 18 });
// function logObjName() {
//   console.log("logObjName", obj.name);
// }
// function logObjAge() {
//   console.log("logObjAge", obj.age);
// }
// const person = reactive({ name: "person", age: 100 });
// function logPersonAge() {
//   console.log("logPersonAge", person.age);
// }
// watchEffect(logObjName);
// watchEffect(logObjAge);
// watchEffect(logPersonAge);
