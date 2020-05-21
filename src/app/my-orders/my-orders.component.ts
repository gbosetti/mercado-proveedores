import { Component, OnInit } from '@angular/core';
import { CombosService } from '../_services/combos.service';
import { AuthenticationService } from '../_services/authentication.service';


@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.css']
})
export class MyOrdersComponent implements OnInit {

  constructor(private combosService: CombosService, private authenticationService: AuthenticationService) { }

  ngOnInit() {
  	this.loadOrders();
  }

  getCurrentDni(){
  	return (<any>this.authenticationService.currentUser.source).getValue()["id"];
  }

  createStockItem(stockItem){

  	return $(`<li href="#" class="list-group-item list-group-item-action flex-column align-items-start">
		<h5>${stockItem.nombre_combo} ($ ${stockItem.precio_individual})</h5>
    <div class="mt-2 mb-2">
      Circuito: ${stockItem.circuito}
    </div>
		<div class="d-flex w-100 justify-content-between">
			<small class="mb-1">${stockItem.detalle}</small>
		</div>
    <div class="mt-2">
      Mi stock ofrecido: ${stockItem.stock_inicial}
    </div>
	</li>`);
  }

  loadOrders(){

  	$('#overlay-spinner').fadeIn();
  	this.combosService.getProviderStock(this.getCurrentDni()).then((orders: Array<any>)=>{
      console.log(this.getCurrentDni(), orders);
  		$("#my-orders").html('');
    	orders.forEach(stockItem => {
        	$("#my-orders").append(this.createStockItem(stockItem));
        });
        $('#overlay-spinner').fadeOut();
  	});
  }

}
