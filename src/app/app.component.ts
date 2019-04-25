import { Component, ViewChild } from '@angular/core';
import { Nav, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import {FuncProvider} from '../providers/func/func';
import { Storage } from '@ionic/storage';
import { UserPage } from '../pages/user/user'
@Component({
  templateUrl : 'tab.html' 
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = LoginPage;
  detail : any = {name : "",email : ""};
  pages: Array<{title: string, component: any}>;
  tab1Root = HomePage;
  tab2Root = ListPage;
  tab3Root = UserPage;
  constructor(public storage : Storage,public func : FuncProvider,public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp()
    this.pages = [
      { title: 'Home', component: HomePage},
      { title: 'Category', component: ListPage}
    ];
    storage.get('isLog').then(data=>{
      if(data==true){
        this.rootPage = HomePage;
        this.storage.get('user').then(data=>{
          this.detail = data;
        })
      }
      else if(data==null)
        this.rootPage = LoginPage;
    })

  }
  ngOnInit(){
    this.storage.get('isLog').then(data=>{
      if(data==true){
        this.storage.get('user').then(data=>{
          this.detail = data;
          console.log("jalan")
        })
      }
    })
  }
  user(){
    this.nav.push(UserPage)
  }
  doLogout(){
    this.storage.clear();
    this.rootPage = LoginPage;
  }
  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    this.nav.setRoot(page.component);
  }
}
