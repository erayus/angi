import {makeAutoObservable} from 'mobx';



export default class AppStore {
    headerTitle: string = "";
    showToBuyListButton: boolean = true;

    constructor(){
        makeAutoObservable(this)
    }

   
}