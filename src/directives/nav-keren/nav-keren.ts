import { Directive, Input, ElementRef, Renderer } from '@angular/core';

/**
 * Generated class for the NavKerenDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[nav-keren]',
  host :{
    '(ionScroll)' : 'lagiScrollNih($event)'
  }
})
export class NavKerenDirective {
  @Input('header') header : HTMLElement;
  imageHeight;
  toolBar;
  backButton;
  title;
  constructor(public elements : ElementRef, public render : Renderer) {
    console.log('Hello NavKerenDirective Directive');
  }

  ngOnInit(){
     this.imageHeight = this.elements.nativeElement.getElementsByClassName('cover')[0].clientHeight;
     this.toolBar = this.header.getElementsByClassName('toolbar-background')[0];
     this.backButton = this.header.getElementsByClassName('back-button')[0];
     this.title = this.header.getElementsByClassName('toolbar-title')[0];

     this.render.setElementStyle(this.toolBar, 'webkitTransition', 'background 500ms');
     this.render.setElementStyle(this.backButton, 'webkitTransition','color 500ms');
     this.render.setElementStyle(this.title, 'webkitTransition','color 500ms');
  }

  lagiScrollNih(event){
    console.log(event)
    if(event.scrollTop > this.imageHeight){
      this.render.setElementStyle(this.toolBar, 'background', '#fff');
      this.render.setElementStyle(this.backButton, 'color','#999');
      this.render.setElementStyle(this.title, 'color','#999');
    }else{
      this.render.setElementStyle(this.toolBar, 'background', 'transparent');
      this.render.setElementStyle(this.backButton, 'color','#fff');
      this.render.setElementStyle(this.title, 'color','#fff');
    }
  }

}
