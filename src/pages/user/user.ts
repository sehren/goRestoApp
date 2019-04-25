import { Component,ViewChild } from '@angular/core';
import { IonicPage, NavController, NavParams,ToastController ,Content } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { Http} from '@angular/http';
import { LoginPage } from'../../pages/login/login'
import { FuncProvider} from '../../providers/func/func'
/**
 * Generated class for the UserPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-user',
  templateUrl: 'user.html',
})
export class UserPage {
  @ViewChild(Content) content: Content;
  user : any = ""
  tempEmail : any = ""
  oldPass : any = ""
  newPass : any = ""
  constructor(public toastCtrl : ToastController,public func : FuncProvider,private http : Http,public storage : Storage,public navCtrl: NavController, public navParams: NavParams) {
    this.storage.get('user').then(data=>{
      this.user = data;
      this.tempEmail = this.user.email
    })
  }
  doRefresh(refresher) {
    this.storage.get('user').then(data=>{
      this.user = data;
      this.tempEmail = this.user.email
    })

    setTimeout(() => {
      if(refresher!=0)
        refresher.complete();
    }, 1000);
  }
  ionViewDidLoad() {
    console.log('ionViewDidLoad UserPage');
  }
  edit(){
    if(this.oldPass!='' && this.newPass==''){
      let toast = this.toastCtrl.create({
        message: "isi Password baru",
        duration: 3000
      });
      toast.present();
    }
    else{
      this.http.post(this.func.url+'/change-user',{email : this.user.email,name : this.user.name,idUser : this.tempEmail,oldPass : this.oldPass,newPass : this.newPass}).subscribe(data=>{
        let toast = this.toastCtrl.create({
          message: (data.json()).text,
          duration: 3000
        });
        toast.present();
        if((data.json()).isvalid)
          this.storage.set('user',this.user)
        this.content.resize();
      })
    }
  }
  doLogout(){
  	this.storage.clear();
  	this.navCtrl.setRoot(LoginPage)
  }
}
