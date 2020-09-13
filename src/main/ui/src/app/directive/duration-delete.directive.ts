import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from '@angular/core';

@Directive({
  selector: '[durationDelete]'
})
export class DurationDeleteDirective implements OnInit, OnDestroy {

  // 缓存数量
  static currentCache = 0;

  // 缓存控件列表
  static caches: DurationDeleteDirective[] = [];

  // 默认配置
  readonly DEFAULT_CONFIG: DelayConfigure = {
    // 缓冲区长度, 低于该长度不做自动删除处理
    cacheLength: 5,
    // 动画持续时长: 毫秒
    duration: 1000,
    // 正常显示时长: 毫秒
    displayDuration: 3000,
  };

  // 配置
  @Input("durationDelete")
  configure: DelayConfigure = {};

  /**
   * DOM删除后调用, 该函数如果使用到this对象必须使用指向函数方式实现 ()=>{}
   */
  @Input("onDeleted")
  onDeleted?: (data: any) => void;

  constructor(
    private el: ElementRef,
    private render: Renderer2
  ) {
    console.log("指令创建成功");
  }

  ngOnInit(): void {
    DurationDeleteDirective.caches.push(this);
    let maxCache = this.configure.cacheLength || this.DEFAULT_CONFIG.cacheLength;
    if (++DurationDeleteDirective.currentCache > maxCache)
      DurationDeleteDirective.caches.shift().doDelete();
  }

  // 执行删除命令
  private doDelete() {
    setTimeout(() => {
      let dom = this.el.nativeElement;
      this.render.setStyle(dom, 'height', dom.clientHeight + 'px');
      this.render.setStyle(dom, 'opacity', dom.style.opacity);

      setTimeout(() => {
        this.render.addClass(dom, 'duration-delete');
        let duration = this.configure.duration || this.DEFAULT_CONFIG.duration;
        this.render.setStyle(dom, 'transition', `height ${duration}ms, opacity ${duration}ms`);

        // 由组件数据驱动删除
        setTimeout(() => this.onDeleted(this.configure.data), duration);

      }, this.configure.displayDuration || this.DEFAULT_CONFIG.displayDuration);
    });
  }

  ngOnDestroy(): void {
    console.log("指令对象被销毁");
    // if (isFunction(this.onDeleted))
    //   this.onDeleted(this.configure.data);
  }

}

// 自动删除配置
export class DelayConfigure {

  // 缓冲区长度, 低于该长度不做自动删除处理
  // 默认: 5
  cacheLength?: number;

  // 动画持续时长: 毫秒
  // 默认: 1000
  duration?: number;

  // 正常显示时长: 毫秒
  // 默认: 3000
  displayDuration?: number;

  // 携带数据
  data?: any;
}
