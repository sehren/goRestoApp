exports.acoTabu = function(koki,order){
	//ketetapan
	var alpha = 1
	var beta = 0.5
	var rho = 0.8
	var q = 1
	var peromone = 0.1
	var iter = 20
	var semut = 10
	var aco = []
	var tabuList = []
	


	var jlhKoki = koki.length
	var tmp = JSON.parse(JSON.stringify(order))
	if(tmp.length>0){
		for(var i =0;i<tmp.length;i++){
			tmp[i].idUser = [{idUser : tmp[i].idUser, qty : tmp[i].qty,noMeja : tmp[i].noMeja}]
		}
		for(var i = 0;i<tmp.length;i++){
			for(var j = i+1;j<tmp.length;j++){
				if(tmp[i].nama==tmp[j].nama){
					tmp[i].qty += tmp[j].qty
					tmp[i].idUser.push(tmp[j].idUser[0])
					tmp.splice(j,1)
				}
			}
		}
	}
	//pemetaan
	var pemetaan = [];
	for(var i = 0 ;i<jlhKoki;i++){
		pemetaan[i] = []
		for(var j = 0;j<tmp.length;j++){
			var temp = tmp[j].nama;
			var idUser = tmp[j].idUser
			var qty = tmp[j].qty
			for(var k =0;k<koki[i].length;k++){
				if(koki[i][k].nama==temp){
					pemetaan[i][j]=koki[i][k]
					pemetaan[i][j].per = peromone;
					pemetaan[i][j].qty = qty
					pemetaan[i][j].idUser = idUser
					pemetaan[i][j].idMakanan = tmp[j].idMakanan
					pemetaan[i][j].noMeja = tmp[j].noMeja
					pemetaan[i][j].idOrder = tmp[j].idOrder
					if(tmp[j].qty>1){
						pemetaan[i][j].estimasi +=((tmp[j].qty-1)*(pemetaan[i][j].estimasi*0.1))
					}
				}
			}
		}
	}
	var ishigh;
	var globalBest = 0;
	for(var itr=0;itr<iter;itr++){
		for(var c = 0;c<semut;c++){
			//set status check false
			for(var i=0;i<jlhKoki;i++){
				for(var j=0;j<tmp.length;j++){
					if(pemetaan[i][j]!=null){
						pemetaan[i][j].checked = false;
					}
				}
			}
			//start awal random
			var indSelect = []
			var sum = 0
			var rand = Math.floor((Math.random() * tmp.length-1) + 1);
			indSelect.push({nama : "", index : rand, koki : null,estimasi : null})
			for(var i =0;i<jlhKoki;i++){
				if(pemetaan[i][rand]!=null){
					pemetaan[i][rand].prob = Math.pow(pemetaan[i][rand].per,alpha)*Math.pow(1/pemetaan[i][rand].estimasi,beta)
					sum+=pemetaan[i][rand].prob
				}
			}
			//check prob paling gede
			ishigh = {high : null,ind : null};
			for(var i =0;i<jlhKoki;i++){
				if(pemetaan[i][rand]!=null){
					pemetaan[i][rand].prob = pemetaan[i][rand].prob/sum
					if(pemetaan[i][rand].prob>ishigh.high){
						ishigh = {high : pemetaan[i][rand].prob,ind : i}
					}
				}
			}
			//select status sekarang
			for(var i=0;i<jlhKoki;i++){
				if(i==ishigh.ind){
					indSelect[0].koki = i
					indSelect[0].nama = pemetaan[i][rand].nama
					indSelect[0].estimasi = pemetaan[i][rand].estimasi
				}
			}
			var tampung = JSON.parse(JSON.stringify(pemetaan))
			//hapus yang uda diselect
			for(var i =0;i<jlhKoki;i++){
				delete tampung[i][indSelect[0].index]
			}
			for(var p=1;p<tmp.length;p++){
				//pilih path berikutnya
				for(var i=0;i<jlhKoki;i++){
					for(var k=0;k<indSelect.length;k++){
						for(var j =0;j<tmp.length;j++){
							if(tampung[i][j]!=null){
								if(indSelect[k].koki==i){
									tampung[i][j].estimasi+=JSON.parse(JSON.stringify(pemetaan[i][indSelect[k].index].estimasi))

								}
							}
						}
					}
				}
				//pilih probabilitas selanjutnya
				ishigh = {high : null,ind : null,koki : null,estimasi : null};
				var tambah = [];
				for(var i=0;i<tmp.length;i++){
					tambah[i] = 0;
				}
				for(var i =0;i<jlhKoki;i++){
					for(var j =0;j<tmp.length;j++){
						if(tampung[i][j]!=null){
							tampung[i][j].prob = Math.pow(tampung[i][j].per,alpha)*Math.pow(1/tampung[i][j].estimasi,beta)
						}
					}
				}
				// console.log(JSON.parse(JSON.stringify(tampung)),"setelah probabilitas")
				for(var i=0;i<tmp.length;i++){
					for(var j=0;j<jlhKoki;j++){
						if(tampung[j][i]!=null){
							tambah[i]+=tampung[j][i].prob
							// console.log(tambah[i],tampung[j][i],i,p)
						}
					}
				}
				for(var i=0;i<jlhKoki;i++){
					for(var j=0;j<tmp.length;j++){
						if(tampung[i][j]!=null){
							tampung[i][j].prob = tampung[i][j].prob/tambah[j]
							// console.log(tampung[i][j],tambah[j],j)
							if(tampung[i][j].prob>ishigh.high){
								ishigh = {high : tampung[i][j].prob,ind : j,koki : i,estimasi : pemetaan[i][j].estimasi}
							}
						}
					}
				}
				//select status
				indSelect.push({nama : pemetaan[ishigh.koki][ishigh.ind].nama,index : ishigh.ind,koki : ishigh.koki,estimasi : ishigh.estimasi})

				//hapus
				tampung = JSON.parse(JSON.stringify(tampung))
				for(var i =0;i<jlhKoki;i++){
					delete tampung[i][indSelect[p].index]
				}
			}
			//ini untuk hasil total yang diselect
			var total = [];
			for(var i=0;i<jlhKoki;i++){
				total.push(0);
			}
			for(var i =0;i<tmp.length;i++){
				for(var j =0;j<jlhKoki;j++){
					if(indSelect[i].koki == j){
						total[j]+=indSelect[i].estimasi;
					}
				}
			}
			//konversi dri indselect ke pemetaan.checked untuk memilih yang terbaik dari aco
			for(var k = 0;k<indSelect.length;k++){
				for(var i=0;i<jlhKoki;i++){
					for(var j=0;j<tmp.length;j++){
						if(pemetaan[i][j]!=null){
							if(indSelect[k].koki == i && indSelect[k].index == j) {
								temp = JSON.parse(JSON.stringify(pemetaan))
								temp[i][j].checked = true
								pemetaan = JSON.parse(JSON.stringify(temp))
							}
						}
					}
				}
			}
			aco.push({rute : JSON.parse(JSON.stringify(pemetaan)),total : JSON.parse(JSON.stringify(total))})
			// console.log(aco[c].total)
		}
		var total = 0
		var pemetaan = 0
		for(var i=0;i<aco.length;i++){
			if(i==0){
				pemetaan = JSON.parse(JSON.stringify(aco[i].rute))
				total = JSON.parse(JSON.stringify(aco[i].total))
			}
			else if(Math.max.apply(Math,aco[i].total)<Math.max.apply(Math,total)){
				pemetaan = JSON.parse(JSON.stringify(aco[i].rute))
				total = JSON.parse(JSON.stringify(aco[i].total))
			}
		}
		aco = []
		// var pemetaanACO = JSON.parse(JSON.stringify(pemetaan))
		// var totalACO = JSON.parse(JSON.stringify(total))
		function tabuSearch(total,pemetaan){
			var tampungHasilTaboo = [];
			var totalTabooTemp = JSON.parse(JSON.stringify(total));
			for(var i = 0;i<tmp.length;i++){
				for(var j = 0;j<jlhKoki;j++){
					for(var t = 0;t<total.length;t++){
						totalTabooTemp[t] = 0;
					}
					var pemetaanTabu = JSON.parse(JSON.stringify(pemetaan))
					if(pemetaanTabu[j][i]!=null){
						var temp = pemetaanTabu[j][i].checked
						for(var k=j;k<jlhKoki;k++){
							if(pemetaanTabu[k][i]!=null && pemetaanTabu[k][i].checked!=temp){
								pemetaanTabu[j][i].checked = pemetaanTabu[k][i].checked
								pemetaanTabu[k][i].checked = temp;
								for(var a = 0;a<jlhKoki;a++){
									for(var b = 0;b<tmp.length;b++){
										if(pemetaanTabu[a][b]!=null){
											if(pemetaanTabu[a][b].checked){
												totalTabooTemp[a]+=pemetaanTabu[a][b].estimasi;
											}
										}
									}
								}
								tampungHasilTaboo.push({rute : pemetaanTabu,waktu : Math.max.apply(Math,totalTabooTemp),total : JSON.parse(JSON.stringify(totalTabooTemp))})
								break
							}
						}
					}
					
				}
			}
			return tampungHasilTaboo;
		}
		var tampungHasilTaboo = tabuSearch(JSON.parse(JSON.stringify(total)),JSON.parse(JSON.stringify(pemetaan)))

		var lngth = JSON.parse(JSON.stringify(tampungHasilTaboo.length))
		for(var i=0;i<lngth;i++){
			let pemetaan1 = JSON.parse(JSON.stringify(tampungHasilTaboo[i].rute))
			let total1 = JSON.parse(JSON.stringify(tampungHasilTaboo[i].total))
			var tampungTabu = tabuSearch(total1,pemetaan1)
			for(var j =0;j<tampungTabu.length;j++){
				tampungHasilTaboo.push(JSON.parse(JSON.stringify(tampungTabu[j])));
			}
		}
		// ((tampungHasilTaboo[i].total).reduce((a, b) => a + b, 0))<((total).reduce((a, b) => a + b, 0))
		// console.log(tampungHasilTaboo)
		var pancing = false;
		for(var i=0;i<tampungHasilTaboo.length;i++){
			if(tampungHasilTaboo[i].waktu<Math.max.apply(Math,total)){
				pemetaan = JSON.parse(JSON.stringify(tampungHasilTaboo[i].rute))
				total = JSON.parse(JSON.stringify(tampungHasilTaboo[i].total))
				pancing = true
			}
			else if(tampungHasilTaboo[i].waktu==Math.max.apply(Math,total)){
				// if(((tampungHasilTaboo[i].total).reduce((a, b) => a + b, 0))<((total).reduce((a, b) => a + b, 0))){
				// 	pemetaan = JSON.parse(JSON.stringify(tampungHasilTaboo[i].rute))
				// 	total = JSON.parse(JSON.stringify(tampungHasilTaboo[i].total))
				// }
				// pemetaan = JSON.parse(JSON.stringify(pemetaanACO))
				// total = JSON.parse(JSON.stringify(totalACO))
			}
		}
		//update tabuList
		if(tabuList[0]==null){
			tabuList.push({rute : pemetaan,total : total})
		}
		else{
			var istr = false
			for(var i=0;i<tabuList.length;i++){
				if(Math.max.apply(Math,tabuList[i].total) <= Math.max.apply(Math,total)){
					istr = true
				}
				if(tabuList[i].total==total){
					tabuList[i].rute = JSON.parse(JSON.stringify(pemetaan))
					tabuList[i].total = JSON.parse(JSON.stringify(total))
				}
			}
			if(!istr){
				tabuList.push({rute : pemetaan,total : total})
			}
		}
		pemetaan = JSON.parse(JSON.stringify(tabuList[tabuList.length-1].rute))
		total = JSON.parse(JSON.stringify(tabuList[tabuList.length-1].total))
		//update pheromone
		if(Math.max.apply(Math,total)<=globalBest || c==0){
			globalBest = Math.max.apply(Math,total)
			for(var i=0;i<jlhKoki;i++){
				for(var j=0;j<tmp.length;j++){
					if(pemetaan[i][j]!=null && pemetaan[i][j].checked){
						pemetaan[i][j].per += (q/Math.max.apply(Math,total))
					}
					else if(pemetaan[i][j]!=null && !pemetaan[i][j].checked){
						pemetaan[i][j].per *= (1-rho)
					}
				}
			}
		}
		else if(Math.max.apply(Math,total)>globalBest){
			for(var i=0;i<jlhKoki;i++){
				for(var j=0;j<tmp.length;j++){
					if(pemetaan[i][j]!=null && pemetaan[i][j].checked){
						pemetaan[i][j].per *= (1-rho)
					}
				}
			}
		}
	}
	var hasilAcoTabu = []
	for(var i =0;i< pemetaan.length;i++){
		for(var j = 0;j<pemetaan[i].length;j++){
			if( pemetaan[i][j]!=null && pemetaan[i][j].checked == true){
				// console.log(i,j,pemetaan[i][j].checked,pemetaan[i][j].nama)
				hasilAcoTabu.push({nama : pemetaan[i][j].nama,estimasi : pemetaan[i][j].estimasi,idKoki : pemetaan[i][j].idKoki,idUser : pemetaan[i][j].idUser,qty : pemetaan[i][j].qty,idMakanan : pemetaan[i][j].idMakanan,idOwner : pemetaan[i][j].idOwner,idOrder : pemetaan[i][j].idOrder})
			}
		}
	}
	return hasilAcoTabu
}