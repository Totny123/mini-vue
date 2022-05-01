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
