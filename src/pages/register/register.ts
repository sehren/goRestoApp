import { Component } from '@angular/core';
import { IonicPage, NavController,AlertController } from 'ionic-angular';
import { Http,Headers} from '@angular/http';
import { FuncProvider} from '../../providers/func/func';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../../pages/login/login'
/**
 * Generated class for the RegisterPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
	register = { name : '', email : '', password : ''}
  url : any = "http://localhost:3000"
  tabBarElement: any;
  constructor(public func : FuncProvider,public http : Http,public navCtrl: NavController, public alertctrl : AlertController) {
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  }

  ionViewDidLoad() {
    this.tabBarElement.style.display = 'none';
  }
  toLogin(){
    this.navCtrl.push(LoginPage)
  }
  doRegister(){
  	this.func.setData('isLog',false)
    let header = new Headers({ 'Content-Type': 'application/json' })
  	this.func.setData('user',{name : this.register.name,email : this.register.email})
  	if(this.register.email == "" || this.register.password =="" || this.register.name == ""){
  		this.func.alertFunc('isi dulu lek')
  	}else{
  			this.http.post(this.func.url+"/register",this.register,{headers : header}).subscribe(data=>{
  				let item = data.json()
  				if(item=="valid"){
  					// this.func.loadingFunc('Authenticating');
            this.func.alertFunc('Berhasil, Check email anda untuk aktivasi akun')
            this.navCtrl.push(LoginPage)
  				// 	this.func.setData('isLog',true)
      //       this.tabBarElement.style.display = 'flex';
						// this.navCtrl.setRoot(HomePage)
					}
					else if(item=="unvalid"){
						this.func.alertFunc('Email Sudah ada');
					}
  			})
  	}
  }
}
