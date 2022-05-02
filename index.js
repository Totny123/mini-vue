function createApp(App) {
  return {
    mount(selector) {
      const container = document.querySelector(selector);
      //记录是否挂载过
      let isMounted = false;
      //记录上一次的VNode，方便patch使用
      let oldVNode = null;
      //每次数据set时，都需要重新render。所有将代码写在watchEffect中。
      //App.render()会触发数据的getter
      watchEffect(() => {
        // if 第一次挂载执行mount函数
        if (!isMounted) {
          oldVNode = App.render();
          mount(oldVNode, container);
          isMounted = true;
        } else {
          // else 第二次开始应该时patch新旧VNode
          const newVNode = App.render();
          patch(oldVNode, newVNode);
          oldVNode = newVNode;
        }
      });
    },
  };
}
