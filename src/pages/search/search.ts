import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams,ViewController } from 'ionic-angular';
import { Http } from '@angular/http';
import { Storage } from '@ionic/storage';
import { InsidePage } from '../../pages/inside/inside';
import { FuncProvider} from '../../providers/func/func'
/**
 * Generated class for the SearchPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-search',
  templateUrl: 'search.html',
})
export class SearchPage {
	search : any = ""
	resto : any = ""
  constructor(public func : FuncProvider,public storage : Storage,private http : Http,public navCtrl: NavController, public navParams: NavParams,public viewCtrl : ViewController) {
  }
  Search(){
  	this.http.get(this.func.url+'/search/'+this.search).subscribe(data=>{
  		this.resto = data.json()
  	})
  }
  tutup(){
   console.log("jalan")
   this.viewCtrl.dismiss();
  }
  goInside(item){
    this.storage.get('user').then(data=>{
      this.navCtrl.push(InsidePage,{detail : item,idUser : data.email})
    })
  }
}
