import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController } from 'ionic-angular';
import { Http,Headers} from '@angular/http';
import { FuncProvider} from '../../providers/func/func'
import { Storage } from '@ionic/storage';
import { HomePage } from '../../pages/home/home'
import { RegisterPage } from'../../pages/register/register'
@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {
	url : any = "http://localhost:3000"
	login = {email : '',password : ''}
	islog;
  tabBarElement: any;
  constructor(private storage : Storage,public func : FuncProvider,public http : Http,public navCtrl: NavController, public alertctrl : AlertController) {
  	this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }
  ionViewDidLoad(){
    this.tabBarElement.style.display = 'none';
  	this.islog = this.func.getData('isLog')
  	this.storage.get('isLog').then(data=>{
      if(data==true){
        this.navCtrl.setRoot(HomePage)
      }
    })
  }
  toRegister(){
    this.navCtrl.push(RegisterPage)
  }
  doLogin(){
  	this.storage.set('isLog',false)
    if(this.login.email == "" || this.login.password == ""){
      this.func.alertFunc("isi dulu lek");
    }
    else{
      let header = new Headers({ 'Content-Type': 'application/json' })
      // let head = this.login.email + " " + this.login.password
      header.append('Authorization','Basic any : password123')
      this.http.post(this.func.url+"/login",this.login,{headers : header}).subscribe(data=>{
        let item = data.json()
        if(item=='notActive'){
          this.func.alertFunc('Akun belum aktif, check email anda')
        }
        else if(item=="unvalid"){
          this.func.alertFunc("Email atau Password salah");
        }
        else{
          this.func.loadingFunc('Authenticating');
          this.func.setData('isLog',true);
          this.storage.set('user',item)
          this.tabBarElement.style.display = 'flex';
          this.navCtrl.setRoot(HomePage)
        }
      })
    }
  }
}
