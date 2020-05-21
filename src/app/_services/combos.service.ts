// Implemented by https://github.com/gbosetti
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class CombosService {

    constructor(private http: HttpClient) {}

    createStock(dni, stockPorCombo, combo_len){

        var formData = new FormData();
            formData.append("id_cliente", dni);
            formData.append("datos", stockPorCombo);
            formData.append("rowid", combo_len); // Parece que es la cantidad de elementos en el array

        return new Promise((resolve, reject) => {

            $.ajax({
                url: environment.apiUrl+'insert_combos_por_proveedor.php',
                type: 'post',
                processData: false,
                contentType: false,
                success: function (msj) {
                    resolve(msj);
                },
                "error": function (request, status) {
                    reject(request.responseText);
                },
                data: formData
            });
        });
    }

    getAllCombos(circuitId, categoryId) {

        return new Promise((resolve, reject) => {

            var formData = new FormData();
            formData.append("id_circuito", circuitId);
            formData.append("id_categoria", categoryId);

            $.ajax({
                url: environment.apiUrl+'combos_by_circuit_and_category_even_no_stock.php',
                type: 'post',
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data);
                    resolve(JSON.parse(data));
                },
                error: function (request, status, error) {
                    reject(request.responseText);
                },
                data: formData
            });
        }); 
    }

    getProviderStock(dni){

        return new Promise((resolve, reject) => {

            var formData = new FormData();
            formData.append("id_proveedor", dni);

            $.ajax({
                url: environment.apiUrl+'stock_by_provider.php',
                type: 'post',
                processData: false,
                contentType: false,
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: function (request, status, error) {
                    reject(request.responseText);
                },
                data: formData
            });
        });   
    }

    getCategories(){

        return new Promise((resolve, reject) => {

            $.ajax({
                "url": environment.apiUrl+'categoria_articulos_all.php',
                "type": 'get',
                "processData": false,
                "contentType": false,
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: function (request, status, error) {
                    reject(error);
                }
            });
        });   
    }

    getOpenCircuits(idProvider) {

        var formData = new FormData();
            formData.append("id", idProvider);

        return new Promise((resolve, reject) => {
            $.ajax({
                url: environment.apiUrl+"circuitos_con_estado_por_proveedor.php", //`${config.apiUrl}/combos/combos_por_circuito`
                type: 'post',
                processData: false,
                contentType: false,
                success: function (data) {
                    console.log(data);
                    resolve(JSON.parse(data));
                },
                error: function (request, status, error) {
                    reject(request.responseText);
                },
                data: formData
            });
        });
    }

    getProductsForCombo(id){

        return new Promise((resolve, reject) => {

            var formData = new FormData();
            formData.append("id", id);

            $.ajax({
                url: environment.apiUrl+'productos_del_combo.php',
                type: 'post',
                processData: false,
                contentType: false,
                success: function (data) {
                    resolve(JSON.parse(data));
                },
                error: function (request, status, error) {
                    reject(request.responseText);
                },
                data: formData
            });
        });  
    }

    getProducts() {

        return new Promise((resolve, reject) => {

            //var formData = new FormData();
            //formData.append("id_circuito", circuitId);

            $.ajax({
                url: environment.apiUrl+'productos_all.php',
                type: 'get',
                processData: false,
                contentType: false,
                success: function (data) {
                    data = JSON.parse(data);
                    resolve(data);
                },
                error: function (request, status, error) {
                    reject([]);
                }//,
                //data: formData
            });
        }); 
    }
}