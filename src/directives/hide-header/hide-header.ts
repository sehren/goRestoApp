import { Directive, ElementRef, Renderer, Input } from '@angular/core';

/**
 * Generated class for the HideHeaderDirective directive.
 *
 * See https://angular.io/api/core/Directive for more info on Angular
 * Directives.
 */
@Directive({
  selector: '[hide-header]',
  host :{
    '(ionScroll)' : 'onContentScroll($event)'
  }
})
export class HideHeaderDirective {
  @Input('header') header : HTMLElement;
  headerHeight;
  elementContent;
  constructor(public render : Renderer, public elements : ElementRef) {
    console.log('Hello HideHeaderDirective Directive');
  }

  ngOnInit(){
    console.log(this.header);
    this.headerHeight = this.header.clientHeight;
    this.render.setElementStyle(this.header, 'webkitTransition', 'margin-top 700ms');

    this.elementContent = this.elements.nativeElement.getElementsByClassName('scroll-content')[0];
    this.render.setElementStyle(this.elementContent, 'webkitTransition', 'margin-top 700ms');
  }

  onContentScroll(event){
     if(event.directionY == 'down'){
       this.render.setElementStyle(this.header, 'margin-top', '-' + (this.headerHeight) + 'px');
       this.render.setElementStyle(this.elementContent, 'margin-top', '0px');
     }else{
       this.render.setElementStyle(this.header, 'margin-top', '0px');
       this.render.setElementStyle(this.elementContent, 'margin-top', this.headerHeight + 'px');
     }
  }

}
