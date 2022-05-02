// 实现h函数，生成VNode。VNode本质就是一个JS对象。
const h = (tag, props, children) => {
  return {
    tag,
    props,
    children,
  };
};

// mount函数将VNode挂载到真实DOM上
const mount = (VNode, container) => {
  // 创建VNode对应的DOM节点
  const el = document.createElement(VNode.tag);
  // el的引用复制一份给VNode
  VNode.el = el;
  // 判断是否有props
  if (VNode.props) {
    // 遍历props
    for (const key in VNode.props) {
      const value = VNode.props[key];
      // 事件
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        // 普通属性
        el.setAttribute(key, value);
      }
    }
  }
  // 判断是否有children
  if (VNode.children) {
    if (typeof VNode.children === "string") {
      el.textContent = VNode.children;
    } else {
      // 子节点也是VNode，直接将子节点挂载到父DOM节点上。
      VNode.children.forEach((item) => {
        mount(item, el);
      });
    }
  }
  // 执行挂载
  container.appendChild(el);
};

//对比新旧VNode，更新UI。n1是旧VNode，n2是新VNode。
const patch = (n1, n2) => {
  //更新节点，意味着el挂载点是一样的。
  const elParentNode = n1.el.parentNode;
  // if 先判断tag是否相同，不相同直接替换
  if (n1.tag !== n2.tag) {
    elParentNode.removeChild(n1.el);
    mount(n2, elParentNode);
  } else {
    //else tag相同，意味着只需要更新，el是不变的。
    n2.el = n1.el;
    const el = n1.el;
    //tag相同，需要比较props。
    const n1Props = n1.props || {};
    const n2Props = n2.props || {};
    //更新props
    for (const key in n2Props) {
      const newValue = n2Props[key];
      const oldValue = n1Props[key];
      //新旧value不一样才需要更新
      if (newValue !== oldValue) {
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue);
        } else {
          el.setAttribute(key, newValue);
        }
      }
    }
    //删除多余的props
    for (const key in n1Props) {
      if (!(key in n2Props)) {
        const value = n1Props[key];
        if (key.startsWith("on")) {
          el.removeChild(key.slice(2).toLowerCase(), value);
        } else {
          el.removeAttribute(key);
        }
      }
    }

    //tag相同，需要比较children。
    //if 新节点的children是字符串，那么直接替换children
    if (typeof n2.children === "string") {
      el.innerHTML = "";
      el.textContent = n2.children;
    } else {
      //else 新节点的children是数组
      //if 旧节点的children是字符串
      if (typeof n1.children === "string") {
        // 删除原有内容，将新节点的VNode挂载上去
        el.innerHTML = "";
        n2.children.forEach((item) => {
          mount(item, el);
        });
      } else {
        //else 旧节点的children也是数组，此时需要diff算法了。暂时完成最简单的diff。
        //相同数目的VNode进行patch操作
        const commonLength = Math.min(n1.children.length, n2.children.length);
        for (let i = 0; i < commonLength; i++) {
          const n1Child = n1.children[i];
          const n2Child = n2.children[i];
          patch(n1Child, n2Child);
        }
        //旧节点的children数量更多,删除多余的节点
        if (n1.children.length > commonLength) {
          for (let i = commonLength; i < n1.children.length; i++) {
            //因为多余的children节点已经挂载过，所以VNode有对应的el。
            el.removeChild(n1.children[i].el);
          }
        }
        //新节点的children数量更多,添加新的节点
        if (n2.children.length > commonLength) {
          for (let i = commonLength; i < n2.children.length; i++) {
            mount(n2.children[i], el);
          }
        }
      }
    }
  }
};
