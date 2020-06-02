import { Component, OnInit } from '@angular/core';
import { CombosService } from '../_services/combos.service';
import { AuthenticationService } from '../_services/authentication.service';
declare var bootbox: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private combosPedidos;

  constructor(private combosService: CombosService, private authenticationService: AuthenticationService) { }

  getCurrentDni(){
  	return (<any>this.authenticationService.currentUser.source).getValue()["id"];
  }

  ngOnInit() {
  	this.initSelectedCombos();
  	this.loadCircuits(); 
  	this.loadCategories(); 
  	$("#circuit").on("change", ()=>{ this.loadCombos(); this.initSelectedCombos(); });
  	$("#categories").on("change", ()=>{ this.loadCombos() });
  	$("#combos").on("click", ".add-to-cart", (evt)=>{ this.addToCart($(evt.target)) });
  	$(".combos-pedidos").on("click", ".remove-from-cart", (evt)=>{ evt.target.parentElement.parentElement.remove() });
  	$("#registerOrder").on("click", (evt)=>{ this.registerOrder(); });
  	
  }

  initSelectedCombos(){

  	$(".combos-pedidos").html("Aún no agregó stock de combos para cargar en la plataforma.");
  }

  addToCart(target){

  	if($(".combos-pedidos li").length<=0)
  		$(".combos-pedidos").html('');

    console.log(".combos-pedidos li[data-id="+target.attr("id")+"]");
    if($(".combos-pedidos li[data-id="+target.attr("id")+"]").length>0){
      bootbox.alert({ message: "Ya ha agregado este producto a la lista de stock por cargar." });
      return;
    }

  	var combo = $(`<li data-id="${target.attr("id")}" href="#" class="list-group-item list-group-item-action flex-column align-items-start">
		<div class="d-flex w-100 justify-content-between">
			<h5 class="mb-1">${target.attr("combo_nombre")} ($ ${target.attr("combo_precio")})</h5>
		</div>
		<i><small>${target.attr("detalle")}</small></i>
    <div class="input-group mt-3">
      <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">Stock ofrecido:</span>
      </div>
      <input type="number" formControlName="stock" class="form-control stock" placeholder="Ej. 50"/>
    </div>
		<div class="btn-group mt-3" role="group" style="width: 100%">
		  <button aria-label="Eliminar combo ${target.attr('combo_nombre')}" type="button" class="btn btn-primary remove-from-cart"><i class="fa fa-remove" aria-hidden="true"></i> Eliminar</button>
		</div>
	</li>`);
  	$(".combos-pedidos").append(combo);
  }

  registerOrder(){

  	var combos = "", combos_length=1, allCombosWithAmount=true;
  	$(".combos-pedidos li").each((id, combo: any) => {
      var stock = parseInt(combo.querySelector(".stock").value || 0);
      console.log(combo, stock);
      if(stock<=0){
        //bootbox.alert({ message: "Ha olvidado indicar stock para uno de los combos seleccionados." });
        allCombosWithAmount=false;
      };
      combos = combos + '{"id_combo":' + combo.getAttribute("data-id") + ', "cantidad": ' + stock + ' }] ';
      combos_length = combos_length + 1;
  	});

  	var dni = this.getCurrentDni();

	if(!allCombosWithAmount ||dni == undefined || combos_length <= 1){
	  bootbox.alert({ message: "Por favor, completar todos los campos requeridos para efectuar la carga de stock." });
	  return false;
	}

	bootbox.confirm({
		title: "Advertencia",
	    message: "Una vez registrada, la carga de stock no puede ser modificada ni cancelada. ¿Estas seguro de querer registrarla?",
	    buttons: {
	        confirm: {
	            label: '<i aria-label="Confirmar el registro de stock" class="fa fa-check" aria-hidden="true"></i> Si',
	            className: 'btn-primary'
	        },
	        cancel: {
	            label: '<i aria-label="Cancelar el registro de stock" class="fa fa-times" aria-hidden="true"></i> No',
	            className: 'btn-secondary'
	        }
	    },
	    callback: (result) => {
	    	if(result){
		        this.combosService.createStock(dni, combos, combos_length).then((msg: any) =>{ 
				   bootbox.alert({ message: msg });
				   this.clearMyCart();
				}, msg =>{
				   bootbox.alert({ message: msg })
				});
		    }
	    }
	});
  }

  clearMyCart(){

  	$(".combos-pedidos").html("Su stock ha sido registrado.");
  }

  loadCategories(){
  	
  	 this.combosService.getCategories().then((categories: Array<any>)=>{

    	$("#categories").html('');
    	categories.forEach(e => {
        	$("#categories").append(this.createCategory(e));
        });
        $("#categories").append($(`<option aria-label="Opcion todas las categorias" value="-1" selected>Todas las categorias</option>`));
    });
  }

  createCategory(category){
  	return $(`<option aria-label="Opcion ${category.nombre_categoria}" value="${category.id}">${category.nombre_categoria}</option>`);
  }

  loadCircuits(){

  	return new Promise((resolve, reject) => {

        this.combosService.getOpenCircuits(this.getCurrentDni()).then((circuits: Array<any>)=>{

          console.log(circuits);

        	$("#circuit").html('');
        	circuits.forEach(e => {
        		if(parseInt(e["habilitado"])==1)
	        		$("#circuit").append(this.createCircuit(e));
	        });
	        $("#circuit").append($(`<option value="" disabled selected>Seleccione el circuito</option>`));
	        resolve();
        });
    }); 
  }

  loadCombos(){

  	$('#overlay-spinner').fadeIn();
      var formattedData = [];
      var circuito = $("#circuit").val();
      if (circuito == null) return;

      var category = $("#categories").val();
      if (category == null) return;

      $("#combos").html('');

      this.combosService.getAllCombos(circuito, category).then((combos: Array<any>) => {

        combos.forEach(e => {

        	var products="";
        	(<any>e['products']).forEach(prod => products = products + prod["prod_nombre"] + " (x" + prod["prod_cantidad"] + "), ");
        	e["detalle"] = products;
        	$("#combos").append(this.createCombo(e));
        	
        });
        $('#overlay-spinner').fadeOut();
      });
    }

  createCircuit(circuit){
  	return $(`<option value="${circuit.id}">${circuit.nombre}</option>`);
  }

  createCombo(combo){

  	return $(`<li href="#" class="list-group-item list-group-item-action flex-column align-items-start">
		<div class="d-flex w-100 justify-content-between">
			<h5 class="mb-1">${combo.combo_nombre} ($ ${combo.combo_precio})</h5>
		</div>
		<i><small>${combo.detalle}</small></i>
		<div class="btn-group mt-3" role="group" style="width: 100%">
		  <button aria-label="Agregar stock al combo ${combo.combo_nombre}" combo_nombre="${combo.combo_nombre}" combo_precio="${combo.combo_precio}" detalle="${combo.detalle}" id="${combo.combo_id}" type="button" class="btn btn-primary add-to-cart"><i class="fa fa-plus-circle" aria-hidden="true"></i> Agregar stock</button>
		</div>
	</li>`);
  }

}
