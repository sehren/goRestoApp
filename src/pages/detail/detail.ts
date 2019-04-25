import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { Http} from '@angular/http';
import { ModalController } from 'ionic-angular';
import { SearchPage } from '../../pages/search/search'
import { InsidePage } from '../../pages/inside/inside'
import { FuncProvider} from '../../providers/func/func'
// import { searchModal} from '../../pages/home/home'
@IonicPage()
@Component({
  selector: 'page-detail',
  templateUrl: 'detail.html',
})
export class DetailPage {
	type : any;
	item : any;
	// temp : any = {url : "https://img.wonderhowto.com/img/53/62/63527023609846/0/these-chef-secrets-will-turn-your-home-cooked-meals-into-5-star-restaurant-tastes.1280x600.jpg",name : "Restoran Mantap jiwa",address : "Jl. Kemayoran No. 27 Jakarta Selatan",status : "buka"}
  constructor(public func : FuncProvider,public http: Http,public navCtrl: NavController, public navParams: NavParams,public viewCtrl : ViewController,public modalCtrl : ModalController) {
  	this.type = this.navParams.data.type
  	// for(let i = 0 ;i<15;i++){
  	// 	this.item.push(this.temp)
  	// }
    this.http.post(this.func.url+'/user-category',{type : this.type}).subscribe(data=>{
      console.log(data.json())
      this.item =  data.json()
    })
  }
  goSearch(){
    this.navCtrl.push(SearchPage)
  }
  goInside(item){
    this.navCtrl.push(InsidePage,{detail : item})
  }
}