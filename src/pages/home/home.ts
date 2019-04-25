import { Component,ViewChild } from '@angular/core';
import { NavController,ViewController } from 'ionic-angular';
import { Http} from '@angular/http';
import { Storage } from '@ionic/storage';
import { LoginPage } from '../../pages/login/login';
import { Slides } from 'ionic-angular';
import { DetailPage } from'../../pages/detail/detail';
import { UserPage } from'../../pages/user/user';
import { SearchPage } from '../../pages/search/search'
import { InsidePage } from '../../pages/inside/inside'
import { ModalController,ToastController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { FuncProvider} from '../../providers/func/func';
import { LaunchNavigator } from '@ionic-native/launch-navigator';
@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild(Slides) slides: Slides;
  user : any = "";
  images = [];
  item : any;
  myLocation : any = {longitude : null, latitude: null};
  tabBarElement: any;
  istrue : any = false
  constructor(private launchNavigator: LaunchNavigator,public func : FuncProvider,public toastCtrl : ToastController,private http : Http,public viewCtrl : ViewController ,private storage: Storage,public navCtrl: NavController,public modalCtrl : ModalController,public geolocation : Geolocation) {
  	// this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
   //  this.images.push('http://travel.home.sndimg.com/content/dam/images/travel/fullset/2014/07/20/32/food-paradise-102-ss-001.rend.hgtvcom.966.544.suffix/1491584380240.jpeg')
   //  this.images.push('https://oneclassblog.com/wp-content/uploads/2017/10/food.jpg')
   //  this.images.push('https://ichef.bbci.co.uk/news/1024/cpsprodpb/5FFC/production/_97427542_thinkstockphotos-180258510.jpg')
   //  this.http.get('http://localhost:3000/home').subscribe(data=>{
   //    this.item = data.json()
   //  })
    this.http.get(this.func.url+'/user-category').subscribe(data=>{
      this.item =  data.json()
      for(var i=0;i<this.item.length;i++){
        if(this.item[i].imageName == '')
          this.item[i].imageName = 'No-image.jpg'
      }
    })
    // this.geolocation.getCurrentPosition().then((resp) => {
    //   this.myLocation.longitude = resp.coords.longitude;
    //   this.myLocation.latitude = resp.coords.latitude;
    // }).catch((error) => {
    //   let toast = this.toastCtrl.create({
    //     message: "cannot get your current Location",
    //     duration: 3000
    //   });
    //   toast.present();
    // });
    // this.func.setData('position',this.myLocation)
  }

  tonavigate(address){
    this.launchNavigator.navigate(address)
    this.istrue=true
  }
  doRefresh(refresher) {
    this.http.get(this.func.url+'/user-category').subscribe(data=>{
      this.item =  data.json()
      for(var i=0;i<this.item.length;i++){
        if(this.item[i].imageName == '')
          this.item[i].imageName = 'No-image.jpg'
      }
    })

    setTimeout(() => {
      if(refresher!=0)
        refresher.complete();
    }, 1000);
  }
  ionViewDidLoad(){
    this.tabBarElement = document.querySelector('.tabbar.show-tabbar');
  	this.storage.get('isLog').then(data=>{
  		if(!data){
        this.navCtrl.setRoot(LoginPage)
      }
  	})
  	this.storage.get('user').then(data=>{
  		this.user = data;
      if(this.user==null)
        this.navCtrl.setRoot(LoginPage)
  	})
  }
  goInside(item){
    if(!this.istrue){
      this.storage.get('user').then(data=>{
        this.navCtrl.push(InsidePage,{detail : item,idUser : data.email})
      })
    }
    this.istrue = false
  }
  goUserPage(){
    this.navCtrl.push(UserPage)
  }
  detailPage(content){
    this.navCtrl.push(DetailPage,{type : content})
  }
  goSearch(){
    this.navCtrl.push(SearchPage)
  }
}

// //modal
// @Component({
//   templateUrl : 'search.html'
// })
// export class searchModal{
//   constructor(public viewCtrl : ViewController){

//   }
//   tutup(){
//    console.log("jalan")
//    this.viewCtrl.dismiss();
//   }
// }
